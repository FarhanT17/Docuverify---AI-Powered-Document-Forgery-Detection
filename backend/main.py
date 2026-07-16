from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
from transformers import AutoImageProcessor, AutoModelForImageClassification
from PIL import Image
import io
import uvicorn
import os

app = FastAPI(title="Docuverify API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Suspicious document types (ID documents are classified as these)
SUSPICIOUS_TYPES = ['advertisement', 'advert', 'news_article', 'scientific']

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = None
processor = None

def load_model():
    global model, processor
    try:
        print("🔄 Loading model...")
        model_path = 'models/model'
        processor_path = 'models/processor'
        
        if not os.path.exists(model_path):
            print(f"❌ Model not found at: {model_path}")
            return False
            
        processor = AutoImageProcessor.from_pretrained(processor_path)
        model = AutoModelForImageClassification.from_pretrained(model_path)
        model = model.to(device)
        model.eval()
        print(f"✅ Model loaded on: {device}")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

# Load model on startup
@app.on_event("startup")
async def startup_event():
    load_model()

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if model is not None else "degraded",
        "model_loaded": model is not None
    }

@app.post("/verify")
async def verify_document(file: UploadFile = File(...)):
    try:
        if model is None or processor is None:
            return {
                "success": False,
                "prediction": "Error",
                "confidence": 0,
                "is_forged": False,
                "risk_level": "ERROR",
                "message": "Model not loaded"
            }
        
        # Read and process image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert('RGB')
        
        # Preprocess
        inputs = processor(images=image, return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        # Predict
        with torch.no_grad():
            outputs = model(**inputs)
            probs = torch.softmax(outputs.logits, dim=1)
            confidence, predicted = torch.max(probs, 1)
        
        # Get class name
        if hasattr(model.config, 'id2label'):
            class_names = [model.config.id2label[i] for i in range(len(model.config.id2label))]
        else:
            class_names = ['Authentic', 'Forged']
        
        raw_prediction = class_names[predicted.item()]
        confidence_percentage = confidence.item() * 100
        
        # ✅ BALANCED FORGERY DETECTION
        is_forged = False
        risk_level = 'LOW'
        message = ''
        final_result = 'Authentic'
        
        # 1. Check if it's a suspicious type (ID documents)
        if raw_prediction in SUSPICIOUS_TYPES:
            # ✅ For ID documents, use a more balanced approach
            if confidence_percentage > 90:
                # Very high confidence on ID = could be AI-generated
                is_forged = True
                risk_level = 'HIGH'
                final_result = 'Forged'
                message = f'❌ AI-generated or forged document detected (too perfect)'
            elif confidence_percentage > 85:
                # High confidence - likely authentic but suspicious
                is_forged = False
                risk_level = 'MEDIUM'
                final_result = 'Authentic'
                message = f'⚠️ Document appears authentic but verify manually'
            elif confidence_percentage > 70:
                # ✅ Moderate confidence - likely authentic
                is_forged = False
                risk_level = 'LOW'
                final_result = 'Authentic'
                message = f'✅ Document verified successfully'
            elif confidence_percentage > 55:
                # Low confidence - could be authentic or forged
                is_forged = False
                risk_level = 'MEDIUM'
                final_result = 'Inconclusive'
                message = f'⚠️ Unable to verify document with certainty. Please rescan with better quality.'
            else:
                # Very low confidence - suspicious
                is_forged = True
                risk_level = 'HIGH'
                final_result = 'Forged'
                message = f'❌ Suspicious document detected (low confidence)'
        else:
            # 2. Regular documents (non-ID)
            if confidence_percentage > 80:
                final_result = 'Authentic'
                risk_level = 'LOW'
                message = f'✅ Document verified successfully'
            elif confidence_percentage > 60:
                final_result = 'Inconclusive'
                risk_level = 'MEDIUM'
                message = f'⚠️ Unable to verify document. Please try again with better image.'
            else:
                final_result = 'Inconclusive'
                risk_level = 'HIGH'
                message = f'⚠️ Poor quality or suspicious document. Please retry.'
        
        return {
            "success": True,
            "prediction": final_result,
            "confidence": round(confidence_percentage, 2),
            "is_forged": is_forged,
            "risk_level": risk_level,
            "message": message,
            "document_type": raw_prediction
        }
    
    except Exception as e:
        print(f"❌ Error: {e}")
        return {
            "success": False,
            "prediction": "Error",
            "confidence": 0,
            "is_forged": False,
            "risk_level": "ERROR",
            "message": f"Error: {str(e)}"
        }

@app.get("/")
async def root():
    return {
        "name": "Docuverify API",
        "version": "1.0.0",
        "status": "running",
        "model_loaded": model is not None
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
