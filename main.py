from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# MongoDB Connection
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["traffic_database"]
collection = db["traffic_data"]

@app.get("/api/traffic")
async def get_traffic():
    try:
        data = list(collection.find({}, {"_id": 0}))  # Get all documents except _id
        if not data:
            raise HTTPException(status_code=404, detail="No data found")
        return {"trafficData": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
