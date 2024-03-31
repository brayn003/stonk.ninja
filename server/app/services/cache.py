from redis import ConnectionPool, Redis

from app.services.env import REDIS_URI

_pool = ConnectionPool.from_url(REDIS_URI + "/0")
cache = Redis(connection_pool=_pool)

print("[Initialized] Cache")
