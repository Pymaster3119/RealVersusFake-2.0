import torch
from PIL import Image
print(torch.__version__)
from transformers import pipeline

# Load the model
pipe = pipeline('image-classification', model="date3k2/vit-real-fake-classification-v3", device=0)

# Predict on an image
result = pipe(Image.open("ai_generated.jpg"))
print(result)
result = pipe(Image.open("real.png"))
print(result)