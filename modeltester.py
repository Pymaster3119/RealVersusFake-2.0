# Ensure you have the necessary libraries installed
# pip install transformers torch torchvision

from transformers import pipeline

# 1. Initialize the video classification pipeline with our model
print("Loading the Deepfake Detection model...")
detector = pipeline("video-classification", model="Naman712/Deep-fake-detection")

# 2. Provide the path to your video file
video_path = "/Users/aditya/Downloads/218309_tiny.mp4"
print(f"Analyzing video: {video_path}...")

# 3. Get the prediction
result = detector(video_path)

# 4. Print the result
# The output will be a list of dictionaries with labels ('real' or 'fake') and scores.
print("Analysis Complete!")
print(result)
