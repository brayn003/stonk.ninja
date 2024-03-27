from redis import ConnectionPool, Redis

_pool = ConnectionPool.from_url("redis://localhost:6379/0")
cache = Redis(connection_pool=_pool)
