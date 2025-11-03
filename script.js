
document.addEventListener('DOMContentLoaded', () => {
    const topicInput = document.getElementById('topic');
    const difficultySelect = document.getElementById('difficulty');
    const singlePlayerButton = document.getElementById('single-player');
    const offlineMultiplayerButton = document.getElementById('multiplayer-offline');
    const onlineMultiplayerButton = document.getElementById('multiplayer-online');
    const joinRoomButton = document.getElementById('join-room');
    const roomCodeInput = document.getElementById('room-code-input');
    const showAnswersToggle = document.getElementById('show-answers-toggle');
    const appContainer = document.querySelector('.container');
    const quizContainer = document.getElementById('quiz-container');
    const timerEl = document.getElementById('timer');
    const splitScreenContainer = document.getElementById('split-screen-container');
    const questionEl = document.getElementById('question');
    const answersEl = document.getElementById('answers');
    const feedbackEl = document.getElementById('feedback');

    // Offline Multiplayer Elements
    const p1_question = document.getElementById('p1-question');
    const p1_timerEl = document.getElementById('p1-timer');
    const p1_answers = document.getElementById('p1-answers');
    const p1_feedback = document.getElementById('p1-feedback');
    const p1_score = document.getElementById('p1-score');
    const p2_question = document.getElementById('p2-question');
    const p2_timerEl = document.getElementById('p2-timer');
    const p2_answers = document.getElementById('p2-answers');
    const p2_feedback = document.getElementById('p2-feedback');
    const p2_score = document.getElementById('p2-score');

    // Online Multiplayer Elements
    const onlineContainer = document.getElementById('online-container');
    const waitingRoom = document.getElementById('waiting-room');
    const onlineQuiz = document.getElementById('online-quiz');
    const onlineTimerEl = document.getElementById('online-timer');
    const roomCodeEl = document.getElementById('room-code');
    const playersList = document.getElementById('players-list');
    const startGameOnlineButton = document.getElementById('start-game-online');
    const onlineQuestionEl = document.getElementById('online-question');
    const onlineAnswersEl = document.getElementById('online-answers');
    const onlineFeedbackEl = document.getElementById('online-feedback');

    const resultsContainer = document.getElementById('results-container');
    const resultsSummary = document.getElementById('results-summary');
    const playAgainFromResultsButton = document.getElementById('play-again-from-results');

    let socket;
    let userAnswers = [];

    let currentQuestions = [];
    let score = 0;
    let p1Score = 0;
    let p2Score = 0;
    let questionIndex = 0;
    let timer;
    let timeLeft = 30;
    let p1Answered = false;
    let p2Answered = false;
    let p1SelectedAnswer = null;
    let p2SelectedAnswer = null;

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

    function startTimer() {
        timeLeft = 30;
        timerEl.textContent = timeLeft;
        timerEl.style.borderColor = '#e67e22';
        timer = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;
            if (timeLeft < 10) {
                timerEl.style.borderColor = '#e74c3c';
            }
            if (timeLeft === 0) {
                clearInterval(timer);
                selectAnswer(null, currentQuestions[questionIndex].correct);
            }
        }, 1000);
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
            startTimer();
        } else {
            endGame();
        }
    }

    function selectAnswer(selected, correct) {
        clearInterval(timer);
        userAnswers.push({
            question: currentQuestions[questionIndex].question,
            selected: selected,
            correct: correct
        });

        if (selected === correct) {
            score++;
            feedbackEl.innerText = "Doğru!";
            feedbackEl.style.color = '#2ecc71';
        } else if (selected === null) {
            feedbackEl.innerText = `Süre doldu! Doğru cevap: ${correct}`;
            feedbackEl.style.color = '#f39c12';
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
        quizContainer.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        resultsSummary.innerHTML = '';
        userAnswers.forEach(answer => {
            const resultItem = document.createElement('div');
            resultItem.classList.add('result-item');
            const isCorrect = answer.selected === answer.correct;
            resultItem.classList.add(isCorrect ? 'correct' : 'incorrect');

            resultItem.innerHTML = `
                <p><strong>Soru:</strong> ${answer.question}</p>
                <p><strong>Cevabınız:</strong> ${answer.selected || 'Boş'}</p>
                ${!isCorrect ? `<p><strong>Doğru Cevap:</strong> ${answer.correct}</p>` : ''}
            `;
            resultsSummary.appendChild(resultItem);
        });

        userAnswers = []; // reset for next game
    }

    playAgainFromResultsButton.addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');
    });

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

    function startMultiplayerTimer() {
        timeLeft = 30;
        p1_timerEl.textContent = timeLeft;
        p2_timerEl.textContent = timeLeft;
        p1_timerEl.style.borderColor = '#e67e22';
        p2_timerEl.style.borderColor = '#e67e22';
        timer = setInterval(() => {
            timeLeft--;
            p1_timerEl.textContent = timeLeft;
            p2_timerEl.textContent = timeLeft;
            if (timeLeft < 10) {
                p1_timerEl.style.borderColor = '#e74c3c';
                p2_timerEl.style.borderColor = '#e74c3c';
            }
            if (timeLeft === 0) {
                evaluateMultiplayerAnswers();
            }
        }, 1000);
    }

    function evaluateMultiplayerAnswers() {
        clearInterval(timer);
        const questionData = currentQuestions[questionIndex];
        const showAnswers = showAnswersToggle.checked;

        // Evaluate P1
        if (p1SelectedAnswer === questionData.correct) {
            p1Score++;
            p1_score.textContent = p1Score;
            if (showAnswers) {
                p1_feedback.innerText = "Doğru!";
                p1_feedback.style.color = '#2ecc71';
            }
        } else {
            if (showAnswers) {
                p1_feedback.innerText = p1SelectedAnswer === null ? `Süre doldu! Doğru: ${questionData.correct}` : `Yanlış! Doğru: ${questionData.correct}`;
                p1_feedback.style.color = p1SelectedAnswer === null ? '#f39c12' : '#e74c3c';
            }
        }

        // Evaluate P2
        if (p2SelectedAnswer === questionData.correct) {
            p2Score++;
            p2_score.textContent = p2Score;
            if (showAnswers) {
                p2_feedback.innerText = "Doğru!";
                p2_feedback.style.color = '#2ecc71';
            }
        } else {
            if (showAnswers) {
                p2_feedback.innerText = p2SelectedAnswer === null ? `Süre doldu! Doğru: ${questionData.correct}` : `Yanlış! Doğru: ${questionData.correct}`;
                p2_feedback.style.color = p2SelectedAnswer === null ? '#f39c12' : '#e74c3c';
            }
        }

        questionIndex++;
        setTimeout(displayNextMultiplayerQuestion, showAnswers ? 2000 : 500);
    }

    function displayNextMultiplayerQuestion() {
        resetMultiplayerState();
        p1Answered = false;
        p2Answered = false;
        p1SelectedAnswer = null;
        p2SelectedAnswer = null;

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
            startMultiplayerTimer();
        } else {
            endMultiplayerGame();
        }
    }

    document.addEventListener('keydown', (e) => {
        if (splitScreenContainer.classList.contains('hidden') || questionIndex >= currentQuestions.length) return;

        const key = e.key.toUpperCase();
        const p1Keys = ['Q', 'W', 'E', 'R'];
        const p2Keys = ['1', '2', '3', '4'];
        const answers = currentQuestions[questionIndex].answers;

        if (p1Keys.includes(key) && !p1Answered) {
            p1Answered = true;
            p1SelectedAnswer = answers[p1Keys.indexOf(key)];
            p1_answers.querySelectorAll('.answer-btn').forEach(btn => {
                if(btn.dataset.key === key) btn.style.backgroundColor = '#e67e22';
                btn.disabled = true;
            });
        } else if (p2Keys.includes(key) && !p2Answered) {
            p2Answered = true;
            p2SelectedAnswer = answers[p2Keys.indexOf(key)];
            p2_answers.querySelectorAll('.answer-btn').forEach(btn => {
                if(btn.dataset.key === key) btn.style.backgroundColor = '#e67e22';
                btn.disabled = true;
            });
        }

        if (p1Answered && p2Answered) {
            evaluateMultiplayerAnswers();
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

    function setupOnlineGameListeners() {
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

        socket.on('timerUpdate', (timeLeft) => {
            onlineTimerEl.textContent = timeLeft;
            if (timeLeft < 10) {
                onlineTimerEl.style.borderColor = '#e74c3c';
            } else {
                onlineTimerEl.style.borderColor = '#e67e22';
            }
        });
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

        setupOnlineGameListeners();
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

        setupOnlineGameListeners();
    });
});
