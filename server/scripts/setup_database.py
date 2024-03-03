from app.services.db import db

db.create_collection('ticks', timeseries={ 'timeField': 'timestamp', 'metaField': 'metadata' })
print('Database initialized')
