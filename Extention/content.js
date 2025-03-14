// Initialize the Set to keep track of processed images
const processedImages = new Set();

async function isImageAI(imageUrl) {
    const response = await fetch('https://realversusfake2-0-backend.onrender.com/check-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imageUrl, url: window.location.href }),
        mode: 'cors'
    });    
    const data = await response.json();
    return data.is_ai_generated;
}

async function processImage(image) {
    if (processedImages.has(image)) return;

    const imageUrl = image.src;
    processedImages.add(image);

    // Check if the image is AI-generated
    const isAI = await isImageAI(imageUrl);
    if (!isAI) return;

    // Create and style the button as before
    const button = document.createElement('button');
    button.innerHTML = 'This image looks AI generated';
    button.style.position = 'absolute';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.cursor = 'pointer';
    button.style.textAlign = 'center';
    button.style.zIndex = '1';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';

    image.style.position = 'relative';
    button.style.width = `${image.width}px`;
    button.style.height = `${image.height}px`;

    image.style.display = 'none';
    image.parentNode.insertBefore(button, image);

    // Check if the image is inside a link
    const link = image.closest('a');
    if (link) {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            image.style.display = 'block';
            button.style.display = 'none';
        });

        // Prevent the link from being followed
        link.addEventListener('click', (event) => {
            event.preventDefault();
        }, { capture: true });
    } else {
        // If no link, just reveal the image
        button.addEventListener('click', () => {
            image.style.display = 'block';
            button.style.display = 'none';
        });
    }

    // Observe changes in the image size
    const observer = new MutationObserver(() => {
        button.style.width = `${image.width}px`;
        button.style.height = `${image.height}px`;
    });

    observer.observe(image, { attributes: true, attributeFilter: ['width', 'height'] });
}

async function update() {
    // Find all image elements on the page
    const images = document.querySelectorAll('img');
    for (let image of images) {
        await processImage(image);
    }
}

// Initial run
update();

// Observe the document for added images
const observer = new MutationObserver(() => {
    update();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

window.addEventListener('message', (event) => {
    console.log('Received message:', event.data);
    // Optionally verify event.origin if needed.
    if (event.data.action === 'closeIframe') {
        const iframe = document.getElementById('result-iframe');
        if (iframe) {
        iframe.remove();
        }
    }
});