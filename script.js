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
            alert('Défi ajouté !');
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    }

    function startGame() {
        const validPlayers = players.filter(p => p.name.trim() !== '');

        if (validPlayers.length < 1) {
            alert("Veuillez entrer au moins un nom de joueur.");
            return;
        }
        
        players = validPlayers;
        
        setupScreen.classList.remove('active');
        gameScreen.classList.add('active');
        
        initializeGameScreenElements();
        currentPlayerIndex = 0;
        updateTurnIndicator();
        challengeText.textContent = 'Préparez-vous...';
    }
    
    function updateTurnIndicator() {
        turnIndicator.textContent = `Au tour de ${players[currentPlayerIndex].name}`;
    }

    function switchTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnIndicator();
        challengeText.textContent = 'Préparez-vous...';
        authorTag.style.display = 'none';
    }

    function handlePass() {
        const currentPlayer = players[currentPlayerIndex];
        currentPlayer.passes += 1;

        if (currentPlayer.passes >= 2) {
            triggerGage();
            currentPlayer.passes = 0; // Reset after getting the gage
        } else {
            alert(`C'est ton premier refus. Au prochain, c'est le gage !`);
            switchTurn();
        }
    }

    function triggerGage() {
        if (typeof challenges.gages === 'undefined' || !challenges.gages[selectedLevel] || challenges.gages[selectedLevel].length === 0) {
            alert("Aucun gage disponible pour ce niveau ! C'est ton jour de chance.");
            switchTurn();
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
        switchTurn(); // Move to next player after closing the gage modal
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

    // --- Event Listeners (Setup Screen) ---
    levelButtons.forEach(button => {
        button.addEventListener('click', () => selectLevel(button.dataset.level));
    });

    addPlayerBtn.addEventListener('click', addPlayer);
    startGameBtn.addEventListener('click', startGame);
    addCustomBtn.addEventListener('click', () => customChallengeModal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => customChallengeModal.style.display = 'none');
    saveChallengeBtn.addEventListener('click', saveCustomChallenge);
    closeGageModalBtn.addEventListener('click', closeGageModal);


    // --- Initial state ---
    addPlayer(); // Add the first player by default
    selectLevel(1);
});

