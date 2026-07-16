# Docuverify Backend

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download the AI model (327 MB)
python download_model.py

# Start the server
python main.py
