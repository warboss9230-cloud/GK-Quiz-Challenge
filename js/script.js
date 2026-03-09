/* ============================================
   QUIZ MASTER — MAIN SCRIPT
   ============================================ */

// ---- STATE ----
let allQuestions = [];
let currentMode = '';
let currentSubject = 'All Subjects';
let quizQuestions = [];
let currentQIndex = 0;
let score = 0;
let correct = 0;
let wrong = 0;
let timerInterval = null;
let timerSeconds = 15;
let currentLevel = 1;
let answered = false;

const TOTAL_Q = 10;
const TIMER_SECONDS = 15;
const XP_PER_CORRECT = 10;
const XP_PER_LEVEL = 100;
const QUESTIONS_PER_LEVEL = 5;
const TIMER_CIRCUMFERENCE = 2 * Math.PI * 34; // r=34

const SUBJECTS = [
  { name: 'All Subjects', emoji: '🌟' },
  { name: 'Math',         emoji: '🔢' },
  { name: 'Science',      emoji: '🔬' },
  { name: 'Indian GK',    emoji: '🇮🇳' },
  { name: 'Animals and Birds', emoji: '🦁' },
  { name: 'Geography',    emoji: '🌍' },
  { name: 'Computer',     emoji: '💻' },
  { name: 'Economics',    emoji: '📈' },
  { name: 'Environmental Studies', emoji: '🌿' },
];

const ACHIEVEMENTS = [
  { id: 'first_win',   icon: '🥇', name: 'First Win',          desc: 'Complete your first quiz',        condition: s => s.totalGames >= 1 },
  { id: 'ten_correct', icon: '✅', name: '10 Correct',         desc: 'Get 10 correct answers total',    condition: s => s.totalCorrect >= 10 },
  { id: 'fifty',       icon: '🔥', name: '50 Correct',         desc: 'Get 50 correct answers total',    condition: s => s.totalCorrect >= 50 },
  { id: 'hundred',     icon: '💯', name: '100 Correct',        desc: 'Get 100 correct answers total',   condition: s => s.totalCorrect >= 100 },
  { id: 'level_master',icon: '🏆', name: 'Level Master',       desc: 'Unlock Level 5',                  condition: s => s.unlockedLevels >= 5 },
  { id: 'speed_demon', icon: '⚡', name: 'Speed Demon',        desc: 'Complete Timer Mode quiz',        condition: s => s.timerGames >= 1 },
  { id: 'daily_hero',  icon: '📅', name: 'Daily Hero',         desc: 'Complete a Daily Quiz',           condition: s => s.dailyGames >= 1 },
  { id: 'scholar',     icon: '🎓', name: 'Scholar',            desc: 'Reach Player Level 5',            condition: s => s.playerLevel >= 5 },
];

// ---- STORAGE ----
function load(key, def) {
  try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : def; }
  catch { return def; }
}
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function getStats() {
  return load('qm_stats', {
    xp: 0, playerLevel: 1, totalGames: 0, totalCorrect: 0,
    timerGames: 0, dailyGames: 0, unlockedLevels: 1
  });
}
function saveStats(s) { save('qm_stats', s); }
function getUnlocked() { return load('qm_achievements', []); }
function saveUnlocked(a) { save('qm_achievements', a); }
function getLeaderboard() { return load('qm_leaderboard', []); }
function saveLeaderboard(l) { save('qm_leaderboard', l); }
function getPlayerName() { return load('qm_name', null); }
function savePlayerName(n) { save('qm_name', n); }
function getDailyData() { return load('qm_daily', { date: '', done: false }); }
function saveDailyData(d) { save('qm_daily', d); }
function getLevelStars() { return load('qm_stars', {}); }
function saveLevelStar(lvl, stars) {
  const s = getLevelStars(); s[lvl] = Math.max(s[lvl] || 0, stars);
  save('qm_stars', s);
}

// ---- SCREEN MANAGEMENT ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) { target.classList.add('active'); target.scrollTop = 0; }
}
let lastMode = '';
function goBack() { showScreen('screen-home'); }

// ---- PARTICLES ----
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      const colors = ['#7c3aed','#06b6d4','#f59e0b','#a78bfa','#38bdf8'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < 90; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(124,58,237,${0.07 * (1 - dist/80)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

// ---- DASHBOARD ----
function updateDashboard() {
  const stats = getStats();
  const name = getPlayerName() || 'Player';
  document.getElementById('playerName').textContent = name;
  document.getElementById('playerLevel').textContent = stats.playerLevel;
  document.getElementById('playerXP').textContent = stats.xp;

  const xpInLevel = stats.xp % XP_PER_LEVEL;
  const pct = (xpInLevel / XP_PER_LEVEL) * 100;
  document.getElementById('xpBarFill').style.width = pct + '%';
  document.getElementById('xpLabel').textContent = `${xpInLevel} / ${XP_PER_LEVEL} XP`;
}

// ---- NAME SCREEN ----
function checkName() {
  const name = getPlayerName();
  if (!name) { showScreen('screen-name'); }
  else { updateDashboard(); showScreen('screen-home'); }
}

function saveName() {
  const val = document.getElementById('nameInput').value.trim();
  if (!val) return;
  savePlayerName(val);
  updateDashboard();
  showScreen('screen-home');
}

document.getElementById('playerName').addEventListener('click', () => {
  document.getElementById('nameInput').value = getPlayerName() || '';
  showScreen('screen-name');
});

// ---- MODE SELECT ----
function selectMode(mode) {
  currentMode = mode;
  lastMode = mode;

  if (mode === 'level') {
    buildLevelGrid();
    showScreen('screen-levels');
    return;
  }

  if (mode === 'daily') {
    const dd = getDailyData();
    const today = new Date().toDateString();
    if (dd.done && dd.date === today) {
      alert('You already completed today\'s Daily Quiz! Come back tomorrow. 📅');
      return;
    }
  }

  buildSubjectGrid();
  showScreen('screen-subject');
}

// ---- SUBJECT GRID ----
function buildSubjectGrid() {
  const grid = document.getElementById('subjectGrid');
  grid.innerHTML = '';
  SUBJECTS.forEach(sub => {
    const count = sub.name === 'All Subjects'
      ? allQuestions.length
      : allQuestions.filter(q => q.subject === sub.name).length;

    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
      <div class="subject-emoji">${sub.emoji}</div>
      <div class="subject-name">${sub.name}</div>
      <div class="subject-count">${count} questions</div>`;
    card.onclick = () => startQuiz(sub.name);
    grid.appendChild(card);
  });
}

// ---- LEVEL GRID ----
function buildLevelGrid() {
  const stats = getStats();
  const stars = getLevelStars();
  const totalLevels = Math.floor(allQuestions.length / QUESTIONS_PER_LEVEL);
  const maxLevels = Math.min(totalLevels, 20);
  const grid = document.getElementById('levelGrid');
  grid.innerHTML = '';

  for (let i = 1; i <= maxLevels; i++) {
    const isUnlocked = i <= stats.unlockedLevels;
    const starCount = stars[i] || 0;
    const card = document.createElement('div');
    card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    const starsHTML = isUnlocked
      ? Array.from({length:3}, (_,k) => k < starCount ? '⭐' : '☆').join('')
      : '';
    card.innerHTML = isUnlocked
      ? `<div class="level-num">${i}</div><div class="level-label">Level ${i}</div><div class="level-stars">${starsHTML}</div>`
      : `<div class="level-lock">🔒</div><div class="level-label">Level ${i}</div>`;
    if (isUnlocked) {
      card.onclick = () => startLevelQuiz(i);
    }
    grid.appendChild(card);
  }
}

// ---- START QUIZ ----
function startQuiz(subject) {
  currentSubject = subject;
  let pool = subject === 'All Subjects'
    ? [...allQuestions]
    : allQuestions.filter(q => q.subject === subject);

  if (currentMode === 'daily') {
    // Seeded random for today
    const seed = new Date().toDateString();
    pool = seededShuffle(pool, seed).slice(0, 10);
  } else {
    pool = shuffle(pool).slice(0, TOTAL_Q);
  }

  quizQuestions = pool;
  initQuiz();
}

function startLevelQuiz(level) {
  currentLevel = level;
  currentSubject = 'All Subjects';
  const start = (level - 1) * QUESTIONS_PER_LEVEL;
  const pool = shuffle([...allQuestions]).slice(start, start + QUESTIONS_PER_LEVEL);
  quizQuestions = pool.length >= QUESTIONS_PER_LEVEL ? pool : shuffle([...allQuestions]).slice(0, QUESTIONS_PER_LEVEL);
  initQuiz();
}

function initQuiz() {
  currentQIndex = 0;
  score = 0; correct = 0; wrong = 0;
  answered = false;

  document.getElementById('quizModeTag').textContent =
    currentMode === 'freeplay' ? 'FREE PLAY' :
    currentMode === 'timer'    ? 'TIMER MODE' :
    currentMode === 'level'    ? `LEVEL ${currentLevel}` :
    currentMode === 'daily'    ? 'DAILY QUIZ' : currentMode.toUpperCase();

  document.getElementById('quizSubjectTag').textContent = currentSubject;

  const tw = document.getElementById('timerWrap');
  tw.style.display = (currentMode === 'freeplay' || currentMode === 'level') ? 'none' : 'flex';

  // Add SVG gradient
  const svg = tw.querySelector('svg');
  if (!svg.querySelector('defs')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
    defs.innerHTML = `<linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>`;
    svg.insertBefore(defs, svg.firstChild);
  }

  showScreen('screen-quiz');
  loadQuestion();
}

// ---- LOAD QUESTION ----
function loadQuestion() {
  clearTimer();
  answered = false;
  document.getElementById('nextBtn').classList.add('hidden');

  if (currentQIndex >= quizQuestions.length) { endQuiz(); return; }

  const q = quizQuestions[currentQIndex];
  const total = quizQuestions.length;

  document.getElementById('qNumber').textContent = `Question ${currentQIndex + 1}`;
  document.getElementById('qSubject').textContent = q.subject;
  document.getElementById('qText').textContent = q.question;
  document.getElementById('quizScore').textContent = score;
  document.getElementById('quizProgressLabel').textContent = `${currentQIndex + 1} / ${total}`;
  document.getElementById('quizProgressFill').style.width = `${((currentQIndex) / total) * 100}%`;

  // Animate card
  const card = document.getElementById('questionCard');
  card.classList.remove('entering');
  void card.offsetWidth;
  card.classList.add('entering');

  // Build options
  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';
  const letters = ['A','B','C','D'];
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.setAttribute('data-letter', letters[i]);
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, opt, q.answer);
    grid.appendChild(btn);
  });

  // Timer
  if (currentMode === 'timer' || currentMode === 'daily') {
    startTimer();
  }
}

// ---- ANSWER ----
function selectAnswer(btn, selected, correct_ans) {
  if (answered) return;
  answered = true;
  clearTimer();

  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => { b.disabled = true; });

  if (selected === correct_ans) {
    btn.classList.add('correct');
    correct++;
    const timeBonus = currentMode === 'timer' ? Math.ceil(timerSeconds * 2) : 0;
    score += 100 + timeBonus;
  } else {
    btn.classList.add('wrong');
    wrong++;
    // Reveal correct
    allBtns.forEach(b => {
      if (b.textContent === correct_ans) b.classList.add('correct');
    });
  }

  document.getElementById('quizScore').textContent = score;
  document.getElementById('nextBtn').classList.remove('hidden');

  // Auto next in free play / level after 1.5s if answered correctly
  if (currentMode === 'freeplay' || currentMode === 'level') {
    // Manual next for these modes
  }
}

function nextQuestion() {
  currentQIndex++;
  loadQuestion();
}

// ---- TIMER ----
function startTimer() {
  timerSeconds = TIMER_SECONDS;
  updateTimerUI(timerSeconds);

  timerInterval = setInterval(() => {
    timerSeconds--;
    updateTimerUI(timerSeconds);
    if (timerSeconds <= 0) {
      clearTimer();
      autoTimeOut();
    }
  }, 1000);
}

function clearTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function updateTimerUI(secs) {
  const num = document.getElementById('timerNum');
  const arc = document.getElementById('timerArc');
  if (!num || !arc) return;

  num.textContent = secs;
  num.className = 'timer-num' + (secs <= 5 ? ' warning' : '');

  const progress = secs / TIMER_SECONDS;
  const offset = TIMER_CIRCUMFERENCE * (1 - progress);
  arc.style.strokeDashoffset = offset;
}

function autoTimeOut() {
  if (answered) return;
  answered = true;
  wrong++;
  const allBtns = document.querySelectorAll('.option-btn');
  allBtns.forEach(b => {
    b.disabled = true;
    const q = quizQuestions[currentQIndex];
    if (b.textContent === q.answer) b.classList.add('correct');
  });
  document.getElementById('nextBtn').classList.remove('hidden');
}

// ---- END QUIZ ----
function endQuiz() {
  clearTimer();
  const stats = getStats();

  // XP
  const xpEarned = correct * XP_PER_CORRECT + (currentMode === 'daily' ? 50 : 0);
  stats.xp += xpEarned;
  stats.playerLevel = Math.floor(stats.xp / XP_PER_LEVEL) + 1;
  stats.totalGames++;
  stats.totalCorrect += correct;
  if (currentMode === 'timer')  stats.timerGames++;
  if (currentMode === 'daily')  stats.dailyGames++;

  // Level unlock
  if (currentMode === 'level') {
    const pct = correct / quizQuestions.length;
    const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.4 ? 1 : 0;
    saveLevelStar(currentLevel, stars);
    if (pct >= 0.4 && currentLevel >= stats.unlockedLevels) {
      stats.unlockedLevels = currentLevel + 1;
    }
  }
  saveStats(stats);

  // Daily
  if (currentMode === 'daily') {
    saveDailyData({ date: new Date().toDateString(), done: true });
  }

  // Leaderboard
  const lb = getLeaderboard();
  lb.push({
    name: getPlayerName() || 'Player',
    score,
    correct,
    mode: currentMode,
    date: new Date().toLocaleDateString()
  });
  lb.sort((a,b) => b.score - a.score);
  saveLeaderboard(lb.slice(0,10));

  // Achievements check
  checkAchievements(stats);

  // Result Screen
  const total = quizQuestions.length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const icon = accuracy >= 80 ? '🎉' : accuracy >= 50 ? '😊' : '😅';
  const title = accuracy >= 80 ? 'Excellent!' : accuracy >= 50 ? 'Good Job!' : 'Keep Practising!';

  document.getElementById('resultIcon').textContent = icon;
  document.getElementById('resultTitle').textContent = title;
  document.getElementById('statCorrect').textContent = correct;
  document.getElementById('statWrong').textContent = wrong;
  document.getElementById('statScore').textContent = score;
  document.getElementById('statXP').textContent = `+${xpEarned}`;

  showScreen('screen-result');

  // Animate bars
  setTimeout(() => {
    document.getElementById('accuracyBar').style.width = accuracy + '%';
    document.getElementById('accuracyLabel').textContent = `${accuracy}% Accuracy`;
  }, 300);

  // Confetti if good
  if (accuracy >= 60) launchConfetti();

  updateDashboard();
}

function quitQuiz() {
  clearTimer();
  showScreen('screen-home');
}

function playAgain() {
  clearTimer();
  document.getElementById('confettiLayer').innerHTML = '';
  if (currentMode === 'level') {
    buildLevelGrid();
    showScreen('screen-levels');
  } else if (currentMode === 'freeplay' || currentMode === 'timer') {
    buildSubjectGrid();
    showScreen('screen-subject');
  } else {
    showScreen('screen-home');
  }
}

// ---- LEADERBOARD ----
function buildLeaderboard() {
  const lb = getLeaderboard();
  const list = document.getElementById('leaderboardList');
  list.innerHTML = '';

  if (!lb.length) {
    list.innerHTML = '<div class="lb-empty">No scores yet. Play a quiz!</div>';
    return;
  }

  lb.slice(0,10).forEach((entry, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
    const row = document.createElement('div');
    row.className = 'lb-row';
    row.innerHTML = `
      <div class="lb-rank ${rankClass}">${rankEmoji}</div>
      <div class="lb-name">${escapeHTML(entry.name)}</div>
      <div class="lb-score">${entry.score} pts</div>
      <div class="lb-date">${entry.date || ''}</div>`;
    list.appendChild(row);
  });
}

// ---- ACHIEVEMENTS ----
function buildAchievements() {
  const unlocked = getUnlocked();
  const stats = getStats();
  const grid = document.getElementById('achievementsGrid');
  grid.innerHTML = '';

  ACHIEVEMENTS.forEach(ach => {
    const isUnlocked = unlocked.includes(ach.id);
    const card = document.createElement('div');
    card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="achievement-icon">${ach.icon}</div>
      <div class="achievement-name">${ach.name}</div>
      <div class="achievement-desc">${ach.desc}</div>`;
    grid.appendChild(card);
  });
}

function checkAchievements(stats) {
  const unlocked = getUnlocked();
  const newBadges = [];

  ACHIEVEMENTS.forEach(ach => {
    if (!unlocked.includes(ach.id) && ach.condition(stats)) {
      unlocked.push(ach.id);
      newBadges.push(ach);
    }
  });

  saveUnlocked(unlocked);
  if (newBadges.length) showBadge(newBadges[0]);
}

function showBadge(ach) {
  document.getElementById('badgePopupIcon').textContent = ach.icon;
  document.getElementById('badgePopupName').textContent = ach.name;
  document.getElementById('badgePopup').classList.remove('hidden');
}

function closeBadgePopup() {
  document.getElementById('badgePopup').classList.add('hidden');
}

// ---- CONFETTI ----
function launchConfetti() {
  const layer = document.getElementById('confettiLayer');
  layer.innerHTML = '';
  const colors = ['#7c3aed','#06b6d4','#f59e0b','#10b981','#f43f5e','#a78bfa','#38bdf8'];

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (Math.random() * 8 + 6) + 'px';
    piece.style.height = (Math.random() * 10 + 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    const dur = (Math.random() * 2 + 2.5).toFixed(2);
    const delay = (Math.random() * 1).toFixed(2);
    piece.style.animation = `confettiFall ${dur}s ${delay}s linear forwards`;
    layer.appendChild(piece);
  }
  setTimeout(() => { layer.innerHTML = ''; }, 5000);
}

// ---- UTILITIES ----
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seededShuffle(arr, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    hash = ((hash >>> 1) ^ (-(hash & 1) & 0xEDB88320));
    const j = Math.abs(hash) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHTML(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ---- SCREEN HOOKS ----
const origShowScreen = showScreen;
window.showScreen = function(id) {
  origShowScreen(id);
  if (id === 'screen-leaderboard') buildLeaderboard();
  if (id === 'screen-achievements') buildAchievements();
};

// ---- LOAD QUESTIONS ----
fetch('data/questions.json')
  .then(r => r.json())
  .then(data => {
    allQuestions = data;
    checkName();
  })
  .catch(err => {
    console.error('Failed to load questions:', err);
    // Fallback: show home anyway
    checkName();
  });
