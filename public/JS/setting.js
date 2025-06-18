const socket = io({ path: '/Air/socket.io' });
const room = new URLSearchParams(window.location.search).get('room');

//playerEmoji
const emoji = localStorage.getItem('playerEmoji');

document.getElementById('playerEmoji').addEventListener('input', event => {
    //console.log(event.target.value);
    localStorage.setItem('playerEmoji', event.target.value);
});

//controllerType
const initialControllerType = localStorage.getItem('controllerType');
if (initialControllerType) {
    const controllerSelectElement = document.getElementById('controllerType');
    if (controllerSelectElement) {
        controllerSelectElement.value = initialControllerType;
    }
}
document.getElementById('controllerType').addEventListener('change', event => {
    //console.log(event.target.value);
    localStorage.setItem('controllerType', event.target.value);
});

//WorldSelection
const initialWorldSelection = localStorage.getItem('worldSelection');
if (initialWorldSelection) {
    const worldSelectElement = document.getElementById('worldSelection');
    if (worldSelectElement) {
        worldSelectElement.value = initialWorldSelection;
    }
}
document.getElementById('worldSelection').addEventListener('change', event => {
    //console.log(event.target.value);
    localStorage.setItem('worldSelection', event.target.value);
});

//Reload after setting changed
document.getElementById('BackBtn').addEventListener('click', event => {
    history.back();
    socket.emit('settingChanged', room);
});