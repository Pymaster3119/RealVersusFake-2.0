import os
from llama_cpp import Llama

# Path to your GGUF quantized model
MODEL_PATH = "Qwen2.5-VL-32B-Instruct-Q4_K_M.gguf"

# Initialize model
llm = Llama(
    model_path=MODEL_PATH,
    n_ctx=2048,
    n_threads=os.cpu_count(),   # Use all available CPU threads
    n_batch=512,
    n_gpu_layers=-1             # On Mac: offload to Metal GPU; on Windows CPU: set to 0
)

# Ask user for image + question
image_path = "this-chart-from-openais-official-gpt-5-release-video-v0-v5gtq8s4rmhf1.jpeg.png"
question = "What does this chart represent?"

# Run inference with image + text
output = llm.create_chat_completion(
    messages=[
        {
            "role": "user",
            "content": question,
            "images": [image_path]   # Attach image
        }
    ],
    max_tokens=50,
)

# Print response
print("Model output:", output["choices"][0]["message"]["content"])