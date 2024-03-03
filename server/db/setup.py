import services.env
import os
import pymongo

if __name__ != '__main__':
  raise Exception('This file should not be imported')

DB_URI = os.getenv('DB_URI')
DB_NAME = os.getenv('DB_NAME')

if not DB_URI:
  raise Exception('DB_URI not found in environment variables')
if not DB_NAME:
  raise Exception('DB_NAME not found in environment variables')

client = pymongo.MongoClient(DB_URI)
db = client[DB_NAME]

print(DB_NAME)

db.create_collection('ticks', timeseries={ 'timeField': 'timestamp', 'metaField': 'metadata' })

print('Database initialized')
