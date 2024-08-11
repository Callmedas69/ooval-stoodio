const canvas = document.getElementById("meme-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const fistImageTemplate = createImage("/fist.svg");
const laserImageTemplate = createImage("/laser.svg");

let canvasImage = new Image();
let elements = [];
let isDragging = false;
let currentElement = null;
let offsetX, offsetY;
let laserHue = 0; // Variable to store laser hue value
let fistHue = 0; // Variable to store fist hue value


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

function drawCanvasImage(src) {
    const img = new Image();
    img.src = src;
    img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawCanvas();
    };
    img.onerror = () => console.error('Failed to load canvas image');
}

function drawCanvas() {
    try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (canvasImage.src) {
            ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
        }
        elements.forEach(element => {
            ctx.save();
            ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
            ctx.rotate(element.rotation * Math.PI / 180);
            ctx.scale(element.scale, element.scale);
            if (element.type === 'laser') {
                ctx.filter = `hue-rotate(${laserHue}deg)`;
            } else if (element.type === 'fist') {
                ctx.filter = `hue-rotate(${fistHue}deg)`;
            } else {
                ctx.filter = 'none'; // Reset filter for other elements
            }
            ctx.drawImage(element.image, -element.width / 2, -element.height / 2);
            ctx.restore();
        });
    } catch (error) {
        console.error('Error drawing canvas:', error);
    }
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
    const scale = e.target.value;
    elements.forEach(element => {
        if (element.type === type) {
            element.scale = scale;
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
    drawCanvasImage(canvasImage.src); // Redraw the background image
}

function downloadCanvas() {
    try {
        const imageDataUrl = canvas.toDataURL();
        const link = document.createElement("a");
        link.href = imageDataUrl;
        link.download = "fist-studio.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error saving canvas:', error);
    }
}

function handleMouseDown(e) {
    const { mouseX, mouseY } = getMousePosition(e);
    currentElement = findElement(mouseX, mouseY);

    if (currentElement) {
        isDragging = true;
        offsetX = mouseX - currentElement.x;
        offsetY = mouseY - currentElement.y;
    }
}

function handleMouseMove(e) {
    if (isDragging && currentElement) {
        const { mouseX, mouseY } = getMousePosition(e);
        currentElement.x = mouseX - offsetX;
        currentElement.y = mouseY - offsetY;
        drawCanvas();
    }
}

function handleMouseUp() {
    isDragging = false;
    currentElement = null;
}

function handleTouchStart(e) {
    e.preventDefault();
    const { mouseX, mouseY } = getTouchPosition(e);
    currentElement = findElement(mouseX, mouseY);

    if (currentElement) {
        isDragging = true;
        offsetX = mouseX - currentElement.x;
        offsetY = mouseY - currentElement.y;
    }
}

function handleTouchMove(e) {
    if (isDragging && currentElement) {
        e.preventDefault();
        const { mouseX, mouseY } = getTouchPosition(e);
        currentElement.x = mouseX - offsetX;
        currentElement.y = mouseY - offsetY;
        drawCanvas();
    }
}

function handleTouchEnd() {
    isDragging = false;
    currentElement = null;
}

function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        mouseX: e.clientX - rect.left,
        mouseY: e.clientY - rect.top
    };
}

function getTouchPosition(e) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    return {
        mouseX: touch.clientX - rect.left,
        mouseY: touch.clientY - rect.top
    };
}

function findElement(mouseX, mouseY) {
    return elements.find(element =>
        mouseX > element.x &&
        mouseX < element.x + element.width &&
        mouseY > element.y &&
        mouseY < element.y + element.height
    );
}

function displayButtonContainer() {
    document.getElementById("button-container").style.display = "grid";
}
