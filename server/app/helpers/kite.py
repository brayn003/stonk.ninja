from datetime import datetime, timezone
from typing import Annotated, Dict, List, Literal, Optional
from urllib.parse import parse_qs
from uuid import uuid4

import pyotp
from kiteconnect import KiteConnect
from playwright.async_api import async_playwright, expect
from pydantic import BaseModel, BeforeValidator, EmailStr, Field, HttpUrl

from app.services.cache import cache

KITE_USER_ID = ""
KITE_USER_PASSWORD = ""
KITE_TOTP_SECRET = ""

PyObjectId = Annotated[str, BeforeValidator(str)]


class KiteConfiguration(BaseModel):
    integration_type: Literal["kite"] = "kite"
    api_key: str
    api_secret: str


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


async def _automated_login(api_key=str):
    login_url = "https://kite.zerodha.com/connect/login?v=3"
    login_url += f"&api_key={api_key}"
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
        await page.locator("input#userid").fill(KITE_USER_ID)
        await page.locator("input#password").fill(KITE_USER_PASSWORD)
        await page.locator("button[type='submit']").click()
        totp = pyotp.TOTP(KITE_TOTP_SECRET)
        otp = totp.now()
        await expect(page.locator("form.twofa-form input#userid")).to_be_visible()
        await expect(page.locator("form.twofa-form button[type='submit']")).to_be_visible()
        await page.locator("form.twofa-form input#userid").fill(otp)
        await page.wait_for_url("https://stonk.ninja/**")
        await browser.close()
    return redirect_url


async def load_kiteconnect(integration: KiteIntegration):
    session_name = "default"
    cache_key = f"integration:{integration.id}:session:{session_name}"
    kite_session = cache.get(cache_key)
    api_key = integration.configuration.api_key
    api_secret = integration.configuration.api_secret
    if not kite_session:
        redirect_url = await _automated_login(api_key)
        queries = parse_qs(redirect_url)
        request_token = queries["request_token"][0]
        kite = KiteConnect(api_key=api_key)
        kite_session_dict = kite.generate_session(request_token, api_secret=api_secret)
        session = KiteSession(data=kite_session_dict)
        cache.set(cache_key, session.model_dump_json())
