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

    // --- Challenges Data (Updated Phrasing) ---
    const truths = {
        1: [
            "T'chiche de me dire quelle est ta plus grande peur inavouable ?",
            "T'chiche de me raconter ta pire honte.",
            "T'chiche de me dire quelle partie de mon corps tu préfères.",
            "T'chiche de me dire quelle est ta pire habitude en amour.",
            "T'chiche de me raconter un rencard complètement raté.",
            "T'chiche de me dire la première chose que tu as pensée en me voyant.",
            "T'chiche de me révéler ton surnom le plus embarrassant.",
            "T'chiche de m'avouer si tu as déjà stalké un ex sur les réseaux sociaux."
        ],
        2: [
            "T'chiche de me décrire ton plus gros fantasme jamais avoué.",
            "T'chiche de me dire la chose la plus folle que tu aies faite par désir.",
            "T'chiche de me dire si tu as déjà fait un rêve érotique avec quelqu'un d'autre depuis qu'on se connaît.",
            "T'chiche de me dire quelle zone de ton corps tu aimes le moins qu'on touche, et celle que tu aimes le plus.",
            "T'chiche de me dire si tu as déjà menti pour séduire, et sur quoi.",
            "T'chiche de me révéler ta plus grande addiction secrète.",
            "T'chiche de me décrire le baiser parfait."
        ],
        3: [
            "T'chiche de me dire si tu as déjà fait l’amour dans un lieu public (et où tu rêverais de le faire).",
            "T'chiche de me raconter en détail une scène de film qui t'a vraiment excité(e).",
            "T'chiche de me révéler ton plus grand fantasme 'interdit' ou tabou.",
            "T'chiche de me dire quelle est la limite que tu ne franchirais jamais au lit.",
            "T'chiche de me dire si tu as déjà filmé ou photographié un de tes moments intimes.",
            "T'chiche de me dire avec combien de personnes tu as vraiment pris ton pied.",
            "T'chiche de me dire quelle pratique sexuelle t'intrigue le plus en secret."
        ],
        4: [
            "T'chiche de me dire la chose non-sexuelle que je fais qui t'excite le plus.",
            "T'chiche de me dire, si tu avais un 'laissez-passer' pour une seule chose avec moi ce soir, ce que tu demanderais.",
            "T'chiche de me dire quelle odeur sur mon corps te rend complètement fou/folle.",
            "T'chiche de me décrire le son que tu préfères m'entendre faire.",
            "T'chiche de me dire la pensée la plus coquine que tu aies eue à mon sujet aujourd'hui.",
            "T'chiche de me dire ce que ton corps dirait au mien en ce moment, s'il pouvait parler.",
            "T'chiche de me dire le mot que tu adorerais m'entendre te murmurer pendant l'amour.",
            "T'chiche de m'avouer si tu as déjà fantasmé sur moi dans un contexte de domination ou de soumission.",
            "T'chiche de me dire quelle partie de ma personnalité tu trouves la plus sexy.",
            "T'chiche de me dire la chose la plus folle que tu voudrais expérimenter avec moi, s'il n'y avait aucune conséquence."
        ]
    };

    const dares = {
        1: [
            "T'chiche de me chuchoter un compliment très personnel à l'oreille.",
            "T'chiche de danser un slow langoureux avec moi, sans musique, pendant 30 secondes.",
            "T'chiche de me regarder dans les yeux sans parler jusqu'à ce que je craque.",
            "T'chiche de prendre ma main et de l'embrasser tendrement.",
            "T'chiche de me dire un mot coquin avec ta voix la plus innocente.",
            "T'chiche de me faire un câlin de 20 secondes, les yeux fermés."
        ],
        2: [
            "T'chiche de me faire un massage sensuel d'une minute sur une zone que je choisis (nuque, pieds...).",
            "T'chiche de rejouer la scène de notre premier baiser.",
            "T'chiche de me faire une déclaration de désir en n'utilisant que des métaphores culinaires.",
            "T'chiche d'imiter pour moi le gémissement d'un personnage de film célèbre.",
            "T'chiche de me demander où je rêve d'être touché(e) maintenant, et d'effleurer cette zone.",
            "T'chiche de dessiner un mot secret avec ton doigt sur mon dos, que je dois deviner."
        ],
        3: [
            "T'chiche de m'embrasser à un endroit où tu ne m'as jamais embrassé(e).",
            "T'chiche de me décrire à voix haute ce que tu aimerais que je te fasse juste après la partie.",
            "T'chiche d'enlever un vêtement de ton choix (le tien ou le mien).",
            "T'chiche de me proposer un scénario de jeu de rôle que tu aimerais tester un jour.",
            "T'chiche de simuler un baiser passionné à quelques millimètres de mes lèvres, sans jamais me toucher.",
            "T'chiche de me faire deviner ta zone érogène préférée en la stimulant discrètement sur toi-même."
        ],
        4: [
            "T'chiche de me bander les yeux et de me faire deviner 3 parties de ton corps avec mes lèvres.",
            "T'chiche de me murmurer à l'oreille la description exacte de ce que tu aimerais me faire dans 10 minutes.",
            "T'chiche d'utiliser un glaçon (ou un doigt froid) pour tracer un chemin sur mon corps, pendant que je te guide avec 'plus chaud' ou 'plus froid'.",
            "T'chiche de m'appeler 'Maître' ou 'Maîtresse' pendant les 3 prochains tours.",
            "T'chiche de me laisser te placer dans la position de mon choix, et de rester ainsi 1 minute sans bouger.",
            "T'chiche d'enlever un de tes vêtements en me regardant droit dans les yeux, le plus lentement possible.",
            "T'chiche de me donner un baiser 'à l'aveugle' : on ferme les yeux et on essaie de s'embrasser.",
            "T'chiche d'écrire un mot coquin avec ton doigt sur mon corps, que je dois effacer avec ma bouche.",
            "T'chiche de faire une 'dégustation' de ma peau : m'embrasser à 3 endroits et décrire leur 'goût'.",
            "T'chiche de faire un strip-tease d'un seul de tes accessoires de la manière la plus sexy possible."
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
            // Using a custom alert is better for PWA, but for simplicity, we keep the alert.
            alert('Veuillez entrer les prénoms des deux joueurs.');
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
        let selectedChallenge = challengePool[randomIndex];
        
        // This logic is simplified as the phrasing now directly addresses the other player.
        // We just need to display it.
        
        displayChallenge(selectedChallenge);
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

