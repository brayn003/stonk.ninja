import pymongo
from pymongo.collection import Collection
from pymongo.database import Database

from app.errors import MissingEnvException
from app.helpers.auth import hash_password
from app.helpers.models import User
from app.services.env import ADMIN_EMAIL, ADMIN_PASSWORD, MONGODB_DB_NAME, MONGODB_URI


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
        self.integrations: Collection = None

    def setup_db(self):
        collection_names = self._db.list_collection_names()
        # init migrations
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

        if "integrations" not in collection_names:
            integrations_collection = self._db.create_collection("integrations")
            integrations_collection.create_index("type", unique=True)

        # init seeders
        user_count = self._db["users"].estimated_document_count()
        if user_count == 0:
            if not ADMIN_EMAIL:
                raise MissingEnvException(
                    "ADMIN_EMAIL not found in environment variables"
                )
            if not ADMIN_PASSWORD:
                raise MissingEnvException(
                    "ADMIN_EMAIL not found in environment variables"
                )
            # not the most secure solution as env will be avaialbe after setup but it is quick
            user = User(
                full_name="Admin",
                email=ADMIN_EMAIL,
                password=hash_password(ADMIN_PASSWORD),
                is_admin=True,
            )
            self._db["users"].insert_one(user.model_dump())

        # binding collections
        self.sessions = self._db["sessions"]
        self.ticks = self._db["ticks"]
        self.users = self._db["users"]
        self.integrations = self._db["integrations"]

        print("[Initialized] Database")


db = Db()
db.setup_db()
