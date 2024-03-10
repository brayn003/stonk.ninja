import pymongo

from app.errors import MissingEnvException
from app.services.env import DB_NAME, DB_URI


def _connect_mongodb():
    if not DB_URI:
        raise MissingEnvException("DB_URI not found in environment variables")
    if not DB_NAME:
        raise MissingEnvException("DB_NAME not found in environment variables")

    client = pymongo.MongoClient(DB_URI, uuidRepresentation="standard")
    return client[DB_NAME]


db = _connect_mongodb()
