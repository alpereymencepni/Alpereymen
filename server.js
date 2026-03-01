const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

const rooms = {};

const categoryMap = {
    "tarih": "history",
    "bilim": "science",
    "coğrafya": "geography",
    "sanat": "arts_and_literature",
    "film": "film_and_tv",
    "müzik": "music",
    "spor": "sport_and_leisure",
    "genel kültür": "society_and_culture"
};

const getTriviaQuestions = async (category, difficulty) => {
    const apiCategory = categoryMap[category.toLowerCase()] || category;
    const difficultyMap = {
        "kolay": "easy",
        "orta": "medium",
        "zor": "hard"
    };
    const apiDifficulty = difficultyMap[difficulty.toLowerCase()] || difficulty;

    try {
        const response = await axios.get(`https://the-trivia-api.com/v2/questions?limit=10&categories=${apiCategory}&difficulties=${apiDifficulty}`);
        return response.data.map(q => ({
            question: q.question.text,
            answers: [...q.incorrectAnswers, q.correctAnswer].sort(() => Math.random() - 0.5),
            correct: q.correctAnswer
        }));
    } catch (error) {
        console.error('Error fetching trivia questions:', error);
        return [];
    }
};

const startTimer = (roomCode) => {
    const room = rooms[roomCode];
    if (!room) {
        return;
    }

    if (room.timer) clearInterval(room.timer);

    let timeLeft = 30;
    room.timer = setInterval(() => {
        io.to(roomCode).emit('timerUpdate', timeLeft);
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(room.timer);
            nextQuestion(roomCode);
        }
    }, 1000);
};

const nextQuestion = (roomCode) => {
    const room = rooms[roomCode];
    if (!room) {
        return;
    }

    room.answers = {};
    room.questionIndex++;
    if (room.questionIndex < room.questions.length) {
        io.to(roomCode).emit('nextQuestion');
        startTimer(roomCode);
    } else {
        io.to(roomCode).emit('gameOver', room.scores);
    }
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', async ({ topic, difficulty }) => {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const questions = await getTriviaQuestions(topic, difficulty);

        if (!questions.length) {
            socket.emit('error', 'Sorular alınamadı. Lütfen tekrar deneyin.');
            return;
        }

        rooms[roomCode] = {
            players: [],
            topic: topic,
            questions: questions,
            scores: {},
            answers: {},
            questionIndex: 0,
            timer: null
        };
        socket.join(roomCode);
        rooms[roomCode].players.push({ id: socket.id });
        rooms[roomCode].scores[socket.id] = 0;

        socket.emit('roomCreated', roomCode);
        io.to(roomCode).emit('playerJoined', rooms[roomCode].players);
    });

    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode]) {
            if (rooms[roomCode].players.length >= 2) {
                socket.emit('error', 'Bu oda dolu.');
                return;
            }

            if (rooms[roomCode].players.some(player => player.id === socket.id)) {
                socket.emit('error', 'Bu odaya zaten katıldınız.');
                return;
            }

            socket.join(roomCode);
            rooms[roomCode].players.push({ id: socket.id });
            rooms[roomCode].scores[socket.id] = 0;
            io.to(roomCode).emit('playerJoined', rooms[roomCode].players);
        } else {
            socket.emit('error', 'Oda bulunamadı');
        }
    });

    socket.on('startGame', () => {
        const roomCode = Object.keys(rooms).find(key => rooms[key].players.some(p => p.id === socket.id));
        if (roomCode && rooms[roomCode]) {
            if (rooms[roomCode].players.length < 2) {
                socket.emit('error', 'Oyunu başlatmak için en az 2 oyuncu gerekli.');
                return;
            }

            io.to(roomCode).emit('gameStarted', rooms[roomCode].questions);
            startTimer(roomCode);
        }
    });

    socket.on('submitAnswer', ({ questionIndex, answer }) => {
        const roomCode = Object.keys(rooms).find(key => rooms[key].players.some(p => p.id === socket.id));
        if (roomCode && rooms[roomCode]) {
            const room = rooms[roomCode];
            const question = room.questions[questionIndex];
            if (!question) {
                socket.emit('error', 'Geçersiz soru. Oyun yeniden başlatılmalı.');
                return;
            }

            if (room.answers[socket.id]) {
                return;
            }

            const correct = question.correct === answer;
            if (correct) {
                room.scores[socket.id]++;
            }
            socket.emit('answerResult', { correct, correctAnswer: question.correct });

            room.answers[socket.id] = true;

            if (Object.keys(room.answers).length === room.players.length) {
                clearInterval(room.timer);
                nextQuestion(roomCode);
            }
        }
    });

    socket.on('getSinglePlayerQuestions', async ({ topic, difficulty }) => {
        const questions = await getTriviaQuestions(topic, difficulty);
        socket.emit('singlePlayerQuestions', questions);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(p => p.id === socket.id);
            if (playerIndex > -1) {
                room.players.splice(playerIndex, 1);
                delete room.scores[socket.id];
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                } else {
                    io.to(roomCode).emit('playerJoined', room.players);
                }
                break;
            }
        }
    });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
