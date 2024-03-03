from app.services.env import KITE_API_KEY
from kiteconnect import KiteConnect

print('Initialized Kite')

kite = KiteConnect(api_key=KITE_API_KEY)
