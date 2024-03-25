import pymongo
from pymongo.collection import Collection
from pymongo.database import Database

from app.errors import MissingEnvException
from app.services.env import MONGODB_DB_NAME, MONGODB_URI


class Db:
    def __init__(self):
        if not MONGODB_URI:
            raise MissingEnvException("MONGODB_URI not found in environment variables")
        if not MONGODB_DB_NAME:
            raise MissingEnvException(
                "MONGODB_DB_NAME not found in environment variables"
            )

        client = pymongo.MongoClient(MONGODB_URI, uuidRepresentation="standard")
        self._db: Database = client[MONGODB_DB_NAME]
        self.sessions: Collection = None
        self.ticks: Collection = None
        self.users: Collection = None

    def setup_db(self):
        collection_names = self._db.list_collection_names()
        if "sessions" not in collection_names:
            col = self._db.create_collection("sessions")
            col.create_index("sess_id", unique=True)
        if "ticks" not in collection_names:
            ticks_collection = self._db.create_collection(
                "ticks", timeseries={"timeField": "timestamp", "metaField": "metadata"}
            )
            ticks_collection.create_index("metadata.tradingsymbol")
        if "users" not in collection_names:
            users_collection = self._db.create_collection("users")
            users_collection.create_index("email", unique=True)
        self.sessions = self._db["sessions"]
        self.ticks = self._db["ticks"]
        self.users = self._db["users"]
        print(f"[Initialized] Database: {MONGODB_DB_NAME}")


db = Db()
db.setup_db()
