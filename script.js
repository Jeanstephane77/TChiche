document.addEventListener('DOMContentLoaded', () => {
    // --- State Variables ---
    let players = ['Joueur·se 1'];
    let selectedLevel = 1;
    let customChallenges = {
        truths: { 1: [], 2: [], 3: [], 4: [] },
        dares: { 1: [], 2: [], 3: [], 4: [] }
    };
    let currentPlayerIndex = 0;

    // --- DOM Elements ---
    const setupScreen = document.getElementById('setup-screen');
    const gameScreen = document.getElementById('game-screen');
    const levelButtons = document.querySelectorAll('.level-btn');
    const playerList = document.getElementById('player-list');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    
    // Custom Challenge Modal Elements
    const addCustomBtn = document.getElementById('add-custom-btn');
    const customChallengeModal = document.getElementById('custom-challenge-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveChallengeBtn = document.getElementById('save-challenge-btn');
    const customChallengeText = document.getElementById('custom-challenge-text');
    const customLevelSelect = document.getElementById('custom-level-select');
    const customTypeSelect = document.getElementById('custom-type-select');

    // Game Screen Elements
    const turnIndicator = document.getElementById('turn-indicator');
    const challengeText = document.getElementById('challenge-text');
    const cardContent = document.getElementById('card-content');
    const authorTag = document.getElementById('author-tag');
    const truthBtn = document.getElementById('truth-btn');
    const dareBtn = document.getElementById('dare-btn');
    const randomBtn = document.getElementById('random-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');

    // --- Functions ---

    function updatePlayerList() {
        if (!playerList) return; // Safety check
        playerList.innerHTML = '';
        players.forEach((player, index) => {
            const playerInput = document.createElement('input');
            playerInput.type = 'text';
            playerInput.value = player;
            playerInput.placeholder = `Prénom Joueur·se ${index + 1}`;
            playerInput.addEventListener('change', (e) => {
                players[index] = e.target.value;
            });
            playerList.appendChild(playerInput);
        });
    }

    function addPlayer() {
        if (players.length < 10) {
            players.push(`Joueur·se ${players.length + 1}`);
            updatePlayerList();
        }
    }

    function selectLevel(level) {
        if (!levelButtons) return; // Safety check
        selectedLevel = level;
        levelButtons.forEach(button => {
            button.classList.remove('selected');
            if (button.dataset.level == level) {
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
        if (!setupScreen || !gameScreen) return; // Safety check for screens

        // Filter out only empty player names
        players = players.filter(p => p.trim() !== '');
        if (players.length < 1) {
            alert("Veuillez entrer au moins un nom de joueur.");
            players = ['Joueur·se 1']; // Reset to one player to avoid errors
            updatePlayerList();
            return;
        }
        setupScreen.style.display = 'none';
        gameScreen.style.display = 'flex';
        updateTurnIndicator();
    }
    
    function updateTurnIndicator() {
        if (!turnIndicator) return; // Safety check
        turnIndicator.textContent = `Au tour de ${players[currentPlayerIndex]}`;
    }

    function switchTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnIndicator();
        // Reset challenge card
        if (challengeText) challengeText.textContent = 'Préparez-vous...';
        if (authorTag) authorTag.style.display = 'none';
    }

    function getChallenge(type) {
        const availableTruths = [...challenges.truths[selectedLevel], ...(customChallenges.truths[selectedLevel] || [])];
        const availableDares = [...challenges.dares[selectedLevel], ...(customChallenges.dares[selectedLevel] || [])];

        let pool = [];

        if (type === 'truth') {
            pool = availableTruths;
        } else if (type === 'dare') {
            pool = availableDares;
        } else if (type === 'random') {
            pool = [...availableTruths, ...availableDares];
        }

        if (pool.length === 0) {
            displayChallenge(`Plus de défis disponibles dans cette catégorie ! Ajoutez les vôtres ou changez de niveau.`);
            return;
        }

        const randomIndex = Math.floor(Math.random() * pool.length);
        const challenge = pool[randomIndex];

        displayChallenge(challenge.text, challenge.author);
    }

    function displayChallenge(text, author = null) {
        if (!challengeText || !cardContent || !authorTag) return; // Safety check
        challengeText.innerHTML = '';
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

    // Setup Screen
    if (levelButtons.length > 0) {
        levelButtons.forEach(button => {
            button.addEventListener('click', () => selectLevel(button.dataset.level));
        });
    }

    if (addPlayerBtn) addPlayerBtn.addEventListener('click', addPlayer);
    if (startGameBtn) startGameBtn.addEventListener('click', startGame);

    // Custom Challenge Modal
    if (addCustomBtn) addCustomBtn.addEventListener('click', () => {
        if (customChallengeModal) customChallengeModal.style.display = 'flex';
    });
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => {
        if (customChallengeModal) customChallengeModal.style.display = 'none';
    });
    if (saveChallengeBtn) saveChallengeBtn.addEventListener('click', saveCustomChallenge);

    // Game Screen
    if (truthBtn) truthBtn.addEventListener('click', () => getChallenge('truth'));
    if (dareBtn) dareBtn.addEventListener('click', () => getChallenge('dare'));
    if (randomBtn) randomBtn.addEventListener('click', () => getChallenge('random'));
    if (nextPlayerBtn) nextPlayerBtn.addEventListener('click', switchTurn);

    // Initial state
    selectLevel(1);
    updatePlayerList();
});


