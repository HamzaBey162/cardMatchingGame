    const express = require('express');
    const http = require('http');
    const { isIPv4, isIP } = require('net');
    const socketIO = require('socket.io');

    const app = express();
    const server = http.createServer(app);
    const io = socketIO(server);

    app.use(express.static(__dirname + '/public'));

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/ana.html');
    });

    // Oyun durumlarını tutmak için bir nesne
    const gameStatus = {
        player1Ready: false,
        player2Ready: false,
        cardsOpened: [],
    };
    const rooms = {};

    io.on('connection', (socket) => {
        socket.on('joinRoom', (roomName) => {
            // Odaya katılan oyuncunun socket'ini odasına ekleyerek bilgilendir
            socket.join(roomName);
            rooms[socket.id] = roomName;

            // Odada kaç oyuncu olduğunu kontrol et
            const room = io.sockets.adapter.rooms.get(roomName);
            if (room.size === 2) {
                // Eğer odada 2 oyuncu varsa, her iki oyuncuya da oyun başlangıcı mesajını gönder
                io.to(roomName).emit('startGame', roomName);
            }
        })});
    io.on('connection', (socket) => {
        console.log('Bir oyuncu bağlandı.', socket.id);

        socket.on('playerReady', (playerNumber) => {
        if (playerNumber === 1) {
            gameStatus.player1Ready = true;
        } else if (playerNumber === 2) {
            gameStatus.player2Ready = true;
            io.emit('startGameCountdown'); // Sadece 2. oyuncu ready olduğunda tetikle
        }

        if (gameStatus.player1Ready && gameStatus.player2Ready) {
            let countdown = 5;
            const countdownInterval = setInterval(() => {
                io.emit('countdown', countdown);
                countdown--;

                if (countdown < 0) {
                    clearInterval(countdownInterval);
                    io.emit('startGame', gameStatus.cardsOpened);
                }
            }, 1000);
        }
    });
    
socket.on('openCard', (data) => {
    gameStatus.cardsOpened.push(data);

    // Her iki oyuncuya kart açma bilgisini gönder
    io.to(rooms[data.playerSocketId]).emit('cardOpened', data);
});

       
        socket.on('resetGame', () => {
            gameStatus.player1Ready = false;
            gameStatus.player2Ready = false;
            gameStatus.cardsOpened = [];

            socket.broadcast.emit('resetGame');
        });

        socket.on('disconnect', () => {
            console.log('Bir oyuncu ayrıldı.', socket.id);
        });
    });

    const PORT = 3000;
    server.listen(PORT, () => {
        console.log(`Server çalışmaya başladı http://localhost:${PORT}`);
    });
