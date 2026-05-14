import unittest
import asyncio
import os
import uuid
from core.queue_manager import init_db, create_job, save_result, get_job_status, get_job_results, mark_job_complete

class TestQueue(unittest.TestCase):
    def setUp(self):
        # Use a test database
        os.environ["DATABASE_URL"] = "test_jobs.db"

    def tearDown(self):
        if os.path.exists("test_jobs.db"):
            os.remove("test_jobs.db")

    def test_queue_workflow(self):
        async def run_test():
            await init_db()

            urls = ["google.com", "bing.com", "yahoo.com"]
            job_id = await create_job(urls)

            self.assertIsNotNone(job_id)

            status = await get_job_status(job_id)
            self.assertEqual(status["total"], 3)
            self.assertEqual(status["completed"], 0)
            self.assertEqual(status["status"], "running")

            await save_result(job_id, "google.com", {"score": 80})
            await save_result(job_id, "bing.com", {"score": 70})
            await save_result(job_id, "yahoo.com", {}, error="Failed")

            status = await get_job_status(job_id)
            self.assertEqual(status["completed"], 3)

            results = await get_job_results(job_id)
            self.assertEqual(len(results), 3)

            await mark_job_complete(job_id)
            status = await get_job_status(job_id)
            self.assertEqual(status["status"], "completed")

        asyncio.run(run_test())

if __name__ == "__main__":
    unittest.main()
