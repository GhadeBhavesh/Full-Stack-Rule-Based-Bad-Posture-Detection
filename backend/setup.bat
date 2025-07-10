@echo off
echo Setting up Posture Analysis Backend...

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate

REM Install requirements
pip install -r requirements.txt

echo Backend setup complete!
echo To start the backend server:
echo 1. Activate virtual environment: venv\Scripts\activate
echo 2. Run: python app.py
pause
