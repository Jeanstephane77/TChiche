'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // ------- State -------
  let players = ['Joueur·se 1'];
  let selectedLevel = 1; // toujours un nombre
  const MAX_PLAYERS = 10;
  let currentPlayerIndex = 0;

  // Défis personnalisés par niveau
  const customChallenges = {
    truths: { 1: [], 2: [], 3: [], 4: [] },
    dares:  { 1: [], 2: [], 3: [], 4: [] }
  };

  // ------- DOM -------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const setupScreen = $('#setup-screen');
  const gameScreen  = $('#game-screen');

  const levelButtons   = $$('.level-btn');
  const playerList     = $('#player-list');
  const addPlayerBtn   = $('#add-player-btn');
  const startGameBtn   = $('#start-game-btn');

  // Modal (facultatif selon ton HTML)
  const addCustomBtn           = $('#add-custom-btn');
  const customChallengeModal   = $('#custom-challenge-modal');
  const closeModalBtn          = $('#close-modal-btn');
  const saveChallengeBtn       = $('#save-challenge-btn');
  const customChallengeText    = $('#custom-challenge-text');
  const customLevelSelect      = $('#custom-level-select');
  const customTypeSelect       = $('#custom-type-select');

  // Écran de jeu
  const turnIndicator  = $('#turn-indicator');
  const challengeText  = $('#challenge-text');
  const cardContent    = $('#card-content');
  const authorTag      = $('#author-tag');
  const truthBtn       = $('#truth-btn');
  const dareBtn        = $('#dare-btn');
  const randomBtn      = $('#random-btn');
  const nextPlayerBtn  = $('#next-player-btn');

  // ------- Helpers -------
  const asNumber = (v) => typeof v === 'number' ? v : Number(v);

  const ensureArray = (val) => Array.isArray(val) ? val : [];
  const getLevel = () => asNumber(selectedLevel) || 1;

  const show = (el) => { if (el) { el.style.display = 'flex'; el.classList.add('active'); } };
  const hide = (el) => { if (el) { el.style.display = 'none'; el.classList.remove('active'); } };

  const safeChallenges = () => {
    // data.js doit définir window.challenges = { truths: {1:[...]}, dares:{1:[...]} }
    const base = window.challenges || {};
    return {
      truths: base.truths || {},
      dares:  base.dares  || {}
    };
  };

  const nextIndex = (i, len) => (i + 1) % Math.max(len, 1);

  // ------- UI builders -------
  function updatePlayerList() {
    if (!playerList) return;
    playerList.innerHTML = '';
    players.forEach((player, index) => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = player;
      input.placeholder = `Prénom Joueur·se ${index + 1}`;
      input.autocomplete = 'off';
      input.addEventListener('input', (e) => {
        players[index] = e.target.value;
      });
      playerList.appendChild(input);
    });
  }

  function selectLevel(levelLike) {
    const level = asNumber(levelLike) || 1;
    selectedLevel = level;

    if (levelButtons.length) {
      levelButtons.forEach(btn => {
        btn.classList.toggle('selected', asNumber(btn.dataset.level) === level);
      });
    }
  }

  function updateTurnIndicator() {
    if (!turnIndicator) return;
    const name = players[currentPlayerIndex] || 'Joueur·se';
    turnIndicator.textContent = `Au tour de ${name}`;
  }

  function resetCard() {
    if (challengeText) challengeText.textContent = 'Préparez-vous...';
    if (authorTag)     authorTag.style.display = 'none';
  }

  // ------- Actions -------
  function addPlayer(e) {
    e?.preventDefault?.();
    if (players.length >= MAX_PLAYERS) return;
    players.push(`Joueur·se ${players.length + 1}`);
    updatePlayerList();
  }

  function startGame(e) {
    e?.preventDefault?.(); // évite un submit implicite si dans un <form>

    if (!setupScreen || !gameScreen) return;

    // Trim + filtre des vides
    const validPlayers = players.map(p => (p || '').trim()).filter(Boolean);

    if (validPlayers.length < 1) {
      alert("Veuillez entrer au moins un nom de joueur.");
      return;
    }

    players = validPlayers;
    currentPlayerIndex = 0;
    hide(setupScreen);
    show(gameScreen);
    resetCard();
    updateTurnIndicator();
  }

  function switchTurn(e) {
    e?.preventDefault?.();
    currentPlayerIndex = nextIndex(currentPlayerIndex, players.length);
    updateTurnIndicator();
    resetCard();
  }

  function displayChallenge(text, author = null) {
    if (!challengeText || !cardContent || !authorTag) return;

    // petite anim "fondu"
    cardContent.style.opacity = 0;
    window.setTimeout(() => {
      challengeText.textContent = text || '—';
      if (author) {
        authorTag.textContent = `Proposé par ${author}`;
        authorTag.style.display = 'block';
      } else {
        authorTag.style.display = 'none';
      }
      cardContent.style.opacity = 1;
    }, 150);
  }

  function getChallenge(type, e) {
    e?.preventDefault?.();

    try {
      const lvl = getLevel();
      const base = safeChallenges();

      const truthsBase   = ensureArray(base.truths[lvl]);
      const daresBase    = ensureArray(base.dares[lvl]);
      const truthsCustom = ensureArray(customChallenges.truths[lvl]);
      const daresCustom  = ensureArray(customChallenges.dares[lvl]);

      const availableTruths = truthsBase.concat(truthsCustom);
      const availableDares  = daresBase.concat(daresCustom);

      let pool = [];
      if (type === 'truth')   pool = availableTruths;
      else if (type === 'dare')  pool = availableDares;
      else pool = availableTruths.concat(availableDares);

      if (!pool.length) {
        displayChallenge(`Plus de défis disponibles à ce niveau. Ajoutez les vôtres ou changez de niveau.`);
        return;
      }

      const challenge = pool[Math.floor(Math.random() * pool.length)];
      if (challenge && typeof challenge === 'object') {
        displayChallenge(challenge.text, challenge.author);
      } else if (typeof challenge === 'string') {
        // compat : si data.js stocke des strings simples
        displayChallenge(challenge, null);
      } else {
        displayChallenge(`Défi introuvable. Réessayez.`);
      }
    } catch (err) {
      console.error('Erreur getChallenge:', err);
      displayChallenge(`Oups, petit souci technique. Réessayez.`);
    }
  }

  function saveCustomChallenge(e) {
    e?.preventDefault?.();
    if (!customChallengeText || !customLevelSelect || !customTypeSelect) return;

    const text  = (customChallengeText.value || '').trim();
    const lvl   = asNumber(customLevelSelect.value) || 1;
    const type  = (customTypeSelect.value === 'truths') ? 'truths' : 'dares';

    if (!text) { alert('Veuillez écrire un défi.'); return; }

    // Sécurité : ensure arrays existent
    if (!Array.isArray(customChallenges[type][lvl])) customChallenges[type][lvl] = [];

    customChallenges[type][lvl].push({ text, author: 'vous' });
    customChallengeText.value = '';
    if (customChallengeModal) customChallengeModal.style.display = 'none';
    alert('Défi ajouté !');
  }

  // ------- Listeners -------
  // Niveaux
  if (levelButtons.length) {
    levelButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        selectLevel(btn.dataset.level);
      });
    });
  }

  // Setup
  if (addPlayerBtn)  addPlayerBtn.addEventListener('click', addPlayer);
  if (startGameBtn)  startGameBtn.addEventListener('click', startGame);

  // Modal perso
  if (addCustomBtn && customChallengeModal) {
    addCustomBtn.addEventListener('click', (e) => {
      e.preventDefault();
      customChallengeModal.style.display = 'flex';
    });
  }
  if (closeModalBtn && customChallengeModal) {
    closeModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      customChallengeModal.style.display = 'none';
    });
  }
  if (saveChallengeBtn) saveChallengeBtn.addEventListener('click', saveCustomChallenge);

  // Jeu
  if (truthBtn)      truthBtn.addEventListener('click', (e) => getChallenge('truth', e));
  if (dareBtn)       dareBtn.addEventListener('click',  (e) => getChallenge('dare',  e));
  if (randomBtn)     randomBtn.addEventListener('click', (e) => getChallenge('random', e));
  if (nextPlayerBtn) nextPlayerBtn.addEventListener('click', switchTurn);

  // ------- Init -------
  selectLevel(1);
  updatePlayerList();
  hide(gameScreen);
  show(setupScreen);

  // (Optionnel) Log des erreurs non-capturées pour debug
  window.addEventListener('error', (ev) => {
    console.error('Global error:', ev.error || ev.message);
  });
  window.addEventListener('unhandledrejection', (ev) => {
    console.error('Unhandled promise:', ev.reason);
  });
});

