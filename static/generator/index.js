const canvas = document.getElementById("meme-canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const fistImageTemplate = createImage("./fist.svg");
const laserImageTemplate = createImage("./laser.svg");

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
    console.log('Image upload event triggered');
    const file = e.target.files[0];
    if (file) {
        console.log('File selected:', file.name);
        const reader = new FileReader();
        reader.onload = function (event) {
            try {
                console.log('File read successfully');
                displayButtonContainer();
                canvasImage.src = event.target.result;
                canvasImage.onload = () => {
                    console.log('Image loaded onto canvas');
                    drawCanvas();
                };
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
            // Calculate the scaling factor
            const scalingFactor = newScale / element.scale;

            // Update the scale
            element.scale = newScale;

            // Adjust the position to keep the element in place
            element.x -= (element.width * (scalingFactor - 1)) / 2;
            element.y -= (element.height * (scalingFactor - 1)) / 2;

            // Update width and height based on the new scale
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
    console.log('Reset button clicked');
    elements = [];
    drawCanvas();
    if (canvasImage.src) {
        ctx.drawImage(canvasImage, 0, 0, canvas.width, canvas.height);
    }
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
        const centerX = currentElement.x + (currentElement.width * currentElement.scale) / 2;
        const centerY = currentElement.y + (currentElement.height * currentElement.scale) / 2;
        offsetX = mouseX - centerX;
        offsetY = mouseY - centerY;
    }
}

function handleMouseMove(e) {
    if (isDragging && currentElement) {
        const { mouseX, mouseY } = getMousePosition(e);
        currentElement.x = mouseX - (currentElement.width * currentElement.scale) / 2 - offsetX;
        currentElement.y = mouseY - (currentElement.height * currentElement.scale) / 2 - offsetY;
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
        const centerX = currentElement.x + (currentElement.width * currentElement.scale) / 2;
        const centerY = currentElement.y + (currentElement.height * currentElement.scale) / 2;
        offsetX = mouseX - centerX;
        offsetY = mouseY - centerY;
    }
}

function handleTouchMove(e) {
    e.preventDefault();
    if (isDragging && currentElement) {
        const { mouseX, mouseY } = getTouchPosition(e);
        currentElement.x = mouseX - (currentElement.width * currentElement.scale) / 2 - offsetX;
        currentElement.y = mouseY - (currentElement.height * currentElement.scale) / 2 - offsetY;
        drawCanvas();
    }
}

function handleTouchEnd() {
    isDragging = false;
    currentElement = null;
}

function getMousePosition(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    return { mouseX, mouseY };
}

function getTouchPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;
    return { mouseX, mouseY };
}

function findElement(x, y) {
    return elements.find(element => {
        const elementCenterX = element.x + (element.width * element.scale) / 2;
        const elementCenterY = element.y + (element.height * element.scale) / 2;
        return (
            x >= elementCenterX - (element.width * element.scale) / 2 &&
            x <= elementCenterX + (element.width * element.scale) / 2 &&
            y >= elementCenterY - (element.height * element.scale) / 2 &&
            y <= elementCenterY + (element.height * element.scale) / 2
        );
    });
}
