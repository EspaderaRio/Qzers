const TEACHER_DRAFT_KEY = "teacher_quiz_draft";

function shuffleArray(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function saveTeacherDraft(title, questions, timeLimit = 0) {
  localStorage.setItem(
    TEACHER_DRAFT_KEY,
    JSON.stringify({ title, questions, timeLimit })
  );
}

function loadTeacherDraft() {
  const raw = localStorage.getItem(TEACHER_DRAFT_KEY);
  return raw ? JSON.parse(raw) : { title: "", questions: [], timeLimit: 0 };
}


function clearTeacherDraft() {
  localStorage.removeItem(TEACHER_DRAFT_KEY);
}

function initTeacherView() {
  // 1️⃣ Restore draft
  const draft = loadTeacherDraft();
  if (draft) {
    teacherQuestions = draft.questions || teacherQuestions;
    window._teacherTitleDraft = draft.title || "";
  } else {
    window._teacherTitleDraft = "";
  }

  // 2️⃣ Setup back button AFTER render
  requestAnimationFrame(() => {
    const backBtn = document.getElementById("backBtnTeacherQuiz");
    if (!backBtn) return;

    backBtn.style.display = "block";

    backBtn.onclick = () => {
      currentView = "home";
      renderApp();
    };
  });
}


function renderStudentView() {
  const student = window.currentStudent || { name: "", id: "" };

  return `
    <div class="w-full min-h-screen flex items-center justify-center p-4"
         style="background-color: var(--background); font-family: var(--font-family); font-size: var(--font-size); line-height: var(--line-height);">
      <div class="w-full max-w-md p-6 fade-in space-y-6"
           style="background-color: var(--card-bg); border-radius: var(--radius);">

        <!-- Logged in info -->
        ${student.name && student.id ? `
        <div style="color: var(--primary); font-size: 0.875rem;">
          ✅ Logged in as: ${student.name} (${student.id})
        </div>` : ""}

        <!-- Student Info Modal -->
        <div id="student-info-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
          <div style="background-color: var(--card-bg); border-radius: var(--radius);" class="p-6 w-full max-w-sm mx-2">
            <h3 style="color: var(--text);" class="text-lg font-semibold mb-4">👤 Student Information</h3>
            <input
              id="student-name-input"
              placeholder="Full Name"
              style="background-color: var(--card-bg); color: var(--text); border-radius: var(--radius); border: 1px solid var(--primary);"
              class="w-full mb-3 px-3 py-2"
            />
            <input
              id="student-id-input"
              placeholder="Student ID"
              style="background-color: var(--card-bg); color: var(--text); border-radius: var(--radius); border: 1px solid var(--primary);"
              class="w-full mb-4 px-3 py-2"
            />
            <div class="flex justify-end gap-2">
              <button onclick="closeStudentInfoModal()"
                      style="background-color: var(--card-bg); color: var(--text); border-radius: var(--radius); border: 1px solid var(--primary);"
                      class="px-4 py-2">
                Cancel
              </button>
              <button onclick="confirmStudentInfo()"
                      style="background-color: var(--primary); color: white; border-radius: var(--radius);"
                      class="px-4 py-2">
                Continue
              </button>
            </div>
          </div>
        </div>

        <!-- Quiz Join Section -->
        <h2 style="color: var(--text);" class="text-2xl font-semibold">🧠 Join Quiz</h2>
        <p style="color: var(--secondary-text);" class="text-sm mb-4">
          Enter the quiz ID provided by your teacher
        </p>

        <input
          id="student-quiz-id"
          placeholder="Quiz ID"
          style="background-color: var(--card-bg); color: var(--text); border-radius: var(--radius); border: 1px solid var(--primary);"
          class="w-full mb-4 px-4 py-3"
        />

        <button
          onclick="loadStudentQuiz()"
          style="background-color: var(--primary); color: white; border-radius: var(--radius);"
          class="w-full py-3 mb-2 font-semibold"
        >
          Start Quiz
        </button>

        <button 
          onclick="currentView='student-score-history'; renderApp();"
          style="background-color: var(--primary); color: white; border-radius: var(--radius);"
          class="w-full py-3 mb-2 font-semibold"
        >
          📊 View Score History
        </button>

        <button
          onclick="backStudentBtn()"
          style="background-color: var(--primary); color: white; border-radius: var(--radius);"
          class="w-full py-3 mb-2 font-semibold"
        >
          Back
        </button>

        <div id="student-error" style="color: red;" class="mt-4 text-center"></div>
      </div>
    </div>
  `;
}

function openStudentInfoModal() {
  document.getElementById("student-info-modal").classList.remove("hidden");
}

function closeStudentInfoModal() {
  document.getElementById("student-info-modal").classList.add("hidden");
}

function confirmStudentInfo() {
  const nameInput = document.getElementById("student-name-input");
  const idInput = document.getElementById("student-id-input");

  if (!nameInput || !idInput) return;

  const name = nameInput.value.trim();
  const id = idInput.value.trim();

  if (!name || !id) {
    alert("Please enter your name and student ID");
    return;
  }

  currentStudent.name = name;
  currentStudent.id = id;
  isStudentLocked = true;

  sessionStorage.setItem(
    "currentStudent",
    JSON.stringify({ name, id })
  );

  closeStudentInfoModal();
}




function saveStudentInfo() {
  const name = document.getElementById("student-name").value.trim();
  const id = document.getElementById("student-id").value.trim();

  if (!name || !id) return alert("Please fill in all fields.");

  
  sessionStorage.setItem("currentStudent", JSON.stringify({ name, id }));

 
  document.getElementById("student-info-form").style.display = "none";
  startStudentQuiz(); 
}

function backStudentBtn() {
  currentView = 'home'; 
  renderApp();         
}


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
let currentView = 'home';
let currentSubject = null;
let currentSet = null;
let currentCardIndex = 0;
let isFlipped = false;
let isLoading = false;
let quizIndex = 0;
let quizScore = 0;
let quizQuestions = [];
let deferredInstallPrompt = null;
let teacherQuestions = [];
let saveTimeout;
let teacherDraftSaveTimer;
let isQuizPreview = false;
let teacherQuizData = null;
let teacherQuizIndex = 0;
let teacherQuizScore = 0;
let isTeacherQuiz = false;
let currentQuizId = null;
let isStudentLocked = false;
let currentStudent = {
  name: "",
  id: ""
};
let studyTimer = {
  duration: 20 * 60,
  remaining: 20 * 60,
  interval: null,
  running: false,
  startTime: null
};

function renderHomeView() {
  return `
    <div class="w-full h-full flex items-center justify-center p-6">
      <div class="max-w-md w-full text-center fade-in">

        <h1
          style="
            font-size:calc(var(--font-size) * 2.2);
            color:var(--text);
            margin-bottom:12px;
          "
        >
          📚 Study Hub
        </h1>

        <p
          style="
            color:var(--secondary, #64748b);
            margin-bottom:32px;
          "
        >
          Choose a study mode to begin
        </p>

        <div class="flex flex-col gap-4">

          <!-- Flashcards -->
          <button
            id="openFlashcardsBtn"
            class="w-full py-4 rounded-xl font-semibold"
            style="
              background:var(--primary);
              color:white;
              box-shadow:0 10px 30px rgba(37,99,235,.35);
              font-size:calc(var(--font-size) * 1.1);
            "
          >
            🃏 Flashcards
          </button>

          <!-- Teacher Quiz -->
          <button
            onclick="openTeacherQuiz()"
            class="w-full py-4 rounded-xl font-semibold"
            style="
              background:var(--card-bg);
              color:var(--text);
              box-shadow:0 6px 18px rgba(0,0,0,.1);
            "
          >
            👩‍🏫 Create Quiz (Teacher)
          </button>

          <!-- Student Quiz -->
          <button
            onclick="openStudentQuiz()"
            class="w-full py-4 rounded-xl font-semibold"
            style="
              background:var(--card-bg);
              color:var(--text);
              box-shadow:0 6px 18px rgba(0,0,0,.1);
            "
          >
            👨‍🎓 Join Quiz (Student)
          </button>

        </div>

      </div>
    </div>
  `;
}

function openTeacherQuiz() {
  currentView = "teacher";
  initTeacherView();
  renderApp();
}

function openStudentQuiz() {
  currentView = "student";
  renderApp();
}

function renderTeacherView() {
  const teacherQuizzes = getTeacherQuizzes();

  const quizListHTML = teacherQuizzes.length
    ? teacherQuizzes.map(q => `
        <div class="p-4 rounded-xl flex justify-between items-center" style="background: var(--card-bg);">
          <div>
            <div style="font-weight:600; color: var(--text);">${q.title}</div>
            <code style="font-size:12px; opacity:.7; color: var(--secondary-text);">${q.quizId}</code>
          </div>
<div class="flex flex-wrap gap-2">
  <button 
    onclick="navigator.clipboard.writeText('${q.quizId}')" 
    class="px-3 py-1 rounded-full text-sm"
    style="background: var(--primary); color: white; flex-shrink: 1;"
  >
    Copy
  </button>

  <button 
    onclick="editTeacherQuiz('${q.quizId}')" 
    class="px-3 py-1 rounded-full text-sm"
    style="background: rgba(0,0,0,.08); flex-shrink: 1;"
  >
    Edit
  </button>

  <button 
    onclick="deleteTeacherQuiz('${q.quizId}')" 
    class="px-3 py-1 rounded-full text-sm"
    style="background: rgba(239,68,68,.15); color:#dc2626; flex-shrink: 1;"
  >
    Delete
  </button>
</div>

        </div>
      `).join("")
    : `<p style="color: var(--secondary-text);">No quizzes created yet.</p>`;

  const renderQuestionInputs = () => teacherQuestions.map((q, i) => `
    <div class="p-4 rounded-xl" style="background: var(--card-bg);">
      <input
        placeholder="Question"
        class="w-full mb-2 px-3 py-2 rounded-lg"
        style="background: var(--card-bg); color: var(--text); border: 1px solid var(--primary); border-radius: var(--radius);"
        value="${q.question}"
        oninput="updateTeacherQuestion(${i}, 'question', this.value)"
      />
      ${q.options.map((opt, j) => `
        <div class="flex items-center mb-2">
          <span style="width:20px; font-weight:600; color: var(--text);">${String.fromCharCode(65+j)}.</span>
          <input
            placeholder="Option ${j + 1}"
            class="w-full px-3 py-2 rounded-lg"
            style="background: var(--card-bg); color: var(--text); border: 1px solid var(--primary); border-radius: var(--radius);"
            value="${opt}"
            oninput="updateTeacherOption(${i}, ${j}, this.value)"
          />
        </div>
      `).join("")}
      <input
        placeholder="Correct answer (letter, e.g., A)"
        class="w-full px-3 py-2 rounded-lg"
        style="background: var(--card-bg); color: var(--text); border: 1px solid var(--primary); border-radius: var(--radius);"
        value="${q.correct}"
        oninput="updateTeacherQuestion(${i}, 'correct', this.value.toUpperCase())"
      />
    </div>
  `).join("");

  const renderPreview = () => teacherQuestions.length ? teacherQuestions.map((q, i) => `
    <div class="p-3 mb-3 rounded-lg" style="background: var(--card-bg);">
      <strong style="color: var(--text);">Q${i + 1}: ${q.question}</strong>
      <ul style="margin-top:4px; padding-left:18px; color: var(--text);">
        ${q.options.map((opt, j) => `<li>${String.fromCharCode(65 + j)}. ${opt}</li>`).join("")}
      </ul>
      <p style="color: var(--primary); font-size:0.9em;">Answer: ${q.correct}</p>
    </div>
  `).join("") : `<p style="color: var(--secondary-text);">No questions to preview.</p>`;

  return `
    <div class="w-full h-full overflow-auto p-6" style="background: var(--background); font-family: var(--font-family); font-size: var(--font-size); line-height: var(--line-height);">
      <div class="max-w-2xl mx-auto fade-in">
        <button id="backBtnTeacherQuiz"
                style="display:none; position:fixed; top:16px; left:16px; z-index:1000; padding:8px 14px; border-radius:999px; background: var(--card-bg); font-weight:600; cursor:pointer; border:1px solid var(--primary);">
          ← Back
        </button>

        <h3 style="font-size:calc(var(--font-size) * 1.2); margin-bottom:12px; color: var(--text);">📋 Your Quizzes</h3>
        ${quizListHTML}
        <hr style="margin:24px 0; opacity:.2;" />

        <button onclick="showTeacherScoresView()"
                class="w-full py-3 rounded-xl font-semibold"
                style="background: var(--card-bg); color: var(--text); box-shadow:0 6px 18px rgba(0,0,0,.1);">
          📊 View Student Scores
        </button>

        <h2 style="font-size:calc(var(--font-size) * 1.8); margin:8px; color: var(--text);">👩‍🏫 Create Quiz</h2>
        <p style="color: var(--secondary-text); margin-bottom:24px;">Build a quiz and share it with your students</p>

        <input
          id="quiz-title"
          placeholder="Quiz title"
          value="${window._teacherTitleDraft || ""}"
          class="w-full mb-4 px-4 py-3 rounded-xl"
          style="background: var(--card-bg); color: var(--text); border-radius: var(--radius); border: 1px solid var(--primary);"
          oninput="updateTeacherTitle(this.value)"
        />

        <div class="flex flex-col gap-4 mb-4">${renderQuestionInputs()}</div>

        <button onclick="addTeacherQuestion()"
                class="w-full py-3 rounded-xl font-semibold"
                style="background: var(--card-bg); color: var(--text); border:1px solid var(--primary);">
          ➕ Add Question
        </button>
        <button onclick="submitTeacherQuiz()"
                class="w-full py-4 rounded-xl font-semibold mt-6"
                style="background: var(--primary); color:white; box-shadow:0 10px 30px rgba(37,99,235,.35);">
          🚀 Publish Quiz
        </button>

        <div id="teacher-result" class="mt-6 text-center"></div>

        <hr style="margin:32px 0; opacity:.2;" />

        <h2 style="font-size:calc(var(--font-size) * 1.8); margin-bottom:8px; color: var(--text);">📝 Preview Quiz</h2>
        <div id="preview-quiz">${renderPreview()}</div>

        <hr style="margin:32px 0; opacity:.2;" />

        <h2 style="font-size:calc(var(--font-size) * 1.8); margin-bottom:8px; color: var(--text);">🤖 AI Quiz Assistant</h2>
        <p style="color: var(--secondary-text); margin-bottom:12px;">Generate quiz questions automatically for a topic</p>
        <button onclick="openAIQuizModal()" class="w-full py-3 rounded-xl font-semibold"
                style="background: rgba(37,99,235,.15); color: var(--primary);">
          🤖 Generate AI Quiz
        </button>

        <!-- AI Quiz Modal -->
        <div id="ai-quiz-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
          <div class="bg-card rounded-xl p-6 w-full max-w-sm mx-2"
               style="background: var(--card-bg); color: var(--text); border-radius: var(--radius);">
            <h3 class="text-lg font-semibold mb-4" style="color: var(--text);">🤖 Generate AI Quiz</h3>
            <input id="ai-quiz-topic-input" placeholder="Topic"
                   class="w-full mb-3 px-3 py-2 rounded-lg"
                   style="background: var(--card-bg); color: var(--text); border: 1px solid var(--primary); border-radius: var(--radius);" />
            <input id="ai-quiz-count-input" type="number" min="1" max="20" placeholder="Number of questions"
                   class="w-full mb-4 px-3 py-2 rounded-lg"
                   style="background: var(--card-bg); color: var(--text); border: 1px solid var(--primary); border-radius: var(--radius);" />
            <div class="flex justify-end gap-2">
              <button onclick="closeAIQuizModal()"
                      class="px-4 py-2 rounded-lg"
                      style="background: var(--card-bg); color: var(--text); border:1px solid var(--primary);">Cancel</button>
              <button onclick="generateAIQuiz()"
                      class="px-4 py-2 rounded-lg"
                      style="background: var(--primary); color:white;">Generate</button>
            </div>
          </div>
        </div>

        <div id="ai-quiz-result" class="mt-4"></div>
      </div>
    </div>
  `;
}

function openAIQuizModal() {
  document.getElementById("ai-quiz-modal").classList.remove("hidden");
}

function closeAIQuizModal() {
  document.getElementById("ai-quiz-modal").classList.add("hidden");
}

function updateTeacherQuestion(index, field, value) {
  teacherQuestions[index][field] = value;

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTeacherDraft(
      document.getElementById('quiz-title')?.value || '',
      teacherQuestions
    );
  }, 300);
}

function updateTeacherOption(qIndex, optIndex, value) {
  teacherQuestions[qIndex].options[optIndex] = value;

  clearTimeout(teacherDraftSaveTimer);
  teacherDraftSaveTimer = setTimeout(() => {
    saveTeacherDraft(
      document.getElementById('quiz-title')?.value || '',
      teacherQuestions
    );
  }, 300);
}


function updateTeacherTitle(title) {
  window._teacherTitleDraft = title;
  saveTeacherDraft(title, teacherQuestions);
}


async function generateAIQuiz() {
  const topicInput = document.getElementById("ai-quiz-topic-input");
  const countInput = document.getElementById("ai-quiz-count-input");

  const topic = topicInput?.value.trim();
  const count = Number(countInput?.value) || 5;

  if (!topic) return alert("Topic is required");

  try {
    const res = await fetch("https://flashcards-ai-backend.onrender.com/api/generate-quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, numQuestions: count })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "AI backend error");
    }

    const data = await res.json();

    teacherQuestions = data.questions.map(q => {
      let options = [...(q.options || [])];

      options = shuffleArray(options);

      const correctText = (q.correct || "").trim().toLowerCase();
      let correctIndex = options.findIndex(
        opt => opt.trim().toLowerCase() === correctText
      );

      if (correctIndex === -1) {
        correctIndex = Math.floor(Math.random() * options.length);
      }

      const correctLetter = String.fromCharCode(65 + correctIndex);

      return {
        question: q.question || "",
        options,
        correct: correctLetter
      };
    });

    window._teacherTitleDraft = `${topic} Quiz`;

    closeAIQuizModal();
    topicInput.value = "";
    countInput.value = "";

    alert(`✅ ${teacherQuestions.length} questions generated!`);

    currentView = "teacher";
    renderApp();
  } catch (err) {
    console.error("AI Quiz generation failed:", err);
    alert("❌ Failed to generate AI quiz: " + err.message);
  }
}






function previewTeacherQuiz() {
  const title = document.getElementById("quiz-title")?.value || "Preview Quiz";

  if (teacherQuestions.length === 0) {
    alert("Add at least one question to preview.");
    return;
  }


  isQuizPreview = true;

  quizQuestions = teacherQuestions.map(q => ({
    question: q.question,
    options: q.options,
    correct: q.correct
  }));

  quizIndex = 0;
  quizScore = 0;

  currentView = "teacher-quiz"; 
  renderApp();
}



async function editTeacherQuiz(quizId) {
  const res = await fetch(
    `https://quiz-backend.espaderario.workers.dev/api/quizzes/${quizId}`
  );

if (!res.ok) {
  const err = await res.json();
  alert(err.error || "Failed to update quiz");
  return;
}

  const data = await res.json();

  clearTeacherDraft();

  window._teacherEditingQuizId = quizId;
  window._teacherTitleDraft = data.quiz.title;
  teacherQuestions = data.questions;

  currentView = "teacher";
  renderApp();
}




async function deleteTeacherQuiz(quizId) {
  if (!confirm("Delete this quiz permanently?")) return;

  await fetch(
    `https://quiz-backend.espaderario.workers.dev/api/quizzes/${quizId}`,
    { method: "DELETE" }
  );

  const user = getUser();
  const key = `teacher_quizzes_${user.id}`;
  const quizzes = getTeacherQuizzes().filter(q => q.quizId !== quizId);

  localStorage.setItem(key, JSON.stringify(quizzes));
  renderApp();
}


function addTeacherQuestion() {
  teacherQuestions.push({
    question: "",
    options: ["", "", "", ""],
    correct: ""
  });

  saveTeacherDraft(
    document.getElementById("quiz-title")?.value || "",
    teacherQuestions
  );

  renderApp();
}

async function submitTeacherQuiz() {
  const title = document.getElementById("quiz-title").value.trim();

  if (!title || teacherQuestions.length === 0) {
    alert("Please add a title and at least one question.");
    return;
  }

  const isEditing = !!window._teacherEditingQuizId;

  const url = isEditing
    ? `https://quiz-backend.espaderario.workers.dev/api/quizzes/${window._teacherEditingQuizId}`
    : "https://quiz-backend.espaderario.workers.dev/api/quizzes";

  const method = isEditing ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        questions: teacherQuestions,
      }),
    });

    const data = await res.json(); // read once

    if (!res.ok) {
      alert(data.error || "Failed to save quiz");
      return;
    }

    if (!isEditing) {
      saveTeacherQuiz({
        quizId: data.quizId,
        title,
      });
    }

    if (isQuizPreview) {
      alert("Preview finished! No results were saved.");
      isQuizPreview = false;
      return;
    }

    window._teacherEditingQuizId = null;
    clearTeacherDraft();
    teacherQuestions = [];
    window._teacherTitleDraft = "";

    document.getElementById("teacher-result").innerHTML = `
      <div class="p-4 rounded-xl" style="background:rgba(34,197,94,.1);">
        ✅ Quiz ${isEditing ? "updated" : "created"} successfully!
      </div>
    `;

    renderApp();
  } catch (err) {
    console.error("Error submitting quiz:", err);
    alert("An unexpected error occurred while saving the quiz.");
  }
}



function saveTeacherQuiz(quiz) {
  const user = getUser();
  if (!user) return;

  const key = `teacher_quizzes_${user.id}`;
  const quizzes = JSON.parse(localStorage.getItem(key) || "[]");

  quizzes.unshift({
    quizId: quiz.quizId,
    title: quiz.title,
    createdAt: Date.now()
  });

  localStorage.setItem(key, JSON.stringify(quizzes));
}



function getTeacherQuizzes() {
  const user = getUser();
  if (!user) return [];

  const key = `teacher_quizzes_${user.id}`;
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function bindTeacherViewEvents() {
  const backBtn = document.getElementById("backBtnTeacherQuiz");
  if (backBtn) {
    backBtn.onclick = () => {
  window._teacherEditingQuizId = null;
  clearTeacherDraft();
  teacherQuestions = [];
  window._teacherTitleDraft = "";
  currentView = "home";
  renderApp();
};
  }
}

async function loadStudentQuiz() {

  // 1️⃣ Require student info
  if (!currentStudent.name || !currentStudent.id) {
    openStudentInfoModal();
    return;
  }

  // 2️⃣ Get quiz ID FIRST
  const quizId = document.getElementById("student-quiz-id").value.trim();

  if (!quizId) {
    alert("Please enter a quiz ID.");
    return;
  }

  currentQuizId = quizId;

  // 3️⃣ Fetch quiz
  const res = await fetch(
    `https://quiz-backend.espaderario.workers.dev/api/quizzes/${quizId}`
  );

  if (!res.ok) {
    document.getElementById("student-error").innerText = "Quiz not found";
    return;
  }

  const data = await res.json();

  quizQuestions = data.questions;
  quizIndex = 0;
  quizScore = 0;
  isQuizPreview = false;

  isStudentLocked = true;

  currentView = "teacher-quiz";
  renderApp();
}




function renderTeacherQuizView() {
  if (!quizQuestions || quizQuestions.length === 0) {
    console.warn("Quiz view opened without questions");
    currentView = "home";
    return renderHomeView();
  }

  const q = quizQuestions[quizIndex];
  const letters = ["A", "B", "C", "D"];

  return `
    <div class="w-full h-full p-6">
      <div class="max-w-xl mx-auto fade-in">
        <div class="text-sm mb-2" style="color:var(--secondary);">
          👀 Teacher Quiz • Question ${quizIndex + 1} / ${quizQuestions.length}
        </div>
        <h2 class="mb-6" style="font-size:1.4rem;">${q.question}</h2>

        <div class="flex flex-col gap-3">
          ${q.options.map((opt, j) => `
            <button
              onclick="answerTeacherQuiz('${letters[j]}')"
              class="px-4 py-3 rounded-xl"
              style="background:var(--card-bg); text-align:left;"
            >
              <strong>${letters[j]}.</strong> ${opt}
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}

function finishStudentQuiz() {
saveStudentScore({
  studentName: currentStudent.name,
  studentId: currentStudent.id,
  quizId: currentQuizId,
  score: quizScore,
  total: quizQuestions.length,
  date: Date.now()
});

  currentView = "student-score-history";
  renderApp();
  populateStudentScores();
}


function answerTeacherQuiz(selectedLetter) {
  const q = quizQuestions[quizIndex];
  if (!q || !q.correct) return; // safety

  const correct = q.correct;
  const correctIndex = correct.charCodeAt(0) - 65;
  const correctText = q.options[correctIndex] || "Unknown";

  let feedbackEl = document.createElement("div");
  feedbackEl.style.marginTop = "12px";
  feedbackEl.style.fontWeight = "600";
  feedbackEl.style.color = selectedLetter === correct ? "green" : "red";
  feedbackEl.innerText = selectedLetter === correct 
    ? `Correct ✅` 
    : `Incorrect ❌ • Correct: ${correct} (${correctText})`;

  document.querySelector(".max-w-xl").appendChild(feedbackEl);

  if (selectedLetter === correct) quizScore++;

  setTimeout(() => {
    quizIndex++;
    if (quizIndex >= quizQuestions.length) {
      finishStudentQuiz();
    } else {
      renderApp();
    }
  }, 1500);
}


function saveStudentScore(record) {
  const key = "studentQuizScores";
  const scores = JSON.parse(localStorage.getItem(key) || "[]");

  const student = JSON.parse(sessionStorage.getItem("currentStudent") || "{}");

  if (!student.name || !student.id) {
    alert("Student information missing!");
    return;
  }

  const scoreRecord = {
    id: crypto.randomUUID(), 
    ...record,
    studentName: student.name,
    studentId: student.id
  };

  scores.push(scoreRecord);
  localStorage.setItem(key, JSON.stringify(scores));

  if (currentView === "student-score-history") {
    populateStudentScores();
  }
}


function showStudentScores() {
  currentView = "student-score-history";
  renderApp();          
  populateStudentScores(); 
}

function showStudentScoresByQuiz(quizId) {
  const allScores = JSON.parse(localStorage.getItem("studentQuizScores") || "[]");
  const container = document.getElementById("student-score-container");
  if (!container) return;

  const scores = allScores.filter(
    s => s.studentId === currentStudent.id && s.quizId === quizId
  );

  if (!scores.length) {
    container.innerHTML = `
      <p style="color:var(--secondary);">
        No attempts for this quiz yet.
      </p>
    `;
    return;
  }

  container.innerHTML = `
    <h3 class="mb-4 text-lg font-semibold">📘 Quiz: ${quizId}</h3>

    <ul class="flex flex-col gap-3">
      ${scores.map(s => `
  <li class="p-4 rounded-xl flex justify-between items-start"
      style="background:var(--card-bg);">
    <div>
      <div><strong>Score:</strong> ${s.score} / ${s.total}</div>
      <div style="color:var(--secondary); font-size:.9rem;">
        ${new Date(s.date).toLocaleString()}
      </div>
    </div>

<button
  onclick="hideStudentScoreForMe('${s.id}')"
  class="px-3 py-1 rounded-lg text-sm"
  style="background:rgba(239,68,68,.15); color:#dc2626;">
  Delete
</button>
  </li>
`).join("")}
    </ul>

    <button
      onclick="populateStudentScores()"
      class="mt-6 px-4 py-2 rounded-xl"
      style="background:var(--primary); color:white;">
      ← Back to All Scores
    </button>
  `;
}

function showTeacherScoresView() {
  currentView = "teacher-view-scores";
  renderApp();                  
  populateTeacherStudentScores();
}

function populateStudentScores() {
  const allScores = JSON.parse(localStorage.getItem("studentQuizScores") || "[]");
  const container = document.getElementById("student-score-container");
  if (!container) return;

  const student = JSON.parse(sessionStorage.getItem("currentStudent") || "{}");
  const hiddenScores = JSON.parse(localStorage.getItem(`hiddenScores_${student.id}`) || "[]");

  const studentScores = allScores
    .filter(s => s.studentId === student.id && !hiddenScores.includes(s.id));

  if (!studentScores.length) {
    container.innerHTML = `<p style="color:var(--secondary);">You haven't taken any quizzes yet.</p>`;
    return;
  }

  const quizzes = {};
  studentScores.forEach(s => {
    if (!quizzes[s.quizId]) quizzes[s.quizId] = [];
    quizzes[s.quizId].push(s);
  });

  container.innerHTML = `
    <ul class="flex flex-col gap-4">
      ${Object.entries(quizzes).map(([quizId, attempts]) => `
        <li class="p-4 rounded-xl flex justify-between items-center" style="background:var(--card-bg);">
          <div>
            <div><strong>Quiz:</strong> ${quizId}</div>
            <div style="color:var(--secondary); font-size:.9rem;">
              Attempts: ${attempts.length}
            </div>
          </div>
          <button onclick="showStudentScoresByQuiz('${quizId}')" class="px-4 py-2 rounded-xl" style="background:var(--primary); color:white;">View</button>
        </li>
      `).join("")}
    </ul>
  `;
}


function populateTeacherStudentScores() {
  const scores = JSON.parse(localStorage.getItem("studentQuizScores") || "[]");
  const container = document.getElementById("student-score-container");
  if (!container) return;

  if (!scores.length) {
    container.innerHTML = `
      <div class="dashboard-card p-6 text-center" style="color:var(--secondary);">
        No students have taken any quizzes yet.
      </div>
    `;
    return;
  }

  const quizzes = {};
  scores.forEach(s => {
    if (!quizzes[s.quizId]) quizzes[s.quizId] = [];
    quizzes[s.quizId].push(s);
  });

  container.innerHTML = `
    <div class="dashboard-list">
      ${Object.entries(quizzes).map(([quizId, attempts]) => `
        <div class="dashboard-card overflow-hidden">
          <div class="dashboard-header"
               onclick="toggleQuizSection('${quizId}')">
            <div>
              <strong>📘 ${quizId}</strong>
              <div style="font-size:.85rem; color:var(--secondary);">
                ${attempts.length} student${attempts.length !== 1 ? "s" : ""}
              </div>
            </div>
            <span id="icon-${quizId}">▾</span>
          </div>

          <div id="quiz-${quizId}" class="dashboard-body hidden">
            <div class="dashboard-list">
              ${attempts.map(s => `
  <div class="dashboard-item">
    <div>
      <div class="font-medium">
        ${s.studentName}
        <span style="opacity:.6;">(${s.studentId})</span>
      </div>
      <div style="font-size:.8rem; color:var(--secondary);">
        ${new Date(s.date).toLocaleString()}
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="${
        s.score / s.total >= 0.7 ? "score-good" : "score-bad"
      }">
        ${s.score} / ${s.total}
      </div>

      <button
        onclick="deleteStudentScoreById('${s.id}')"
        class="px-2 py-1 rounded-md text-xs"
        style="background:rgba(239,68,68,.15); color:#dc2626;">
        ✕
      </button>
    </div>
  </div>
`).join("")}

            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function toggleQuizSection(quizId) {
  const section = document.getElementById(`quiz-${quizId}`);
  const icon = document.getElementById(`icon-${quizId}`);
  if (!section) return;

  const hidden = section.classList.toggle("hidden");
  icon.textContent = hidden ? "▾" : "▴";
}

function hideStudentScoreForMe(scoreId) {
  const student = JSON.parse(sessionStorage.getItem("currentStudent") || "{}");
  if (!student.id) return;

  const key = `hiddenScores_${student.id}`;
  const hiddenScores = JSON.parse(localStorage.getItem(key) || "[]");

  if (!hiddenScores.includes(scoreId)) hiddenScores.push(scoreId);
  localStorage.setItem(key, JSON.stringify(hiddenScores));

  populateStudentScores(); // refresh view
}


function deleteStudentScoreById(scoreId) {
  if (!confirm("Delete this score?")) return;

  const scores = JSON.parse(localStorage.getItem("studentQuizScores") || "[]");
  const updated = scores.filter(s => s.id !== scoreId);

  localStorage.setItem("studentQuizScores", JSON.stringify(updated));

  if (currentView === "student-score-history") populateStudentScores();
  if (currentView === "teacher-view-scores") populateTeacherStudentScores();
}


function deleteStudentScore(index) {
  const scores = JSON.parse(localStorage.getItem("studentQuizScores") || "[]");
  if (index < 0 || index >= scores.length) return;
  if (!confirm("Delete this score?")) return;

  scores.splice(index, 1);
  localStorage.setItem("studentQuizScores", JSON.stringify(scores));

  if (currentView === "student-score-history") populateStudentScores();
  else if (currentView === "teacher-view-scores") populateTeacherStudentScores();
}

function clearMyStudentScores() {
  if (!confirm("Delete all your quiz history?")) return;

  const scores = JSON.parse(localStorage.getItem("studentQuizScores") || "[]");
  const filtered = scores.filter(s => s.studentId !== currentStudent.id);

  localStorage.setItem("studentQuizScores", JSON.stringify(filtered));
  populateStudentScores();
}

function clearAllStudentScores() {
  if (!confirm("This will delete ALL student scores. Continue?")) return;

  localStorage.removeItem("studentQuizScores");
  populateTeacherStudentScores();
}


function showScoresView() {
  renderApp();

  if (currentView === "student-score-history") {
    populateStudentScores();
  }

  if (currentView === "teacher-view-scores") {
    populateTeacherStudentScores();
  }
}

function clearAllStudentScores() {
  if (!confirm("Are you sure you want to delete all your quiz history?")) return;

  localStorage.removeItem("studentQuizScores");
  populateStudentScores(); // refresh view
}

function renderStudentScores() {
  const scores = JSON.parse(localStorage.getItem("studentQuizScores") || "[]");
  const container = document.getElementById("student-score-container");
  if (!container) return;

  if (!scores.length) {
    container.innerHTML = "<p>No quizzes taken yet.</p>";
    return;
  }

  container.innerHTML = `
    <ul class="flex flex-col gap-2">
      ${scores.map(s => `
        <li style="background:var(--card-bg); padding:8px; border-radius:8px;">
          Quiz: ${s.quizId} • Score: ${s.score}/${s.total} • Date: ${new Date(s.date).toLocaleString()}
        </li>
      `).join("")}
    </ul>
  `;
}



function renderStudentScoreHistoryView() {
  return `
    <div class="w-full h-full p-6">
      <h2 style="font-size:1.5rem; margin-bottom:16px;">📊 Quiz Score History</h2>
      <div id="student-score-container"></div>
      <button onclick="clearMyStudentScores()" class="mt-4 px-4 py-2 rounded-xl" style="background:rgba(239,68,68,.15); color:#dc2626;">
      🗑 Clear My Quiz History
      </button>
      <button onclick="currentView='home'; renderApp();" class="mt-6 px-4 py-2 rounded-xl" style="background:var(--primary); color:white;">
        ← Back to Home
      </button>
    </div>
  `;
}




function renderTeacherQuizResultView() {
  if (!teacherQuizData || !teacherQuizData.questions) {
    console.warn("Teacher quiz result rendered without data");
    currentView = "home";
    return renderHomeView();
  }

  return `
    <div>Result here</div>
  `;
}

function renderTeacherViewScores() {
  return `
    <div class="w-full h-full p-6">
      <h2 style="font-size:1.5rem; margin-bottom:16px;">📊 Student Quiz Scores</h2>
      <div id="student-score-container"></div>
      <button onclick="clearAllStudentScores()"
      class="mt-4 px-4 py-2 rounded-xl"
      style="background:rgba(239,68,68,.15); color:#dc2626;">
      🗑 Clear ALL Student Scores
      </button>
      <button onclick="currentView='teacher'; renderApp();" 
        class="mt-6 px-4 py-2 rounded-xl" 
        style="background:var(--primary); color:white;">
        ← Back to Dashboard
      </button>
    </div>
  `;
}



function exitTeacherQuiz() {
  quizQuestions = [];
  quizIndex = 0;
  quizScore = 0;
  isQuizPreview = false;

  currentView = "home";
  renderApp();
}






const savedDuration = parseInt(localStorage.getItem("studyTimerDuration"), 10);
if (!isNaN(savedDuration) && savedDuration > 0) {
  studyTimer.duration = savedDuration;
  studyTimer.remaining = savedDuration;
}


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
  const app = document.getElementById("app");
  let content = "";

  if (currentView === "home") {
    content = renderHomeView();
  } else if (currentView === "teacher") {
    content = renderTeacherView();
  } else if (currentView === "student") {
    content = renderStudentView();
  } else if (currentView === "student-score-history") {
    content = renderStudentScoreHistoryView();
  } else if (currentView === "teacher-quiz") {
    content = renderTeacherQuizView();
  } else if (currentView === "teacher-quiz-result") {
    content = renderTeacherQuizResultView();
  } else if (currentView === 'teacher-view-scores') {
    content = renderTeacherViewScores();
    setTimeout(() => populateTeacherStudentScores(window._teacherSelectedQuizId), 0);
  } else if (currentView === "subjects") {
    content = renderSubjectsView();
  } else if (currentView === "sets") {
    content = renderSetsView();
  } else if (currentView === "cards") {
    content = renderCardsView();
  } else if (currentView === "study") {
    content = renderStudyView();
  } else if (currentView === "quiz") {
    content = renderQuizView();
  } else if (currentView === "quiz-result") {
    content = renderQuizResultView();
  } else if (currentView === "customize") {
    content = renderCustomizationPanel();
  }

  app.innerHTML = content;

  // Show/hide back buttons
  const backBtn = document.getElementById("backToHomeBtn");
  if (backBtn) backBtn.style.display = currentView === "home" ? "none" : "block";

  const backBtnTeacherQuiz = document.getElementById("backBtnTeacherQuiz");
  if (backBtnTeacherQuiz) {
    backBtnTeacherQuiz.style.display =
      ["teacher", "student", "quiz", "quiz-result"].includes(currentView)
        ? "block"
        : "none";
  }

  if (currentView === "teacher") bindTeacherViewEvents();
  attachEventListeners();

  if (currentView === "quiz") updateTimerUI();

  
  if (currentView === "student-score-history") {
    populateStudentScores();
  }
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
          <button
  id="backToHomeBtn"
  style="
    display:none;
    position:fixed;
    top:16px;
    left:16px;
    z-index:999;
    padding:8px 14px;
    border-radius:999px;
    background:rgba(0,0,0,.08);
    color:var(--text);
    font-weight:600;
    border:none;
    cursor:pointer;
  "
>
  ← Home
</button>

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
          <div class="actions-inner">
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

function startStudyTimer() {
  if (studyTimer.running) return;

  stopStudyTimer(); // ✅ safety clear

  studyTimer.running = true;
  studyTimer.startTime = Date.now();

  studyTimer.interval = setInterval(() => {
    studyTimer.remaining--;

    if (studyTimer.remaining <= 0) {
      studyTimer.remaining = 0;
      stopStudyTimer();
      currentView = "quiz-result";
      renderApp();
      return;
    }

    updateTimerUI();
  }, 1000);
}



function stopStudyTimer() {
  clearInterval(studyTimer.interval);
  studyTimer.interval = null;
  studyTimer.running = false;
}

function resetStudyTimer() {
  stopStudyTimer();
  studyTimer.remaining = studyTimer.duration;
  
  updateTimerUI();
}


function updateTimerUI() {
  const el = document.getElementById("study-timer");
  if (!el) return;

  el.textContent = formatTime(studyTimer.remaining);

  const clock = document.getElementById("floating-timer");

if (studyTimer.remaining <= 60) {
  clock.style.background = config.primary_color;
  clock.style.color = "#fff";
} else {
  clock.style.background = config.card_background;
  clock.style.color = config.primary_color;
}

}



function applyTimerSettings() {
  if (studyTimer.running) {
    stopStudyTimer();
  }

  const h = parseInt(document.getElementById("timer-hours")?.value) || 0;
  const m = parseInt(document.getElementById("timer-minutes")?.value) || 0;

  const total = h * 3600 + m * 60;
  if (total <= 0) return;

  studyTimer.duration = total;
  studyTimer.remaining = total;
  localStorage.setItem("studyTimerDuration", total);

  updateTimerUI();
}



function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function toggleFloatingTimer() {
  const el = document.getElementById("floating-timer");
  if (!el) return;

  el.style.display =
    currentView === "quiz" || currentView === "study"
      ? "flex"
      : "none";
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
      <div class="min-h-full flex flex-col p-5">
        <div class="max-w-3xl w-full mx-auto fade-in">

          <!-- Header -->
          <div class="flex items-center justify-between mb-4">

            <button id="exitQuizBtn"
              class="px-4 py-2 rounded-lg text-sm"
              style="background:${bg};color:${text};
              box-shadow:0 2px 8px rgba(0,0,0,.08);">
              ← Exit
            </button>

            <!-- Timer Pill -->
<div
  id="floating-timer"
  style="
    position:fixed;
    top:16px;
    right:16px;
    z-index:1000;

    width:80px;
    height:80px;
    border-radius:50%;

    background:${bg};
    box-shadow:0 10px 30px rgba(0,0,0,.2);

    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction:column;

    font-weight:700;
    color:${primary};
  "
>
  <div style="font-size:1.2rem;">⏱</div>
  <div
    id="study-timer"
    style="
      font-size:1.2rem;
      margin-top:4px;
      letter-spacing:1px;
    "
  >
    ${formatTime(studyTimer.remaining)}
  </div>
</div>



            <div class="text-right text-sm">
              <p style="color:${sub};">
                Q ${quizIndex + 1} / ${quizQuestions.length}
              </p>
              <p style="color:${primary};font-weight:600;">
                ⭐ ${quizScore}
              </p>
            </div>
          </div>

          <!-- Timer Controls Card -->
<div
  class="flex flex-wrap gap-2 items-center justify-center mb-5 p-4 rounded-xl mx-auto"
  style="
    background:${bg};
    box-shadow:0 4px 14px rgba(0,0,0,.08);
    max-width:420px;
  "
>
  <input
    type="number"
    id="timer-hours"
    min="0"
    placeholder="H"
    class="w-16 px-2 py-2 rounded-lg text-center"
  />

  <input
    type="number"
    id="timer-minutes"
    min="0"
    max="59"
    placeholder="M"
    class="w-16 px-2 py-2 rounded-lg text-center"
  />

  <button
    class="px-3 py-2 rounded-lg text-sm font-medium"
    style="background:${primary};color:white;"
    onclick="applyTimerSettings()"
  >
    Set
  </button>

  <button
    class="px-3 py-2 rounded-lg text-sm"
    style="background:rgba(0,0,0,.08);color:${text};"
    onclick="startStudyTimer()"
  >
    ▶ Start
  </button>

  <button
    class="px-3 py-2 rounded-lg text-sm"
    style="background:rgba(0,0,0,.08);color:${text};"
    onclick="stopStudyTimer()"
  >
    ⏸ Pause
  </button>
</div>


          <!-- Progress -->
          <div class="w-full h-2 rounded-full mb-6"
            style="background:rgba(0,0,0,.12);">
            <div class="h-full rounded-full"
              style="width:${progress}%;
              background:${primary};
              transition:width .3s;">
            </div>
          </div>

          <!-- Question -->
          <div class="p-6 rounded-2xl mb-8"
            style="background:${bg};
            box-shadow:0 10px 28px rgba(0,0,0,.12);">
            <h2
              style="
                font-size:calc(var(--font-size) * 1.5);
                color:${text};
                line-height:1.6;
              "
            >
              ${q.question}
            </h2>
          </div>

          <!-- Options -->
          <div class="grid gap-4">
            ${q.options.map(opt => `
              <button
                class="quiz-option"
                data-answer="${opt}"
                style="
                  padding:16px;
                  border-radius:var(--radius);
                  background:${bg};
                  color:${text};
                  font-size:var(--font-size);
                  box-shadow:0 4px 12px rgba(0,0,0,.08);
                  transition:transform .15s, box-shadow .15s;
                "
              >
                ${opt}
              </button>
            `).join("")}
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


function exitQuizBtn() {
  stopStudyTimer();
  resetStudyTimer();
  currentView = "home";
  renderApp();
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
  const openFlashcardsBtn = document.getElementById("openFlashcardsBtn");
if (openFlashcardsBtn) {
  openFlashcardsBtn.addEventListener("click", () => {
    currentView = "subjects";
    renderApp();
  });
}

const backBtn = document.getElementById("backToHomeBtn");

if (backBtn) {
 backBtn.addEventListener("click", () => {
  currentSet = null;
  currentCardIndex = 0;
  studyQueue = [];
  currentView = "home";
  renderApp();
});
}
  const backBtnteacherquiz = document.getElementById("backBtnTeacherQuiz");
  if (backBtnteacherquiz) {
    backBtnteacherquiz.onclick = () => {
      currentView = "home";
      renderApp();
    };
  }

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

resetStudyTimer();

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
    stopStudyTimer();
    resetStudyTimer();
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


