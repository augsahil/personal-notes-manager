from fastapi import FastAPI, HTTPException, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from bson import ObjectId
from textblob import TextBlob
import os
from dotenv import load_dotenv
import math

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "notes-micro")

app = FastAPI(title="Notes Analytics Service")
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
notes_coll = db["notes"]

class AnalyticsRequest(BaseModel):
    note_id: str

def word_count(text: str) -> int:
    return len(text.split())

def reading_time(text: str) -> int:
    return math.ceil(len(text.split()) / 200)

def sentiment_score(text: str) -> float:
    return TextBlob(text).sentiment.polarity

async def compute_analytics(note):
    text = note.get("content", "")
    analytics = {
        "word_count": word_count(text),
        "reading_time": reading_time(text),
        "sentiment": sentiment_score(text)
    }
    await notes_coll.update_one({"_id": note["_id"]}, {"$set": {"analytics": analytics}})

@app.post("/analytics/note")
async def analyze_note(req: AnalyticsRequest, background_tasks: BackgroundTasks):
    try:
        note = await notes_coll.find_one({"_id": ObjectId(req.note_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid note_id")
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    background_tasks.add_task(compute_analytics, note)
    return {"status": "processing_started", "note_id": req.note_id}
