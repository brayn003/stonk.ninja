from dotenv import dotenv_values

from app.services.env import SECRET_FILE


class SecretFileEnvNotFound(Exception):
    pass


def _main():
    if SECRET_FILE is None:
        raise SecretFileEnvNotFound("SECRET_FILE env not defined")
    secrets = dotenv_values(SECRET_FILE)
    return secrets


_secrets = _main()

KITE_API_KEY: str = _secrets["KITE_API_KEY"]
KITE_API_SECRET: str = _secrets["KITE_API_SECRET"]
SESSION_SECRET: str = _secrets["SESSION_SECRET"]
