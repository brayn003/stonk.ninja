import bcrypt


def hash_password(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(bytes(password, encoding="utf-8"), salt)
    return hashed


def compare_passwords(password: str, hashed: str):
    match = bcrypt.checkpw(
        bytes(password, encoding="utf-8"), bytes(hashed, encoding="utf-8")
    )
    return match
