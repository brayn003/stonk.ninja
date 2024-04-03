from datetime import datetime, timezone
from typing import Dict, List, Literal, Optional
from urllib.parse import parse_qs
from uuid import uuid4

import pyotp
from kiteconnect import KiteConnect
from playwright.async_api import async_playwright, expect
from pydantic import BaseModel, EmailStr, Field, HttpUrl

from app.helpers.types import PyObjectId
from app.services.cache import cache


class KiteConfiguration(BaseModel):
    integration_type: Literal["kite"] = "kite"
    api_key: str
    api_secret: str
    is_autosession_enabled: bool = False
    username: Optional[str]
    password: Optional[str]
    totp_secret: Optional[str]


class KiteIntegration(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    type: Literal["kite"] = "kite"
    configuration: KiteConfiguration
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class KiteNativeSession(BaseModel):
    user_type: str
    email: EmailStr
    user_name: str
    user_shortname: str
    broker: str
    exchanges: List[str]
    products: List[str]
    order_types: List[str]
    avatar_url: HttpUrl | None
    user_id: str
    api_key: str
    access_token: str
    public_token: str
    enctoken: str
    login_time: datetime
    meta: Dict[str, str]


class KiteSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4))
    data: KiteNativeSession
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class KiteSessionManager:
    @staticmethod
    async def _automated_login(integration: KiteIntegration):
        login_url = "https://kite.zerodha.com/connect/login?v=3"
        login_url += f"&api_key={integration.configuration.api_key}"
        redirect_url = None

        async def _request_handler(request):
            if "/api/integrations/kite/callback" in request.url:
                nonlocal redirect_url
                redirect_url = request.url

        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            page.on("request", _request_handler)
            await page.goto(login_url)
            await page.locator("input#userid").fill(integration.configuration.username)
            await page.locator("input#password").fill(integration.configuration.password)
            await page.locator("button[type='submit']").click()
            totp = pyotp.TOTP(integration.configuration.totp_secret)
            otp = totp.now()
            await expect(page.locator("form.twofa-form input#userid")).to_be_visible()
            await expect(page.locator("form.twofa-form button[type='submit']")).to_be_visible()
            await page.locator("form.twofa-form input#userid").fill(otp)
            await page.wait_for_url("**/api/integrations/kite/callback*")
            await browser.close()
        return redirect_url

    @staticmethod
    async def load_session(integration: KiteIntegration, session_name: str = "default"):
        cache_key = f"integration:{integration.id}:session:{session_name}"
        api_key = integration.configuration.api_key
        api_secret = integration.configuration.api_secret
        redirect_url = await KiteSessionManager._automated_login(integration)
        queries = parse_qs(redirect_url)
        request_token = queries["request_token"][0]
        kite = KiteConnect(api_key=api_key)
        kite_session_dict = kite.generate_session(request_token, api_secret=api_secret)
        integration_session = KiteSession(data=kite_session_dict)
        cache.set(cache_key, integration_session.model_dump_json())

    @staticmethod
    async def get_session(integration: KiteIntegration, session_name: str = "default"):
        cache_key = f"integration:{integration.id}:session:{session_name}"
        kite_session_json = cache.get(cache_key)
        if not kite_session_json:
            return None
        kite_session = KiteSession.model_validate_json(kite_session_json)
        return kite_session
