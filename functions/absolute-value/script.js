import { canvas2d, mapRange } from "../../viz/viz.js";

const canvas = document.querySelector("#graph");
const cursor = document.querySelector("#cursor");
const equation = document.querySelector("#equation");
const facts = document.querySelector("#facts");

const inputs = {
  a: document.querySelector("#a"),
  h: document.querySelector("#h"),
  k: document.querySelector("#k")
};

const state = { a: 1, h: 0, k: 0 };

function format(value) {
  if (Math.abs(value) < 1e-10) return "0";
  return Number(value.toFixed(3)).toString();
}

function expression() {
  const a = state.a;
  const h = state.h;
  const k = state.k;
  const inside = h === 0 ? "x" : "x " + (h > 0 ? "−" : "+") + " " + format(Math.abs(h));
  const abs = "|" + inside + "|";

  if (a === 0) return "f(x) = " + format(k);

  const scaled = Math.abs(a) === 1 ? abs : format(Math.abs(a)) + abs;
  const signed = a < 0 ? "−" + scaled : scaled;

  if (k === 0) return "f(x) = " + signed;
  return "f(x) = " + signed + " " + (k > 0 ? "+" : "−") + " " + format(Math.abs(k));
}

function rangeText() {
  if (state.a === 0) return "range = {" + format(state.k) + "}";
  return state.a > 0 ? "range: y ≥ " + format(state.k) : "range: y ≤ " + format(state.k);
}

function updateFacts() {
  facts.innerHTML = [
    "vertex (" + format(state.h) + ", " + format(state.k) + ")",
    "axis x = " + format(state.h),
    "domain: all real x",
    rangeText()
  ].map((fact) => '<span class="function-fact">' + fact + "</span>").join("");
}

const graph = canvas2d(canvas, (ctx, width, height) => {
  const a = state.a;
  const h = state.h;
  const k = state.k;
  const scale = Math.max(1, Math.abs(h) + 3, Math.abs(k) + 3, Math.abs(a) * 3);
  const xMin = -scale;
  const xMax = scale;
  const yMin = -scale;
  const yMax = scale;
  const x = (value) => mapRange(value, xMin, xMax, 48, width - 20);
  const y = (value) => mapRange(value, yMax, yMin, 20, height - 36);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#eceae3";
  ctx.lineWidth = 1;

  for (let value = Math.ceil(xMin); value <= Math.floor(xMax); value += 1) {
    ctx.beginPath();
    ctx.moveTo(x(value), 0);
    ctx.lineTo(x(value), height);
    ctx.stroke();
  }

  for (let value = Math.ceil(yMin); value <= Math.floor(yMax); value += 1) {
    ctx.beginPath();
    ctx.moveTo(0, y(value));
    ctx.lineTo(width, y(value));
    ctx.stroke();
  }

  ctx.strokeStyle = "#171717";
  if (xMin <= 0 && xMax >= 0) {
    ctx.beginPath();
    ctx.moveTo(x(0), 0);
    ctx.lineTo(x(0), height);
    ctx.stroke();
  }
  if (yMin <= 0 && yMax >= 0) {
    ctx.beginPath();
    ctx.moveTo(0, y(0));
    ctx.lineTo(width, y(0));
    ctx.stroke();
  }

  if (a !== 0 && h >= xMin && h <= xMax) {
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#aaa79f";
    ctx.beginPath();
    ctx.moveTo(x(h), 0);
    ctx.lineTo(x(h), height);
    ctx.stroke();
    ctx.restore();
  }

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 2;
  ctx.beginPath();
  const samples = Math.max(240, Math.floor(width));

  for (let i = 0; i <= samples; i += 1) {
    const xv = mapRange(i, 0, samples, xMin, xMax);
    const yv = a * Math.abs(xv - h) + k;
    const px = x(xv);
    const py = y(yv);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  if (h >= xMin && h <= xMax && k >= yMin && k <= yMax) {
    ctx.fillStyle = "#171717";
    ctx.beginPath();
    ctx.arc(x(h), y(k), 4, 0, Math.PI * 2);
    ctx.fill();
  }
});

function redraw() {
  equation.textContent = expression();
  updateFacts();
  graph.redraw();
}

Object.entries(inputs).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    const value = Number(input.value);
    state[key] = Number.isFinite(value) ? value : 0;
    redraw();
  });
});

canvas.addEventListener("pointermove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.max(1, Math.abs(state.h) + 3, Math.abs(state.k) + 3, Math.abs(state.a) * 3);
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;
  const xv = mapRange(px, 48, rect.width - 20, -scale, scale);
  const yv = mapRange(py, 20, rect.height - 36, scale, -scale);
  const value = state.a * Math.abs(xv - state.h) + state.k;

  cursor.textContent = "x " + format(xv) + " · f(x) " + format(value);
  cursor.style.left = px + "px";
  cursor.style.top = py + "px";
});

canvas.addEventListener("pointerleave", () => {
  cursor.textContent = "";
});

redraw();
