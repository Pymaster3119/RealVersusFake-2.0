// Initialize caches to keep track of processed images
const processedImages = new Set();
const processedImageSources = new Set();
const linkBlockers = new WeakMap();

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureStylesInjected, { once: true });
} else {
    ensureStylesInjected();
}

function ensureStylesInjected() {
    const styleId = 'rvf-dynamic-styles';
    if (document.getElementById(styleId)) {
        return;
    }

    const css = `
    .rvf-alert-button {
        font-family: inherit;
    }
    .rvf-replacement-wrapper {
        position: relative;
        display: inline-block;
        width: 100%;
        max-width: 100%;
        margin-bottom: 12px;
    }
    .rvf-replacement-stage {
        position: relative;
        width: 100%;
        overflow: hidden;
        border-radius: 8px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
        background-color: #ffffff;
    }
    .rvf-replacement-image {
        display: block;
        width: 100%;
        height: auto;
        border-radius: 8px;
    }
    .rvf-replacement-banner {
        position: absolute;
        top: 12px;
        left: 12px;
        background: rgba(13, 110, 253, 0.9);
        color: #ffffff;
        padding: 6px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.2px;
    }
    .rvf-replacement-controls {
        display: flex;
        justify-content: flex-end;
        margin-top: 10px;
    }
    .rvf-toggle-original {
        background: rgba(33, 37, 41, 0.9);
        color: #ffffff;
        border: none;
        border-radius: 999px;
        padding: 8px 18px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.25);
        transition: background 0.2s ease-in-out, transform 0.2s ease-in-out;
    }
    .rvf-toggle-original:hover,
    .rvf-toggle-original:focus-visible {
        background: rgba(33, 37, 41, 0.95);
        transform: translateY(-1px);
        outline: none;
    }
    .rvf-toggle-original:focus-visible {
        box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.35);
    }
    .rvf-replacement-info {
        margin-top: 10px;
        padding: 10px 12px;
        font-size: 13px;
        line-height: 1.4;
        color: #1c1c1c;
        background: #f8f9fa;
        border-left: 4px solid #0d6efd;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .rvf-alert-button--ai {
        border: none;
        padding: 0;
        background: rgba(0, 0, 0, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background 0.2s ease-in-out;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        border-radius: 12px;
    }
    .rvf-alert-button--ai:hover,
    .rvf-alert-button--ai:focus-visible {
        background: rgba(0, 0, 0, 0.55);
        transform: scale(1.01);
        outline: none;
    }
    .rvf-alert-button--ai * {
        pointer-events: none;
    }
    .rvf-ai-card {
        position: relative;
        width: 100%;
        height: 100%;
        background: #fff4e1;
        border-radius: 18px;
        box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: clamp(16px, 7%, 64px) clamp(12px, 5%, 48px);
        box-sizing: border-box;
    }
    .rvf-ai-card--critical .rvf-ai-card__border {
        background: #dc3545;
    }
    .rvf-ai-card--critical .rvf-ai-card__badge-icon circle:nth-of-type(2),
    .rvf-ai-card--critical .rvf-ai-card__badge-icon circle:nth-of-type(4) {
        fill: #dc3545;
    }
    .rvf-ai-card__border {
        position: absolute;
        top: 0;
        bottom: 0;
        width: clamp(4px, 1.2%, 10px);
        background: #6c8b3a;
    }
    .rvf-ai-card__border--left {
        left: 0;
    }
    .rvf-ai-card__border--right {
        right: 0;
    }
    .rvf-ai-card__badge {
        position: absolute;
        width: clamp(48px, 10%, 128px);
        aspect-ratio: 1 / 1;
        display: block;
        line-height: 0;
    }
    .rvf-ai-card__badge--top-left {
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
    }
    .rvf-ai-card__badge--top-right {
        bottom: 0;
        right: 0;
        transform: translate(50%, 50%);
    }
    .rvf-ai-card__badge-icon {
        width: 100%;
        height: 100%;
        display: block;
    }
    .rvf-ai-card__sparkle {
        position: absolute;
        width: clamp(40px, 18%, 86px);
        height: clamp(40px, 18%, 86px);
        pointer-events: none;
    }
    .rvf-ai-card__sparkle--left {
        left: 24%;
        bottom: 24%;
        transform-origin: center;
        transform: translate(-50%, 50%);
    }
    .rvf-ai-card__sparkle--right {
        right: 24%;
        bottom: 24%;
        transform-origin: center;
        transform: translate(50%, 50%);
    }
    .rvf-ai-card__sparkle-icon {
        width: 100%;
        height: 100%;
        display: block;
    }
    .rvf-ai-card__text {
        position: relative;
        width: 100%;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        color: #6c8b3a;
        font-family: "CherryBombOne-Regular", "Trebuchet MS", sans-serif;
        letter-spacing: 0.8px;
    }
    .rvf-ai-card__headline {
        font-size: clamp(18px, 6vw, 42px);
        line-height: 1.1;
        text-transform: uppercase;
        text-shadow: -0.4px -0.4px 0 #000000, 0.4px -0.4px 0 #000000, -0.4px 0.4px 0 #000000, 0.4px 0.4px 0 #000000;
        align-self: center;
        text-align: center;
        width: 100%;
    }
    .rvf-ai-card--critical .rvf-ai-card__headline {
        color: #dc3545;
    }
    .rvf-ai-card__hint {
        font-family: "CherryBomb-Regular", "Trebuchet MS", sans-serif;
        font-size: clamp(12px, 3.6vw, 20px);
        color: #000000;
        text-shadow: none;
        letter-spacing: 0.4px;
        text-align: center;
        width: 100%;
    }
    `;

    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = css;
    (document.head || document.documentElement).appendChild(styleTag);
}

const RVF_AI_BADGE_SVG = `
<svg class="rvf-ai-card__badge-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <circle cx="100" cy="100" r="90" fill="#FC928E"></circle>
  <circle cx="100" cy="100" r="65" fill="#6C8B3A"></circle>
  <circle cx="100" cy="100" r="40" fill="#FC928E"></circle>
  <circle cx="100" cy="100" r="15" fill="#6C8B3A"></circle>
</svg>`;

const RVF_AI_SPARKLE_SVG = `
<svg class="rvf-ai-card__sparkle-icon" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <path d="M100 40 L110 90 L160 100 L110 110 L100 160 L90 110 L40 100 L90 90 Z" fill="#000000" stroke="#E8C547" stroke-width="2"></path>
  <path d="M50 50 L54 70 L70 74 L54 78 L50 98 L46 78 L30 74 L46 70 Z" fill="#000000" stroke="#E8C547" stroke-width="1"></path>
  <path d="M150 50 L154 70 L170 74 L154 78 L150 98 L146 78 L130 74 L146 70 Z" fill="#000000" stroke="#E8C547" stroke-width="1"></path>
  <path d="M50 130 L54 145 L70 150 L54 155 L50 170 L46 155 L30 150 L46 145 Z" fill="#000000" stroke="#E8C547" stroke-width="1"></path>
  <path d="M150 130 L154 145 L170 150 L154 155 L150 170 L146 155 L130 150 L146 145 Z" fill="#000000" stroke="#E8C547" stroke-width="1"></path>
</svg>`;

function escapeHtml(value) {
    const str = String(value ?? '');
    return str.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case '\'':
                return '&#39;';
            default:
                return char;
        }
    });
}

function buildAiCardMarkup(message, { critical = false } = {}) {
    const cardClass = critical ? 'rvf-ai-card rvf-ai-card--critical' : 'rvf-ai-card';
    const safeMessage = escapeHtml(message);
    return `
        <div class="${cardClass}">
            <span class="rvf-ai-card__border rvf-ai-card__border--left"></span>
            <span class="rvf-ai-card__border rvf-ai-card__border--right"></span>
            <span class="rvf-ai-card__badge rvf-ai-card__badge--top-left">${RVF_AI_BADGE_SVG}</span>
            <span class="rvf-ai-card__badge rvf-ai-card__badge--top-right">${RVF_AI_BADGE_SVG}</span>
            <span class="rvf-ai-card__sparkle rvf-ai-card__sparkle--left">${RVF_AI_SPARKLE_SVG}</span>
            <span class="rvf-ai-card__sparkle rvf-ai-card__sparkle--right">${RVF_AI_SPARKLE_SVG}</span>
            <div class="rvf-ai-card__text">
                <span class="rvf-ai-card__headline">${safeMessage}</span>
                <span class="rvf-ai-card__hint">Click to hide this warning</span>
            </div>
        </div>
    `;
}

function getImageDimensions(image) {
    const rect = image.getBoundingClientRect ? image.getBoundingClientRect() : { width: 0, height: 0 };
    const naturalWidth = image.naturalWidth || 0;
    const naturalHeight = image.naturalHeight || 0;

    let width = Math.round(rect.width || image.width || naturalWidth);
    let height = Math.round(rect.height || image.height || naturalHeight);

    if (!width && naturalWidth) {
        width = Math.round(naturalWidth);
    }

    if (!height) {
        const ratio = naturalWidth > 0 ? naturalHeight / naturalWidth : 0.75;
        height = Math.max(1, Math.round((width || 320) * ratio || 200));
    }

    if (!width) {
        width = 320;
    }

    return { width, height };
}

async function checkImage(imageUrl) {
    const response = await fetch('http://127.0.0.1:8080/check-image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imageUrl, url: window.location.href }),
        mode: 'cors'
    });    
    if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
    }
    const data = await response.json();
    return {
        isAI: data.is_ai_generated,
        isDeceptiveGraph: data.is_deceptive_graph,
        score: data.score,
        replacementChart: data.replacement_chart || null
    };
}

async function processImage(image) {
    if (!image) return;

    const imageUrl = image.currentSrc || image.src || image.dataset.rvfOriginalSrc || '';

    if (image.dataset && image.dataset.rvfReplacement === 'true') {
        if (imageUrl) {
            processedImageSources.add(imageUrl);
        }
        processedImages.add(image);
        return;
    }

    const wrapper = image.closest('.rvf-replacement-wrapper');
    if (wrapper) {
        if (imageUrl) {
            processedImageSources.add(imageUrl);
        }
        processedImages.add(image);
        return;
    }

    if (imageUrl && processedImageSources.has(imageUrl)) {
        processedImages.add(image);
        return;
    }

    if (processedImages.has(image)) return;

    if ((!image.src && !image.currentSrc) || image.dataset.rvfProcessing === 'true') {
        return;
    }

    //Check if the image is less than 500x500
    dims = getImageDimensions(image);
    if (dims.width < 500 || dims.height < 500) {
        processedImages.add(image);
        if (imageUrl) {
            processedImageSources.add(imageUrl);
        }
        return;
    }

    if (!image.complete || image.naturalWidth === 0) {
        image.dataset.rvfProcessing = 'true';
        image.addEventListener('load', () => {
            image.dataset.rvfProcessing = 'false';
            processImage(image);
        }, { once: true });
        return;
    }

    processedImages.add(image);
    if (imageUrl) {
        processedImageSources.add(imageUrl);
    }

    const finalImageUrl = image.currentSrc || image.src;
    if (!finalImageUrl) {
        return;
    }

    image.dataset.rvfOriginalSrc = finalImageUrl;
    processedImageSources.add(finalImageUrl);
    let checkResult;
    try {
        checkResult = await checkImage(finalImageUrl);
    } catch (error) {
        console.error('Failed to analyse image', error);
        return;
    }

    if (!checkResult || (!checkResult.isAI && !checkResult.isDeceptiveGraph)) {
        return;
    }

    const dimensions = getImageDimensions(image);

    removeExistingOverlays(image);

    if (checkResult.isDeceptiveGraph) {
        const displayed = displayReplacementChart(image, checkResult, dimensions);
        if (displayed) {
            return;
        }
    }

    if (checkResult.isAI) {
        createAlertButton(image, checkResult, dimensions);
    }
}

function createAlertButton(image, checkResult, dimensions) {
    const parent = image.parentNode;
    if (!parent) return;

    const button = document.createElement('button');
    button.className = 'rvf-alert-button';
    button.type = 'button';

    let buttonText = '';
    let buttonColor = '#007bff';
    const isCritical = checkResult.isAI && checkResult.isDeceptiveGraph;
    const useAiCard = checkResult.isAI;

    if (isCritical) {
        buttonText = 'AI generated & deceptive chart';
        buttonColor = '#dc3545';
    } else if (checkResult.isAI) {
        buttonText = 'This image looks AI generated';
        buttonColor = '#007bff';
    } else if (checkResult.isDeceptiveGraph) {
        buttonText = 'This chart may be misleading';
        buttonColor = '#fd7e14';
    } else {
        return;
    }

    const baseBoxShadow = useAiCard
        ? (isCritical ? '0 6px 18px rgba(220,53,69,0.28)' : '0 6px 16px rgba(0,0,0,0.25)')
        : '0 4px 12px rgba(0,0,0,0.2)';
    const hoverBoxShadow = useAiCard
        ? (isCritical ? '0 8px 22px rgba(220,53,69,0.32)' : '0 8px 18px rgba(0,0,0,0.3)')
        : '0 6px 16px rgba(0,0,0,0.25)';

    button.style.position = 'relative';
    button.style.zIndex = '1';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.transition = 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out';
    button.style.textAlign = 'center';

    if (useAiCard) {
        button.classList.add('rvf-alert-button--ai');
        button.innerHTML = buildAiCardMarkup(buttonText, { critical: isCritical });
        const overlayTint = isCritical ? 'rgba(220, 53, 69, 0.45)' : 'rgba(0, 0, 0, 0.45)';
        button.style.backgroundColor = overlayTint;
        button.style.color = '#1c1c1c';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.fontSize = 'inherit';
        button.style.fontWeight = 'inherit';
        button.style.borderRadius = '12px';
        button.style.padding = '0';
        button.style.boxShadow = baseBoxShadow;
    } else {
        button.textContent = buttonText;
        button.style.backgroundColor = buttonColor;
        button.style.color = '#ffffff';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.borderRadius = '6px';
        button.style.padding = '12px';
        button.style.boxShadow = baseBoxShadow;
    }

    const { width, height } = dimensions;
    button.style.width = `${width}px`;
    button.style.height = `${height}px`;

    const link = image.closest('a');

    const observer = new MutationObserver(() => {
        const updated = getImageDimensions(image);
        button.style.width = `${updated.width}px`;
        button.style.height = `${updated.height}px`;
    });

    const revealOriginal = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const previousDisplay = image.dataset.rvfOriginalDisplay || 'block';
        image.style.display = previousDisplay;
        observer.disconnect();
        button.remove();
        if (link) {
            const blocker = linkBlockers.get(link);
            if (blocker) {
                link.removeEventListener('click', blocker, true);
                linkBlockers.delete(link);
            }
        }
    };

    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.02)';
        button.style.boxShadow = hoverBoxShadow;
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
        button.style.boxShadow = baseBoxShadow;
    });

    button.addEventListener('click', revealOriginal);
    button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            revealOriginal(event);
        }
    });

    button.setAttribute('aria-label', `${buttonText}. Click to reveal the original image.`);

    if (link) {
        let blocker = linkBlockers.get(link);
        if (!blocker) {
            blocker = (event) => {
                event.preventDefault();
                event.stopPropagation();
            };
            linkBlockers.set(link, blocker);
        }
        link.addEventListener('click', blocker, true);
    }

    image.dataset.rvfOriginalDisplay = image.style.display || '';
    if (image.dataset.rvfOriginalSrc) {
        processedImageSources.add(image.dataset.rvfOriginalSrc);
    }
    image.style.position = 'relative';
    image.style.display = 'none';

    parent.insertBefore(button, image);

    observer.observe(image, { attributes: true, attributeFilter: ['width', 'height', 'style', 'class'] });
}

function removeExistingOverlays(image) {
    const parent = image.parentNode;
    if (!parent) return;

    parent.querySelectorAll('.rvf-alert-button, .rvf-replacement-wrapper').forEach(el => {
        if (el.parentNode === parent) {
            el.remove();
        }
    });

    if (image.dataset.rvfOriginalDisplay !== undefined) {
        image.style.display = image.dataset.rvfOriginalDisplay || '';
        delete image.dataset.rvfOriginalDisplay;
    } else {
        image.style.display = '';
    }

    const link = image.closest('a');
    if (link) {
        const blocker = linkBlockers.get(link);
        if (blocker) {
            link.removeEventListener('click', blocker, true);
            linkBlockers.delete(link);
        }
    }
}

function displayReplacementChart(image, checkResult, dimensions) {
    const parent = image.parentNode;
    if (!parent) return false;

    const payload = checkResult.replacementChart;
    if (!payload || !payload.image) {
        return false;
    }

    const { width, height } = dimensions;

    const wrapper = document.createElement('div');
    wrapper.className = 'rvf-replacement-wrapper';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';
    wrapper.style.maxWidth = `${width}px`;

    const stage = document.createElement('div');
    stage.className = 'rvf-replacement-stage';
    stage.style.minHeight = `${height}px`;
    stage.style.width = '100%';

    const replacementImg = document.createElement('img');
    replacementImg.className = 'rvf-replacement-image';
    replacementImg.src = payload.image;
    replacementImg.alt = payload.caption || 'Corrected chart generated with GPT-5 nano';
    replacementImg.loading = 'lazy';
    replacementImg.style.width = '100%';
    replacementImg.style.height = 'auto';
    replacementImg.dataset.rvfReplacement = 'true';
    processedImages.add(replacementImg);
    processedImageSources.add(replacementImg.src);

    const banner = document.createElement('div');
    banner.className = 'rvf-replacement-banner';
    banner.textContent = payload.caption || 'Corrected chart generated with GPT-5 nano';

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'rvf-toggle-original';
    toggleBtn.type = 'button';
    toggleBtn.textContent = 'View original chart';
    toggleBtn.setAttribute('aria-pressed', 'false');

    const infoText = document.createElement('div');
    infoText.className = 'rvf-replacement-info';
    const correctedCopy = checkResult.isAI
        ? 'GPT-5 nano rebuilt this chart after flagging the original as AI-generated and misleading. Click "View original chart" to restore the untouched graphic.'
        : 'GPT-5 nano rebuilt this chart after flagging the original as misleading. Click "View original chart" to restore the graphic.';
    infoText.textContent = correctedCopy;

    const controls = document.createElement('div');
    controls.className = 'rvf-replacement-controls';
    controls.appendChild(toggleBtn);

    stage.appendChild(replacementImg);
    stage.appendChild(banner);

    wrapper.appendChild(stage);
    wrapper.appendChild(controls);
    wrapper.appendChild(infoText);

    parent.insertBefore(wrapper, image);

    const link = image.closest('a');
    if (link) {
        let blocker = linkBlockers.get(link);
        if (!blocker) {
            blocker = (event) => {
                event.preventDefault();
                event.stopPropagation();
            };
            linkBlockers.set(link, blocker);
        }
        link.addEventListener('click', blocker, true);
    }

    const blockNavigation = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    stage.addEventListener('click', blockNavigation);

    const restoreOriginal = () => {
        if (wrapper.parentNode) {
            wrapper.parentNode.removeChild(wrapper);
        }
        if (link) {
            const blocker = linkBlockers.get(link);
            if (blocker) {
                link.removeEventListener('click', blocker, true);
                linkBlockers.delete(link);
            }
        }
        if (image.dataset && image.dataset.rvfOriginalDisplay !== undefined) {
            image.style.display = image.dataset.rvfOriginalDisplay || '';
            delete image.dataset.rvfOriginalDisplay;
        } else {
            image.style.display = '';
        }
        processedImages.add(image);
        if (image.dataset && image.dataset.rvfOriginalSrc) {
            processedImageSources.add(image.dataset.rvfOriginalSrc);
        }
    };

    toggleBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        restoreOriginal();
    });

    toggleBtn.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            restoreOriginal();
        }
    });

    replacementImg.addEventListener('load', () => {
        const updatedHeight = replacementImg.getBoundingClientRect().height;
        if (updatedHeight) {
            stage.style.minHeight = `${Math.round(updatedHeight)}px`;
        }
    });

    image.dataset.rvfOriginalDisplay = image.style.display || '';
    image.style.display = 'none';
    return true;
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