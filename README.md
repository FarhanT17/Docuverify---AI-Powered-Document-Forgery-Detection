# 🛡️ Docuverify - AI-Powered Document Forgery Detection

AI-powered mobile application that detects forged documents using deep learning and computer vision.

## 📋 Features

- 📱 **Mobile-First Design** - Built with React Native
- 🤖 **AI-Powered Detection** - Microsoft DiT Vision Transformer
- 📸 **Real-Time Verification** - Capture or upload documents
- 📊 **Verification History** - Track all verifications with search & filter
- 🎨 **Professional UI** - Enterprise-grade design with smooth animations
- 🔒 **Secure & Private** - All processing done on your own server

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI
- Python 3.9+

### 1. Clone the Repository

```bash
git clone https://github.com/FarhanT17/Docuverify---AI-Powered-Document-Forgery-Detection.git

2. Install Frontend Dependencies
bash
npm install
# or
yarn install

3. Setup Backend
bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python download_model.py
python main.py

4. Run the App
bash
npx expo start

5. Scan QR Code
Scan with Expo Go (Android) or Camera app (iOS)

Press i for iOS simulator / a for Android emulator

📁 Project Structure

Docuverify-App/
├── screens/           # React Native screens
│   ├── HomeScreen.js
│   ├── CameraScreen.js
│   ├── ResultScreen.js
│   ├── HistoryScreen.js
│   └── SettingsScreen.js
├── navigation/        # Navigation files
│   ├── AppNavigator.js
│   ├── CameraStack.js
│   └── RootNavigator.js
├── assets/            # Images & icons
├── utils/             # Utility files
├── backend/           # FastAPI backend
│   ├── main.py        # API server
│   ├── download_model.py
│   ├── requirements.txt
│   └── README.md
├── App.js
├── app.json
├── package.json
└── README.md

📊 Tech Stack
Frontend	Backend	AI/ML
React Native	FastAPI	Microsoft DiT (ViT)
Expo	Python	PyTorch
React Navigation	Transformers	400K+ Documents

📸 Screenshots


🎯 How It Works
Capture - Take a photo of a document or upload from gallery

Process - The image is sent to the FastAPI backend

Analyze - The AI model classifies the document

Result - Returns prediction (Authentic/Forged) with confidence score

History - All verifications are saved locally

📊 Model Performance
Metric	Value
Accuracy	94.5%
Dataset	400K+ Documents
Model	Microsoft DiT (Vision Transformer)
Fine-tuned on	RVL-CDIP dataset

👨‍💻 Author
Farhan Tariq

MSc Cyber Security, Northumbria University

📧 farhantariq5251@gmail.com

🔗 LinkedIn: https://linkedin.com/in/farhant17

🐙 Portfolio: https://farhantariq.vercel.app/

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Northumbria University - MSc Cyber Security program

Microsoft Research - DiT Vision Transformer model

Hugging Face - Transformers library

⭐ Star this repository if you find it useful!
