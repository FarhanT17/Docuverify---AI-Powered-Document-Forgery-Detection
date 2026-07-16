from transformers import AutoImageProcessor, AutoModelForImageClassification
import os

def download_model():
    print("🤖 Downloading AI Model...")
    os.makedirs('models', exist_ok=True)
    
    model_name = "microsoft/dit-base-finetuned-rvlcdip"
    
    print("📥 Downloading processor...")
    processor = AutoImageProcessor.from_pretrained(model_name)
    processor.save_pretrained('models/processor')
    
    print("📥 Downloading model...")
    model = AutoModelForImageClassification.from_pretrained(model_name)
    model.save_pretrained('models/model')
    
    print("✅ Model downloaded!")

if __name__ == "__main__":
    download_model()
