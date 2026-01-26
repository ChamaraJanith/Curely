from fastapi import FastAPI, UploadFile, File, HTTPException
from pathlib import Path

app = FastAPI()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        contents = await file.read()
        save_path = UPLOAD_DIR / file.filename
        with open(save_path, "wb") as f:
            f.write(contents)
    except Exception:
        raise HTTPException(status_code=500, detail="Upload failed")
    finally:
        await file.close()

    return {"message": "PDF uploaded", "filename": file.filename}
