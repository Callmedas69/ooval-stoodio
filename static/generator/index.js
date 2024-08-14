const canvas = document.getElementById("meme-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const fistImageTemplate = createImage("./fist.svg");
const laserImageTemplate = createImage("./laser.svg");

let canvasImage = new Image();
let elements = [];
let isDragging = false;
let currentElement = null;
let offsetX, offsetY;
let laserHue = 0;
let fistHue = 0;

canvas.width = 400;
canvas.height = 400;

document.getElementById("image-upload").addEventListener("change", handleImageUpload);
document.getElementById("add-fist-button").addEventListener("click", () => addElement(fistImageTemplate, 'fist'));
document.getElementById("add-laser-button").addEventListener("click", () => addElement(laserImageTemplate, 'laser'));
document.getElementById("resize-fist-slider").addEventListener("input", (e) => resizeElements(e, 'fist'));
document.getElementById("rotate-fist-slider").addEventListener("input", (e) => rotateElements(e, 'fist'));
document.getElementById("resize-laser-slider").addEventListener("input", (e) => resizeElements(e, 'laser'));
document.getElementById("rotate-laser-slider").addEventListener("input", (e) => rotateElements(e, 'laser'));
document.getElementById("delete-fist-button").addEventListener("click", () => deleteLastElement('fist'));
document.getElementById("delete-laser-button").addEventListener("click", () => deleteLastElement('laser'));
document.getElementById("reset-button").addEventListener("click", resetCanvas);
document.getElementById("download-button").addEventListener("click", downloadCanvas);
document.getElementById("hue-slider").addEventListener("input", (e) => updateLaserHue(e.target.value));
document.getElementById("fist-hue-slider").addEventListener("input", (e) => updateFistHue(e.target.value));

canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);
canvas.addEventListener("touchend", handleTouchEnd);

function createImage(src) {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    img.onerror = () => console.error('Failed to load image:', src);
    return img;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                displayButtonContainer();
                canvasImage.src = event.target.result;
                canvasImage.onload = () => drawCanvas();
                canvasImage.onerror = () => console.error('Failed to load canvas image');
            } catch (error) {
                console.error('Error processing image:', error);
            }
        };
        reader.onerror = () => console.error('Failed to read file');
        reader.readAsDataURL(file);
    } else {
        console.warn('No file selected');
    }
}

function displayButtonContainer() {
    document.getElementById("button-container").style.display = "flex";
}

function addElement(image, type) {
    const element = {
        image: image,
        x: Math.random() * (canvas.width - image.width),
        y: Math.random() * (canvas.height - image.height),
        width: image.width,
        height: image.height,
        scale: 1,
        rotation: 0,
        type: type
    };
    elements.push(element);
    drawCanvas();
}

function drawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (canvasImage.src) {
        ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
    }
    elements.forEach(element => {
        ctx.save();
        ctx.translate(element.x + (element.width * element.scale) / 2, element.y + (element.height * element.scale) / 2);
        ctx.rotate(element.rotation * Math.PI / 180);
        ctx.scale(element.scale, element.scale);
        ctx.filter = element.type === 'laser' ? `hue-rotate(${laserHue}deg)` :
                     element.type === 'fist' ? `hue-rotate(${fistHue}deg)` : 'none';
        ctx.drawImage(element.image, -element.width / 2, -element.height / 2);
        ctx.restore();
    });
}

function updateFistHue(hue) {
    fistHue = hue;
    drawCanvas();
}

function updateLaserHue(hue) {
    laserHue = hue;
    drawCanvas();
}

function resizeElements(e, type) {
    const newScale = e.target.value;
    elements.forEach(element => {
        if (element.type === type) {
            const scalingFactor = newScale / element.scale;
            element.scale = newScale;
            element.x -= (element.width * (scalingFactor - 1)) / 2;
            element.y -= (element.height * (scalingFactor - 1)) / 2;
            element.width *= scalingFactor;
            element.height *= scalingFactor;
        }
    });
    drawCanvas();
}

function rotateElements(e, type) {
    const rotation = e.target.value;
    elements.forEach(element => {
        if (element.type === type) {
            element.rotation = rotation;
        }
    });
    drawCanvas();
}

function deleteLastElement(type) {
    elements = elements.filter(element => element.type !== type);
    drawCanvas();
}

function resetCanvas() {
    elements = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCanvas();
}

function downloadCanvas() {
    const link = document.createElement("a");
    link.download = "meme.png";
    link.href = canvas.toDataURL();
    link.click();
}

function handleMouseDown(e) {
    startDragging(e.offsetX, e.offsetY);
}

function handleMouseMove(e) {
    if (isDragging) {
        dragElement(e.offsetX, e.offsetY);
    }
}

function handleMouseUp() {
    stopDragging();
}

function handleTouchStart(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    startDragging(touchX, touchY);
}

function handleTouchMove(e) {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        dragElement(touchX, touchY);
    }
}

function handleTouchEnd() {
    stopDragging();
}

function startDragging(x, y) {
    elements.forEach(element => {
        if (x >= element.x && x <= element.x + element.width * element.scale &&
            y >= element.y && y <= element.y + element.height * element.scale) {
            isDragging = true;
            currentElement = element;
            offsetX = x - element.x;
            offsetY = y - element.y;
        }
    });
}

function dragElement(x, y) {
    if (currentElement) {
        currentElement.x = x - offsetX;
        currentElement.y = y - offsetY;
        drawCanvas();
    }
}

function stopDragging() {
    isDragging = false;
    currentElement = null;
}
