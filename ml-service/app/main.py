from fastapi import FastAPI, HTTPException, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import tempfile
import httpx
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2
import asyncio
from datetime import datetime
import json

app = FastAPI(title="Matobev ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

class AnalyzeRequest(BaseModel):
    video_url: str
    player_id: str
    video_id: str = None

class AnalyzeResult(BaseModel):
    analysis_id: str
    player_id: str
    video_id: str = None
    video_url: str
    metrics: dict
    player_card: dict
    analysis_date: str
    processing_time: float

class PlayerCardRequest(BaseModel):
    player_id: str

class PlayerCardResponse(BaseModel):
    player_id: str
    overall_rating: float
    pace: float
    shooting: float
    passing: float
    dribbling: float
    defending: float
    physical: float
    last_updated: str

@app.get("/healthz")
async def healthz():
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
        "service": "matobev-ml-service"
    }

def compute_stats_from_video(path: str) -> dict:
    """Enhanced video analysis with better metrics calculation"""
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise RuntimeError("Cannot open video")
    
    # Get video properties
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0
    
    diffs, brightness, edges = [], [], []
    ret, prev = cap.read()
    if not ret:
        cap.release()
        raise RuntimeError("Failed to read first frame")
    
    prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
    brightness.append(float(prev_gray.mean()))
    edges.append(float(cv2.Canny(prev_gray, 100, 200).mean()))
    
    frame_count = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness.append(float(g.mean()))
        edges.append(float(cv2.Canny(g, 100, 200).mean()))
        
        # Calculate optical flow for movement analysis
        flow = cv2.calcOpticalFlowFarneback(prev_gray, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
        diffs.append(float(np.mean(mag)))
        
        prev_gray = g
        
        # Limit processing for performance
        if frame_count > 300:  # Process max 300 frames
            break
    
    cap.release()
    
    if not diffs:
        diffs = [0.0]
    
    def scale(x, lo, hi):
        if hi - lo < 1e-6:
            return 50
        return int(np.clip(99 * (x - lo) / (hi - lo), 1, 99))
    
    # Enhanced metrics calculation
    speed = scale(np.mean(diffs), np.min(diffs), np.max(diffs if len(diffs) > 1 else [np.mean(diffs) + 1]))
    agility = scale(np.std(diffs), 0, np.max(diffs))
    stamina = scale(np.std(brightness), 0, max(1.0, np.max(brightness) - np.min(brightness)))
    shooting = scale(np.mean(edges), np.min(edges), np.max(edges if len(edges) > 1 else [np.mean(edges) + 1]))
    passing = scale(np.median(edges), np.min(edges), np.max(edges if len(edges) > 1 else [np.median(edges) + 1]))
    strength = int(np.clip((speed + agility + stamina) / 3, 1, 99))
    
    # Calculate overall rating
    overall_rating = (speed + stamina + shooting + passing + strength) / 5
    
    return {
        "speed": int(speed),
        "stamina": int(stamina),
        "shooting_accuracy": int(shooting),
        "passing_accuracy": int(passing),
        "strength": int(strength),
        "dribbling": int(agility),
        "overall_rating": round(overall_rating, 1)
    }

def generate_player_card(stats: dict) -> dict:
    """Generate player card data structure"""
    return {
        "overall_rating": stats["overall_rating"],
        "pace": stats["speed"],
        "shooting": stats["shooting_accuracy"],
        "passing": stats["passing_accuracy"],
        "dribbling": stats["dribbling"],
        "defending": stats["strength"],
        "physical": stats["strength"]
    }

async def download_to_tmp(url: str) -> str:
    """Download video to temporary file"""
    async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        fd, path = tempfile.mkstemp(suffix=".mp4")
        os.close(fd)
        with open(path, "wb") as f:
            f.write(r.content)
        return path

@app.post("/analyze", response_model=AnalyzeResult)
async def analyze_video(req: AnalyzeRequest):
    """Analyze video and return comprehensive results"""
    start_time = datetime.now()
    
    try:
        print(f"Starting analysis for player {req.player_id}")
        
        # Download video
        tmp_path = await download_to_tmp(req.video_url)
        print(f"Video downloaded to {tmp_path}")
        
        # Analyze video
        metrics = compute_stats_from_video(tmp_path)
        print(f"Analysis completed: {metrics}")
        
        # Generate player card
        player_card = generate_player_card(metrics)
        
        # Clean up temporary file
        os.unlink(tmp_path)
        
        # Calculate processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Generate analysis ID
        analysis_id = f"analysis_{req.player_id}_{int(datetime.now().timestamp())}"
        
        result = AnalyzeResult(
            analysis_id=analysis_id,
            player_id=req.player_id,
            video_id=req.video_id,
            video_url=req.video_url,
            metrics=metrics,
            player_card=player_card,
            analysis_date=datetime.now().isoformat(),
            processing_time=processing_time
        )
        
        print(f"Analysis completed in {processing_time:.2f}s")
        return result
        
    except Exception as e:
        print(f"Error in analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/player_card", response_model=PlayerCardResponse)
async def get_player_card(req: PlayerCardRequest):
    """Get latest player card for a player"""
    # In a real implementation, this would fetch from database
    # For now, return mock data
    return PlayerCardResponse(
        player_id=req.player_id,
        overall_rating=85.5,
        pace=88.0,
        shooting=82.0,
        passing=87.0,
        dribbling=84.0,
        defending=83.0,
        physical=86.0,
        last_updated=datetime.now().isoformat()
    )

@app.get("/time_estimate")
async def get_time_estimate():
    """Get estimated analysis time"""
    return {
        "estimated_time_seconds": 30,
        "estimated_time_minutes": 0.5,
        "message": "Analysis typically takes 30 seconds"
    }

@app.post("/admin/approve")
def approve(user_id: str, approved: bool, x_admin_password: str = Header(default="")):
    """Admin endpoint for user approval"""
    if not ADMIN_PASSWORD or x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"user_id": user_id, "approved": approved}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)