document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let players = []; 
    let selectedLevel = 1;
    let customChallenges = {
        truths: { 1: [], 2: [], 3: [], 4: [] },
        dares: { 1: [], 2: [], 3: [], 4: [] }
    };
    let currentPlayerIndex = 0;

    // --- DOM Elements (Setup Screen) ---
    const setupScreen = document.getElementById('setup-screen');
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
        if (nextPlayerBtn) nextPlayerBtn.addEventListener('click', switchTurn);
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
        
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active');
        
        initializeGameScreenElements();
        currentPlayerIndex = 0;
        updateTurnIndicator();
        challengeText.textContent = 'Préparez-vous...';
    }
    
    function updateTurnIndicator() {
        if(players.length > 0) {
            turnIndicator.textContent = `Au tour de ${players[currentPlayerIndex].name}`;
        }
    }

    function switchTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnIndicator();
        challengeText.textContent = 'Préparez-vous...';
        authorTag.style.display = 'none';
    }

    function showNotification(message, isGageWarning = false) {
        notificationText.textContent = message;
        notificationModal.style.display = 'flex';
        
        // We define what the "OK" button does when clicked
        closeNotificationModalBtn.onclick = () => {
            notificationModal.style.display = 'none';
            // If it was a gage warning, we switch to the next player
            if (isGageWarning) {
                switchTurn();
            }
            // Otherwise, we do nothing (it was a simple info message)
        };
    }

    function handlePass() {
        const currentPlayer = players[currentPlayerIndex];
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
        switchTurn(); 
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


    // --- Initial state ---
    players.push({ name: '', passes: 0 }); // Start with one player field
    updatePlayerList();
    selectLevel(1);
});

