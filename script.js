 document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const levelButtons = document.querySelectorAll('.level-btn');
    const playersList = document.getElementById('players-list');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const turnIndicator = document.getElementById('turn-indicator');
    const challengeCard = document.getElementById('challenge-card');
    const challengeText = document.getElementById('challenge-text');
    const truthBtn = document.getElementById('truth-btn');
    const dareBtn = document.getElementById('dare-btn');
    const randomBtn = document.getElementById('random-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');

    // Modal elements
    const customChallengeModal = document.getElementById('custom-challenge-modal');
    const addCustomChallengesBtn = document.getElementById('add-custom-challenges-btn');
    const closeModalBtn = document.querySelector('.close-btn');
    const saveCustomChallengeBtn = document.getElementById('save-custom-challenge-btn');

    // --- Game State ---
    let selectedLevel = null;
    let players = [];
    let currentPlayerIndex = 0;
    let challengesData = { truths: {}, dares: {} }; // Will be populated from data.js and localStorage

    // --- Functions ---

    function initializeChallenges() {
        // Deep copy of original data to avoid modifying it
        challengesData.truths = JSON.parse(JSON.stringify(originalChallenges.truths));
        challengesData.dares = JSON.parse(JSON.stringify(originalChallenges.dares));

        // Load custom challenges from localStorage
        const customChallenges = JSON.parse(localStorage.getItem('customTchicheChallenges')) || {};
        for (const level in customChallenges.truths) {
            if (!challengesData.truths[level]) challengesData.truths[level] = [];
            challengesData.truths[level].push(...customChallenges.truths[level]);
        }
        for (const level in customChallenges.dares) {
            if (!challengesData.dares[level]) challengesData.dares[level] = [];
            challengesData.dares[level].push(...customChallenges.dares[level]);
        }
    }

    function updateStartButtonState() {
        const playerNames = Array.from(document.querySelectorAll('.player-name')).map(input => input.value.trim());
        const allPlayersNamed = playerNames.every(name => name !== '') && playerNames.length > 0;
        
        if (selectedLevel && allPlayersNamed) {
            startGameBtn.disabled = false;
        } else {
            startGameBtn.disabled = true;
        }
    }

    function addPlayer() {
        if (playersList.children.length < 10) {
            const playerIndex = playersList.children.length + 1;
            const newPlayerInput = document.createElement('div');
            newPlayerInput.classList.add('player-input-group');
            newPlayerInput.innerHTML = `
                <input type="text" class="player-name" placeholder="Prénom Joueur/se ${playerIndex}" required>
                <button class="remove-player-btn">&times;</button>
            `;
            playersList.appendChild(newPlayerInput);

            newPlayerInput.querySelector('.remove-player-btn').addEventListener('click', () => {
                newPlayerInput.remove();
                updatePlayerPlaceholders();
                updateStartButtonState();
            });

            newPlayerInput.querySelector('.player-name').addEventListener('input', updateStartButtonState);
        }
        if (playersList.children.length === 10) {
            addPlayerBtn.disabled = true;
        }
    }
    
    function updatePlayerPlaceholders() {
        const inputs = playersList.querySelectorAll('.player-name');
        inputs.forEach((input, index) => {
            input.placeholder = `Prénom Joueur/se ${index + 1}`;
        });
        addPlayerBtn.disabled = inputs.length >= 10;
    }


    function startGame() {
        players = Array.from(document.querySelectorAll('.player-name')).map(input => input.value.trim());
        if (players.length > 0 && selectedLevel) {
            startScreen.classList.remove('active');
            gameScreen.classList.add('active');
            currentPlayerIndex = 0;
            updateTurnIndicator();
            challengeText.textContent = "Préparez-vous...";
        }
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = `Au tour de ${players[currentPlayerIndex]}...`;
    }

    function getChallenge(type) {
        let challengePool = [];
        if (type === 'truth') {
            challengePool = challengesData.truths[selectedLevel] || [];
        } else { // dare
            challengePool = challengesData.dares[selectedLevel] || [];
        }

        if (challengePool.length === 0) {
            challengeText.textContent = `Aucun défi de ce type pour le niveau ${selectedLevel}.`;
            return;
        }

        const randomIndex = Math.floor(Math.random() * challengePool.length);
        displayChallenge(challengePool[randomIndex]);
    }

    function displayChallenge(text) {
        challengeText.textContent = text;
        challengeCard.classList.add('active');
    }

    function nextPlayer() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnIndicator();
        challengeText.textContent = "Le prochain défi vous attend...";
        challengeCard.classList.remove('active');
    }
    
    // --- Modal Logic ---
    function openModal() {
        customChallengeModal.style.display = 'block';
    }

    function closeModal() {
        customChallengeModal.style.display = 'none';
    }

    function saveCustomChallenge() {
        const level = document.getElementById('custom-level-select').value;
        const type = document.getElementById('custom-type-select').value;
        const text = document.getElementById('custom-challenge-input').value.trim();

        if (text) {
            let customChallenges = JSON.parse(localStorage.getItem('customTchicheChallenges')) || { truths: {}, dares: {} };
            if (!customChallenges[type]) customChallenges[type] = {};
            if (!customChallenges[type][level]) customChallenges[type][level] = [];
            
            customChallenges[type][level].push(text);
            localStorage.setItem('customTchicheChallenges', JSON.stringify(customChallenges));
            
            // Re-initialize challenges to include the new one
            initializeChallenges();

            document.getElementById('custom-challenge-input').value = '';
            closeModal();
            alert('Défi ajouté !');
        } else {
            alert('Veuillez écrire un défi.');
        }
    }


    // --- Event Listeners ---
    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            levelButtons.forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
            selectedLevel = button.dataset.level;
            updateStartButtonState();
        });
    });

    playersList.addEventListener('input', updateStartButtonState);
    
    addPlayerBtn.addEventListener('click', addPlayer);

    startGameBtn.addEventListener('click', startGame);

    truthBtn.addEventListener('click', () => getChallenge('truth'));
    dareBtn.addEventListener('click', () => getChallenge('dare'));
    randomBtn.addEventListener('click', () => {
        const randomType = Math.random() < 0.5 ? 'truth' : 'dare';
        getChallenge(randomType);
    });
    nextPlayerBtn.addEventListener('click', nextPlayer);

    // Modal listeners
    addCustomChallengesBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    saveCustomChallengeBtn.addEventListener('click', saveCustomChallenge);
    window.addEventListener('click', (event) => {
        if (event.target == customChallengeModal) {
            closeModal();
        }
    });

    // Initial setup
    initializeChallenges();
    document.querySelector('.player-name').addEventListener('input', updateStartButtonState); // For the first player
});

