/* ===========================================================
   Module 5 — Digital Techniques Mock Exam
   Fisher-Yates shuffle · bilingual EN/TH · 75% pass threshold
   =========================================================== */

const PASS_THRESHOLD = 0.75;
const DATA_URL = "data/questions.json";

let RAW_QUESTIONS = [];   // as loaded from JSON, never mutated
let ROUND = [];           // this round's shuffled questions + shuffled options
let ANSWERS = {};         // questionRoundIndex -> selected option index
let LOCKED = false;

const shellEl = document.getElementById("shell");
const railFillEl = document.getElementById("railFill");
const readoutEl = document.getElementById("readout");
const submitBtn = document.getElementById("submitBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const thToggle = document.getElementById("thToggle");

function fisherYates(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound() {
  const shuffledQuestions = fisherYates(RAW_QUESTIONS);
  ROUND = shuffledQuestions.map((q) => {
    const order = fisherYates(q.options.map((_, idx) => idx));
    const options = order.map((origIdx) => q.options[origIdx]);
    const correct = order.indexOf(q.correct);
    return { ...q, options, correct };
  });
  ANSWERS = {};
  LOCKED = false;
}

function updateProgress() {
  const answered = Object.keys(ANSWERS).length;
  const total = ROUND.length;
  railFillEl.style.width = ((answered / total) * 100).toFixed(1) + "%";
  readoutEl.textContent = `${answered} / ${total} ANSWERED`;
  submitBtn.disabled = answered < total || LOCKED;
}

function renderQuestion(q, idx) {
  const card = document.createElement("div");
  card.className = "qcard";
  card.dataset.idx = idx;

  const head = document.createElement("div");
  head.className = "qhead";
  const num = document.createElement("span");
  num.className = "qnum";
  num.textContent = `Q${idx + 1}`;
  head.appendChild(num);

  const qtext = document.createElement("div");
  qtext.className = "qtext";
  qtext.innerHTML = escapeHtml(q.en) + `<span class="th">${escapeHtml(q.th)}</span>`;
  head.appendChild(qtext);

  if (q.flagged) {
    const flag = document.createElement("span");
    flag.className = "flag";
    flag.textContent = "VERIFY";
    head.appendChild(flag);
  }
  card.appendChild(head);

  const opts = document.createElement("div");
  opts.className = "opts";
  q.options.forEach((opt, oi) => {
    const label = document.createElement("label");
    label.className = "opt";
    label.innerHTML = `
      <input type="radio" name="q${idx}" value="${oi}">
      <span class="label">${escapeHtml(opt.en)}<span class="th">${escapeHtml(opt.th)}</span></span>
    `;
    const input = label.querySelector("input");
    input.addEventListener("change", () => {
      ANSWERS[idx] = oi;
      opts.querySelectorAll(".opt").forEach((el) => el.classList.remove("selected"));
      label.classList.add("selected");
      updateProgress();
    });
    opts.appendChild(label);
  });
  card.appendChild(opts);

  const explainToggle = document.createElement("div");
  explainToggle.className = "explain-toggle";
  explainToggle.textContent = "▸ SHOW EXPLANATION";
  card.appendChild(explainToggle);

  const explain = document.createElement("div");
  explain.className = "explain";
  explain.innerHTML = `
    ${escapeHtml(q.analysis_en)}
    <span class="th">${escapeHtml(q.analysis_th)}</span>
    <span class="ref">${escapeHtml(q.reference)}</span>
  `;
  card.appendChild(explain);

  explainToggle.addEventListener("click", () => {
    const open = explain.classList.toggle("open");
    explainToggle.textContent = open ? "▾ HIDE EXPLANATION" : "▸ SHOW EXPLANATION";
  });

  // --- remark: the actual passage from the books ---
  const remarkToggle = document.createElement("div");
  remarkToggle.className = "remark-toggle";
  remarkToggle.textContent = "▸ READ IT IN THE BOOK / อ่านเนื้อหาต้นฉบับ";
  card.appendChild(remarkToggle);

  const remark = document.createElement("div");
  remark.className = "remark";
  remark.innerHTML = buildRemark(q);
  card.appendChild(remark);

  remarkToggle.addEventListener("click", () => {
    const open = remark.classList.toggle("open");
    remarkToggle.textContent = open
      ? "▾ HIDE BOOK PASSAGE / ซ่อนเนื้อหาต้นฉบับ"
      : "▸ READ IT IN THE BOOK / อ่านเนื้อหาต้นฉบับ";
  });

  return card;
}

function buildRemark(q) {
  const src = q.source || {};
  const blocks = [];
  [["b1", "CAT-B1"], ["b2", "CAT-B2"]].forEach(([key, label]) => {
    const s = src[key];
    if (!s) return;
    const body = s.text
      ? escapeHtml(s.text)
      : '<em class="nohit">No supporting passage found in the searchable text of this book — check the figure on this page.</em>';
    blocks.push(`
      <div class="remark-book">
        <div class="remark-cite">${label} · page ${s.page}${q.section ? " · " + escapeHtml(q.section) : ""}</div>
        <blockquote>${body}</blockquote>
      </div>
    `);
  });
  blocks.push(
    '<div class="remark-note th">ข้อความข้างต้นคัดมาจากหนังสือเรียนโดยตรง (สกัดจากไฟล์ PDF) เปิดหน้าที่ระบุในหนังสือเพื่ออ่านฉบับเต็มพร้อมรูปประกอบ</div>'
  );
  return blocks.join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : str;
  return div.innerHTML;
}

function renderRound() {
  shellEl.innerHTML = "";
  const banner = document.getElementById("bannerSlot");
  if (banner) banner.remove();

  const bannerSlot = document.createElement("div");
  bannerSlot.id = "bannerSlot";
  shellEl.appendChild(bannerSlot);

  ROUND.forEach((q, idx) => {
    shellEl.appendChild(renderQuestion(q, idx));
  });
  updateProgress();
}

function gradeRound() {
  LOCKED = true;
  let correctCount = 0;

  document.querySelectorAll(".qcard").forEach((card) => {
    const idx = Number(card.dataset.idx);
    const q = ROUND[idx];
    const selected = ANSWERS[idx];
    const isCorrect = selected === q.correct;
    if (isCorrect) correctCount++;

    card.classList.add("locked", isCorrect ? "correct" : "incorrect");
    card.querySelectorAll(".opt").forEach((optEl, oi) => {
      const input = optEl.querySelector("input");
      input.disabled = true;
      if (oi === q.correct) optEl.classList.add("correct-answer");
      if (oi === selected && !isCorrect) optEl.classList.add("wrong-answer");
    });
  });

  const total = ROUND.length;
  const pct = correctCount / total;
  const passed = pct >= PASS_THRESHOLD;

  const banner = document.createElement("div");
  banner.className = "banner " + (passed ? "pass" : "fail");
  banner.innerHTML = `
    <div class="score">${correctCount} / ${total} — ${(pct * 100).toFixed(0)}%</div>
    <div class="verdict">${passed ? "PASS" : "FAIL"} · 75% required to pass</div>
    <div class="sub">Items marked VERIFY are flagged as not fully confirmed in the source books — cross-check those against your instructor material before relying on them.</div>
    <div class="sub th">รายการที่มีป้าย VERIFY เป็นข้อที่ยังไม่ยืนยันได้ครบถ้วนจากหนังสือต้นฉบับ ควรตรวจสอบเพิ่มเติมกับเอกสารของผู้สอนก่อนนำไปใช้อ้างอิง</div>
  `;
  document.getElementById("bannerSlot").replaceWith(banner);
  banner.scrollIntoView({ behavior: "smooth", block: "start" });

  submitBtn.disabled = true;
  updateProgress();
}

function startNewRound() {
  buildRound();
  renderRound();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function init() {
  const res = await fetch(DATA_URL);
  RAW_QUESTIONS = await res.json();
  startNewRound();
}

submitBtn.addEventListener("click", () => {
  if (Object.keys(ANSWERS).length < ROUND.length || LOCKED) return;
  gradeRound();
});
shuffleBtn.addEventListener("click", startNewRound);
thToggle.addEventListener("change", () => {
  document.body.classList.toggle("hide-th", !thToggle.checked);
});

init();
