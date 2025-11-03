
document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topic');
    const difficultySelect = document.getElementById('difficulty');
    const singlePlayerButton = document.getElementById('single-player');
    const offlineMultiplayerButton = document.getElementById('multiplayer-offline');
    const onlineMultiplayerButton = document.getElementById('multiplayer-online');
    const joinRoomButton = document.getElementById('join-room');
    const roomCodeInput = document.getElementById('room-code-input');
    const appContainer = document.querySelector('.container');
    const quizContainer = document.getElementById('quiz-container');
    const splitScreenContainer = document.getElementById('split-screen-container');
    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    const feedbackEl = document.getElementById('feedback');

    // Offline Multiplayer Elements
    const p1_question = document.getElementById('p1-question');
    const p1_answers = document.getElementById('p1-answers');
    const p1_feedback = document.getElementById('p1-feedback');
    const p1_score = document.getElementById('p1-score');
    const p2_question = document.getElementById('p2-question');
    const p2_answers = document.getElementById('p2-answers');
    const p2_feedback = document.getElementById('p2-feedback');
    const p2_score = document.getElementById('p2-score');

    // Online Multiplayer Elements
    const onlineContainer = document.getElementById('online-container');
    const waitingRoom = document.getElementById('waiting-room');
    const onlineQuiz = document.getElementById('online-quiz');
    const roomCodeEl = document.getElementById('room-code');
    const playersList = document.getElementById('players-list');
    const startGameOnlineButton = document.getElementById('start-game-online');
    const onlineQuestionEl = document.getElementById('online-question');
    const onlineAnswersEl = document.getElementById('online-answers');
    const onlineFeedbackEl = document.getElementById('online-feedback');

    let socket;

    let currentQuestions = [];
    let score = 0;
    let p1Score = 0;
    let p2Score = 0;
    let questionIndex = 0;

    const mockQuestions = [
        {
            question: "Türkiye'nin başkenti neresidir?",
            answers: ["İstanbul", "Ankara", "İzmir", "Bursa"],
            correct: "Ankara"
        },
        {
            question: "JavaScript'te bir değişken bildirmek için hangi anahtar kelime kullanılır?",
            answers: ["var", "let", "const", "tümü"],
            correct: "tümü"
        },
        {
            question: "En yüksek dağı hangisidir?",
            answers: ["Ağrı Dağı", "Erciyes Dağı", "Uludağ", "Toros Dağları"],
            correct: "Ağrı Dağı"
        },
        {
            question: "Hangi gezegen 'Kızıl Gezegen' olarak bilinir?",
            answers: ["Venüs", "Mars", "Jüpiter", "Satürn"],
            correct: "Mars"
        },
        {
            question: "CSS'in açılımı nedir?",
            answers: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
            correct: "Cascading Style Sheets"
        },
        {
            question: "Bir yıl kaç haftadır?",
            answers: ["52", "50", "48", "54"],
            correct: "52"
        },
        {
            question: "HTML'de bir başlık oluşturmak için hangi etiket kullanılır?",
            answers: ["<h1>", "<h2>", "<h3>", "Hepsi"],
            correct: "Hepsi"
        },
        {
            question: "Hangi okyanus en büyüktür?",
            answers: ["Atlas Okyanusu", "Hint Okyanusu", "Büyük Okyanus", "Arktik Okyanusu"],
            correct: "Büyük Okyanus"
        },
        {
            question: "İlk insanlı uzay uçuşunu kim gerçekleştirmiştir?",
            answers: ["Neil Armstrong", "Yuri Gagarin", "Buzz Aldrin", "John Glenn"],
            correct: "Yuri Gagarin"
        },
        {
            question: "Hangi elementin kimyasal sembolü 'O' dur?",
            answers: ["Altın", "Gümüş", "Oksijen", "Demir"],
            correct: "Oksijen"
        }
    ];

    singlePlayerButton.addEventListener('click', startSinglePlayerGame);

    function startSinglePlayerGame() {
        const topic = topicInput.value;
        const difficulty = difficultySelect.value;

        if (!topic) {
            alert("Lütfen bir konu girin!");
            return;
        }

        console.log(`Oyun Başladı: Konu - ${topic}, Zorluk - ${difficulty}`);

        socket = io();

        socket.on('connect', () => {
            socket.emit('getSinglePlayerQuestions', { topic, difficulty });
        });

        socket.on('singlePlayerQuestions', (questions) => {
            appContainer.classList.add('hidden');
            quizContainer.classList.remove('hidden');
            currentQuestions = questions;
            score = 0;
            questionIndex = 0;
            displayNextQuestion();
        });
    }

    function displayNextQuestion() {
        resetState();
        if (questionIndex < currentQuestions.length) {
            const questionData = currentQuestions[questionIndex];
            questionEl.innerText = questionData.question;

            questionData.answers.forEach(answer => {
                const button = document.createElement('button');
                button.innerText = answer;
                button.classList.add('answer-btn');
                button.addEventListener('click', () => selectAnswer(answer, questionData.correct));
                answersEl.appendChild(button);
            });
        } else {
            endGame();
        }
    }

    function selectAnswer(selected, correct) {
        if (selected === correct) {
            score++;
            feedbackEl.innerText = "Doğru!";
            feedbackEl.style.color = '#2ecc71';
        } else {
            feedbackEl.innerText = `Yanlış! Doğru cevap: ${correct}`;
            feedbackEl.style.color = '#e74c3c';
        }

        questionIndex++;
        setTimeout(displayNextQuestion, 1500);
    }

    function resetState() {
        feedbackEl.innerText = '';
        while (answersEl.firstChild) {
            answersEl.removeChild(answersEl.firstChild);
        }
    }

    function endGame() {
        questionEl.innerHTML = `Oyun Bitti! <br> Toplam Puanınız: ${score} / ${currentQuestions.length}`;
        answersEl.innerHTML = '';
        feedbackEl.innerText = '';

        const playAgainButton = document.createElement('button');
        playAgainButton.innerText = 'Tekrar Oyna';
        playAgainButton.addEventListener('click', () => {
            quizContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
        });
        answersEl.appendChild(playAgainButton);
    }

    offlineMultiplayerButton.addEventListener('click', startOfflineMultiplayerGame);

    function startOfflineMultiplayerGame() {
        appContainer.classList.add('hidden');
        splitScreenContainer.classList.remove('hidden');

        currentQuestions = [...mockQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
        p1Score = 0;
        p2Score = 0;
        questionIndex = 0;

        p1_score.textContent = p1Score;
        p2_score.textContent = p2Score;

        displayNextMultiplayerQuestion();
    }

    function displayNextMultiplayerQuestion() {
        resetMultiplayerState();
        if (questionIndex < currentQuestions.length) {
            const questionData = currentQuestions[questionIndex];
            p1_question.innerText = questionData.question;
            p2_question.innerText = questionData.question;

            const p1AnswerKeys = ['Q', 'W', 'E', 'R'];
            const p2AnswerKeys = ['1', '2', '3', '4'];

            questionData.answers.forEach((answer, index) => {
                const p1Button = document.createElement('button');
                p1Button.innerText = `(${p1AnswerKeys[index]}) ${answer}`;
                p1Button.classList.add('answer-btn');
                p1Button.dataset.key = p1AnswerKeys[index];
                p1_answers.appendChild(p1Button);

                const p2Button = document.createElement('button');
                p2Button.innerText = `(${p2AnswerKeys[index]}) ${answer}`;
                p2Button.classList.add('answer-btn');
                p2Button.dataset.key = p2AnswerKeys[index];
                p2_answers.appendChild(p2Button);
            });
        } else {
            endMultiplayerGame();
        }
    }

    document.addEventListener('keydown', (e) => {
        if (!splitScreenContainer.classList.contains('hidden')) {
            const key = e.key.toUpperCase();
            const p1Keys = ['Q', 'W', 'E', 'R'];
            const p2Keys = ['1', '2', '3', '4'];

            if (p1Keys.includes(key) || p2Keys.includes(key)) {
                const questionData = currentQuestions[questionIndex];
                const answers = questionData.answers;
                let selectedAnswer = '';
                let player = 0;

                if(p1Keys.includes(key)){
                    selectedAnswer = answers[p1Keys.indexOf(key)];
                    player = 1;
                } else {
                    selectedAnswer = answers[p2Keys.indexOf(key)];
                    player = 2;
                }

                if (selectedAnswer === questionData.correct) {
                    if(player === 1) {
                        p1Score++;
                        p1_score.textContent = p1Score;
                        p1_feedback.innerText = "Doğru!";
                        p1_feedback.style.color = '#2ecc71';
                    } else {
                        p2Score++;
                        p2_score.textContent = p2Score;
                        p2_feedback.innerText = "Doğru!";
                        p2_feedback.style.color = '#2ecc71';
                    }
                } else {
                    if(player === 1) {
                        p1_feedback.innerText = `Yanlış!`;
                        p1_feedback.style.color = '#e74c3c';
                    } else {
                        p2_feedback.innerText = `Yanlış!`;
                        p2_feedback.style.color = '#e74c3c';
                    }
                }

                questionIndex++;
                setTimeout(displayNextMultiplayerQuestion, 1500);
            }
        }
    });

    function resetMultiplayerState() {
        p1_feedback.innerText = '';
        p2_feedback.innerText = '';
        while (p1_answers.firstChild) {
            p1_answers.removeChild(p1_answers.firstChild);
        }
        while (p2_answers.firstChild) {
            p2_answers.removeChild(p2_answers.firstChild);
        }
    }

    function endMultiplayerGame() {
        let winnerMessage = '';
        if (p1Score > p2Score) {
            winnerMessage = "Oyuncu 1 Kazandı!";
        } else if (p2Score > p1Score) {
            winnerMessage = "Oyuncu 2 Kazandı!";
        } else {
            winnerMessage = "Berabere!";
        }

        p1_question.innerText = `Oyun Bitti!`;
        p2_question.innerText = `Oyun Bitti!`;

        p1_answers.innerHTML = `<h3>${winnerMessage}</h3>`;
        p2_answers.innerHTML = `<h3>${winnerMessage}</h3>`;

        const playAgainButton = document.createElement('button');
        playAgainButton.innerText = 'Tekrar Oyna';
        playAgainButton.addEventListener('click', () => {
            splitScreenContainer.classList.add('hidden');
            appContainer.classList.remove('hidden');
        });
        p1_answers.appendChild(playAgainButton.cloneNode(true));
        p2_answers.appendChild(playAgainButton);
    }

    onlineMultiplayerButton.addEventListener('click', () => {
        const topic = topicInput.value;
        const difficulty = difficultySelect.value;
        if (!topic) {
            alert("Lütfen bir konu girin!");
            return;
        }

        socket = io();

        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('createRoom', { topic, difficulty });
        });

        socket.on('roomCreated', (roomCode) => {
            appContainer.classList.add('hidden');
            onlineContainer.classList.remove('hidden');
            roomCodeEl.textContent = roomCode;
        });

        socket.on('playerJoined', (players) => {
            playersList.innerHTML = '';
            players.forEach(player => {
                const li = document.createElement('li');
                li.textContent = player.id;
                playersList.appendChild(li);
            });
        });

        socket.on('gameStarted', (questions) => {
            waitingRoom.classList.add('hidden');
            onlineQuiz.classList.remove('hidden');
            currentQuestions = questions;
            questionIndex = 0;
            displayNextOnlineQuestion();
        });

        socket.on('answerResult', ({ correct, correctAnswer }) => {
            if (correct) {
                onlineFeedbackEl.textContent = 'Doğru!';
                onlineFeedbackEl.style.color = '#2ecc71';
            } else {
                onlineFeedbackEl.textContent = `Yanlış! Doğru cevap: ${correctAnswer}`;
                onlineFeedbackEl.style.color = '#e74c3c';
            }
        });

        socket.on('nextQuestion', () => {
            questionIndex++;
            displayNextOnlineQuestion();
        });

        socket.on('gameOver', (scores) => {
            onlineQuestionEl.innerHTML = 'Oyun Bitti!';
            onlineAnswersEl.innerHTML = '';

            const scoresList = document.createElement('ul');
            for(const playerId in scores) {
                const li = document.createElement('li');
                li.textContent = `${playerId}: ${scores[playerId]}`;
                scoresList.appendChild(li);
            }
            onlineAnswersEl.appendChild(scoresList);
        });
    });

    startGameOnlineButton.addEventListener('click', () => {
        socket.emit('startGame');
    });

    function displayNextOnlineQuestion() {
        if (questionIndex < currentQuestions.length) {
            const questionData = currentQuestions[questionIndex];
            onlineQuestionEl.textContent = questionData.question;
            onlineAnswersEl.innerHTML = '';
            questionData.answers.forEach(answer => {
                const button = document.createElement('button');
                button.textContent = answer;
                button.classList.add('answer-btn');
                button.addEventListener('click', () => {
                    socket.emit('submitAnswer', { questionIndex, answer });
                });
                onlineAnswersEl.appendChild(button);
            });
        }
    }

    joinRoomButton.addEventListener('click', () => {
        const roomCode = roomCodeInput.value.trim().toUpperCase();
        if (!roomCode) {
            alert("Lütfen bir oda kodu girin!");
            return;
        }

        socket = io();

        socket.on('connect', () => {
            console.log('Connected to server');
            socket.emit('joinRoom', roomCode);
        });

        socket.on('playerJoined', (players) => {
            appContainer.classList.add('hidden');
            onlineContainer.classList.remove('hidden');
            waitingRoom.classList.remove('hidden');
            onlineQuiz.classList.add('hidden');
            roomCodeEl.textContent = roomCode;

            playersList.innerHTML = '';
            players.forEach(player => {
                const li = document.createElement('li');
                li.textContent = player.id;
                playersList.appendChild(li);
            });
        });

        socket.on('error', (message) => {
            alert(message);
        });

        // Other socket event listeners from createRoom should also be here...
        socket.on('gameStarted', (questions) => {
            waitingRoom.classList.add('hidden');
            onlineQuiz.classList.remove('hidden');
            currentQuestions = questions;
            questionIndex = 0;
            displayNextOnlineQuestion();
        });

        socket.on('answerResult', ({ correct, correctAnswer }) => {
            if (correct) {
                onlineFeedbackEl.textContent = 'Doğru!';
                onlineFeedbackEl.style.color = '#2ecc71';
            } else {
                onlineFeedbackEl.textContent = `Yanlış! Doğru cevap: ${correctAnswer}`;
                onlineFeedbackEl.style.color = '#e74c3c';
            }
        });

        socket.on('nextQuestion', () => {
            questionIndex++;
            displayNextOnlineQuestion();
        });

        socket.on('gameOver', (scores) => {
            onlineQuestionEl.innerHTML = 'Oyun Bitti!';
            onlineAnswersEl.innerHTML = '';

            const scoresList = document.createElement('ul');
            for(const playerId in scores) {
                const li = document.createElement('li');
                li.textContent = `${playerId}: ${scores[playerId]}`;
                scoresList.appendChild(li);
            }
            onlineAnswersEl.appendChild(scoresList);
        });
    });
});
