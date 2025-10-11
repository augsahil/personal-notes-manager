# from fastapi import FastAPI, HTTPException, BackgroundTasks
# from motor.motor_asyncio import AsyncIOMotorClient
# from pydantic import BaseModel
# from bson import ObjectId
# from textblob import TextBlob
# import os
# from dotenv import load_dotenv
# import math

# load_dotenv()

# MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
# DB_NAME = os.getenv("MONGO_DB_NAME", "notes-micro")

# app = FastAPI(title="Notes Analytics Service")
# client = AsyncIOMotorClient(MONGO_URI)
# db = client[DB_NAME]
# notes_coll = db["notes"]

# class AnalyticsRequest(BaseModel):
#     note_id: str

# def word_count(text: str) -> int:
#     return len(text.split())

# def reading_time(text: str) -> int:
#     return math.ceil(len(text.split()) / 200)

# def sentiment_score(text: str) -> float:
#     return TextBlob(text).sentiment.polarity

# async def compute_analytics(note):
#     text = note.get("content", "")
#     analytics = {
#         "word_count": word_count(text),
#         "reading_time": reading_time(text),
#         "sentiment": sentiment_score(text)
#     }
#     await notes_coll.update_one({"_id": note["_id"]}, {"$set": {"analytics": analytics}})

# @app.post("/analytics/note")
# async def analyze_note(req: AnalyticsRequest, background_tasks: BackgroundTasks):
#     try:
#         note = await notes_coll.find_one({"_id": ObjectId(req.note_id)})
#     except:
#         raise HTTPException(status_code=400, detail="Invalid note_id")
#     if not note:
#         raise HTTPException(status_code=404, detail="Note not found")

#     background_tasks.add_task(compute_analytics, note)
#     return {"status": "processing_started", "note_id": req.note_id}


from fastapi import FastAPI, HTTPException, BackgroundTasks
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from bson import ObjectId
from textblob import TextBlob
import os
from dotenv import load_dotenv
import math
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = os.getenv("MONGO_DB_NAME", "notes-micro")

app = FastAPI(title="Notes Analytics Service")
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
notes_coll = db["new-coll"]

class Note(BaseModel):
    title: str
    content: str

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

@app.post("/debug/create-test-note")
async def create_test_note(note: Note):
    """Debug endpoint to create a test note"""
    result = await notes_coll.insert_one({
        "title": note.title,
        "content": note.content,
        "createdAt": datetime.utcnow(),
        "analytics": {}
    })
    return {
        "id": str(result.inserted_id),
        "message": "Test note created successfully"
    }

@app.get("/debug/notes")
async def list_notes():
    """Debug endpoint to list all notes in the database"""
    notes = await notes_coll.find({}).to_list(length=10)
    return [{
        "id": str(note["_id"]),
        "title": note.get("title", ""),
        "content": note.get("content", ""),
        "analytics": note.get("analytics", {})
    } for note in notes]

@app.post("/analytics/note")
async def analyze_note(req: AnalyticsRequest, background_tasks: BackgroundTasks):
    try:
        print(f"Received request with note_id: {req.note_id}")
        
        if not req.note_id:
            print("note_id is empty")
            raise HTTPException(status_code=400, detail="note_id is required")
            
        print(f"Checking if {req.note_id} is a valid ObjectId")
        if not ObjectId.is_valid(req.note_id):
            print(f"Invalid ObjectId format: {req.note_id}")
            raise HTTPException(status_code=400, detail=f"Invalid note_id format. Must be a 24-character hex string.")
            
        object_id = ObjectId(req.note_id)
        print(f"Looking for note with _id: {object_id}")
        note = await notes_coll.find_one({"_id": object_id})
        
        if not note:
            print(f"No note found with _id: {object_id}")
            raise HTTPException(status_code=404, detail="Note not found")

        print(f"Found note: {note}")
        print("Starting analytics computation...")
        background_tasks.add_task(compute_analytics, note)
        # return {"status": "processing_started", "note_id": req.note_id}
        return {"status": "processing_started"}
        
    except HTTPException as he:
        raise he
    except Exception as e:
        error_msg = f"Error processing request: {str(e)}"
        print(error_msg)
        print(f"Exception type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail=error_msg)

@app.get("/analytics/health")
def health():
    return {"status": "ok"}