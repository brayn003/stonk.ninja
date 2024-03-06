import pymongo

from app.errors import MissingEnvException
from app.services.env import DB_NAME, DB_URI

if not DB_URI:
    raise MissingEnvException("DB_URI not found in environment variables")
if not DB_NAME:
    raise MissingEnvException("DB_NAME not found in environment variables")

print("Initialized DB")
client = pymongo.MongoClient(DB_URI, uuidRepresentation="standard")
db = client[DB_NAME]
