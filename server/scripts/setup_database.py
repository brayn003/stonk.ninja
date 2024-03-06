from app.services.db import db

ticks_collection = db.create_collection(
    "ticks", timeseries={"timeField": "timestamp", "metaField": "metadata"}
)
ticks_collection.create_index("metadata.tradingsymbol")


sessions_collection = db.create_collection("sessions")
sessions_collection.create_index("sess_id", unique=True)

print("Database initialized")
