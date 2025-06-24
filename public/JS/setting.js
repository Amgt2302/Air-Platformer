const socket = io({ path: '/Air/socket.io' });
const room = new URLSearchParams(window.location.search).get('room');

const emojiInput = document.getElementById('playerEmoji');
const controllerInput = document.getElementById('controllerType');
const worldInput = document.getElementById('worldSelection');


// --- Player Emoji
if (emojiInput) {
    emojiInput.value = localStorage.getItem('playerEmoji') || '🐸';
    emojiInput.addEventListener('input', e => {
        const emoji = e.target.value;
        localStorage.setItem('playerEmoji', emoji);
    });
}

// --- Controller Type
if (controllerInput) {
    controllerInput.value = localStorage.getItem('controllerType') || 'default';
    controllerInput.addEventListener('change', e => {
        const value = e.target.value;
        localStorage.setItem('controllerType', value);
    });
}

// --- World Selection
if (worldInput) {
    worldInput.value = localStorage.getItem('worldSelection') || 'default';
    worldInput.addEventListener('change', e => {
        const value = e.target.value;
        localStorage.setItem('worldSelection', value);
    });
}

//Send setting -> Server
function sendSettingsUpdate() {
    const settings = {
        playerEmoji: emojiInput ? emojiInput.value : '🐸',
        controllerType: controllerInput ? controllerInput.value : 'simple',
        worldSelection: worldInput ? worldInput.value : 'default',
    };
    socket.emit('settingChanged', { room, settings });
}

// Reload after click + send setting -> Server
const backBtn = document.getElementById('BackBtn');
if (backBtn) {
    backBtn.addEventListener('click', () => {
        sendSettingsUpdate();
        history.back();
    });
}