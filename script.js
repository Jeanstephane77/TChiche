 document.addEventListener('DOMContentLoaded', () => {
    // Écrans
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');

    // Éléments de configuration
    const levelSelection = document.getElementById('level-selection');
    const modeSelection = document.getElementById('mode-selection');
    const playerInputsContainer = document.getElementById('player-inputs');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const startGameBtn = document.getElementById('start-game-btn');

    // Éléments de défis personnalisés
    const toggleCustomBtn = document.getElementById('toggle-custom-challenge-btn');
    const customChallengeSection = document.getElementById('custom-challenge-section');
    const customLevelSelect = document.getElementById('custom-challenge-level');
    const customTypeSelect = document.getElementById('custom-challenge-type');
    const customTextInput = document.getElementById('custom-challenge-text');
    const saveCustomBtn = document.getElementById('save-custom-challenge-btn');
    const customFeedback = document.getElementById('custom-challenge-feedback');

    // Éléments de l'écran de jeu
    const turnIndicator = document.getElementById('turn-indicator');
    const challengeText = document.getElementById('challenge-text');
    const truthBtn = document.getElementById('truth-btn');
    const dareBtn = document.getElementById('dare-btn');
    const randomBtn = document.getElementById('random-btn');
    const nextTurnBtn = document.getElementById('next-turn-btn');

    // État du jeu
    let gameState = {
        level: null,
        mode: null,
        players: [],
        currentPlayerIndex: 0,
        customChallenges: JSON.parse(localStorage.getItem('customTchicheChallenges')) || {}
    };

    // --- CONFIGURATION DU JEU ---

    // Sélection du niveau
    levelSelection.addEventListener('click', (e) => {
        if (e.target.classList.contains('level-btn')) {
            document.querySelectorAll('.level-btn').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
            gameState.level = parseInt(e.target.dataset.level);
        }
    });

    // Sélection du mode
    modeSelection.addEventListener('click', (e) => {
        if (e.target.classList.contains('mode-btn')) {
            document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
            e.target.classList.add('selected');
            gameState.mode = e.target.dataset.mode;
        }
    });

    // Ajout de joueurs
    addPlayerBtn.addEventListener('click', () => {
        const playerInputs = playerInputsContainer.querySelectorAll('.player-input');
        if (playerInputs.length < 10) {
            const newPlayerInput = document.createElement('input');
            newPlayerInput.type = 'text';
            newPlayerInput.classList.add('player-input');
            newPlayerInput.placeholder = `Prénom Joueur·se ${playerInputs.length + 1}`;
            playerInputsContainer.appendChild(newPlayerInput);
        } else {
            addPlayerBtn.disabled = true;
            addPlayerBtn.textContent = 'Maximum de 10 joueurs atteint';
        }
    });
    
    // Afficher/cacher la section des défis perso
    toggleCustomBtn.addEventListener('click', () => {
        customChallengeSection.classList.toggle('hidden');
    });

    // Sauvegarder un défi perso
    saveCustomBtn.addEventListener('click', () => {
        const level = `phase${customLevelSelect.value}`;
        const type = `${customTypeSelect.value}s`; // truths or dares
        const text = customTextInput.value.trim();

        if (text) {
            if (!gameState.customChallenges[level]) {
                gameState.customChallenges[level] = { truths: [], dares: [] };
            }
            if (!gameState.customChallenges[level][type]) {
                gameState.customChallenges[level][type] = [];
            }
            gameState.customChallenges[level][type].push(text);
            localStorage.setItem('customTchicheChallenges', JSON.stringify(gameState.customChallenges));
            
            customTextInput.value = '';
            customFeedback.textContent = 'Défi ajouté avec succès !';
            setTimeout(() => customFeedback.textContent = '', 2000);
        } else {
            customFeedback.textContent = 'Veuillez écrire un défi.';
        }
    });


    // Démarrer le jeu
    startGameBtn.addEventListener('click', () => {
        // Collecter les noms des joueurs
        const playerInputs = playerInputsContainer.querySelectorAll('.player-input');
        gameState.players = Array.from(playerInputs)
            .map(input => input.value.trim())
            .filter(name => name !== '');

        // Validation
        if (!gameState.level) {
            alert('Veuillez choisir un niveau.');
            return;
        }
        if (!gameState.mode) {
            alert('Veuillez choisir un mode de jeu.');
            return;
        }
        if (gameState.players.length < 1) {
            alert('Veuillez entrer le prénom d\'au moins un joueur.');
            return;
        }

        // Transition vers l'écran de jeu
        startScreen.classList.remove('active');
        gameScreen.classList.add('active');
        updateTurnIndicator();
    });

    // --- LOGIQUE DE L'ÉCRAN DE JEU ---

    function updateTurnIndicator() {
        if (gameState.players.length > 1) {
            turnIndicator.textContent = `Au tour de ${gameState.players[gameState.currentPlayerIndex]}`;
        } else {
            turnIndicator.textContent = `À vous, ${gameState.players[0]}`;
        }
    }

    function getChallenge(type) {
        const levelKey = `phase${gameState.level}`;
        const typeKey = `${type}s`; // truths or dares

        const baseChallenges = challenges[levelKey][typeKey] || [];
        const customChallengesList = (gameState.customChallenges[levelKey] && gameState.customChallenges[levelKey][typeKey]) ? gameState.customChallenges[levelKey][typeKey] : [];
        
        const allChallenges = [...baseChallenges, ...customChallengesList];

        if (allChallenges.length === 0) {
            challengeText.textContent = `Aucun défi de type '${type}' pour ce niveau. Ajoutez-en ou choisissez une autre option.`;
            return;
        }

        const randomIndex = Math.floor(Math.random() * allChallenges.length);
        displayChallenge(allChallenges[randomIndex]);
        
        // Cacher les boutons de choix et afficher le bouton "suivant"
        truthBtn.classList.add('hidden');
        dareBtn.classList.add('hidden');
        randomBtn.classList.add('hidden');
        if (gameState.players.length > 1) {
            nextTurnBtn.classList.remove('hidden');
        } else {
            // Si un seul joueur, on ré-affiche les choix directement
            setTimeout(() => {
                 truthBtn.classList.remove('hidden');
                 dareBtn.classList.remove('hidden');
                 randomBtn.classList.remove('hidden');
                 challengeText.textContent = "Préparez-vous...";
            }, 3000);
        }
    }

    function displayChallenge(text) {
        challengeCard.style.animation = 'none';
        void challengeCard.offsetWidth; // Force le "reflow" pour redémarrer l'animation
        challengeCard.style.animation = 'fadeIn 0.5s ease';
        challengeText.textContent = text;
    }

    function nextTurn() {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        updateTurnIndicator();
        
        challengeText.textContent = "Préparez-vous...";
        truthBtn.classList.remove('hidden');
        dareBtn.classList.remove('hidden');
        randomBtn.classList.remove('hidden');
        nextTurnBtn.classList.add('hidden');
    }

    truthBtn.addEventListener('click', () => getChallenge('truth'));
    dareBtn.addEventListener('click', () => getChallenge('dare'));
    randomBtn.addEventListener('click', () => {
        const randomType = Math.random() < 0.5 ? 'truth' : 'dare';
        getChallenge(randomType);
    });
    nextTurnBtn.addEventListener('click', nextTurn);
});

