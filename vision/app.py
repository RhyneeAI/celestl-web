"""
Celestl Vision Service
======================
FastAPI microservice providing OCR and computer vision capabilities for Celestl.
Following CLAUDE.md separation of concerns:
- This service handles ONLY image reading and raw feature extraction.
- It contains NO rating logic, no chart constant databases, and no user accounting.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import io
from .ocr_engine import Best50Parser
from .models import Best50Response

app = FastAPI(
    title="Celestl Vision OCR Service",
    description="Dedicated OCR service for Arcaea Best 50 screenshot parsing",
    version="1.0.0",
)

# Allow CORS for Nuxt 3 web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

parser = Best50Parser()

@app.get("/")
def root():
    return {
        "service": "Celestl Vision OCR",
        "status": "online",
        "version": "1.0.0",
        "engine": "RapidOCR (PP-OCRv4 ONNX Runtime)",
    }

@app.post("/ocr/best50", response_model=Best50Response)
async def parse_best50(file: UploadFile = File(...)):
    """
    Accepts an official Arcaea Best 50 screenshot and returns raw parsed cards.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image")

    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot decode image: {str(e)}")

    try:
        result = parser.parse(image)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
