
const AI_API_URL =
  "https://flashcards-ai-backend.onrender.com/api/generate-cards";

const defaultConfig = {
  app_title: "Flashcard Study",
  app_subtitle: "Create custom subjects and master your knowledge",
  background_color: "#f0f4f8",
  card_background: "#ffffff",
  primary_color: "#2563eb",
  text_color: "#1e293b",
  secondary_color: "#64748b"
};

const DEFAULT_SETTINGS = {
  theme: "light",
  colors: {
    primary: "#2563eb",
    background: "#f8fafc",
    card: "#ffffff",
    text: "#0f172a"
  },
  font: {
    family: "Open Sans",
    size: 16,
    lineHeight: 1.6
  },
  layout: {
    radius: 16,
    cardSize: "normal",
    animation: "flip"
  }
};

const THEME_PRESETS = {
  /* ===== EXISTING ===== */
  light: {
    colors: {
      primary: "#2563eb",
      background: "#f8fafc",
      card: "#ffffff",
      text: "#0f172a"
    },
    font: {
      family: "Google Sans"
    }
  },

  dark: {
    colors: {
      primary: "#60a5fa",
      background: "#020617",
      card: "#020617",
      text: "#e5e7eb"
    },
    font: {
      family: "Open Sans"
    }
  },

  cyber: {
    colors: {
      primary: "#22d3ee",
      background: "#020617",
      card: "#020617",
      text: "#67e8f9"
    },
    font: {
      family: "BBHBorgle"
    }
  },

  paper: {
    colors: {
      primary: "#92400e",
      background: "#fef3c7",
      card: "#fffbeb",
      text: "#451a03"
    },
    font: {
      family: "Playfair Display"
    }
  },

  /* ===== NEW THEMES ===== */

  midnight: {
    colors: {
      primary: "#818cf8",
      background: "#0b1020",
      card: "#121a33",
      text: "#e0e7ff"
    },
    font: {
      family: "Google Sans"
    }
  },

  forest: {
    colors: {
      primary: "#16a34a",
      background: "#052e16",
      card: "#064e3b",
      text: "#ecfdf5"
    },
    font: {
      family: "Open Sans"
    }
  },

  sunset: {
    colors: {
      primary: "#f97316",
      background: "#fff7ed",
      card: "#ffedd5",
      text: "#7c2d12"
    }
  },

  rose: {
    colors: {
      primary: "#e11d48",
      background: "#fff1f2",
      card: "#ffe4e6",
      text: "#4c0519"
    }
  },

  graphite: {
    colors: {
      primary: "#38bdf8",
      background: "#0f172a",
      card: "#111827",
      text: "#cbd5f5"
    },
    font: {
      family: "Roboto"
    }
  },

  lavender: {
    colors: {
      primary: "#8b5cf6",
      background: "#f5f3ff",
      card: "#ede9fe",
      text: "#312e81"
    }
  },

  coffee: {
    colors: {
      primary: "#78350f",
      background: "#faf3e0",
      card: "#f3e5ab",
      text: "#3f1d0b"
    },
    font: {
      family: "Playfair Display"
    }
  },

  mint: {
    colors: {
      primary: "#14b8a6",
      background: "#ecfeff",
      card: "#cffafe",
      text: "#134e4a"
    }
  }
};




let config = { ...defaultConfig };
let allData = [];
let currentView = 'subjects'; // subjects, sets, cards, study
let currentSubject = null;
let currentSet = null;
let currentCardIndex = 0;
let isFlipped = false;
let isLoading = false;
let quizIndex = 0;
let quizScore = 0;
let quizQuestions = [];
let deferredInstallPrompt = null;

function applyUserSettings() {
  const s = userSettings;
  const r = document.documentElement.style;

  r.setProperty("--primary", s.colors.primary);
  r.setProperty("--background", s.colors.background);
  r.setProperty("--card-bg", s.colors.card);
  r.setProperty("--text", s.colors.text);

  r.setProperty("--font-family", s.font.family);
  r.setProperty("--font-size", `${s.font.size}px`);
  r.setProperty("--line-height", s.font.lineHeight);

  r.setProperty("--radius", `${s.layout.radius}px`);

  document.documentElement.dataset.cardSize = s.layout.cardSize;
  document.documentElement.dataset.anim = s.layout.animation;

  localStorage.setItem("userSettings", JSON.stringify(s));
}

let userSettings = loadSettings();
applyUserSettings();


function saveAndApplySettings() {
  localStorage.setItem("userSettings", JSON.stringify(userSettings));
  applyUserSettings();
}

function loadSettings() {
  try {
    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(localStorage.getItem("userSettings"))
    };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}


function renderCustomizationPanel() {
  return `
    <div class="settings-header">
      <h2>🎨 Customize Interface</h2>
      <button id="closeSettingsBtn">✕</button>
    </div>

    <!-- THEME PRESETS -->
    <div class="theme-grid">
      ${Object.keys(THEME_PRESETS).map(key => `
        <button
          class="theme-tile ${userSettings.theme === key ? "active" : ""}"
          onclick="applyThemePreset('${key}')"
        >
          ${key}
        </button>
      `).join("")}
    </div>

    <!-- PRIMARY COLOR -->
    <div class="settings-group">
      <label>
        <span>Primary Color</span>
        <input
          type="color"
          value="${userSettings.colors.primary}"
          onchange="updateSetting('colors.primary', this.value)"
        />
      </label>
    </div>

    <!-- FONT FAMILY -->
    <div class="settings-group">
      <label>
        <span>Font</span>
        <select onchange="updateSetting('font.family', this.value)">
          ${[
      "BBHBartle", "BBHBorgle", "BBHHegarty",
      "Open Sans", "Open Sans Italic",
      "Google Sans", "Google Sans Italic",
      "Playfair Display", "Playfair Display Italic",
      "Roboto", "Roboto Italic"
    ].map(f => `
            <option ${userSettings.font.family === f ? "selected" : ""}>
              ${f}
            </option>
          `).join("")}
        </select>
      </label>
    </div>

    <!-- FONT SIZE -->
    <div class="settings-group">
      <label>
        <span>Font Size</span>
        <input
          type="range"
          min="12"
          max="22"
          value="${userSettings.font.size}"
          onchange="updateSetting('font.size', this.value)"
        />
      </label>
    </div>

    <!-- CORNER RADIUS -->
    <div class="settings-group">
      <label>
        <span>Corner Radius</span>
        <input
          type="range"
          min="8"
          max="28"
          value="${userSettings.layout.radius}"
          onchange="updateSetting('layout.radius', this.value)"
        />
      </label>
    </div>
    <div class="settings-group">
<button onclick="resetSettings()" class="reset-btn">
  Reset to Default
</button>
    </div>
  `;
}

function resetSettings() {
  userSettings = structuredClone(DEFAULT_SETTINGS);
  saveAndApplySettings();
}



document.addEventListener("click", e => {
  if (document.querySelector(".settings-overlay")) return;

  const btn = e.target.closest("#openSettingsBtn");
  if (!btn) return;

  const overlay = document.createElement("div");
  overlay.className = "settings-overlay";

  overlay.innerHTML = `
    <div class="settings-modal">
      ${renderCustomizationPanel()}
    </div>
  `;

  document.body.appendChild(overlay);

  // ✅ Trigger animation AFTER mount
  requestAnimationFrame(() => {
    overlay.classList.add("open");
  });

  overlay.addEventListener("click", ev => {
    if (ev.target === overlay) overlay.remove();
  });

  overlay.querySelector("#closeSettingsBtn")?.addEventListener("click", () => {
    overlay.remove();
  });
});





function updateSetting(path, value) {
  const keys = path.split(".");
  let obj = userSettings;

  while (keys.length > 1) {
    obj = obj[keys.shift()];
  }

  obj[keys[0]] = isNaN(value) ? value : Number(value);

  saveAndApplySettings();
}

function applyThemePreset(themeKey) {
  const preset = THEME_PRESETS[themeKey];
  if (!preset) return;

  userSettings = deepMerge(userSettings, {
    theme: themeKey,
    ...preset
  });

  saveAndApplySettings();
}

function deepMerge(target, source) {
  const output = structuredClone(target);

  for (const key in source) {
    if (typeof source[key] === "object" && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

const emojiOptions = ['📚', '🧪', '🎨', '💻', '🌍', '📐', '🎵', '⚽', '🔬', '📖', '🎭', '🏛️', '💼', '🍎', '🚀', '🎯', '💡', '🔧', '🌟', '🎪'];

const dataHandler = {
  onDataChanged(data) {
    allData = data;
    renderApp();
  }
};

function getSubjects() {
  const subjectMap = new Map();
  allData.filter(item => item.type === 'subject').forEach(subject => {
    subjectMap.set(subject.subject_id, subject);
  });
  return Array.from(subjectMap.values());
}

function getSetsForSubject(subjectId) {
  const setMap = new Map();
  allData.filter(item => item.type === 'set' && item.subject_id === subjectId).forEach(set => {
    setMap.set(set.set_id, set);
  });
  return Array.from(setMap.values());
}

function getCardsForSet(setId) {
  return allData.filter(item => item.type === 'card' && item.set_id === setId);
}

function renderApp() {
  const app = document.getElementById('app');

  let content = '';
  if (currentView === 'subjects') {
    content = renderSubjectsView();
  } else if (currentView === 'sets') {
    content = renderSetsView();
  } else if (currentView === 'cards') {
    content = renderCardsView();
  } else if (currentView === 'study') {
    content = renderStudyView();
  }
  else if (currentView === 'quiz') {
    content = renderQuizView();
  }
  else if (currentView === 'quiz-result') {
    content = renderQuizResultView();
  }
  else if (currentView === 'customize') {
    content = renderCustomizationPanel();
  }


  app.innerHTML = content;
  attachEventListeners();
}

function renderSubjectsView() {
  const subjects = getSubjects();

  const subjectsHTML = subjects.map(subject => {
    const sets = getSetsForSubject(subject.subject_id);

    return `
      <div
        class="category-card"
        data-subject-id="${subject.subject_id}"
      >
        <button
          class="delete-subject-btn"
          data-subject-id="${subject.subject_id}"
          aria-label="Delete subject"
        >
          ×
        </button>

        <div class="category-header">
          <div class="category-icon">
            <span class="category-icon-text">
              ${subject.subject_icon}
            </span>
          </div>

          <div class="category-meta">
            <h2 class="category-title">
              ${subject.subject_name}
            </h2>
            <p class="category-subtitle">
              ${sets.length} set${sets.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="subjects-view">
      <div class="subjects-wrapper">
        <div class="subjects-container fade-in">

          <div class="subjects-hero">
            <h1 class="subjects-title">
              ${config.app_title || defaultConfig.app_title}
            </h1>
            <p class="subjects-subtitle">
              ${config.app_subtitle || defaultConfig.app_subtitle}
            </p>
          </div>

          <div class="subjects-actions">
            <button
              id="addSubjectBtn"
              class="add-subject-btn"
            >
              + Add New Subject
            </button>
          </div>

          ${subjects.length === 0
      ? `
                <div class="subjects-empty">
                  <p>No subjects yet. Create your first subject to get started!</p>
                </div>
              `
      : `
                <div class="subjects-grid">
                  ${subjectsHTML}
                </div>
              `
    }

        </div>
      </div>
    </div>
  `;
}

function renderSetsView() {
  if (!currentSubject || !currentSubject.subject_id) {
    currentView = 'subjects';
    renderApp();
    return '';
  }

  const sets = getSetsForSubject(currentSubject.subject_id);
  const subtitleColor = config.secondary_color || defaultConfig.secondary_color;


  const setsHTML = sets.map(set => {
    const cards = getCardsForSet(set.set_id);
    return `
          <div class="category-card p-6 rounded-2xl" data-set-id="${set.set_id}" style="background: var(--card-bg); box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative;">
            <button class="delete-set-btn" data-set-id="${set.set_id}" style="position: absolute; top: 0.75rem; right: 0.75rem; color: ${subtitleColor}; font-size: calc(var(--font-size) * 1.2);
 background: none; border: none; cursor: pointer; padding: 0.25rem; line-height: 1;">×</button>
            <h3 style="font-size: calc(var(--font-size) * 1.3);
 font-weight: 400; color: var(--text); margin-bottom: 0.5rem;">${set.set_name}</h3>
            <p style="font-size: calc(var(--font-size) * 0.875);
 color: ${subtitleColor};">${cards.length} card${cards.length !== 1 ? 's' : ''}</p>
            ${cards.length > 0 ? `
              <button class="study-set-btn mt-4 px-4 py-2 rounded-lg" data-set-id="${set.set_id}" style="background: var(--primary); color: white; font-size: calc(var(--font-size) * 0.875);
">
                Study Now
              </button>
            ` : ''}
          </div>
        `;
  }).join('');

  return `
        <div class="w-full h-full overflow-auto">
          <div class="min-h-full flex flex-col p-6">
            <div class="max-w-4xl w-full mx-auto">
              <div class="flex items-center justify-between mb-8 slide-in">
                <button id="backToSubjectsBtn" class="px-4 py-2 rounded-lg transition-all" style="background: var(--card-bg); color: var(--text); font-size: var(--font-size); box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  ← Back
                </button>
                <div class="text-center">
                  <div style="font-size:calc(var(--font-size) * 2);
 margin-bottom: 0.25rem;">${currentSubject.subject_icon}</div>
                  <h2 style="font-size:calc(var(--font-size) * 1.8);
 font-weight: 400; color: var(--text);">${currentSubject.subject_name}</h2>
                </div>
                <div style="width: 50px;"></div>
              </div>

              <div class="mb-6">
                <button id="addSetBtn" class="w-full py-4 rounded-xl transition-all font-semibold" style="background: var(--primary); color: white; font-size: calc(var(--font-size) * 1.1);
 box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                  + Add New Set
                </button>
              </div>

              ${sets.length === 0 ? `
                <div class="text-center py-12" style="color: ${subtitleColor};">
                  <p style="font-size: calc(var(--font-size) * 1.2);
">No sets yet. Create your first set!</p>
                </div>
              ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  ${setsHTML}
                </div>
              `}
            </div>
          </div>
        </div>
      `;
}
function renderCardsView() {
  if (!currentSet || !currentSet.set_id) {
    currentView = "sets";
    renderApp();
    return "";
  }

  const cards = getCardsForSet(currentSet.set_id);

  const cardsHTML = cards.map(card => `
    <div class="card-item">
      <button
        class="card-delete-btn"
        data-id="${card.id}"
        aria-label="Delete card"
      >
        <img src="icons/delete.svg" class="icon sm" />
      </button>

      <div class="card-section">
        <p class="card-label">Question</p>
        <p class="card-text card-question">${card.question}</p>
      </div>

      <div class="card-section">
        <p class="card-label">Answer</p>
        <p class="card-text card-answer">${card.answer}</p>
      </div>
    </div>
  `).join("");

  return `
    <div class="view-container">
      <div class="view-content">
        <div class="view-inner">

          <!-- HEADER -->
          <div class="cards-header slide-in">
            <button id="backToSetsBtn" class="btn-back">
              <img src="icons/back.svg" class="icon sm" />
            </button>

            <div class="cards-title">
              <h2>${currentSet.set_name}</h2>
              <p>${cards.length} card${cards.length !== 1 ? "s" : ""}</p>
            </div>

            <div class="header-spacer"></div>
          </div>

          <!-- ACTIONS -->
          <div class="cards-actions">
            <button id="addCardBtn" class="action-btn">
              <img src="icons/add.svg" class="icon md" />
              <span class="action-label">Add</span>
            </button>

            <button id="aiGenerateBtn" class="action-btn">
              <img src="icons/ai.svg" class="icon md" />
              <span class="action-label">AI</span>
            </button>

            <button id="importCardsJsonBtn" class="action-btn">
              <img src="icons/import.svg" class="icon md" />
              <span class="action-label">Import</span>
            </button>

            ${cards.length > 0 ? `
              <button id="studyCardsBtn" class="action-btn">
                <img src="icons/flashcard.svg" class="icon md" />
                <span class="action-label">Study</span>
              </button>
            ` : ""}

            ${cards.length > 1 ? `
              <button id="quizCardsBtn" class="action-btn">
                <img src="icons/quiz.svg" class="icon md" />
                <span class="action-label">Quiz</span>
              </button>
            ` : ""}
          </div>

          <!-- EMPTY STATE / LIST -->
          ${cards.length === 0 ? `
            <div class="cards-empty">
              <p>No cards yet. Add your first flashcard!</p>
            </div>
          ` : `
            <div class="cards-list">
              ${cardsHTML}
            </div>
          `}

        </div>
      </div>
    </div>
  `;
}



function renderStudyView() {
  const cards = getCardsForSet(currentSet.set_id);
  if (cards.length === 0) {
    currentView = 'cards';
    renderApp();
    return;
  }

  const card = cards[currentCardIndex];
  const subtitleColor = config.secondary_color || defaultConfig.secondary_color;
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return `
        <div class="w-full h-full overflow-auto">
          <div class="min-h-full flex flex-col p-6">
            <div class="max-w-3xl w-full mx-auto flex flex-col" style="height: 100%;">
              <div class="flex items-center justify-between mb-6 slide-in">
                <button id="backToCardsBtn" class="px-4 py-2 rounded-lg transition-all" style="background: var(--card-bg); color: var(--text); font-size: var(--font-size);
 box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                  ← Back
                </button>
                <div class="text-center">
                  <h2 style="font-size: calc(var(--font-size) * 1.5);
 font-weight: 400; color: var(--text);">${currentSet.set_name}</h2>
                  <p style="font-size: calc(var(--font-size) * 0.875);
 color: ${subtitleColor};">Card ${currentCardIndex + 1} of ${cards.length}</p>
                </div>
                <div style="width: 50px;"></div>
              </div>
              
              <div class="w-full rounded-full mb-6" style="background: rgba(0,0,0,0.1); height: 5px;">
                <div class="progress-bar h-full rounded-full" style="width: ${progress}%; background: var(--primary);"></div>
              </div>
              
              <div class="flex-1 flex items-center justify-center mb-6">
                <div class="card-3d w-full" style="max-width: 600px; height: 400px;">
                  <div id="cardInner" class="card-inner">
                    <div class="card-front" style="background: var(--card-bg); box-shadow: 0 8px 24px rgba(0,0,0,0.12);">
                      <div class="text-center">
                        <p style="font-size: calc(var(--font-size) * 1);

 color: var(--primary); font-weight: 400; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">Question</p>
                        <p style="font-size: calc(var(--font-size) * 1.75);

 color: var(--text); font-weight: 400; line-height: 1.6;">${card.question}</p>
                      </div>
                    </div>
                    <div class="card-back" style="background: var(--primary);">
                      <div class="text-center">
                        <p style="font-size: calc(var(--font-size) * 1);

 color: rgba(255,255,255,0.9); font-weight: 400; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 1rem;">Answer</p>
                        <p style="font-size: calc(var(--font-size) * 1.75);

 color: white; font-weight: 400; line-height: 1.6;">${card.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col gap-4">
                <button id="flipBtn" class="w-full py-4 rounded-xl transition-all font-semibold" style="background: var(--primary); color: white; font-size: calc(var(--font-size) * 1.1);
 box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                  Flip Card
                </button>
                
                <div class="flex gap-4">
                  <button id="prevBtn" class="flex-1 py-3 rounded-xl transition-all" style="background: var(--card-bg); color: var(--text); font-size: var(--font-size);
 box-shadow: 0 2px 8px rgba(0,0,0,0.08); opacity: ${currentCardIndex === 0 ? '0.5' : '1'}; cursor: ${currentCardIndex === 0 ? 'not-allowed' : 'pointer'};" ${currentCardIndex === 0 ? 'disabled' : ''}>
                    ← Previous
                  </button>
                  <button id="nextBtn" class="flex-1 py-3 rounded-xl transition-all" style="background: var(--card-bg); color: var(--text); font-size: var(--font-size);
 box-shadow: 0 2px 8px rgba(0,0,0,0.08); opacity: ${currentCardIndex === cards.length - 1 ? '0.5' : '1'}; cursor: ${currentCardIndex === cards.length - 1 ? 'not-allowed' : 'pointer'};" ${currentCardIndex === cards.length - 1 ? 'disabled' : ''}>
                    Next →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
}

function generateQuizQuestions(cards) {
  return cards.map(card => {
    const wrongAnswers = cards
      .filter(c => c.answer !== card.answer)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(c => c.answer);

    const options = [...wrongAnswers, card.answer]
      .sort(() => 0.5 - Math.random());

    return {
      question: card.question,
      correct: card.answer,
      options
    };
  });
}

function renderQuizView() {
  const q = quizQuestions[quizIndex];
  const progress = ((quizIndex + 1) / quizQuestions.length) * 100;

  const primary = config.primary_color;
  const bg = config.card_background;
  const text = config.text_color;
  const sub = config.secondary_color;

  return `
    <div class="w-full h-full overflow-auto">
      <div class="min-h-full flex flex-col p-6">
        <div class="max-w-3xl w-full mx-auto fade-in">

          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <button id="exitQuizBtn"
              class="px-4 py-2 rounded-lg"
              style="background:${bg};color:${text};box-shadow:0 2px 8px rgba(0,0,0,.08);">
              ← Exit
            </button>

            <div style="text-align:right;">
              <p style="font-size:var(--font-size);
color:${sub};">
                Question ${quizIndex + 1} / ${quizQuestions.length}
              </p>
              <p style="font-size:var(--font-size);
 color:${primary}; font-weight:600;">
              ⭐ Score: ${quizScore}
              </p>
            </div>
          </div>

          <!-- Progress -->
          <div class="w-full h-2 rounded-full mb-6"
               style="background:rgba(0,0,0,.1);">
            <div class="h-full rounded-full"
                 style="width:${progress}%;background:${primary};transition:width .3s;">
            </div>
          </div>

          <!-- Question -->
          <div class="p-6 rounded-2xl mb-8"
               style="background:${bg};box-shadow:0 8px 24px rgba(0,0,0,.12);">
            <h2 style="font-size:calc(var(--font-size) * 1.5);
color:${text};line-height:1.6;">
              ${q.question}
            </h2>
          </div>

          <!-- Options -->
          <div class="grid gap-4">
            ${q.options.map(opt => `
              <button class="quiz-option"
                data-answer="${opt}"
                style="
                  padding:16px;
                  border-radius: var(--radius);
                  background:${bg};
                  color:${text};
                  font-size:var(--font-size);

                  text-align:left;
                  box-shadow:0 4px 12px rgba(0,0,0,.08);
                  transition:all .2s;
                ">
                ${opt}
              </button>
            `).join('')}
          </div>

        </div>
      </div>
    </div>
  `;
}

function renderQuizResultView() {
  const primary = config.primary_color;
  const bg = config.card_background;
  const text = config.text_color;

  return `
    <div class="w-full h-full flex items-center justify-center p-6 fade-in">
      <div class="max-w-md w-full p-8 rounded-2xl text-center"
           style="background:${bg};box-shadow:0 10px 30px rgba(0,0,0,.15);">

        <h2 style="font-size:calc(var(--font-size) * 2);

color:${text};margin-bottom:12px;">
          Quiz Complete 🎉
        </h2>

        <p style="font-size:calc(var(--font-size) * 1.2);
color:${text};margin-bottom:24px;">
          Your score
        </p>
        
        <div class="quiz-result-score"
        style="
        font-size:calc(var(--font-size) * 3);
        font-weight:700;
        color:${primary};
        margin-bottom:32px;
        ">
        ${quizScore} / ${quizQuestions.length}
        </div>

        <button id="exitQuizBtn"
          class="w-full py-4 rounded-xl font-semibold"
          style="background:${primary};color:white;">
          Back to Cards
        </button>
      </div>
    </div>
  `;
}

function showAddSubjectModal() {
  const subtitleColor = config.secondary_color || defaultConfig.secondary_color;
  const primaryColor = config.primary_color || defaultConfig.primary_color;

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
        <div class="modal-content" style="background: var(--card-bg); padding: 2rem;">
          <h2 style="font-size:calc(var(--font-size) * 1.8);
 font-weight: 400; color: var(--text); margin-bottom: 1.5rem;">Add New Subject</h2>
          
          <form id="addSubjectForm">
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: calc(var(--font-size) * 0.875);
 font-weight: 400; color: var(--text); margin-bottom: 0.5rem;">Subject Name</label>
              <input type="text" id="subjectNameInput" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: var(--radius); font-size: var(--font-size);
 color: var(--text);" placeholder="e.g., Biology, History...">
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: calc(var(--font-size) * 0.875);
 font-weight: 400; color: var(--text); margin-bottom: 0.5rem;">Choose Icon</label>
              <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem;">
                ${emojiOptions.map((emoji, idx) => `
                  <button type="button" class="emoji-btn" data-emoji="${emoji}" style="padding: 0.75rem; border: 2px solid ${idx === 0 ? primaryColor : '#e2e8f0'}; border-radius: var(--radius); font-size: calc(var(--font-size) * 1.5);
 cursor: pointer; background: var(--card-bg); transition: all 0.2s;">
                    ${emoji}
                  </button>
                `).join('')}
              </div>
              <input type="hidden" id="selectedEmoji" value="${emojiOptions[0]}">
            </div>

            <div style="display: flex; gap: 1rem;">
              <button type="button" id="cancelSubjectBtn" style="flex: 1; padding: 0.75rem; border-radius: var(--radius); font-size: var(--font-size);
 background: #e2e8f0; color: var(--text); border: none; cursor: pointer;">
                Cancel
              </button>
              <button type="submit" id="submitSubjectBtn" style="flex: 1; padding: 0.75rem; border-radius: var(--radius); font-size: var(--font-size);
 background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 400;">
                <span id="submitSubjectText">Add Subject</span>
              </button>
            </div>
          </form>
        </div>
      `;

  document.body.appendChild(modal);

  const emojiButtons = modal.querySelectorAll('.emoji-btn');
  const selectedEmojiInput = modal.querySelector('#selectedEmoji');

  emojiButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiButtons.forEach(b => b.style.borderColor = '#e2e8f0');
      btn.style.borderColor = primaryColor;
      selectedEmojiInput.value = btn.dataset.emoji;
    });
  });

  modal.querySelector('#cancelSubjectBtn').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modal.querySelector('#addSubjectForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (allData.filter(d => d.type === 'subject').length >= 999) {
      showToast('Maximum limit of 999 subjects reached');
      return;
    }

    const submitBtn = modal.querySelector('#submitSubjectBtn');
    const submitText = modal.querySelector('#submitSubjectText');
    submitBtn.disabled = true;
    submitText.innerHTML = '<span class="spinner"></span>';

    const subjectName = modal.querySelector('#subjectNameInput').value;
    const subjectIcon = selectedEmojiInput.value;
    const subjectId = 'subj_' + Date.now();

    const result = await window.dataSdk.create({
      type: 'subject',
      subject_id: subjectId,
      subject_name: subjectName,
      subject_icon: subjectIcon,
      set_id: '',
      set_name: '',
      question: '',
      answer: '',
      created_at: new Date().toISOString()
    });

    if (result.isOk) {
      modal.remove();
      renderApp();
    }
    else {
      submitBtn.disabled = false;
      submitText.textContent = 'Add Subject';
      showToast('Failed to add subject. Please try again.');
    }
  });
}

function importCardsFromJsonForCurrentSet() {
  if (!currentSet?.set_id) {
    showToast('No set selected');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (!Array.isArray(json.cards)) {
        throw new Error('Invalid format');
      }

      for (const card of json.cards) {
        if (!card.question || !card.answer) continue;

        await window.dataSdk.create({
          type: 'card',
          subject_id: '',
          subject_name: '',
          subject_icon: '',
          set_id: currentSet.set_id,
          set_name: '',
          question: card.question,
          answer: card.answer,
          created_at: new Date().toISOString()
        });
      }

      showToast(`Imported ${json.cards.length} cards`);
    } catch (err) {
      console.error(err);
      showToast('Invalid JSON file');
    }
  });

  input.click();
}

function showAddSetModal() {


  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
        <div class="modal-content" style="background: var(--card-bg); padding: 2rem;">
          <h2 style="font-size:calc(var(--font-size) * 1.8);
 font-weight: 400; color: var(--text); margin-bottom: 1.5rem;">Add New Set</h2>
          
          <form id="addSetForm">
            <div style="margin-bottom: 1.5rem;">
              <label for="setNameInput" style="display: block; font-size: calc(var(--font-size) * 0.875);
 font-weight: 400; color: var(--text); margin-bottom: 0.5rem;">Set Name</label>
              <input type="text" id="setNameInput" required style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: var(--radius); font-size: var(--font-size);
 color: var(--text);" placeholder="e.g., Chapter 1, Vocabulary...">
            </div>

            <div style="display: flex; gap: 1rem;">
              <button type="button" id="cancelSetBtn" style="flex: 1; padding: 0.75rem; border-radius: var(--radius); font-size: var(--font-size);
 background: #e2e8f0; color: var(--text); border: none; cursor: pointer;">
                Cancel
              </button>
              <button type="submit" id="submitSetBtn" style="flex: 1; padding: 0.75rem; border-radius: var(--radius); font-size: var(--font-size);
 background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 400;">
                <span id="submitSetText">Add Set</span>
              </button>
            </div>
          </form>
        </div>
      `;

  document.body.appendChild(modal);

  modal.querySelector('#cancelSetBtn').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modal.querySelector('#addSetForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (allData.filter(d => d.type === 'set').length >= 999) {
      showToast('Maximum limit of 999 sets reached');
      return;
    }

    const submitBtn = modal.querySelector('#submitSetBtn');
    const submitText = modal.querySelector('#submitSetText');
    submitBtn.disabled = true;
    submitText.innerHTML = '<span class="spinner"></span>';

    const setName = modal.querySelector('#setNameInput').value;
    const setId = 'set_' + Date.now();

    const result = await window.dataSdk.create({
      type: 'set',
      subject_id: currentSubject.subject_id,
      subject_name: '',
      subject_icon: '',
      set_id: setId,
      set_name: setName,
      question: '',
      answer: '',
      created_at: new Date().toISOString()
    });

    if (result.isOk) {
      modal.remove();
    } else {
      submitBtn.disabled = false;
      submitText.textContent = 'Add Set';
      showToast('Failed to add set. Please try again.');
    }
  });
}

function showAddCardModal() {

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
        <div class="modal-content" style="background: var(--card-bg); padding: 2rem;">
          <h2 style="font-size:calc(var(--font-size) * 1.8);
 font-weight: 400; color: var(--text); margin-bottom: 1.5rem;">Add New Card</h2>
          
          <form id="addCardForm">
            <div style="margin-bottom: 1.5rem;">
              <label for="questionInput" style="display: block; font-size: calc(var(--font-size) * 0.875);
 font-weight: 400; color: var(--text); margin-bottom: 0.5rem;">Question</label>
              <textarea id="questionInput" required rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: var(--radius); font-size: var(--font-size);
 color: var(--text); resize: vertical;" placeholder="Enter the question..."></textarea>
            </div>

            <div style="margin-bottom: 1.5rem;">
              <label for="answerInput" style="display: block; font-size: calc(var(--font-size) * 0.875);
 font-weight: 400; color: var(--text); margin-bottom: 0.5rem;">Answer</label>
              <textarea id="answerInput" required rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid #e2e8f0; border-radius: var(--radius); font-size: var(--font-size);
 color: var(--text); resize: vertical;" placeholder="Enter the answer..."></textarea>
            </div>

            <div style="display: flex; gap: 1rem;">
              <button type="button" id="cancelCardBtn" style="flex: 1; padding: 0.75rem; border-radius: var(--radius); font-size: var(--font-size);
 background: #e2e8f0; color: var(--text); border: none; cursor: pointer;">
                Cancel
              </button>
              <button type="submit" id="submitCardBtn" style="flex: 1; padding: 0.75rem; border-radius: var(--radius); font-size: var(--font-size);
 background: var(--primary); color: white; border: none; cursor: pointer; font-weight: 400;">
                <span id="submitCardText">Add Card</span>
              </button>
            </div>
          </form>
        </div>
      `;

  document.body.appendChild(modal);

  modal.querySelector('#cancelCardBtn').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  modal.querySelector('#addCardForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (allData.filter(d => d.type === 'card').length >= 999) {
      showToast('Maximum limit of 999 cards reached');
      return;
    }

    const submitBtn = modal.querySelector('#submitCardBtn');
    const submitText = modal.querySelector('#submitCardText');
    submitBtn.disabled = true;
    submitText.innerHTML = '<span class="spinner"></span>';

    const question = modal.querySelector('#questionInput').value;
    const answer = modal.querySelector('#answerInput').value;

    const result = await window.dataSdk.create({
      type: 'card',
      subject_id: currentSubject.subject_id,
      subject_name: currentSubject.subject_name,
      subject_icon: currentSubject.subject_icon,
      set_id: currentSet.set_id,
      set_name: currentSet.set_name,
      question: question,
      answer: answer,
      created_at: new Date().toISOString()
    });


    if (result.isOk) {
      modal.remove();
    } else {
      submitBtn.disabled = false;
      submitText.textContent = 'Add Card';
      showToast('Failed to add card. Please try again.');
    }
  });
}

async function generateCardsWithAI(topic, count) {
  if (!navigator.onLine) {
    showToast("AI generation requires internet");
    return;
  }

  if (!currentSet?.set_id) {
    showToast("No set selected");
    return false;
  }

  showAILoading();

  try {
    const res = await fetch(AI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count })
    });

    if (!res.ok) {
      throw new Error(`API request failed with status ${res.status}`);
    }

    const json = await res.json();

    if (!Array.isArray(json.cards)) {
      throw new Error("Invalid AI response");
    }

    // Create all cards sequentially
    for (const card of json.cards) {
      const result = await window.dataSdk.create({
        type: "card",
        subject_id: currentSubject?.subject_id || "",
        subject_name: currentSubject?.subject_name || "",
        subject_icon: currentSubject?.subject_icon || "",
        set_id: currentSet.set_id,
        set_name: currentSet.set_name || "",
        question: card.question,
        answer: card.answer,
        created_at: new Date().toISOString()
      });

      if (result.isError) {
        throw new Error("Failed to create card");
      }
    }

    // UI update happens in onDataChanged when data changes are detected
    hideAILoading();
    showToast(`Successfully generated ${json.cards.length} cards`);
    return true;

  } catch (error) {
    hideAILoading();
    showToast("Failed to generate cards. Please try again.");
    console.error("AI generation error:", error);
    return false;
  }
}

function showAIGenerateModal() {
  if (document.querySelector(".modal-overlay")) return;

  const modal = document.createElement("div");
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal">
      <h2>Generate Cards with AI</h2>

      <label>
        Topic
        <input id="aiTopicInput" type="text" placeholder="e.g. Photosynthesis" />
      </label>

      <label>
        Number of cards
        <input id="aiCountInput" type="number" min="1" max="50" value="10" />
      </label>

      <div class="modal-actions">
        <button class="btn btn-secondary" id="cancelAIModal">Cancel</button>
        <button class="btn btn-primary" id="confirmAIModal">
          Generate
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector("#aiTopicInput").focus();

  modal.querySelector("#cancelAIModal").onclick = () => modal.remove();

  modal.addEventListener("click", e => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector("#confirmAIModal").onclick = async () => {
    const btn = modal.querySelector("#confirmAIModal");
    btn.disabled = true;
    btn.textContent = "Generating...";

    const topic = modal.querySelector("#aiTopicInput").value.trim();
    const count = Math.min(
      50,
      Math.max(1, parseInt(modal.querySelector("#aiCountInput").value, 10))
    );

    if (!topic) {
      showToast("Please enter a topic");
      btn.disabled = false;
      btn.textContent = "Generate";
      return;
    }

    modal.remove();
    await generateCardsWithAI(topic, count);
  };
}




async function loadAllData() {
  allData = window.dataSdk.getAll();
}

let aiLoadingEl = null;

function showAILoading() {
  document.getElementById("aiLoading")?.classList.add("show");
}

function hideAILoading() {
  document.getElementById("aiLoading")?.classList.remove("show");
}




function showToast(message) {

  // Try to reuse existing toast
  let toast = document.getElementById('toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;

  toast.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: #1e293b;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: var(--radius);
    font-size: var(--font-size);

    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 2000;
    opacity: 0;
  `;

  // Show animation
  toast.classList.remove('show');
  void toast.offsetWidth; // force reflow
  toast.classList.add('show');

  // Auto-hide
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function attachEventListeners() {
  const addSubjectBtn = document.getElementById('addSubjectBtn');
  if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', showAddSubjectModal);
  }

  const addSetBtn = document.getElementById('addSetBtn');
  if (addSetBtn) {
    addSetBtn.addEventListener('click', showAddSetModal);
  }

  const addCardBtn = document.getElementById('addCardBtn');
  if (addCardBtn) {
    addCardBtn.addEventListener('click', showAddCardModal);
  }

  const importCardsJsonBtn = document.getElementById('importCardsJsonBtn');
  if (importCardsJsonBtn) {
    importCardsJsonBtn.addEventListener('click', importCardsFromJsonForCurrentSet);
  }

  const categoryCards = document.querySelectorAll('.category-card');
  categoryCards.forEach(card => {
    if (card.dataset.subjectId) {
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-subject-btn')) {
          const subjectId = card.dataset.subjectId;
          currentSubject = getSubjects().find(s => s.subject_id === subjectId);
          currentView = 'sets';
          renderApp();
        }
      });
    } else if (card.dataset.setId) {
      card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('delete-set-btn') && !e.target.classList.contains('study-set-btn')) {
          const setId = card.dataset.setId;
          currentSet = getSetsForSubject(currentSubject.subject_id).find(s => s.set_id === setId);
          currentView = 'cards';
          renderApp();
        }
      });
    }
  });

  const deleteSubjectBtns = document.querySelectorAll('.delete-subject-btn');
  deleteSubjectBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const subjectId = btn.dataset.subjectId;
      const subject = allData.find(d => d.type === 'subject' && d.subject_id === subjectId);

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>';

      const itemsToDelete = allData.filter(d =>
        (d.type === 'subject' && d.subject_id === subjectId) ||
        (d.type === 'set' && d.subject_id === subjectId) ||
        (d.type === 'card' && allData.some(s => s.type === 'set' && s.set_id === d.set_id && s.subject_id === subjectId))
      );

      for (const item of itemsToDelete) {
        await window.dataSdk.delete({ id: item.id }, true);
      }
      window.dataSdk.init(dataHandler); // reload + notify cleanly

      if (currentSubject?.subject_id === subjectId) {
        currentSubject = null;
        currentView = 'subjects';
      }
    });
  });

  const deleteSetBtns = document.querySelectorAll('.delete-set-btn');
  deleteSetBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const setId = btn.dataset.setId;

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span>';

      const itemsToDelete = allData.filter(d =>
        (d.type === 'set' && d.set_id === setId) ||
        (d.type === 'card' && d.set_id === setId)
      );

      for (const item of itemsToDelete) {
        await window.dataSdk.delete({ id: item.id });
      }
    });
  });

  const deleteCardBtns = document.querySelectorAll('.delete-card-btn');
  deleteCardBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();

      const id = btn.dataset.id;

      btn.disabled = true;
      btn.innerHTML =
        '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span>';
      await window.dataSdk.delete({ id });
    });
  });


  const studySetBtns = document.querySelectorAll('.study-set-btn');
  studySetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const setId = btn.dataset.setId;
      currentSet = getSetsForSubject(currentSubject.subject_id).find(s => s.set_id === setId);
      currentCardIndex = 0;
      isFlipped = false;
      currentView = 'study';
      renderApp();
    });
  });

  const studyCardsBtn = document.getElementById('studyCardsBtn');
  if (studyCardsBtn) {
    studyCardsBtn.addEventListener('click', () => {
      currentCardIndex = 0;
      isFlipped = false;
      currentView = 'study';
      renderApp();
    });
  }

  const quizBtn = document.getElementById('quizCardsBtn');
  if (quizBtn) {
    quizBtn.addEventListener('click', () => {
      const cards = getCardsForSet(currentSet.set_id);
      quizQuestions = generateQuizQuestions(cards);
      quizIndex = 0;
      quizScore = 0;
      currentView = 'quiz';
      renderApp();
    });
  }

  const backToSubjectsBtn = document.getElementById('backToSubjectsBtn');
  if (backToSubjectsBtn) {
    backToSubjectsBtn.addEventListener('click', () => {
      currentView = 'subjects';
      currentSubject = null;
      renderApp();
    });
  }

  const backToSetsBtn = document.getElementById('backToSetsBtn');
  if (backToSetsBtn) {
    backToSetsBtn.addEventListener('click', () => {
      currentView = 'sets';
      currentSet = null;
      renderApp();
    });
  }

  const backToCardsBtn = document.getElementById('backToCardsBtn');
  if (backToCardsBtn) {
    backToCardsBtn.addEventListener('click', () => {
      currentView = 'cards';
      currentCardIndex = 0;
      isFlipped = false;
      renderApp();
    });
  }

  const flipBtn = document.getElementById('flipBtn');
  if (flipBtn) {
    flipBtn.addEventListener('click', () => {
      const cardInner = document.getElementById('cardInner');
      isFlipped = !isFlipped;
      if (isFlipped) {
        cardInner.classList.add('flipped');
      } else {
        cardInner.classList.remove('flipped');
      }
    });
  }

  const prevBtn = document.getElementById('prevBtn');
  if (prevBtn && currentCardIndex > 0) {
    prevBtn.addEventListener('click', () => {
      currentCardIndex--;
      isFlipped = false;
      renderApp();
    });
  }

  const nextBtn = document.getElementById('nextBtn');
  const cards = getCardsForSet(currentSet?.set_id || '');
  if (nextBtn && currentCardIndex < cards.length - 1) {
    nextBtn.addEventListener('click', () => {
      currentCardIndex++;
      isFlipped = false;
      renderApp();
    });
  }
  const aiGenerateBtn = document.getElementById("aiGenerateBtn");

  if (aiGenerateBtn) {
    aiGenerateBtn.addEventListener("click", () => {
      showAIGenerateModal();
    });
  }
  // QUIZ option click handlers
  if (currentView === 'quiz') {
    document.querySelectorAll(".quiz-option").forEach(btn => {
      btn.addEventListener("click", () => {
        const selected = btn.dataset.answer;
        const correct = quizQuestions[quizIndex].correct;

        // Disable all options
        document.querySelectorAll(".quiz-option").forEach(b => {
          b.classList.add("disabled");
        });

        // Mark answers
        if (selected === correct) {
          btn.classList.add("correct");
          quizScore++;
        } else {
          btn.classList.add("wrong");

          document.querySelectorAll(".quiz-option").forEach(b => {
            if (b.dataset.answer === correct) {
              b.classList.add("correct");
            }
          });
        }

        // Next question delay
        setTimeout(() => {
          quizIndex++;

          if (quizIndex >= quizQuestions.length) {
            currentView = "quiz-result";
          }

          renderApp();
        }, 800);
      });
    });
  }
  const exitQuizBtn = document.getElementById('exitQuizBtn');
  if (exitQuizBtn) {
    exitQuizBtn.addEventListener('click', () => {
      currentView = 'cards';
      renderApp();
    });
  }

}

function adjustColor(color, amount) {
  const num = parseInt(color.slice(1), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

async function onConfigChange(newConfig) {
  Object.assign(config, newConfig);
  renderApp();
}

function mapToCapabilities(cfg) {
  return {
    recolorables: [
      {
        get: () => cfg.background_color || defaultConfig.background_color,
        set: (value) => {
          cfg.background_color = value;
          window.elementSdk.setConfig({ background_color: value });
        }
      },
      {
        get: () => cfg.card_background || defaultConfig.card_background,
        set: (value) => {
          cfg.card_background = value;
          window.elementSdk.setConfig({ card_background: value });
        }
      },
      {
        get: () => cfg.text_color || defaultConfig.text_color,
        set: (value) => {
          cfg.text_color = value;
          window.elementSdk.setConfig({ text_color: value });
        }
      },
      {
        get: () => cfg.primary_color || defaultConfig.primary_color,
        set: (value) => {
          cfg.primary_color = value;
          window.elementSdk.setConfig({ primary_color: value });
        }
      },
      {
        get: () => cfg.secondary_color || defaultConfig.secondary_color,
        set: (value) => {
          cfg.secondary_color = value;
          window.elementSdk.setConfig({ secondary_color: value });
        }
      }
    ],
    borderables: [],
    fontEditable: {
      get: () => cfg.font_family || 'system-ui',
      set: (value) => {
        cfg.font_family = value;
        window.elementSdk.setConfig({ font_family: value });
      }
    },
    fontSizeable: {
      get: () => cfg.font_size || 16,
      set: (value) => {
        cfg.font_size = value;
        window.elementSdk.setConfig({ font_size: value });
      }
    }
  };
}

function mapToEditPanelValues(cfg) {
  return new Map([
    ["app_title", cfg.app_title || defaultConfig.app_title],
    ["app_subtitle", cfg.app_subtitle || defaultConfig.app_subtitle]
  ]);
}

(async () => {
  if (window.elementSdk) {
    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities,
      mapToEditPanelValues
    });
  }

  if (window.dataSdk) {
    const initResult = await window.dataSdk.init(dataHandler);
    if (!initResult.isOk) {
      console.error('Failed to initialize data SDK');
    }
  }
})();

window.addEventListener("beforeinstallprompt", e => {
  console.log("✅ beforeinstallprompt fired");

  e.preventDefault(); // REQUIRED
  deferredInstallPrompt = e;

  const installBtn = document.getElementById("installAppBtn");
  if (installBtn) installBtn.style.display = "block";
});

document.getElementById("installAppBtn")?.addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice;

  deferredInstallPrompt = null;

  document.getElementById("installAppBtn").style.display = "none";

  if (choice.outcome === "accepted") {
    showToast("App installed 🎉");
  }
});

window.addEventListener("appinstalled", () => {
  console.log("🎉 App installed");
});


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch(err => console.error("SW registration failed", err));
  });
}



