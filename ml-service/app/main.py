from fastapi import FastAPI, HTTPException, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import tempfile
import httpx
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2

app = FastAPI()

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

class AnalyzeResult(BaseModel):
    speed: int
    stamina: int
    passing: int
    shooting: int
    strength: int
    card_image_url: str | None = None

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

def compute_stats_from_video(path: str) -> dict:
    cap = cv2.VideoCapture(path)
    if not cap.isOpened():
        raise RuntimeError("Cannot open video")
    diffs, brightness, edges = [], [], []
    ret, prev = cap.read()
    if not ret:
        cap.release()
        raise RuntimeError("Failed to read first frame")
    prev_gray = cv2.cvtColor(prev, cv2.COLOR_BGR2GRAY)
    brightness.append(float(prev_gray.mean()))
    edges.append(float(cv2.Canny(prev_gray,100,200).mean()))
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        brightness.append(float(g.mean()))
        edges.append(float(cv2.Canny(g,100,200).mean()))
        flow = cv2.calcOpticalFlowFarneback(prev_gray, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        mag, _ = cv2.cartToPolar(flow[...,0], flow[...,1])
        diffs.append(float(np.mean(mag)))
        prev_gray = g
    cap.release()
    if not diffs:
        diffs = [0.0]
    def scale(x, lo, hi):
        if hi - lo < 1e-6: return 50
        return int(np.clip(99 * (x - lo) / (hi - lo), 1, 99))
    speed = scale(np.mean(diffs), np.min(diffs), np.max(diffs if len(diffs)>1 else [np.mean(diffs)+1]))
    agility = scale(np.std(diffs), 0, np.max(diffs))
    stamina = scale(np.std(brightness), 0, max(1.0, np.max(brightness)-np.min(brightness)))
    shooting = scale(np.mean(edges), np.min(edges), np.max(edges if len(edges)>1 else [np.mean(edges)+1]))
    passing = scale(np.median(edges), np.min(edges), np.max(edges if len(edges)>1 else [np.median(edges)+1]))
    strength = int(np.clip((speed + agility + stamina) / 3, 1, 99))
    return {
        "speed": int(speed),
        "stamina": int(stamina),
        "passing": int(passing),
        "shooting": int(shooting),
        "strength": int(strength),
    }

def generate_card_image(stats: dict, out_path: str):
    w, h = 720, 960
    img = Image.new("RGBA", (w, h), (0,0,0,0))
    grad = Image.new("RGBA", (w, h), (0,0,0,0))
    for y in range(h):
        r = 90 + int(90 * y / h)
        g = 140 + int(60 * y / h)
        b = 255 - int(80 * y / h)
        ImageDraw.Draw(grad).line([(0,y),(w,y)], fill=(r,g,b,230))
    img = Image.alpha_composite(Image.new("RGBA",(w,h)), grad)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([20,20,w-20,h-20], radius=28, outline=(255,255,255,90), width=4)
    try:
        font_big = ImageFont.truetype("DejaVuSans-Bold.ttf", 64)
        font = ImageFont.truetype("DejaVuSans.ttf", 36)
    except:
        font_big = None
        font = None
    draw.text((40,40), "Matobev Player Card", fill=(255,255,255,255), font=font_big, stroke_width=1, stroke_fill=(0,0,0,80))
    labels = ["Speed","Stamina","Passing","Shooting","Strength"]
    y0 = 180
    for i, k in enumerate(["speed","stamina","passing","shooting","strength"]):
        val = stats[k]
        draw.text((60, y0 + i*120), f"{labels[i]}: {val}", fill=(255,255,255,240), font=font)
        draw.rounded_rectangle([300, y0 + i*120 + 10, 300 + int(360*val/100), y0 + i*120 + 40], radius=12, fill=(255,255,255,220))
    img.convert("RGB").save(out_path, "PNG")

async def download_to_tmp(url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
        r = await client.get(url)
        r.raise_for_status()
        fd, path = tempfile.mkstemp(suffix=".mp4")
        os.close(fd)
        with open(path, "wb") as f:
            f.write(r.content)
        return path

class AnalyzeRequestIn(BaseModel):
    video_url: str

@app.post("/analyze", response_model=AnalyzeResult)
async def analyze(req: AnalyzeRequestIn):
    try:
        tmp = await download_to_tmp(req.video_url)
        stats = compute_stats_from_video(tmp)
        out = tempfile.mktemp(suffix=".png")
        generate_card_image(stats, out)
        return AnalyzeResult(**stats, card_image_url=None)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/admin/approve")
def approve(user_id: str, approved: bool, x_admin_password: str = Header(default="")):
    if not ADMIN_PASSWORD or x_admin_password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"user_id": user_id, "approved": approved}
