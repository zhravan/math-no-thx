import { canvas2d, mapRange } from "../../viz/viz.js";

const canvas = document.querySelector("#graph");
const equation = document.querySelector("#equation");
const boundaryText = document.querySelector("#boundaryText");

const inputs = {
  leftA: document.querySelector("#leftA"),
  leftB: document.querySelector("#leftB"),
  rightA: document.querySelector("#rightA"),
  rightB: document.querySelector("#rightB"),
  boundary: document.querySelector("#boundary")
};

let values = { leftA: 1, leftB: 0, rightA: 1, rightB: 0, boundary: 0 };

function format(value) {
  return Number(value).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function draw(ctx, width, height) {
  const padding = 36;
  const min = -8;
  const max = 8;
  const x = value => mapRange(value, min, max, padding, width - padding);
  const y = value => mapRange(value, -10, 10, height - padding, padding);

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "#eee";
  ctx.lineWidth = 1;

  for (let i = -8; i <= 8; i++) {
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

  const drawRule = (fn, from, to, color) => {
    ctx.beginPath();
    let started = false;

    for (let px = padding; px <= width - padding; px += 2) {
      const xv = mapRange(px, padding, width - padding, min, max);
      if (xv < from || xv > to) continue;

      const value = fn(xv);
      const py = y(value);

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

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  };

  const leftValue = values.leftA * values.boundary + values.leftB;
  const rightValue = values.rightA * values.boundary + values.rightB;

  drawRule(xv => values.leftA * xv + values.leftB, min, values.boundary, "#171717");
  drawRule(xv => values.rightA * xv * xv + values.rightB, values.boundary, max, "#777");

  const endpoint = (value, filled) => {
    ctx.beginPath();
    ctx.arc(x(values.boundary), y(value), 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#171717";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (filled) {
      ctx.beginPath();
      ctx.arc(x(values.boundary), y(value), 3, 0, Math.PI * 2);
      ctx.fillStyle = "#171717";
      ctx.fill();
    }
  };

  endpoint(leftValue, false);
  endpoint(rightValue, true);
}

const graph = canvas2d(canvas, draw);

function update() {
  for (const key of Object.keys(inputs)) {
    const value = Number(inputs[key].value);
    values[key] = Number.isFinite(value) ? value : 0;
  }

  const k = format(values.boundary);
  const left = `${format(values.leftA)}x ${values.leftB >= 0 ? "+" : "-"} ${format(Math.abs(values.leftB))}`;
  const right = `${format(values.rightA)}x² ${values.rightB >= 0 ? "+" : "-"} ${format(Math.abs(values.rightB))}`;

  equation.textContent = `f(x) = ${left}, x < ${k} · ${right}, x ≥ ${k}`;

  const leftValue = values.leftA * values.boundary + values.leftB;
  const rightValue = values.rightA * values.boundary * values.boundary + values.rightB;
  const difference = Math.abs(leftValue - rightValue);

  boundaryText.textContent = difference < 0.001
    ? `The two rules meet at x = ${k}.`
    : `The rules differ by ${format(difference)} at x = ${k}, creating a jump.`;

  graph.redraw();
}

Object.values(inputs).forEach(input => input.addEventListener("input", update));
update();
