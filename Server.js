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

io.on('connection', (socket) => {
    socket.on('pageConnect', ({ page, room }) => {
        connectedClients[socket.id] = { page, room };
        socket.join(room);
        console.log(`${page} joined room ${room}`);
    });
    socket.on('disconnect', () => {
        delete connectedClients[socket.id];
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


fastify.listen({ port: 3000 }, () => {
    console.log('Server on http://localhost:3000');
});