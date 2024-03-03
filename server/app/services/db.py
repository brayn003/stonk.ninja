from app.services.env import DB_URI, DB_NAME
import pymongo


if not DB_URI:
  raise Exception('DB_URI not found in environment variables')
if not DB_NAME:
  raise Exception('DB_NAME not found in environment variables')

print('Initialized DB')
client = pymongo.MongoClient(DB_URI)
db = client[DB_NAME]
