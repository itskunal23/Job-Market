#!/bin/bash
# Setup script for RoleWithAI Agent Pipeline

echo "Setting up RoleWithAI Agent Pipeline..."
echo ""

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.9+ first."
    exit 1
fi

echo "✅ Python found: $(python --version)"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not installed."
    echo "   Please install Ollama from https://ollama.ai"
    echo "   Then run: ollama pull llama3"
    echo ""
else
    echo "✅ Ollama found: $(ollama --version)"
    echo ""
    
    # Check if llama3 model is available
    if ollama list | grep -q "llama3"; then
        echo "✅ llama3 model is available"
    else
        echo "⚠️  llama3 model not found. Pulling..."
        ollama pull llama3
    fi
fi

echo ""
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the agent pipeline:"
echo "  python scripts/pipeline.py"
