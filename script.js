const canvas = document.getElementById("main-canvas");
const smallCanvas = document.getElementById("small-canvas");
const displayBox = document.getElementById("prediction");
const confidence = document.getElementById("confidence");

const inputBox = canvas.getContext("2d");
const smBox = smallCanvas.getContext("2d");

let isDrawing = false;
let model;

async function init() {
    model = await tf.loadLayersModel("model/model/model.json");
}

function drawStartEvent(event) {
    isDrawing = true;

    inputBox.strokeStyle = "white";
    inputBox.lineWidth = "15";
    inputBox.lineJoin = inputBox.lineCap = "round";
    inputBox.beginPath();
}
canvas.addEventListener("mousedown", drawStartEvent);
canvas.addEventListener("ontouchstart", drawStartEvent);

function drawMoveEvent(event) {
    if (isDrawing) {
        drawStroke(event.clientX, event.clientY);
    }
}
canvas.addEventListener("mousemove", drawMoveEvent);
canvas.addEventListener("ontouchmove", drawMoveEvent);

function drawEndEvent(event) {
    isDrawing = false;
    updateDisplay(predict());
}
canvas.addEventListener("mouseup", drawEndEvent);
canvas.addEventListener("ontouchend", drawEndEvent);

function drawStroke(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    inputBox.lineTo(x, y);
    inputBox.stroke();
    inputBox.moveTo(x, y);
}

function predict() {
    let values = getPixelData();
    let predictions = model.predict(values).dataSync();

    return predictions;
}

function getPixelData() {
    smBox.drawImage(
        inputBox.canvas,
        0,
        0,
        smallCanvas.width,
        smallCanvas.height
    );
    const imgData = smBox.getImageData(
        0,
        0,
        smallCanvas.width,
        smallCanvas.height
    );

    let values = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
        values.push(imgData.data[i] / 255);
    }
    values = tf.reshape(values, [1, 28, 28, 1]);
    return values;
}

function updateDisplay(predictions) {
    const maxValue = Math.max(...predictions);
    const bestPred = predictions.indexOf(maxValue);
    const label = String.fromCharCode(bestPred < 10 ? bestPred + 48 : (bestPred < 36 ? bestPred + 55 : bestPred + 61));
    confidence.innerHTML = `<strong>${Math.round(maxValue * 100)}%</strong> Accurate`
    displayBox.innerText = label;

}

document.getElementById("erase").addEventListener("click", erase);

function erase() {
    inputBox.fillStyle = "#111";
    inputBox.fillRect(0, 0, canvas.width, canvas.height);
    displayBox.innerText = "";
    confidence.innerHTML = "&#8212";
}

erase();
init();
