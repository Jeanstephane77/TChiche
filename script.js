document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let players = []; 
    let selectedLevel = 1;
    let customChallenges = {
        truths: { 1: [], 2: [], 3: [], 4: [] },
        dares: { 1: [], 2: [], 3: [], 4: [] }
    };
    let currentPlayer = null;

    // --- DOM Elements (Setup Screen) ---
    const setupScreen = document.getElementById('setup-screen');
    const wheelScreen = document.getElementById('wheel-screen');
    const wheelCanvas = document.getElementById('wheel-canvas');
    const spinBtn = document.getElementById('spin-btn');
    const wheelCtx = wheelCanvas ? wheelCanvas.getContext('2d') : null;
    const levelButtons = document.querySelectorAll('.level-btn');
    const playerList = document.getElementById('player-list');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const addCustomBtn = document.getElementById('add-custom-btn');
    
    // --- Modals ---
    const customChallengeModal = document.getElementById('custom-challenge-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveChallengeBtn = document.getElementById('save-challenge-btn');
    const customChallengeText = document.getElementById('custom-challenge-text');
    const customLevelSelect = document.getElementById('custom-level-select');
    const customTypeSelect = document.getElementById('custom-type-select');
    const gageModal = document.getElementById('gage-modal');
    const gageText = document.getElementById('gage-text');
    const closeGageModalBtn = document.getElementById('close-gage-modal-btn');
    const notificationModal = document.getElementById('notification-modal');
    const notificationText = document.getElementById('notification-text');
    const closeNotificationModalBtn = document.getElementById('close-notification-modal-btn');


    // --- DOM Elements (Game Screen) ---
    const gameScreen = document.getElementById('game-screen');
    let turnIndicator, challengeText, cardContent, authorTag, truthBtn, dareBtn, randomBtn, nextPlayerBtn, passBtn;

    // --- Functions ---
    function initializeGameScreenElements() {
        turnIndicator = document.getElementById('turn-indicator');
        challengeText = document.getElementById('challenge-text');
        cardContent = document.getElementById('card-content');
        authorTag = document.getElementById('author-tag');
        truthBtn = document.getElementById('truth-btn');
        dareBtn = document.getElementById('dare-btn');
        randomBtn = document.getElementById('random-btn');
        nextPlayerBtn = document.getElementById('next-player-btn');
        passBtn = document.getElementById('pass-btn');

        // Add event listeners for game screen buttons
        if (truthBtn) truthBtn.addEventListener('click', () => getChallenge('truth'));
        if (dareBtn) dareBtn.addEventListener('click', () => getChallenge('dare'));
        if (randomBtn) randomBtn.addEventListener('click', () => getChallenge('random'));
        if (nextPlayerBtn) nextPlayerBtn.addEventListener('click', prepareNextRound);
        if (passBtn) passBtn.addEventListener('click', handlePass);
    }


    function updatePlayerList() {
        playerList.innerHTML = '';
        players.forEach((player, index) => {
            const playerInput = document.createElement('input');
            playerInput.type = 'text';
            playerInput.value = player.name;
            playerInput.placeholder = `Prénom Joueur·se ${index + 1}`;
            playerInput.addEventListener('input', (e) => {
                players[index].name = e.target.value;
            });
            playerList.appendChild(playerInput);
        });
    }

    function addPlayer() {
        if (players.length < 10) {
            players.push({ name: '', passes: 0 });
            updatePlayerList();
        }
    }

    function selectLevel(level) {
        selectedLevel = parseInt(level, 10);
        levelButtons.forEach(button => {
            button.classList.remove('selected');
            if (parseInt(button.dataset.level, 10) === selectedLevel) {
                button.classList.add('selected');
            }
        });
    }
    
    function saveCustomChallenge() {
        const customText = customChallengeText.value.trim();
        const level = customLevelSelect.value;
        const type = customTypeSelect.value;

        if (customText && level && type) {
            customChallenges[type][level].push({ text: customText, author: 'vous' });
            customChallengeText.value = '';
            customChallengeModal.style.display = 'none';
        } else {
            showNotification('Veuillez remplir tous les champs.');
        }
    }

    function startGame() {
        // We filter player names directly on start
        const namedPlayers = players.map(p => p.name.trim()).filter(name => name !== '');
        if (namedPlayers.length < 1) {
            showNotification("Veuillez entrer au moins un nom de joueur.");
            return;
        }
        
        // Recreate the players array with only valid players and reset their passes
        players = namedPlayers.map(name => ({ name: name, passes: 0 }));
        currentPlayer = null;

        setupScreen.classList.remove('active');
        wheelScreen.classList.add('active');

        initializeGameScreenElements();
        drawWheel();
    }

    function updateTurnIndicator() {
        if(currentPlayer) {
            turnIndicator.textContent = `Au tour de ${currentPlayer.name}`;
        }
    }

    function showNotification(message, isGageWarning = false) {
        notificationText.textContent = message;
        notificationModal.style.display = 'flex';
        
        // We define what the "OK" button does when clicked
        closeNotificationModalBtn.onclick = () => {
            notificationModal.style.display = 'none';
            // If it was a gage warning, we prepare next round
            if (isGageWarning) {
                prepareNextRound();
            }
            // Otherwise, we do nothing (it was a simple info message)
        };
    }

    function handlePass() {
        if (!currentPlayer) return;
        currentPlayer.passes += 1;

        if (currentPlayer.passes >= 2) {
            currentPlayer.passes = 0; // Reset after getting the gage
            triggerGage();
        } else {
            // This is the first refusal, show a warning
            showNotification(`C'est ton premier refus. Au prochain, c'est le gage !`, true);
        }
    }

    function triggerGage() {
        if (typeof challenges.gages === 'undefined' || !challenges.gages[selectedLevel] || challenges.gages[selectedLevel].length === 0) {
            showNotification("Aucun gage disponible pour ce niveau ! C'est ton jour de chance.", true);
            return;
        }

        const gagePool = challenges.gages[selectedLevel];
        const randomIndex = Math.floor(Math.random() * gagePool.length);
        const selectedGage = gagePool[randomIndex];
        
        gageText.textContent = selectedGage.text;
        gageModal.style.display = 'flex';
    }

    function closeGageModal() {
        gageModal.style.display = 'none';
        prepareNextRound();
    }

    function prepareNextRound() {
        gameScreen.classList.remove('active');
        wheelScreen.classList.add('active');
        drawWheel();
    }

    function drawWheel() {
        if (!wheelCtx) return;
        const radius = wheelCanvas.width / 2;
        const total = players.length;
        wheelCtx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

        for (let i = 0; i < total; i++) {
            const startAngle = (2 * Math.PI / total) * i;
            const endAngle = startAngle + (2 * Math.PI / total);
            wheelCtx.beginPath();
            wheelCtx.moveTo(radius, radius);
            wheelCtx.arc(radius, radius, radius, startAngle, endAngle);
            wheelCtx.closePath();
            wheelCtx.fillStyle = i % 2 === 0 ? '#ff69b4' : '#39ff14';
            wheelCtx.fill();
            wheelCtx.strokeStyle = '#000';
            wheelCtx.stroke();

            // Draw player name
            wheelCtx.save();
            wheelCtx.translate(radius, radius);
            wheelCtx.rotate(startAngle + (endAngle - startAngle) / 2);
            wheelCtx.textAlign = 'right';
            wheelCtx.fillStyle = '#000';
            wheelCtx.font = '16px Montserrat';
            wheelCtx.fillText(players[i].name, radius - 10, 5);
            wheelCtx.restore();
        }

        wheelCanvas.style.transform = 'rotate(0deg)';
        spinBtn.disabled = false;
    }

    function spinWheel() {
        if (!wheelCanvas) return;
        spinBtn.disabled = true;
        const extraSpins = Math.random() * 360 + 720; // at least two spins
        const duration = 4000;
        const start = performance.now();
        const initialAngle = 0;

        function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const angle = initialAngle + easeOut * extraSpins;
            wheelCanvas.style.transform = `rotate(${angle}deg)`;
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                const finalAngle = angle % 360;
                getWinner(finalAngle);
            }
        }

        requestAnimationFrame(animate);
    }

    function getWinner(angle) {
        const total = players.length;
        const segmentAngle = 360 / total;
        const normalized = (360 - angle + segmentAngle / 2) % 360;
        const index = Math.floor(normalized / segmentAngle);
        currentPlayer = players[index];

        const availableTruths = [...challenges.truths[selectedLevel], ...customChallenges.truths[selectedLevel]];
        const availableDares = [...challenges.dares[selectedLevel], ...customChallenges.dares[selectedLevel]];
        const pool = [...availableTruths, ...availableDares];
        const randomIndex = Math.floor(Math.random() * pool.length);
        const challenge = pool[randomIndex];

        setTimeout(() => {
            wheelScreen.classList.remove('active');
            gameScreen.classList.add('active');
            updateTurnIndicator();
            if (challenge) {
                displayChallenge(challenge.text, challenge.author);
            } else {
                displayChallenge('Plus de défis disponibles dans cette catégorie ! Ajoutez les vôtres ou changez de niveau.');
            }
        }, 2000);
    }

    function getChallenge(type) {
        if (typeof challenges === 'undefined') {
            console.error('Les données des défis (data.js) ne sont pas chargées !');
            return;
        }

        const availableTruths = [...challenges.truths[selectedLevel], ...customChallenges.truths[selectedLevel]];
        const availableDares = [...challenges.dares[selectedLevel], ...customChallenges.dares[selectedLevel]];

        let pool = [];
        if (type === 'truth') pool = availableTruths;
        else if (type === 'dare') pool = availableDares;
        else if (type === 'random') pool = [...availableTruths, ...availableDares];

        if (pool.length === 0) {
            displayChallenge(`Plus de défis disponibles dans cette catégorie ! Ajoutez les vôtres ou changez de niveau.`);
            return;
        }

        const randomIndex = Math.floor(Math.random() * pool.length);
        const challenge = pool[randomIndex];
        displayChallenge(challenge.text, challenge.author);
    }

    function displayChallenge(text, author = null) {
        cardContent.style.opacity = 0;

        setTimeout(() => {
            challengeText.textContent = text;
            if (author) {
                authorTag.textContent = `Proposé par ${author}`;
                authorTag.style.display = 'block';
            } else {
                authorTag.style.display = 'none';
            }
            cardContent.style.opacity = 1;
        }, 300);
    }

    // --- Event Listeners ---
    levelButtons.forEach(button => {
        button.addEventListener('click', () => selectLevel(button.dataset.level));
    });

    addPlayerBtn.addEventListener('click', addPlayer);
    startGameBtn.addEventListener('click', startGame);
    addCustomBtn.addEventListener('click', () => customChallengeModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => customChallengeModal.style.display = 'none');
    saveChallengeBtn.addEventListener('click', saveCustomChallenge);
    closeGageModalBtn.addEventListener('click', closeGageModal);
    
    // The main listener for the notification modal "OK" button. 
    // Its specific action is now set inside the showNotification function.
    closeNotificationModalBtn.addEventListener('click', () => {
        notificationModal.style.display = 'none';
    });

    if (spinBtn) spinBtn.addEventListener('click', spinWheel);


    // --- Initial state ---
    players.push({ name: '', passes: 0 }); // Start with one player field
    updatePlayerList();
    selectLevel(1);
});

