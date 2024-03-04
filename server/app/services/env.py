from os import getenv

from dotenv import load_dotenv

print("Loading environment variables")

load_dotenv()

DB_URI: str = getenv("DB_URI")
DB_NAME: str = getenv("DB_NAME")
KITE_API_KEY: str = getenv("KITE_API_KEY")
KITE_API_SECRET: str = getenv("KITE_API_SECRET")
