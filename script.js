document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const levelSelection = document.getElementById('level-selection');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerList = document.getElementById('player-list');
    const startGameBtn = document.getElementById('start-game-btn');
    const turnIndicator = document.getElementById('turn-indicator');
    const challengeText = document.getElementById('challenge-text');
    const truthBtn = document.getElementById('truth-btn');
    const dareBtn = document.getElementById('dare-btn');
    const randomBtn = document.getElementById('random-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');
    
    // Nouveaux éléments pour les gages
    const passBtn = document.getElementById('pass-btn');
    const forfeitModal = document.getElementById('forfeit-modal');
    const forfeitPlayerName = document.getElementById('forfeit-player-name');
    const forfeitText = document.getElementById('forfeit-text');
    const closeForfeitModalBtn = document.getElementById('close-forfeit-modal-btn');
    
    // Éléments pour défis personnalisés
    const openCustomModalBtn = document.getElementById('open-custom-challenge-modal-btn');
    const customModal = document.getElementById('custom-challenge-modal');
    const closeCustomModalBtn = document.getElementById('close-custom-challenge-modal-btn');
    const saveCustomChallengeBtn = document.getElementById('save-custom-challenge-btn');

    // --- État du jeu ---
    const gameState = {
        level: 1,
        players: [],
        currentPlayerIndex: 0,
    };

    // --- Initialisation ---

    // Sélection du niveau
    levelSelection.addEventListener('click', (e) => {
        if (e.target.classList.contains('choice-btn')) {
            // Désélectionner tous les boutons
            document.querySelectorAll('#level-selection .choice-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
            // Sélectionner le bouton cliqué
            e.target.classList.add('selected');
            gameState.level = parseInt(e.target.dataset.level, 10);
        }
    });

    // Ajouter un joueur
    addPlayerBtn.addEventListener('click', () => {
        if (playerList.children.length < 10) {
            const playerNum = playerList.children.length + 1;
            const newPlayerInput = `
                <div class="player-input-group">
                    <input type="text" placeholder="Prénom Joueur·se ${playerNum}" class="player-name-input">
                    <button class="remove-player-btn">×</button>
                </div>`;
            playerList.insertAdjacentHTML('beforeend', newPlayerInput);
        }
    });

    // Supprimer un joueur
    playerList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-player-btn')) {
            if (playerList.children.length > 1) {
                e.target.parentElement.remove();
            }
        }
    });

    // Démarrer le jeu
    startGameBtn.addEventListener('click', () => {
        const playerInputs = document.querySelectorAll('.player-name-input');
        const playerNames = Array.from(playerInputs)
            .map(input => input.value.trim())
            .filter(name => name !== '');

        if (playerNames.length === 0) {
            alert('Veuillez entrer au moins un nom de joueur.');
            return;
        }

        gameState.players = playerNames.map(name => ({ name, refuseCount: 0 }));
        gameState.currentPlayerIndex = 0;

        startScreen.classList.remove('active');
        gameScreen.classList.add('active');
        setupTurn();
    });

    // --- Logique de jeu ---

    function setupTurn() {
        challengeText.textContent = 'Préparez-vous...';
        turnIndicator.textContent = `Au tour de ${gameState.players[gameState.currentPlayerIndex].name}`;
        
        // Afficher les boutons de choix de défi
        truthBtn.classList.remove('hidden');
        dareBtn.classList.remove('hidden');
        randomBtn.classList.remove('hidden');
        
        // Cacher les boutons d'action post-défi
        nextPlayerBtn.classList.add('hidden');
        passBtn.classList.add('hidden');
    }

    function getChallenge(type) {
        let challengePool;
        const levelChallenges = challenges[type][gameState.level] || [];
        const customChallenges = JSON.parse(localStorage.getItem('customChallenges')) || { truths: {}, dares: {} };
        const customLevelChallenges = (customChallenges[type] && customChallenges[type][gameState.level]) ? customChallenges[type][gameState.level] : [];
        
        challengePool = [...levelChallenges, ...customLevelChallenges];

        if (challengePool.length === 0) {
            challengeText.textContent = `Aucun défi de type "${type}" trouvé pour ce niveau.`;
            return;
        }

        const randomIndex = Math.floor(Math.random() * challengePool.length);
        displayChallenge(challengePool[randomIndex].text);
    }
    
    function getRandomChallenge() {
        const type = Math.random() < 0.5 ? 'truths' : 'dares';
        getChallenge(type);
    }
    
    function displayChallenge(text) {
        challengeText.textContent = text;
        
        // Cacher les boutons de choix de défi
        truthBtn.classList.add('hidden');
        dareBtn.classList.add('hidden');
        randomBtn.classList.add('hidden');
        
        // Afficher les boutons d'action post-défi
        nextPlayerBtn.classList.remove('hidden');
        passBtn.classList.remove('hidden');
    }
    
    function switchTurn() {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        setupTurn();
    }
    
    function handlePass() {
        const currentPlayer = gameState.players[gameState.currentPlayerIndex];
        currentPlayer.refuseCount++;
        
        if (currentPlayer.refuseCount >= 2) {
            currentPlayer.refuseCount = 0; // Reset count
            displayForfeit();
        } else {
            // On peut ajouter une petite alerte ou un message visuel ici si on veut
            alert(`${currentPlayer.name} passe son tour. Attention, au prochain refus, c'est le gage !`);
            switchTurn();
        }
    }
    
    function displayForfeit() {
        const forfeitPool = challenges.forfeits[gameState.level] || [];
        if(forfeitPool.length === 0) {
            alert("Pas de gage pour ce niveau, tu as de la chance !");
            switchTurn();
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * forfeitPool.length);
        const forfeit = forfeitPool[randomIndex].text;
        
        forfeitPlayerName.textContent = `Gage pour ${gameState.players[gameState.currentPlayerIndex].name} !`;
        forfeitText.textContent = forfeit;
        forfeitModal.classList.add('active');
    }
    
    function closeForfeitModal() {
        forfeitModal.classList.remove('active');
        switchTurn();
    }


    // --- Écouteurs d'événements ---
    truthBtn.addEventListener('click', () => getChallenge('truths'));
    dareBtn.addEventListener('click', () => getChallenge('dares'));
    randomBtn.addEventListener('click', getRandomChallenge);
    nextPlayerBtn.addEventListener('click', switchTurn);
    passBtn.addEventListener('click', handlePass);
    closeForfeitModalBtn.addEventListener('click', closeForfeitModal);

    // --- Logique des défis personnalisés ---
    openCustomModalBtn.addEventListener('click', () => customModal.classList.add('active'));
    closeCustomModalBtn.addEventListener('click', () => customModal.classList.remove('active'));
    saveCustomChallengeBtn.addEventListener('click', () => {
        const level = document.getElementById('custom-challenge-level').value;
        const type = document.getElementById('custom-challenge-type').value;
        const text = document.getElementById('custom-challenge-text').value.trim();

        if (text) {
            const customChallenges = JSON.parse(localStorage.getItem('customChallenges')) || { truths: {}, dares: {} };
            if (!customChallenges[type]) customChallenges[type] = {};
            if (!customChallenges[type][level]) customChallenges[type][level] = [];
            
            customChallenges[type][level].push({ text });
            localStorage.setItem('customChallenges', JSON.stringify(customChallenges));
            
            document.getElementById('custom-challenge-text').value = '';
            customModal.classList.remove('active');
            alert('Défi ajouté avec succès !');
        } else {
            alert('Veuillez écrire un défi.');
        }
    });

    // Initialiser le premier niveau comme sélectionné
    document.querySelector('#level-selection .choice-btn[data-level="1"]').classList.add('selected');
});

