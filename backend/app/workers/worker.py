"""ARQ worker configuration."""

from arq.connections import RedisSettings

from app.workers.tasks import scrape_job_task, submit_application_task


class WorkerSettings:
    functions = [scrape_job_task, submit_application_task]
    redis_settings = RedisSettings(host="localhost", port=6379)
    max_jobs = 2
    job_timeout = 300
    poll_delay = 0.5
