const analyzeBtn = document.getElementById("analyzeBtn");
const crimeInput = document.getElementById("crimeInput");

const loading = document.getElementById("loading");
const analysisSection = document.getElementById("analysis");

const summaryEl = document.getElementById("summary");
const cluesEl = document.getElementById("clues");
const suspectsEl = document.getElementById("suspects");
const timelineEl = document.getElementById("timeline");
const nextStepsEl = document.getElementById("nextSteps");

const historyEl = document.getElementById("caseHistory");

const API = "http://localhost:5000"; // backend URL

/* =========================
   CLICK: ANALYZE CRIME
========================= */
analyzeBtn.addEventListener("click", async () => {
  const crimeText = crimeInput.value.trim();

  if (!crimeText) {
    alert("Please enter crime details");
    return;
  }

  // Reset UI
  analysisSection.classList.add("hidden");
  loading.classList.remove("hidden");

  try {
    const res = await fetch(`${API}/api/investigate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ crime: crimeText })
    });

    const caseData = await res.json();

    loading.classList.add("hidden");
    renderAnalysis(caseData.analysis);
    analysisSection.classList.remove("hidden");

    loadCaseHistory();

  } catch (err) {
    loading.classList.add("hidden");
    alert("Backend not running or error occurred");
    console.error(err);
  }
});

/* =========================
   RENDER AI ANALYSIS
========================= */
function renderAnalysis(analysis) {

  // Summary
  typeWriter(summaryEl, analysis.summary);

  // Key Clues
  cluesEl.innerHTML = "";
  analysis.keyClues.forEach(clue => {
    const li = document.createElement("li");
    li.textContent = clue;
    cluesEl.appendChild(li);
  });

  // Suspects
  suspectsEl.innerHTML = "";
  analysis.suspectRanking.forEach(s => {
    const card = document.createElement("div");
    card.className = "suspect-card";
    card.innerHTML = `
      <h4>${s.name}</h4>
      <p>Risk: <b>${s.risk}%</b></p>
      <p>${s.reason}</p>
    `;
    suspectsEl.appendChild(card);
  });

  // Timeline
  timelineEl.innerHTML = "";
  analysis.timeline.forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    timelineEl.appendChild(li);
  });

  // Next Steps
  nextStepsEl.innerHTML = "";
  analysis.nextSteps.forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    nextStepsEl.appendChild(li);
  });
}

/* =========================
   TYPEWRITER EFFECT
========================= */
function typeWriter(element, text, speed = 20) {
  element.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    element.textContent += text.charAt(i);
    i++;
    if (i >= text.length) clearInterval(timer);
  }, speed);
}

/* =========================
   CASE HISTORY
========================= */
async function loadCaseHistory() {
  try {
    const res = await fetch(`${API}/api/cases`);
    const cases = await res.json();

    historyEl.innerHTML = "";

    if (cases.length === 0) {
      historyEl.innerHTML = `<p class="muted">No cases yet</p>`;
      return;
    }

    cases.reverse().forEach(c => {
      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
        <strong>Case #${c.id}</strong><br/>
        <small>${new Date(c.createdAt).toLocaleString()}</small>
        <p>${c.analysis.summary}</p>
      `;
      historyEl.appendChild(div);
    });

  } catch (err) {
    console.error("History load failed", err);
  }
}
