(function () {
  'use strict';

  const DATA = window.__QUIZ_DATA__;

  if (!DATA || typeof DATA !== 'object') {
    console.error('Quiz data not found or invalid:', typeof DATA);
    return;
  }

  const { questions, tiebreakers, profiles } = DATA;

  if (!questions || !questions.length) {
    console.error('No questions found in quiz data. Keys:', Object.keys(DATA));
    return;
  }

  const PROFILE_KEYS = Object.keys(profiles);
  const TOTAL_MAIN = questions.length; // 8

  const BASE = (window.__BASE_URL__ || '/').replace(/\/$/, '');

  // ── State ──
  let scores = {};
  let currentStep = 0;
  let questionQueue = [];
  let selectedIndex = null;

  // ── DOM refs ──
  const screens = {
    landing:  document.getElementById('screen-landing'),
    question: document.getElementById('screen-question'),
    result:   document.getElementById('screen-result'),
  };

  const els = {
    btnStart:      document.getElementById('btn-start'),
    btnAnswer:     document.getElementById('btn-answer'),
    btnRestart:    document.getElementById('btn-restart'),
    progressFill:  document.getElementById('progress-fill'),
    progressText:  document.getElementById('progress-text'),
    questionTitle: document.getElementById('question-title'),
    questionSubtitle: document.getElementById('question-subtitle'),
    questionOpts:  document.getElementById('question-options'),
    resultTitle:   document.getElementById('result-title'),
    resultImage:   document.getElementById('result-image-wrap'),
    resultTagline: document.getElementById('result-tagline'),
    resultBody:    document.getElementById('result-body'),
  };

  function showScreen(name) {
    Object.values(screens).forEach((s) => {
      s.classList.remove('screen--active', 'screen--fade-in');
    });
    const target = screens[name];
    target.classList.add('screen--active', 'screen--fade-in');
  }

  function resetQuiz() {
    scores = {};
    PROFILE_KEYS.forEach((k) => (scores[k] = 0));
    currentStep = 0;
    selectedIndex = null;
    questionQueue = [...questions];
  }

  function renderQuestion() {
    const q = questionQueue[currentStep];
    const total = questionQueue.length;
    const num = currentStep + 1;

    els.progressFill.style.width = `${(num / total) * 100}%`;
    els.progressText.textContent = `${num} / ${total}`;

    els.questionTitle.textContent = q.title;
    els.questionSubtitle.textContent = q.subtitle || '';
    els.questionSubtitle.style.display = q.subtitle ? '' : 'none';

    els.questionOpts.innerHTML = '';
    q.options.forEach((opt, i) => {
      const li = document.createElement('li');
      li.className = 'option';
      li.dataset.index = i;
      li.innerHTML = `
        <span class="option__dot"></span>
        <span class="option__text">${opt.text}</span>
      `;
      li.addEventListener('click', () => selectOption(i));
      els.questionOpts.appendChild(li);
    });

    selectedIndex = null;
    els.btnAnswer.disabled = true;
    els.btnAnswer.classList.add('btn--disabled');
  }

  function selectOption(index) {
    selectedIndex = index;
    // Visual
    els.questionOpts.querySelectorAll('.option').forEach((el, i) => {
      el.classList.toggle('option--selected', i === index);
    });
    els.btnAnswer.disabled = false;
    els.btnAnswer.classList.remove('btn--disabled');
  }

  // ── Submit answer ──
  function submitAnswer() {
    if (selectedIndex === null) return;

    const q = questionQueue[currentStep];
    const chosen = q.options[selectedIndex];

    window.scrollTo({ top: 0, behavior: 'instant' });

    if (chosen.points) {
      Object.entries(chosen.points).forEach(([profile, pts]) => {
        scores[profile] = (scores[profile] || 0) + pts;
      });
    }

    currentStep++;

    if (currentStep < questionQueue.length) {
      renderQuestion();
      screens.question.classList.remove('screen--fade-in');
      void screens.question.offsetWidth; 
      screens.question.classList.add('screen--fade-in');
    } else {
      const tiebreaker = findTiebreaker();
      if (tiebreaker) {
        questionQueue.push(tiebreaker);
        renderQuestion();
        screens.question.classList.remove('screen--fade-in');
        void screens.question.offsetWidth;
        screens.question.classList.add('screen--fade-in');
      } else {
        showResult();
      }
    }
  }

function findTiebreaker() {
  const sorted = PROFILE_KEYS
    .map((k) => ({ key: k, score: scores[k] }))
    .sort((a, b) => b.score - a.score);

  const topScore = sorted[0].score;
  const tied = sorted.filter((s) => s.score === topScore).map((s) => s.key);

  if (tied.length <= 1) return null;

  const usedIds = questionQueue.map((q) => q.id);

  for (const tb of tiebreakers) {
    if (usedIds.includes(tb.id)) continue;

    // Check if this tiebreaker applies to ANY of the tied profiles
    const anyMatch = tied.some(p => tb.profiles.includes(p));
    
    if (anyMatch) {
      // Filter options to only include tied profiles
      const filteredOptions = tb.options.filter(opt => {
        const pointsProfile = Object.keys(opt.points)[0];
        return tied.includes(pointsProfile);
      });

      // Return a new question object that matches the structure of regular questions
return {
  id: tb.id,
  title: tb.title,
  options: filteredOptions,
  subtitle: tb.subtitle || ''
  }; 
    }
  }

  return null;
}

  function getWinner() {
    let maxScore = -1;
    let winner = PROFILE_KEYS[0];
    PROFILE_KEYS.forEach((k) => {
      if (scores[k] > maxScore) {
        maxScore = scores[k];
        winner = k;
      }
    });
    return winner;
  }

  function showResult() {
    const winnerKey = getWinner();
    const profile = profiles[winnerKey];

    els.resultTitle.innerHTML = `TÚ ERT <span class="text-yellow">${profile.name.toUpperCase()}!</span>`;

    const imgSrc = profile.image;
    els.resultImage.innerHTML = '<img src="' + imgSrc + '" alt="' + profile.name + '" loading="lazy">';

    els.resultTagline.textContent = profile.tagline;

    els.resultBody.innerHTML = profile.paragraphs
      .map((p) => `<p>${p}</p>`)
      .join('');

    showScreen('result');
  }

  els.btnStart.addEventListener('click', () => {
    resetQuiz();
    renderQuestion();
    showScreen('question');
  });

  els.btnAnswer.addEventListener('click', submitAnswer);

  els.btnRestart.addEventListener('click', () => {
    resetQuiz();
    showScreen('landing');
  });

  document.addEventListener('keydown', (e) => {
    if (!screens.question.classList.contains('screen--active')) return;
    const opts = els.questionOpts.querySelectorAll('.option');
    if (e.key >= '1' && e.key <= String(opts.length)) {
      selectOption(parseInt(e.key) - 1);
    }
    if (e.key === 'Enter' && selectedIndex !== null) {
      submitAnswer();
    }
  });
})();
