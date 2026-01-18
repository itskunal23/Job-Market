@echo off
REM Setup script for RoleWithAI Agent Pipeline (Windows)

echo Setting up RoleWithAI Agent Pipeline...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed. Please install Python 3.9+ first.
    exit /b 1
)

echo [OK] Python found
python --version
echo.

REM Check if Ollama is installed
ollama --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Ollama is not installed.
    echo    Please install Ollama from https://ollama.ai
    echo    Then run: ollama pull llama3
    echo.
) else (
    echo [OK] Ollama found
    ollama --version
    echo.
    
    REM Check if llama3 model is available
    ollama list | findstr "llama3" >nul 2>&1
    if errorlevel 1 (
        echo [WARNING] llama3 model not found. Pulling...
        ollama pull llama3
    ) else (
        echo [OK] llama3 model is available
    )
)

echo.
echo Installing Python dependencies...
pip install -r requirements.txt

echo.
echo [OK] Setup complete!
echo.
echo To run the agent pipeline:
echo   python scripts\pipeline.py
