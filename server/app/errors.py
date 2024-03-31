class MissingEnvException(Exception):
    pass


class DatabaseNotConnectedException(Exception):
    pass


class UserAlreadyExistsException(Exception):
    pass


class WeakPasswordException(Exception):
    pass


class InvalidEmailException(Exception):
    pass
