from os import getenv

from dotenv import load_dotenv

load_dotenv()

DB_URI: str = getenv("DB_URI")
DB_NAME: str = getenv("DB_NAME")
RABBITMQ_URI: str = getenv("RABBITMQ_URI")
KITE_API_KEY: str = getenv("KITE_API_KEY")
KITE_API_SECRET: str = getenv("KITE_API_SECRET")
SESSION_SECRET: str = getenv("SESSION_SECRET")
