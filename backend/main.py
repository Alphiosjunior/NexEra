from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import base64
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. THE ULTIMATE MODEL CATALOG ---
# A massive list of public assets from Three.js and Khronos
MODEL_CATALOG = {
    # --- CHARACTERS ---
    "robot_silver": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb",
    "soldier": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb",
    
    # --- ANIMALS / NATURE ---
    "duck": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
    "fish": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BarramundiFish/glTF-Binary/BarramundiFish.glb",
    "flamingo": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Flamingo.glb",
    "parrot": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Parrot.glb",
    "stork": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Stork.glb",
    "horse": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Horse.glb",
    "avocado": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb",
    "mosquito": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MosquitoInAmber/glTF-Binary/MosquitoInAmber.glb",
    
    # --- VEHICLES ---
    "buggy": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Buggy/glTF-Binary/Buggy.glb",
    "damaged_helmet": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    "scifi_helmet": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    "flight_helmet": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb",
    
    # --- ARCHITECTURE / PROPS ---
    "lantern": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb",
    "boombox": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb",
    "corset": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Corset/glTF-Binary/Corset.glb",
    "chair": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb",
    "antique_camera": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb",
    "typewriter": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Typewriter/glTF-Binary/Typewriter.glb",
    "pocket_watch": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/PocketWatch/glTF-Binary/PocketWatch.glb",
    "sneaker": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
    
    # --- SCENES ---
    "littlest_tokyo": "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/LittlestTokyo.glb",
}

# --- TEST 1: ASSET GENERATOR ---
@app.post("/generate-asset")
async def generate_asset(prompt: str = Form(None), image: UploadFile = File(None)):
    available_keys = list(MODEL_CATALOG.keys())
    messages = []

    # CASE A: Image Uploaded (Vision)
    if image:
        contents = await image.read()
        base64_image = base64.b64encode(contents).decode('utf-8')
        system_prompt = f"Analyze this image. Find the best match from: {available_keys}. Return JSON: {{ 'selected_key': 'key', 'summary': '1-sentence summary' }}"
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": [{"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}]}
        ]
    # CASE B: Text Prompt
    else:
        user_input = prompt if prompt else "A generic object"
        system_prompt = f"Match user text '{user_input}' to one of: {available_keys}. Return JSON: {{ 'selected_key': 'key', 'summary': '1-sentence summary' }}"
        messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_input}]

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        selected_key = data.get("selected_key", "damaged_helmet")
        summary = data.get("summary", "AI generated content.")
        
        if selected_key not in MODEL_CATALOG:
            return {
                "model_url": None,
                "summary": "No matching 3D model found in our catalog. Try describing common objects like animals, vehicles, or everyday items.",
                "error": True
            }
            
        return {"model_url": MODEL_CATALOG[selected_key], "summary": summary}
    except Exception as e:
        print(f"Error: {e}")
        return {
            "model_url": None,
            "summary": "Unable to process your request. Please try again with a different description or image.",
            "error": True
        }

# --- TEST 2: AVATAR INTERACTION (Keep unchanged) ---
class AvatarRequest(BaseModel):
    command: str

@app.post("/interact-avatar")
async def interact_avatar(request: AvatarRequest):
    user_command = request.command.lower()
    system_prompt = "You are a logic engine for a 3D classroom. Locations: [board, teacher_desk, lantern, student_desk, center]. Return JSON: { 'animation': 'run/walk/agree/headShake/idle', 'target': 'location_id', 'explanation': 'status' }"
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_command}],
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"animation": "idle", "target": "none", "explanation": "AI Error"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "NexEra Learning Platform"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)