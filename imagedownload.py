from PIL import Image
import requests
from io import BytesIO
image_url = "https://www.nasa.gov/wp-content/uploads/2024/11/grc-2024-c-12427-002-e1731959466240.jpg?w=1024"
response = requests.get(image_url)
if response.status_code == 200:
    image = Image.open(BytesIO(response.content))
    image.show()