document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');
    const startBtn = document.getElementById('start-btn');
    const turnIndicator = document.getElementById('turn-indicator');
    const progressBar = document.getElementById('progress-bar');
    const challengeCard = document.getElementById('challenge-card');
    const challengeText = document.getElementById('challenge-text');
    const truthBtn = document.getElementById('truth-btn');
    const dareBtn = document.getElementById('dare-btn');
    const player1Input = document.getElementById('player1');
    const player2Input = document.getElementById('player2');

    // --- Game State ---
    let players = [];
    let currentPlayerIndex = 0;
    let currentLevel = 1;
    let levelProgress = 0;
    const challengesToLevelUp = 6; // Number of challenges to complete before leveling up

    // --- Challenges Data ---
    const truths = {
        1: [
            "Quelle est ta plus grande peur inavouable ?",
            "Raconte ta pire honte.",
            "Quelle partie de mon corps préfères-tu ?",
            "Quelle est ta pire habitude en amour ?",
            "Raconte un rencard complètement raté.",
            "La première chose que tu as pensée en me voyant ?",
            "Quel est ton surnom le plus embarrassant ?",
            "As-tu déjà stalké un ex sur les réseaux sociaux ?"
        ],
        2: [
            "Quel est ton plus gros fantasme jamais avoué ?",
            "Quelle est la chose la plus folle que tu aies faite par désir ?",
            "As-tu déjà fait un rêve érotique avec quelqu'un d'autre depuis qu'on se connaît ?",
            "Quelle est la zone de ton corps que tu aimes le moins qu'on touche ? Et le plus ?",
            "As-tu déjà menti pour séduire ? Si oui, sur quoi ?",
            "Quelle est ta plus grande addiction secrète ?",
            "Décris le baiser parfait pour toi."
        ],
        3: [
            "As-tu déjà fait l’amour dans un lieu public ? Si non, où rêverais-tu de le faire ?",
            "Raconte en détail une scène d'un film qui t'a vraiment excité(e).",
            "Quel est ton plus grand fantasme 'interdit' ou tabou ?",
            "Quelle est la limite que tu ne franchirais jamais au lit ?",
            "As-tu déjà filmé ou photographié un moment intime ?",
            "Avec combien de personnes as-tu vraiment pris ton pied ?",
            "Quelle pratique sexuelle t'intrigue le plus en secret ?"
        ],
        4: [
            "Quelle est la chose non-sexuelle que je fais qui t'excite le plus ?",
            "Si tu pouvais avoir un 'laissez-passer' pour une seule chose avec moi ce soir, que demanderais-tu ?",
            "Quelle odeur sur mon corps te rend complètement fou/folle ?",
            "Décris le son que tu préfères m'entendre faire.",
            "Quelle est la pensée la plus coquine que tu aies eue à mon sujet aujourd'hui ?",
            "Si nos corps pouvaient parler, que dirait le tien au mien maintenant ?",
            "Quel est le mot que tu adorerais m'entendre te murmurer pendant l'amour ?",
            "As-tu déjà fantasmé sur moi dans un contexte de domination ou de soumission ?",
            "Quelle partie de ma personnalité trouves-tu la plus sexy ?",
            "S'il n'y avait aucune conséquence, quelle est la chose la plus folle que tu voudrais expérimenter avec moi ?"
        ]
    };

    const dares = {
        1: [
            "Chuchote un compliment très personnel à l'oreille de l'autre.",
            "Danse un slow langoureux sans musique pendant 30 secondes.",
            "Regarde l'autre dans les yeux sans parler jusqu'à ce qu'il/elle craque.",
            "Prends la main de ton/ta partenaire et embrasse-la tendrement.",
            "Dis un mot coquin avec ta voix la plus innocente.",
            "Fais un câlin de 20 secondes, les yeux fermés."
        ],
        2: [
            "Fais un massage sensuel d'une minute sur une zone choisie par l'autre (nuque, pieds...).",
            "Rejoue la scène de votre premier baiser.",
            "Fais une déclaration de désir en n'utilisant que des métaphores culinaires.",
            "Imite le gémissement d'un personnage de film célèbre.",
            "Demande à l'autre où il/elle rêve d'être touché(e) maintenant, et effleure cette zone.",
            "Avec ton doigt, dessine un mot secret sur le dos de l'autre, qui doit le deviner."
        ],
        3: [
            "Embrasse ton/ta partenaire à un endroit où tu ne l'as jamais embrassé(e).",
            "Décris à voix haute ce que tu aimerais qu'on te fasse juste après la partie.",
            "Enlève un vêtement de ton choix (ou celui de ton/ta partenaire).",
            "Propose un scénario de jeu de rôle que tu aimerais tester un jour.",
            "Simule un baiser passionné à quelques millimètres des lèvres de l'autre, sans jamais le/la toucher.",
            "Fais deviner ta zone érogène préférée en la stimulant discrètement sur toi-même."
        ],
        4: [
            "Bande les yeux de l'autre et fais-lui deviner 3 parties de ton corps avec ses lèvres.",
            "Murmure à son oreille la description exacte de ce que tu aimerais lui faire dans 10 minutes.",
            "Utilise un glaçon (ou un doigt froid) pour tracer un chemin sur son corps. L'autre guide avec 'plus chaud' ou 'plus froid'.",
            "Pendant les 3 prochains tours, appelle ton/ta partenaire 'Maître' ou 'Maîtresse'.",
            "Laisse l'autre te placer dans la position de son choix, et restez-y 1 minute sans bouger.",
            "Enlève un de tes vêtements en le/la regardant droit dans les yeux, le plus lentement possible.",
            "Donne un baiser 'à l'aveugle' : fermez les yeux et essayez de vous embrasser.",
            "Écris un mot coquin avec ton doigt sur le corps de l'autre, qui doit l'effacer avec sa bouche.",
            "Fais une 'dégustation' de sa peau : embrasse 3 endroits et décris leur 'goût'.",
            "Fais un strip-tease d'un seul accessoire de la manière la plus sexy possible."
        ]
    };

    // --- Functions ---

    function startGame() {
        const player1Name = player1Input.value.trim();
        const player2Name = player2Input.value.trim();

        if (player1Name && player2Name) {
            players = [player1Name, player2Name];
            startScreen.classList.remove('active');
            gameScreen.classList.add('active');
            updateTurnIndicator();
        } else {
            // Replaced alert with a visual cue
            player1Input.style.borderColor = player1Name ? 'var(--primary-color)' : 'red';
            player2Input.style.borderColor = player2Name ? 'var(--primary-color)' : 'red';
        }
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = `Au tour de ${players[currentPlayerIndex]}...`;
    }

    function switchTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnIndicator();
    }

    function updateProgressBar() {
        levelProgress++;
        const progressPercentage = (levelProgress / challengesToLevelUp) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        if (levelProgress >= challengesToLevelUp) {
            levelUp();
        }
    }
    
    function showLevelUpIndicator() {
        const indicator = document.getElementById('level-up-indicator');
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }

    function levelUp() {
        if (currentLevel < 4) {
            currentLevel++;
            levelProgress = 0;
            progressBar.style.width = '0%';
            showLevelUpIndicator();
            challengeText.innerHTML = `Niveau ${currentLevel} atteint !<br>La température monte...`;
        } else {
            // Max level reached
            challengeText.textContent = "Vous avez atteint le point de non-retour... Continuez si vous l'osez.";
        }
    }

    function getChallenge(type) {
        let challengePool;
        if (type === 'truth') {
            challengePool = truths[currentLevel];
        } else {
            challengePool = dares[currentLevel];
        }

        const randomIndex = Math.floor(Math.random() * challengePool.length);
        const selectedChallenge = challengePool[randomIndex];
        
        // Add player name to the challenge
        const personalizedChallenge = selectedChallenge.replace("l'autre", players[(currentPlayerIndex + 1) % 2])
                                                      .replace("ton/ta partenaire", players[(currentPlayerIndex + 1) % 2]);

        displayChallenge(personalizedChallenge);
        updateProgressBar();
        switchTurn();
    }
    
    function displayChallenge(text) {
        challengeCard.style.animation = 'none';
        // Trigger reflow to restart animation
        void challengeCard.offsetWidth; 
        challengeCard.style.animation = 'fadeIn 0.5s ease';
        challengeText.textContent = text;
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startGame);
    truthBtn.addEventListener('click', () => getChallenge('truth'));
    dareBtn.addEventListener('click', () => getChallenge('dare'));
});

