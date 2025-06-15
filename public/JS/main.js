// ID Room generation
const room = Math.random().toString(36).substring(2, 6);
const QRSize = 256;

// URLS
const controllerURL = `${window.location.origin}/Air/controller?room=${room}`;
const gameURL = `${window.location.origin}/Air/game?room=${room}`;

// Fallback Links
document.getElementById("controllerLink").href = controllerURL;
document.getElementById("gameLink").href = gameURL;

// QRCode generation
new QRCode(document.getElementById("qrController"), {
    text: controllerURL,
    width: QRSize,
    height: QRSize,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
});
new QRCode(document.getElementById("qrGame"), {
    text: gameURL,
    width: QRSize,
    height: QRSize,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
});


//Slider
let currentIndex = 0;
const boxes = document.querySelectorAll('.box');

function slide(direction) {
    currentIndex += direction;
    if (currentIndex < 0) currentIndex = boxes.length - 1;
    if (currentIndex >= boxes.length) currentIndex = 0;

    boxes.forEach((box, index) => {
        box.style.display = index === currentIndex ? 'flex' : 'none';
    });
}

window.addEventListener('DOMContentLoaded', () => {
    slide(0);
});

//console.log(room);