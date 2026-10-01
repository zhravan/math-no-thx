import { canvas2d, mapRange } from "../../viz/viz.js";

const canvas = document.querySelector("#graph");
const equation = document.querySelector("#equation");
const result = document.querySelector("#result");
const steps = document.querySelector("#steps");

const inputs = {
  a: document.querySelector("#a"),
  b: document.querySelector("#b"),
  c: document.querySelector("#c"),
  d: document.querySelector("#d")
};

let values = { a: 2, b: 1, c: 3, d: -1 };

function format(value) {
  return Number(value).toFixed(2).replace(/\\.00$/, "").replace(/(\\.\\d)0$/, "$1");
}

function expression(m, k, variable = "x") {
  if (m === 0) return format(k);
  const first = m === 1 ? variable : m === -1 ? "-" + variable : format(m) + variable;
  if (k === 0) return first;
  return first + " " + (k > 0 ? "+" : "-") + " " + format(Math.abs(k));
}

function draw(ctx, width, height) {
  const padding = 36;
  const min = -6;
  const max = 6;
  const x = value => mapRange(value, min, max, padding, width - padding);
  const y = value => mapRange(value, -10, 10, height - padding, padding);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;

  for (let i = -6; i <= 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x(i), padding);
    ctx.lineTo(x(i), height - padding);
    ctx.stroke();

    if (i >= -10 && i <= 10) {
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

  const drawCurve = (fn, lineWidth) => {
    ctx.beginPath();
    let started = false;
    for (let px = padding; px <= width - padding; px += 2) {
      const xv = mapRange(px, padding, width - padding, min, max);
      const py = y(fn(xv));
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
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };

  ctx.strokeStyle = "#aaa";
  drawCurve(xv => values.c * xv + values.d, 1.5);
  ctx.strokeStyle = "#171717";
  drawCurve(xv => values.a * (values.c * xv + values.d) + values.b, 2.5);
}

const graph = canvas2d(canvas, draw);

function update() {
  for (const key of Object.keys(inputs)) {
    const value = Number(inputs[key].value);
    values[key] = Number.isFinite(value) ? value : 0;
  }

  const inner = expression(values.c, values.d);
  const composedSlope = values.a * values.c;
  const composedConstant = values.a * values.d + values.b;
  const composed = expression(composedSlope, composedConstant);

  equation.textContent = "f(g(x))";
  result.textContent = "f(g(x)) = " + composed;
  steps.textContent = "g(x) = " + inner + ", then f(g(x)) = " + expression(values.a, values.b, inner) + ".";
  graph.redraw();
}

Object.values(inputs).forEach(input => input.addEventListener("input", update));
update();
