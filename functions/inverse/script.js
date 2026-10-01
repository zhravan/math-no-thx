import { canvas2d, mapRange } from "../../viz/viz.js";

const canvas = document.querySelector("#graph");
const equation = document.querySelector("#equation");
const inverse = document.querySelector("#inverse");
const composition = document.querySelector("#composition");

const aInput = document.querySelector("#a");
const bInput = document.querySelector("#b");

let a = 2;
let b = 1;

function format(value) {
  return Number(value).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function draw(ctx, width, height) {
  const padding = 36;
  const min = -6;
  const max = 6;
  const x = value => mapRange(value, min, max, padding, width - padding);
  const y = value => mapRange(value, min, max, height - padding, padding);

  ctx.clearRect(0, 0, width, height);

  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;

  for (let i = -6; i <= 6; i++) {
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
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x(0), padding);
  ctx.lineTo(x(0), height - padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, y(0));
  ctx.lineTo(width - padding, y(0));
  ctx.stroke();

  const curve = (fn, color, width, dashed = false) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    if (dashed) ctx.setLineDash([5, 5]);

    let started = false;

    for (let px = padding; px <= width - padding; px += 2) {
      const xv = mapRange(px, padding, width - padding, min, max);
      const value = fn(xv);

      if (!Number.isFinite(value) || value < min - 1 || value > max + 1) {
        started = false;
        continue;
      }

      const py = y(value);

      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else {
        ctx.lineTo(px, py);
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);
  };

  curve(x => x, "#aaa", 1.5, true);

  if (a !== 0) {
    curve(x => a * x + b, "#171717", 2.5);
    curve(x => (x - b) / a, "#777", 2);
  }
}

const graph = canvas2d(canvas, draw);

function update() {
  const nextA = Number(aInput.value);
  const nextB = Number(bInput.value);

  a = Number.isFinite(nextA) ? nextA : 0;
  b = Number.isFinite(nextB) ? nextB : 0;

  if (a === 0) {
    equation.textContent = "f(x) = b";
    inverse.textContent = "f⁻¹(x) does not exist as a function";
    composition.textContent = "A constant function cannot be inverted because different inputs have the same output.";
  } else {
    equation.textContent = `f(x) = ${format(a)}x ${b >= 0 ? "+" : "-"} ${format(Math.abs(b))}`;
    inverse.textContent = `f⁻¹(x) = (x ${b >= 0 ? "-" : "+"} ${format(Math.abs(b))}) / ${format(a)}`;
    composition.textContent = "f(f⁻¹(x)) = x and f⁻¹(f(x)) = x";
  }

  graph.redraw();
}

aInput.addEventListener("input", update);
bInput.addEventListener("input", update);
update();
