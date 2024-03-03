import services.env
import pymongo
import os
from datetime import datetime
import pytz

DB_URI = os.getenv('DB_URI')
DB_NAME = os.getenv('DB_NAME')

client = pymongo.MongoClient(DB_URI)

old_db = client['kite_mock']
old_collections = [
  'ticks',
  'ticks_7_feb',
  'ticks_7_feb_p1',
  'ticks_7_feb_p2',
  'ticks_7_feb_p3',
  'ticks_8_feb_p1',
  'ticks_9_feb_p1',
  'ticks_12_feb_p1',
  'ticks_14_feb_p1',
  'ticks_14_feb_p2',
  'ticks_14_feb_p3',
  'ticks_15_feb_p1',
  'ticks_16_feb_p1',
  'ticks_16_feb_p2',
  'ticks_1_mar_p1',
]

db = client[DB_NAME]

for old_collection in old_collections:
  old_docs = old_db[old_collection].find()
  docs = list(map(lambda doc: {
    'timestamp': doc['data']['exchange_timestamp'],
    # 'received_timestamp': datetime.fromtimestamp(doc['timestamp']).replace(tzinfo=pytz.timezone('Asia/Kolkata')),
    'received_timestamp': datetime.fromtimestamp(doc['timestamp']),
    'metadata': {
      'tradingsymbol': doc['tradingsymbol'],
      'instrument_token': doc['instrument_token'],
    },
    'data': doc['data']
  }, old_docs))
  db['ticks'].insert_many(docs)
  print(f'Inserted {len(docs)} documents from \'{old_collection}\' to ticks')

print('Migration complete')
