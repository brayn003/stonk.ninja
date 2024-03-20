from os import getenv

from dotenv import load_dotenv

load_dotenv()

MONGODB_URI: str = getenv("MONGODB_URI")
MONGODB_DB_NAME: str = getenv("MONGODB_DB_NAME")
KITE_API_KEY: str = getenv("KITE_API_KEY")
KITE_API_SECRET: str = getenv("KITE_API_SECRET")
SESSION_SECRET: str = getenv("SESSION_SECRET")
