const room = new URLSearchParams(window.location.search).get('room');
const socket = io({ path: '/Air/socket.io' });
socket.emit('pageConnect', { page: 'game', room });



//Player movement & position
let player = document.getElementById('player');
let playerX = 50;
let playerY = 600;
let checkpointX;
let checkpointY;
let verticalOffset = 0;
const moveSpeed = 3.5;

//Player jump
let jumpCount = -1;
let onGround = false;
let isJumping = false;
let velocityY = 0;
const initialJumpVelocity = -15;
const gravity = 1;

//Enemies
let nbEnemies = 10;
let enemies = [];

//Other
let gameLoop = true;
let cameraX = 0, cameraY = 0;
let platforms = [];

const world = document.getElementById('world');


/* ----- FUNCTIONS Player and Enemies----- */

//Jump & Gravity for player
function Physics() {
    playerY += velocityY;
    velocityY += gravity;
}

// Check collision & change Player position

function CheckPlayerCollisions() {
    onGround = false;

    for (let plat of platforms) {
        const px = parseInt(plat.style.left);
        const py = parseInt(plat.style.top);

        if (
            playerX + 30 > px && playerX < px + 100 &&
            playerY + 30 >= py && playerY + 30 <= py + 20 &&
            velocityY >= 0
        ) {
            playerY = py - 30;
            velocityY = 0;
            isJumping = false;
            onGround = true;

            //Platform effect

            let CheckPoint;
            let platRemove;
            const slideSpeed = 2;


            switch (true) {
                case plat.classList.contains('platform-End'):
                    //console.log("🏁 win");
                    const Menu = document.getElementById("Menu");
                    Menu.style.display = 'flex';
                    gameLoop = false;
                    break;

                case plat.classList.contains('platform-transition'):
                    if (CheckPoint !== plat) {
                        checkpointX = playerX;
                        checkpointY = playerY;
                        CheckPoint = plat;
                        //console.log(`📍 Checkpoint: X ${checkpointX}, Y ${checkpointY}`);   
                    }
                    break;

                case plat.classList.contains('platform-lava') || plat.classList.contains('platform-dirt'):
                    playerX += slideSpeed;
                    console.log(`🧊 Slide...`);
                    break;

                case plat.classList.contains('platform-rock'):
                    platRemove = plat;

                    if (jumpCount >= 2) {
                        platRemove.remove();
                        console.log(`❌ Remove : ${platRemove}`);
                        platRemove = null;
                        jumpCount = 0;
                    }
                    break;

                default:
                    break;
            }
        }
    }
}

//Check collision with Enemies
function checkEnemyCollisions() {
    const PLAYER_W = 40;
    const PLAYER_H = 40;

    for (let enemy of enemies) {
        const enemyLeft = parseInt(enemy.style.left);
        const enemyTop = parseInt(enemy.style.top);
        const enemyWidth = enemy.offsetWidth;
        const enemyHeight = enemy.offsetHeight;

        const VerticalTouch = (playerX + PLAYER_W > enemyLeft) && (playerX < enemyLeft + enemyWidth);
        const touchingTop = (playerY + PLAYER_H >= enemyTop) && (playerY + PLAYER_H <= enemyTop + enemyHeight / 2);
        const falling = velocityY > 0;

        if (VerticalTouch && touchingTop && falling) {
            enemy.remove();
            enemies = enemies.filter(e => e !== enemy);
            velocityY = -10;
            continue;
        }

        const Touch =
            (playerX < enemyLeft + enemyWidth) &&
            (playerX + PLAYER_W > enemyLeft) &&
            (playerY < enemyTop + enemyHeight) &&
            (playerY + PLAYER_H > enemyTop);

        if (Touch && !(VerticalTouch && touchingTop && falling)) {
            //console.log("Kill by Monster !");
            playerX = checkpointX || 50;
            playerY = checkpointY || 600;
            velocityY = 0;
            isJumping = false;
            break;
        }
    }
}

//Infinity fall
let fallTimer = 0;
const maxFallTime = 90; // 60 = ~1 sec à 60fps

function startFallTimer() {
    fallTimer++;
    if (fallTimer > maxFallTime) {
        playerX = checkpointX || 50;
        playerY = checkpointY || 600;
        velocityY = 0;
        isJumping = false;
        fallTimer = 0;
        //console.log("You Fall !");
    }
}
function stopFallTimer() {
    if (fallTimer > 0) {
        fallTimer = 0;
        //console.log("On the floor !");
        jumpCount = onGround ? jumpCount + 1 : 0; //Detect jump & count
        //console.log(`nb sauts : ${jumpCount}`);
    }
}

function Fall() {
    (!onGround && velocityY > 0) ? startFallTimer() : stopFallTimer();
}

//Camera follow Player
function Camera() {
    const screenCenterX = window.innerWidth / 2;
    const screenCenterY = window.innerHeight / 2;
    cameraX = playerX - screenCenterX;
    cameraY = playerY - screenCenterY;
    world.style.transform = `translate(${-cameraX}px, ${-cameraY}px)`;
}

//Spawn Enemies
function spawnEnemies(nbEnemies) {
    enemies.forEach(e => e.remove());
    enemies = [];

    const minPlatIndex = 3; // ignore les 2 premières plateformes
    const platformsAvailable = platforms.slice(minPlatIndex, platforms.length - 1);

    for (let i = platformsAvailable.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [platformsAvailable[i], platformsAvailable[j]] = [platformsAvailable[j], platformsAvailable[i]];
    }

    for (let i = 0; i < Math.min(nbEnemies, platformsAvailable.length); i++) {
        const plat = platformsAvailable[i];
        const px = parseInt(plat.style.left);
        const py = parseInt(plat.style.top);

        const enemyX = px + 20;
        const enemyY = py - 40;

        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.innerText = '👾';
        enemy.style.left = `${enemyX}px`;
        enemy.style.top = `${enemyY}px`;

        const enemyWidth = 30;
        enemy.dataset.minX = px;
        enemy.dataset.maxX = px + 100 - enemyWidth;
        enemy.dataset.direction = Math.random() < 0.5 ? 'left' : 'right';

        enemies.push(enemy);
        world.appendChild(enemy);
    }
}



//Update Enemies movement
function updateEnemies() {
    for (let enemy of enemies) {
        let x = parseFloat(enemy.style.left);
        let dir = enemy.dataset.direction;
        let minX = parseFloat(enemy.dataset.minX);
        let maxX = parseFloat(enemy.dataset.maxX);

        if (dir === 'right') {
            x += 1.2;
            if (x >= maxX) {
                enemy.dataset.direction = 'left';
            }
        } else {
            x -= 1.2;
            if (x <= minX) {
                enemy.dataset.direction = 'right';
            }
        }

        enemy.style.left = `${x}px`;
    }
}

//Update Player movement
function renderPlayer() {
    player.style.left = `${playerX}px`;
    player.style.top = `${playerY}px`;
}



/* ----- FUNCTIONS PLATEFORMER ----- */
function generatePlatforms(options) { //HELP ME!! 1 fucking day to create this function that terrible XD
    const { count, worldType } = options;
    const world = document.getElementById('world');
    const player = document.getElementById('player');

    // Clear World
    world.innerHTML = '';
    world.appendChild(player);
    platforms.length = 0;

    const totalLayers = 3;
    const initialY = 700;
    const layerSpacing = 100;
    const minSpacingX = 80;
    const maxSpacingX = 200;
    const maxSpacingY = 50;

    //ADD World here !!
    const worldChoose = {
        'default': ['platform-rock', 'platform-dirt', 'platform-sky'],
        'ice': ['platform-dirtSnow', 'platform-snow', 'plateform-skyIce'],
        'lava': ['platform-cinder', 'platform-lava', 'platform-skyAsh'],
        'candy': ['platform-licorice', 'platform-sugar', 'platform-cottonCandy']
    };
    const selectedClasses = worldChoose[worldType] || worldChoose['default'];

    const randomSpacingX = () => minSpacingX + Math.random() * (maxSpacingX + 1);
    const randomSpacingY = () => Math.floor(Math.random() * (maxSpacingY + 50));
    const getLayerY = (layerIndex) => initialY - (layerIndex * layerSpacing);

    let currentX = 5;

    for (let layerIndex = 0; layerIndex < totalLayers; layerIndex++) {
        const platformClassName = selectedClasses[layerIndex % selectedClasses.length];
        const layerY = getLayerY(layerIndex);

        for (let i = 0; i < count; i++) {
            const plat = document.createElement('div');

            plat.className = platformClassName;
            plat.style.cssText = `
                left: ${currentX}px;
                top: ${layerY + randomSpacingY()}px;
            `;

            platforms.push(plat);
            world.appendChild(plat);

            currentX += randomSpacingX();
        }

        //Platform-transition after every layer
        if (layerIndex < totalLayers - 1) {
            const nextLayerY = getLayerY(layerIndex + 0.5);
            const transitionY = (layerY + nextLayerY) / 2;
            const transition = document.createElement('div');

            transition.className = 'platform-transition';
            transition.style.cssText = `
                left: ${currentX}px;
                top: ${transitionY}px;
            `;

            platforms.push(transition);
            world.appendChild(transition);

            currentX += randomSpacingX();
        }
    }

    //End platform
    const endPlatform = document.createElement('div');
    endPlatform.className = 'platform-End';
    endPlatform.style.cssText = `
    left: ${currentX}px;
    top: ${getLayerY(totalLayers - 1) - 20}px; /* position légèrement au-dessus du dernier layer */`;
    platforms.push(endPlatform);
    world.appendChild(endPlatform);
}


function game() {
    Physics();
    CheckPlayerCollisions();
    Fall();
    Camera();
    renderPlayer();

    updateEnemies();
    checkEnemyCollisions()

    if (gameLoop) { requestAnimationFrame(game); }
}


//Recive Action (server -> controller)
socket.on('reloadGame', settings => {
    console.log('Settings :', settings);
    gameLoop = false;
    const emoji = settings.playerEmoji || '🐸';
    const controllerType = settings.controllerType || 'simple';
    const world = settings.worldSelection || 'default';

    document.getElementById('player').textContent = emoji;
    Start(world);
    gameLoop = true;
});

socket.on('move', (dir) => {
    if (dir === 'jump' && !isJumping) {
        isJumping = true;
        velocityY = initialJumpVelocity;
    } else {
        if (dir === 'up') playerY -= moveSpeed;
        if (dir === 'down') playerY += moveSpeed;
        if (dir === 'left') playerX -= moveSpeed;
        if (dir === 'right') playerX += moveSpeed;
        else if (dir === 'home') {
            window.location.href = `/Air`;
        }
        else if (dir === 'pause') {
            gameLoop = !gameLoop;
            if (gameLoop) { game(); }
        }
    }
});


//Easter egg
if (room === '4rUl0st') {//n0t_h3r3, 18;, 2_4get_bu9?, 4r-U-l0st, st1ll_h3r3?
    activateSecretRoom();
}

function activateSecretRoom() {
    alert("Easter egg Unloked !!");
    document.body.innerHTML = '';
    gameLoop = false;
    document.body.innerHTML = '<h1>🤔</h1> <p>i keep this for later !</p>';
}


//Debug
function toggleHitboxes(enabled = true) {
    if (enabled) {
        player.style.outline = '2px solid lime';

        enemies.forEach(enemy => {
            enemy.style.outline = '2px solid red';
        });
    } else {
        player.style.outline = 'none';

        enemies.forEach(enemy => {
            enemy.style.outline = 'none';
        });
    }
}



//Call function
function Start(worldType) {
    generatePlatforms({
        count: 2,
        worldType: worldType //savedWorldType
    });
    spawnEnemies(5);
}

Start();
game();


//Debug Time let's GOOOO !!
toggleHitboxes(false);