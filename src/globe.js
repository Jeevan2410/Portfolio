// The hero's 3D wireframe globe on a canvas: dots on a sphere, latitude and longitude lines, a tilted
// orbit with a satellite, and arcs that pulse between points. Drag to spin it; it keeps turning on its own.

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
export function fibonacciSphere(count) {
  const points = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (2 * (i + 0.5)) / count;
    const radius = Math.sqrt(1 - y * y);
    const theta = golden * i;
    points.push([Math.cos(theta) * radius, y, Math.sin(theta) * radius]);
  }
  return points;
}

/** Rotate a point by yaw (around y) and then pitch (around x). */
export function rotate([x, y, z], yaw, pitch) {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
}

/** Roll a point around the z axis (the line of sight). */
export function roll([x, y, z], angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [x * c - y * s, x * s + y * c, z];
}

const ORBIT = 1.38;

/** Orthographic projection to canvas pixels; z > 0 faces the viewer. */
export const project = ([x, y, z], cx, cy, radius) => [cx + x * radius, cy - y * radius, z];

/** A point on a circle of latitude/longitude, for drawing grid lines. */
export function latLng(lat, lng) {
  return [Math.cos(lat) * Math.sin(lng), Math.sin(lat), Math.cos(lat) * Math.cos(lng)];
}

/** Spherical interpolation between two unit vectors, lifted off the surface by `lift` at the middle. */
export function arcPoint(a, b, t, lift = 0.25) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const omega = Math.acos(dot);
  const s = Math.sin(omega) || 1;
  const wa = Math.sin((1 - t) * omega) / s;
  const wb = Math.sin(t * omega) / s;
  const height = 1 + lift * Math.sin(Math.PI * t);
  return [(a[0] * wa + b[0] * wb) * height, (a[1] * wa + b[1] * wb) * height, (a[2] * wa + b[2] * wb) * height];
}

export function createGlobe(canvas, { reduceMotion }) {
  const context = canvas.getContext("2d");
  const dots = fibonacciSphere(520);
  const arcs = Array.from({ length: 5 }, (_, i) => ({
    a: dots[(i * 97 + 13) % dots.length],
    b: dots[(i * 211 + 151) % dots.length],
    offset: i / 5,
  }));
  let colors = readColors();
  let size = 0;
  let ratio = 1;
  let yaw = 0.6;
  let velocity = 0;
  let tiltX = 0;
  let tiltY = 0;
  let dragging = null;
  let frame = 0;
  let visible = true;
  let last = 0;

  function readColors() {
    const style = getComputedStyle(canvas);
    return {
      dot: style.getPropertyValue("--globe-dot").trim() || "#a5b4fc",
      line: style.getPropertyValue("--globe-line").trim() || "rgba(165,180,252,.35)",
      accent: style.getPropertyValue("--globe-accent").trim() || "#22d3ee",
      warm: style.getPropertyValue("--globe-warm").trim() || "#f472b6",
    };
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    ratio = Math.min(devicePixelRatio || 1, 2);
    size = Math.min(box.width, box.height);
    canvas.width = Math.round(box.width * ratio);
    canvas.height = Math.round(box.height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(performance.now());
  }

  function line(points, cx, cy, r, color, width) {
    // Draw segment by segment so the half facing away fades out.
    for (let i = 1; i < points.length; i++) {
      const p = project(points[i - 1], cx, cy, r);
      const q = project(points[i], cx, cy, r);
      const depth = (p[2] + q[2]) / 2;
      context.globalAlpha = depth > 0 ? 0.25 + depth * 0.75 : Math.max(0, 0.12 + depth * 0.1);
      context.strokeStyle = color;
      context.lineWidth = width;
      context.beginPath();
      context.moveTo(p[0], p[1]);
      context.lineTo(q[0], q[1]);
      context.stroke();
    }
  }

  function draw(time) {
    const width = canvas.width / ratio;
    const height = canvas.height / ratio;
    const cx = width / 2;
    const cy = height / 2;
    const r = size * 0.33;
    const pitch = -0.38 + tiltY;
    const turn = yaw + tiltX;
    context.clearRect(0, 0, width, height);

    // Soft glow behind the sphere.
    const glow = context.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.5);
    glow.addColorStop(0, `${colors.accent}33`);
    glow.addColorStop(1, "transparent");
    context.globalAlpha = 1;
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    // Latitude rings and meridians.
    for (let lat = -60; lat <= 60; lat += 30) {
      const ring = [];
      for (let lng = 0; lng <= 360; lng += 8) ring.push(rotate(latLng((lat * Math.PI) / 180, (lng * Math.PI) / 180), turn, pitch));
      line(ring, cx, cy, r, colors.line, 1);
    }
    for (let lng = 0; lng < 180; lng += 30) {
      const meridian = [];
      for (let lat = 0; lat <= 360; lat += 8) {
        const a = (lat * Math.PI) / 180;
        const m = (lng * Math.PI) / 180;
        meridian.push(rotate([Math.sin(a) * Math.sin(m), Math.cos(a), Math.sin(a) * Math.cos(m)], turn, pitch));
      }
      line(meridian, cx, cy, r, colors.line, 1);
    }

    // Dots: bigger and brighter on the near side.
    context.fillStyle = colors.dot;
    for (const dot of dots) {
      const [x, y, z] = project(rotate(dot, turn, pitch), cx, cy, r);
      context.globalAlpha = z > 0 ? 0.35 + z * 0.65 : 0.08;
      context.beginPath();
      context.arc(x, y, z > 0 ? 1 + z * 1.2 : 0.8, 0, Math.PI * 2);
      context.fill();
    }

    // Arcs that draw themselves between points, then fade.
    for (const arc of arcs) {
      const phase = ((time / 4200 + arc.offset) % 1) * 1.6;
      const end = Math.min(phase, 1);
      const start = Math.max(0, phase - 0.6);
      const points = [];
      for (let t = start; t <= end; t += 0.04) points.push(rotate(arcPoint(arc.a, arc.b, t), turn, pitch));
      if (points.length > 1) line(points, cx, cy, r, colors.accent, 1.8);
      if (end < 1 && points.length) {
        const [x, y, z] = project(points[points.length - 1], cx, cy, r);
        context.globalAlpha = z > 0 ? 1 : 0.2;
        context.fillStyle = colors.accent;
        context.beginPath();
        context.arc(x, y, 2.6, 0, Math.PI * 2);
        context.fill();
      }
    }

    // An orbit ring, rolled sideways so it reads as an open ellipse, with a satellite riding it.
    const onOrbit = (t) => rotate(roll([Math.cos(t) * ORBIT, 0, Math.sin(t) * ORBIT], 0.42), turn * 0.35, pitch - 0.3);
    const orbit = [];
    for (let a = 0; a <= 360; a += 6) orbit.push(onOrbit((a * Math.PI) / 180));
    line(orbit, cx, cy, r, colors.warm, 1.2);
    const satellite = project(onOrbit((time / 2600) % (Math.PI * 2)), cx, cy, r);
    const hidden = satellite[2] < 0 && Math.hypot(satellite[0] - cx, satellite[1] - cy) < r;
    context.globalAlpha = hidden ? 0.15 : 1;
    context.fillStyle = colors.warm;
    context.shadowColor = colors.warm;
    context.shadowBlur = hidden ? 0 : 14;
    context.beginPath();
    context.arc(satellite[0], satellite[1], 4, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.globalAlpha = 1;
  }

  function tick(time) {
    const step = last ? Math.min((time - last) / 16.7, 3) : 1;
    last = time;
    if (!dragging) {
      velocity *= 0.95 ** step;
      yaw += (0.0035 + velocity) * step;
    }
    draw(time);
    frame = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(frame);
    last = 0;
    if (visible && !document.hidden && !reduceMotion.matches) frame = requestAnimationFrame(tick);
    else draw(performance.now());
  }

  canvas.addEventListener("pointerdown", (event) => {
    dragging = { x: event.clientX, yaw, time: event.timeStamp };
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("grabbing");
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    const dx = event.clientX - dragging.x;
    const next = dragging.yaw + dx / (size * 0.5);
    velocity = (next - yaw) * 0.5;
    yaw = next;
    if (reduceMotion.matches) draw(performance.now());
  });
  canvas.addEventListener("lostpointercapture", () => {
    dragging = null;
    canvas.classList.remove("grabbing");
  });

  // The globe leans gently toward the pointer.
  addEventListener("pointermove", (event) => {
    if (reduceMotion.matches || event.pointerType !== "mouse") return;
    tiltX = (event.clientX / innerWidth - 0.5) * 0.35;
    tiltY = (event.clientY / innerHeight - 0.5) * 0.25;
  });

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    start();
  }).observe(canvas);
  document.addEventListener("visibilitychange", start);
  reduceMotion.addEventListener("change", start);
  new ResizeObserver(resize).observe(canvas);

  return {
    /** Pick up new colours after a theme change. */
    refresh() {
      colors = readColors();
      draw(performance.now());
    },
  };
}
