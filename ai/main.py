from fastapi import FastAPI
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
import torch
from io import BytesIO
import base64

# Creates the web server
app = FastAPI()

# Every request must send JSON with a prompt field
class GenerateRequest(BaseModel):
    prompt: str

# Loads the AI model and runs it on CPU
pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float32
)
pipe = pipe.to("cpu")

@app.post("/generate")
def generate(request: GenerateRequest):
    image = pipe(
    request.prompt,
    num_inference_steps=12,
    guidance_scale=7.5,
    height=384,
    width=384
).images[0]
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return { "image": img_base64 }
