from kiteconnect import KiteConnect

from app.services.env import KITE_API_KEY

print("Initialized Kite")

kite = KiteConnect(api_key=KITE_API_KEY)
