import aiosqlite
import json
import uuid
from datetime import datetime

DB_PATH = "jobs.db"

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                job_id TEXT PRIMARY KEY,
                status TEXT,
                total INT,
                completed INT,
                created_at TEXT,
                updated_at TEXT
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                job_id TEXT,
                website TEXT,
                result_json TEXT,
                error TEXT,
                created_at TEXT
            )
        """)
        await db.commit()

async def create_job(urls: list) -> str:
    job_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO jobs (job_id, status, total, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            (job_id, "running", len(urls), 0, now, now)
        )
        await db.commit()
    return job_id

async def save_result(job_id: str, website: str, result_dict: dict, error: str = None):
    now = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO results (job_id, website, result_json, error, created_at) VALUES (?, ?, ?, ?, ?)",
            (job_id, website, json.dumps(result_dict), error, now)
        )
        await db.execute(
            "UPDATE jobs SET completed = completed + 1, updated_at = ? WHERE job_id = ?",
            (now, job_id)
        )
        await db.commit()

async def get_job_status(job_id: str) -> dict:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT status, total, completed FROM jobs WHERE job_id = ?", (job_id,)) as cursor:
            row = await cursor.fetchone()
            if row:
                return {"status": row[0], "total": row[1], "completed": row[2]}
    return None

async def get_job_results(job_id: str) -> list:
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT website, result_json, error FROM results WHERE job_id = ?", (job_id,)) as cursor:
            rows = await cursor.fetchall()
            results = []
            for row in rows:
                res = json.loads(row[1])
                if row[2]:
                    res["error"] = row[2]
                res["website"] = row[0]
                results.append(res)
            return results

async def mark_job_complete(job_id: str):
    now = datetime.utcnow().isoformat()
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE jobs SET status = 'completed', updated_at = ? WHERE job_id = ?",
            (now, job_id)
        )
        await db.commit()
