const fastify = require('fastify')();
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');

fastify.register(require('@fastify/static'), {
    root: path.join(__dirname, 'public'),
    prefix: '/public',
});

const io = new Server(fastify.server);
const connectedClients = {}; // socket.id -> { page, room }
const roomSettings = {};

io.on('connection', (socket) => {
    socket.on('pageConnect', ({ page, room }) => {
        connectedClients[socket.id] = { page, room };
        socket.join(room);
        console.log(`${page} joined room ${room}`);
    });
    socket.on('disconnect', () => {
        delete connectedClients[socket.id];
    });
    socket.on('settingChanged', ({ room, settings }) => {
        roomSettings[room] = settings;
        io.to(room).emit('reloadGame', settings);
    });

    socket.on('moveState', (moveStates) => {
        const client = connectedClients[socket.id];
        if (!client || !client.room) return;
        const room = client.room;

        // Envoie les directions actives à la game
        if (moveStates.up) io.to(room).emit('move', 'up');
        if (moveStates.down) io.to(room).emit('move', 'down');
        if (moveStates.left) io.to(room).emit('move', 'left');
        if (moveStates.right) io.to(room).emit('move', 'right');
        if (moveStates.jump) io.to(room).emit('move', 'jump');
        if (moveStates.home) io.to(room).emit('move', 'home');
        if (moveStates.setting) io.to(room).emit('move', 'setting');
        if (moveStates.pause) io.to(room).emit('move', 'pause');
    });
});

fastify.get('/', (req, res) => {
    res.type('text/html').send(fs.readFileSync('./public/index.html'));
});
fastify.get('/game', (req, res) => {
    res.type('text/html').send(fs.readFileSync('./public/game.html'));
});
fastify.get('/controller', (req, res) => {
    res.type('text/html').send(fs.readFileSync('./public/controller.html'));
});
fastify.get('/setting', (req, res) => {
    res.type('text/html').send(fs.readFileSync('./public/setting.html'));
});
fastify.get('/multi', (req, res) => {
    res.type('text/html').send(fs.readFileSync('./public/multi.html'));
});

fastify.listen({ port: 3000 }, () => {
    console.log('Server on http://localhost:3000');
});