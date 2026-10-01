export function canvas2d(canvas, draw) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not supported.");

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx, rect.width, rect.height);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return {
    ctx,
    redraw: () => {
      const rect = canvas.getBoundingClientRect();
      draw(ctx, rect.width, rect.height);
    },
    destroy: () => observer.disconnect()
  };
}

export function animate(step, options = {}) {
  let frame = 0;
  let running = false;
  let previous = 0;

  const loop = (time) => {
    if (!running) return;
    const delta = previous ? (time - previous) / 1000 : 0;
    previous = time;
    step({ time, delta, frame });
    frame += 1;
    options.onFrame?.({ time, delta, frame });
    requestAnimationFrame(loop);
  };

  return {
    start() {
      if (running) return;
      running = true;
      previous = 0;
      frame = 0;
      requestAnimationFrame(loop);
    },
    stop() {
      running = false;
    },
    get running() {
      return running;
    }
  };
}

export function slider(input, onChange) {
  const update = () => onChange(Number(input.value), input);
  input.addEventListener("input", update);
  update();

  return () => input.removeEventListener("input", update);
}

export function simulation(update, options = {}) {
  let state = options.initial ?? {};
  let animation;

  const loop = ({ delta }) => {
    state = update(state, delta);
    options.onUpdate?.(state);
  };

  animation = animate(loop);

  return {
    start: () => animation.start(),
    stop: () => animation.stop(),
    reset(next = options.initial ?? {}) {
      state = next;
      options.onUpdate?.(state);
    },
    get state() {
      return state;
    }
  };
}

export function project3d({ x, y, z }, camera = {}) {
  const focalLength = camera.focalLength ?? 500;
  const distance = camera.distance ?? 4;
  const scale = focalLength / (distance + z);

  return {
    x: x * scale,
    y: y * scale,
    scale
  };
}

export function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMin === inMax) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
