const room = new URLSearchParams(window.location.search).get('room');
const socket = io({ path: '/Air/socket.io' });
socket.emit('pageConnect', { page: 'controller', room });



const moveIntervals = {};

function startSendingMove(direction) {
    if (moveIntervals[direction]) return;

    socket.emit('moveState', { [direction]: true });

    moveIntervals[direction] = setInterval(() => {
        socket.emit('moveState', { [direction]: true });
    }, 10);
}
function stopSendingMove(direction) {
    if (!moveIntervals[direction]) return;

    clearInterval(moveIntervals[direction]);
    delete moveIntervals[direction];

    socket.emit('moveState', { [direction]: false });
}


// boutons tactiles / souris
document.querySelectorAll(".button-container button").forEach(btn => {
    const dir = btn.id;

    if (!dir) return;

    if (!['left', 'right', 'jump'].includes(dir)) return; //['up', 'down', 'left', 'right', 'jump']
    btn.addEventListener('mousedown', () => startSendingMove(dir));
    btn.addEventListener('mouseup', () => stopSendingMove(dir));
    btn.addEventListener('mouseleave', () => stopSendingMove(dir));

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startSendingMove(dir);
    });

    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        stopSendingMove(dir);
    });
});


// clavier
const keyState = {};
const keyMap = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ' ': 'jump'
};

document.addEventListener('keydown', (e) => {
    const dir = keyMap[e.key];
    if (!dir || keyState[dir]) return;

    keyState[dir] = true;
    startSendingMove(dir);
});

document.addEventListener('keyup', (e) => {
    const dir = keyMap[e.key];
    if (!dir) return;

    keyState[dir] = false;
    stopSendingMove(dir);
});
