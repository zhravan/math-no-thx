import { canvas2d, mapRange } from "../viz/viz.js";

const canvas = document.querySelector("#graph");
const cursor = document.querySelector("#cursor");
const equation = document.querySelector("#equation");

const controls = {
  a: document.querySelector("#a"),
  b: document.querySelector("#b"),
  c: document.querySelector("#c")
};

const values = {
  a: document.querySelector("#a-value"),
  b: document.querySelector("#b-value"),
  c: document.querySelector("#c-value")
};

let params = { a: 1, b: 0, c: 0 };
let graphSize = { width: 0, height: 0 };

function format(value) {
  return Number(value).toFixed(1).replace(".0", "");
}

function equationText() {
  const { a, b, c } = params;
  const terms = [
    a === 0 ? "" : `${format(a)}x²`,
    b === 0 ? "" : `${b > 0 ? "+" : "-"} ${format(Math.abs(b))}x`,
    c === 0 ? "" : `${c > 0 ? "+" : "-"} ${format(Math.abs(c))}`
  ].filter(Boolean);

  return `f(x) = ${terms.join(" ") || "0"}`;
}

function draw(ctx, width, height) {
  graphSize = { width, height };

  const padding = 36;
  const xRange = viewport();
  const xMin = xRange.min;
  const xMax = xRange.max;
  const samples = 120;
  const ys = Array.from({ length: samples + 1 }, (_, i) => {
    const xv = mapRange(i, 0, samples, xMin, xMax);
    return params.a * xv * xv + params.b * xv + params.c;
  });
  const rawMin = Math.min(...ys, 0);
  const rawMax = Math.max(...ys, 0);
  const span = Math.max(rawMax - rawMin, 1);
  const yMin = rawMin - span * 0.12;
  const yMax = rawMax + span * 0.12;

  const x = value => mapRange(value, xMin, xMax, padding, width - padding);
  const y = value => mapRange(value, yMin, yMax, height - padding, padding);

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;

  const step = niceStep((xMax - xMin) / 8);
  const firstX = Math.ceil(xMin / step) * step;
  const firstY = Math.ceil(yMin / step) * step;

  for (let i = firstX; i <= xMax; i += step) {
    if (Math.abs(i) > step / 10) {
      ctx.beginPath();
      ctx.moveTo(x(i), padding);
      ctx.lineTo(x(i), height - padding);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(padding, y(i));
      ctx.lineTo(width - padding, y(i));
      ctx.stroke();
    }
  }

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x(0), padding);
  ctx.lineTo(x(0), height - padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, y(0));
  ctx.lineTo(width - padding, y(0));
  ctx.stroke();

  ctx.fillStyle = "#777";
  ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";

  for (let i = firstX; i <= xMax; i += step * 2) {
    if (Math.abs(i) > step / 10) {
      ctx.fillText(format(i), x(i) - 8, y(0) + 18);
    }
  }

  ctx.beginPath();

  let started = false;

  for (let px = padding; px <= width - padding; px += 2) {
    const xv = mapRange(px, padding, width - padding, xMin, xMax);
    const yv = params.a * xv * xv + params.b * xv + params.c;
    const py = y(yv);

    if (py < padding - 20 || py > height - padding + 20) {
      started = false;
      continue;
    }

    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else {
      ctx.lineTo(px, py);
    }
  }

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function niceStep(value) {
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / power;
  const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return factor * power;
}

function viewport() {
  const scale = Math.max(1, Math.abs(params.a), Math.abs(params.b) / 5, Math.abs(params.c) / 5);
  const half = Math.max(6, Math.min(20, 8 + Math.log10(scale + 1) * 4));
  return { min: -half, max: half };
}

const graph = canvas2d(canvas, draw);

canvas.addEventListener("pointermove", event => {
  if (!graphSize.width) return;

  const rect = canvas.getBoundingClientRect();
  const px = event.clientX - rect.left;
  const py = event.clientY - rect.top;

  const padding = 36;
  const range = viewport();
  const x = mapRange(px, padding, graphSize.width - padding, range.min, range.max);
  const y = params.a * x * x + params.b * x + params.c;

  cursor.textContent = `x: ${format(x)}   y: ${format(y)}`;
  cursor.style.left = `${px}px`;
  cursor.style.top = `${py}px`;
});

function update() {
  for (const key of Object.keys(controls)) {
    const value = Number(controls[key].value);
    params[key] = Number.isFinite(value) ? value : 0;
    values[key].textContent = format(params[key]);
  }

  equation.textContent = equationText();
  graph.redraw();
}

for (const key of Object.keys(controls)) {
  controls[key].addEventListener("input", update);
}

update();
