from fastapi import FastAPI
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline
import torch

app = FastAPI()

class GenerateRequest(BaseModel):
    prompt: str

pipe = StableDiffusionPipeline.from_pretrained(
    "runwayml/stable-diffusion-v1-5",
    torch_dtype=torch.float32
)
pipe = pipe.to("cpu")

@app.post("/generate")
def generate(request: GenerateRequest):
    image = pipe(request.prompt, num_inference_steps=20).images[0]
    image.save("output.png")
    return {"message": "Image generated"}
