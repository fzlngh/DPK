let score = 0;
let time = 60;
let level = 1;
let bestScore = parseInt(localStorage.getItem('tangkapBest') || '0');
let gameInterval = null;
let timerInterval = null;
let isPlaying = false;

const LEVELS = [
  { minScore: 0,  speed: 2000, size: 60 },
  { minScore: 8,  speed: 1400, size: 55 },
  { minScore: 18, speed: 900,  size: 48 },
  { minScore: 30, speed: 550,  size: 40 },
  { minScore: 45, speed: 300,  size: 34 },
];

const box          = document.getElementById('box');
const trap         = document.getElementById('trap');
const scoreEl      = document.getElementById('score');
const timeEl       = document.getElementById('time');
const levelEl      = document.getElementById('level');
const bestEl       = document.getElementById('best');
const finalScoreEl = document.getElementById('finalScore');
const newBestEl    = document.getElementById('newBest');
const startOverlay = document.getElementById('startOverlay');
const gameOverOvl  = document.getElementById('gameOverOverlay');

const sfxClick = document.getElementById('sfxClick');
const sfxTrap  = document.getElementById('sfxTrap');
const sfxOver  = document.getElementById('sfxOver');

bestEl.textContent = bestScore;

function playSound(audio) {
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function getAreaSize() {
  const area = document.getElementById('gameArea');
  return { w: area.clientWidth, h: area.clientHeight };
}

function randomPos(size) {
  const { w, h } = getAreaSize();
  return {
    x: Math.random() * (w - size - 8) + 4,
    y: Math.random() * (h - size - 8) + 4,
  };
}

function moveBox() {
  const cfg = LEVELS[level - 1];
  const pos = randomPos(cfg.size);
  box.style.left   = pos.x + 'px';
  box.style.top    = pos.y + 'px';
  box.style.width  = cfg.size + 'px';
  box.style.height = cfg.size + 'px';
  moveTrap();
}

function moveTrap() {
  const cfg = LEVELS[level - 1];
  const pos = randomPos(cfg.size);
  trap.style.left   = pos.x + 'px';
  trap.style.top    = pos.y + 'px';
  trap.style.width  = cfg.size + 'px';
  trap.style.height = cfg.size + 'px';
}

function updateLevel() {
  let newLevel = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) { newLevel = i + 1; break; }
  }
  if (newLevel !== level) {
    level = newLevel;
    levelEl.textContent = level;
    clearInterval(gameInterval);
    gameInterval = setInterval(moveBox, LEVELS[level - 1].speed);
  }
}

box.addEventListener('click', () => {
  if (!isPlaying) return;
  score++;
  scoreEl.textContent = score;
  playSound(sfxClick);
  updateLevel();
  moveBox();
});

trap.addEventListener('click', () => {
  if (!isPlaying) return;
  score = Math.max(0, score - 3);
  scoreEl.textContent = score;
  playSound(sfxTrap);
  trap.style.background = '#ff0000';
  setTimeout(() => { trap.style.background = ''; }, 200);
  moveTrap();
});

function startGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);

  score = 0; time = 60; level = 1; isPlaying = true;

  scoreEl.textContent = 0;
  timeEl.textContent  = 60;
  levelEl.textContent = 1;
  timeEl.classList.remove('urgent');

  startOverlay.style.display  = 'none';
  gameOverOvl.style.display   = 'none';
  box.style.display  = 'block';
  trap.style.display = 'block';

  moveBox();
  gameInterval = setInterval(moveBox, LEVELS[0].speed);

  timerInterval = setInterval(() => {
    time--;
    timeEl.textContent = time;
    if (time <= 10) timeEl.classList.add('urgent');
    if (time <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  isPlaying = false;
  box.style.display  = 'none';
  trap.style.display = 'none';

  playSound(sfxOver);
  timeEl.classList.remove('urgent');

  const isNew = score > bestScore;
  if (isNew) {
    bestScore = score;
    localStorage.setItem('tangkapBest', bestScore);
    bestEl.textContent = bestScore;
  }

  finalScoreEl.textContent  = score;
  newBestEl.style.display   = isNew ? 'block' : 'none';
  gameOverOvl.style.display = 'flex';
}

function resetGame() {
  clearInterval(gameInterval);
  clearInterval(timerInterval);
  isPlaying = false;

  score = 0; time = 60; level = 1;
  scoreEl.textContent = 0;
  timeEl.textContent  = 60;
  levelEl.textContent = 1;
  timeEl.classList.remove('urgent');

  box.style.display  = 'none';
  trap.style.display = 'none';
  gameOverOvl.style.display  = 'none';
  startOverlay.style.display = 'flex';
}
