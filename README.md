# NexEra - Full-Stack AI Prototype

A full-stack AI prototype application demonstrating intelligent 3D asset generation and avatar animation control through natural language processing.

## Project Overview

NexEra is an interactive 3D platform that combines AI-powered asset retrieval with intelligent avatar animation. Users can generate 3D models through natural language descriptions and control animated avatars using conversational commands. The system leverages OpenAI's language models to bridge the gap between human intent and 3D interactions.

## Features

### Asset Pipeline (Test 1)

- **Natural Language Asset Generation**: Describe 3D objects in plain English
- **Intelligent Model Retrieval**: AI matches descriptions to appropriate 3D models
- **Interactive 3D Viewer**: Rotate, zoom, and inspect generated assets
- **Educational Summaries**: AI-generated explanations for each asset
- **Real-time Processing**: Instant feedback and model loading

### Avatar Trainer (Test 2)

- **Conversational Animation Control**: Command avatars using natural language
- **Smart Intent Recognition**: AI maps commands to appropriate animations
- **Smooth Animation Transitions**: Seamless blending between animation states
- **Trainer Feedback**: Contextual explanations for each animation choice
- **13 Animation Types**: Dance, Jump, Wave, Sitting, Running, and more

## Tech Stack

### Frontend

- **React 18** - Modern UI framework with hooks
- **Vite** - Fast development build tool
- **Three.js** - 3D graphics rendering
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for 3D scenes
- **Axios** - HTTP client for API communication

### Backend

- **Python FastAPI** - High-performance async web framework
- **OpenAI API** - GPT-4o-mini for cost-effective AI processing
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server for production deployment
- **python-dotenv** - Environment variable management

### 3D Assets

- **Khronos Group glTF Models** - Industry-standard 3D assets
- **Three.js Robot Model** - Animated character for avatar system

## Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- Python 3.8+
- OpenAI API key

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Create `.env` file in backend directory:

```
OPENAI_API_KEY=your_openai_api_key_here
```

Start the backend server:

```bash
python main.py
```

Server runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Usage

1. Navigate to `http://localhost:5173`
2. **Test 1 (Asset Generator)**: Type descriptions like "helmet", "duck", "lantern", or "avocado"
3. **Test 2 (Avatar Trainer)**: Give commands like "make him dance", "wave hello", or "sit down"
4. Interact with 3D models using mouse controls (rotate, zoom, pan)

## API Endpoints

- `POST /generate-asset` - Generate 3D assets from text descriptions
- `POST /interact-avatar` - Control avatar animations with natural language

## Live Demo

- **Frontend**: https://alphiosjunior.github.io/NexEra/
- **Backend**: Deployed on Render

## Development Notes

- Uses gpt-4o-mini for cost-effective AI processing
- Implements proper Suspense boundaries for 3D model loading
- CORS enabled for local development
- Error handling for API failures and model loading issues

## License

MIT License - See LICENSE file for details
