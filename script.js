 document.addEventListener('DOMContentLoaded', () => {
    // --- Éléments du DOM ---
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const levelButtons = document.querySelectorAll('.level-btn');
    const playerList = document.getElementById('player-list');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const toggleCustomChallengeBtn = document.getElementById('toggle-custom-challenge-btn');
    const customChallengeForm = document.getElementById('custom-challenge-form');
    const saveCustomChallengeBtn = document.getElementById('save-custom-challenge-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    const turnIndicator = document.getElementById('turn-indicator');
    const challengeText = document.getElementById('challenge-text');
    const truthBtn = document.getElementById('truth-btn');
    const dareBtn = document.getElementById('dare-btn');
    const randomBtn = document.getElementById('random-btn');
    const nextPlayerBtn = document.getElementById('next-player-btn');

    // --- État du jeu ---
    let gameState = {
        players: [],
        currentPlayerIndex: 0,
        selectedLevel: 1,
        customChallenges: JSON.parse(localStorage.getItem('customTchicheChallenges')) || {1:{truths:[],dares:[]}, 2:{truths:[],dares:[]}, 3:{truths:[],dares:[]}, 4:{truths:[],dares:[]}}
    };

    // --- Fonctions de Configuration ---

    function selectLevel(e) {
        // CORRECTION : On enlève la classe 'selected' de TOUS les boutons
        levelButtons.forEach(btn => btn.classList.remove('selected'));
        // On ajoute la classe 'selected' uniquement au bouton cliqué
        e.target.classList.add('selected');
        gameState.selectedLevel = parseInt(e.target.dataset.level);
    }

    function addPlayer() {
        if (playerList.children.length >= 10) return;
        const playerCount = playerList.children.length + 1;
        const newPlayerItem = document.createElement('div');
        newPlayerItem.classList.add('player-item');
        newPlayerItem.innerHTML = `
            <input type="text" class="player-name-input" placeholder="Prénom Joueur/Joueuse ${playerCount}" value="">
            <button class="remove-player-btn">&times;</button>
        `;
        playerList.appendChild(newPlayerItem);
        // On ajoute l'écouteur pour le nouveau bouton de suppression
        newPlayerItem.querySelector('.remove-player-btn').addEventListener('click', (e) => {
            e.target.parentElement.remove();
        });
    }
    
    function toggleCustomChallengeForm() {
        customChallengeForm.classList.toggle('active');
    }

    function saveCustomChallenge() {
        const level = document.getElementById('custom-challenge-level').value;
        const type = document.getElementById('custom-challenge-type').value;
        const text = document.getElementById('custom-challenge-text').value.trim();

        if (text) {
            if (type === 'truth') {
                gameState.customChallenges[level].truths.push(text);
            } else {
                gameState.customChallenges[level].dares.push(text);
            }
            localStorage.setItem('customTchicheChallenges', JSON.stringify(gameState.customChallenges));
            document.getElementById('custom-challenge-text').value = '';
            alert('Défi ajouté !');
        } else {
            alert('Veuillez écrire un défi.');
        }
    }

    // --- Fonctions de Jeu ---

    function startGame() {
        const playerInputs = document.querySelectorAll('.player-name-input');
        gameState.players = Array.from(playerInputs)
            .map(input => input.value.trim())
            .filter(name => name !== '');

        if (gameState.players.length < 1) {
            alert('Veuillez entrer au moins un nom de joueur·se.');
            return;
        }

        startScreen.classList.remove('active');
        gameScreen.classList.add('active');
        gameState.currentPlayerIndex = 0;
        updateTurnIndicator();
        challengeText.textContent = "Préparez-vous...";
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = `Au tour de ${gameState.players[gameState.currentPlayerIndex]}`;
    }

    function getChallenge(type) {
        const level = gameState.selectedLevel;
        const allTruths = [...challenges.truths[level], ...gameState.customChallenges[level].truths];
        const allDares = [...challenges.dares[level], ...gameState.customChallenges[level].dares];

        let challengePool;
        if (type === 'truth') {
            challengePool = allTruths;
        } else if (type === 'dare') {
            challengePool = allDares;
        } else { // random
            challengePool = [...allTruths, ...allDares];
        }

        if (challengePool.length === 0) {
            challengeText.textContent = "Aucun défi disponible pour cette catégorie. Ajoutez-en un !";
            return;
        }

        const randomIndex = Math.floor(Math.random() * challengePool.length);
        displayChallenge(challengePool[randomIndex]);
    }
    
    function displayChallenge(text) {
        challengeText.parentElement.style.animation = 'none';
        void challengeText.parentElement.offsetWidth;
        challengeText.parentElement.style.animation = 'fadeIn 0.5s ease-in-out';
        challengeText.textContent = text;
    }

    function nextPlayer() {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
        updateTurnIndicator();
        challengeText.textContent = "Préparez-vous...";
    }


    // --- Ajout des écouteurs d'événements ---
    levelButtons.forEach(btn => btn.addEventListener('click', selectLevel));
    // CORRECTION : L'écouteur est maintenant bien attaché
    addPlayerBtn.addEventListener('click', addPlayer);
    toggleCustomChallengeBtn.addEventListener('click', toggleCustomChallengeForm);
    saveCustomChallengeBtn.addEventListener('click', saveCustomChallenge);
    startGameBtn.addEventListener('click', startGame);

    truthBtn.addEventListener('click', () => getChallenge('truth'));
    dareBtn.addEventListener('click', () => getChallenge('dare'));
    randomBtn.addEventListener('click', () => getChallenge('random'));
    nextPlayerBtn.addEventListener('click', nextPlayer);

});

