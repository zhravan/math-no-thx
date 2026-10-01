import { canvas2d, slider, mapRange } from "../viz/viz.js";

const canvas = document.querySelector("#graph");
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
  const padding = 32;
  const xMin = -10;
  const xMax = 10;
  const yMin = -10;
  const yMax = 10;

  const x = value => mapRange(value, xMin, xMax, padding, width - padding);
  const y = value => mapRange(value, yMin, yMax, height - padding, padding);

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "#e7e5df";
  ctx.lineWidth = 1;

  for (let i = -10; i <= 10; i++) {
    ctx.beginPath();
    ctx.moveTo(x(i), padding);
    ctx.lineTo(x(i), height - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(padding, y(i));
    ctx.lineTo(width - padding, y(i));
    ctx.stroke();
  }

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(x(0), padding);
  ctx.lineTo(x(0), height - padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, y(0));
  ctx.lineTo(width - padding, y(0));
  ctx.stroke();

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
  ctx.lineWidth = 3;
  ctx.stroke();
}

const graph = canvas2d(canvas, draw);

function update() {
  for (const key of Object.keys(controls)) {
    params[key] = Number(controls[key].value);
    values[key].textContent = format(params[key]);
  }

  equation.textContent = equationText();
  graph.redraw();
}

for (const key of Object.keys(controls)) {
  slider(controls[key], update);
}

update();
