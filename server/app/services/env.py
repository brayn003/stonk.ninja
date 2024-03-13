from os import getenv

from dotenv import load_dotenv

load_dotenv()

DB_URI: str = getenv("DB_URI")
DB_NAME: str = getenv("DB_NAME")
RABBITMQ_URI: str = getenv("RABBITMQ_URI")
SECRET_FILE: str = getenv("SECRET_FILE")
