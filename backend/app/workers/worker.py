"""ARQ worker configuration."""

from arq.connections import RedisSettings


class WorkerSettings:
    functions = []
    redis_settings = RedisSettings(host="localhost", port=6379)
    max_jobs = 2
    job_timeout = 300
    poll_delay = 0.5
