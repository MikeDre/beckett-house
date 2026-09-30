import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const FPS = 60;
const LAST_FRAME = 299;
const OUT_FRAME = 300;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const OUTPUT = join(ROOT, "public/lottie");

const palette = {
  ink: "#203979",
  deep: "#35599a",
  coral: "#aaa0cb",
  sun: "#f6dfa3",
  blue: "#b9d7e9",
  white: "#ffffff",
};

const rgb = (hex) => {
  const value = Number.parseInt(hex.slice(1), 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255, 1];
};

const fixed = (value) => ({ a: 0, k: value });
const ease = { o: { x: [0.33], y: [0] }, i: { x: [0.67], y: [1] } };
const animated = (frames) => ({
  a: 1,
  k: frames.map(([t, value], index) => {
    const current = Array.isArray(value) ? value : [value];
    if (index === frames.length - 1) return { t, s: current };
    const next = frames[index + 1][1];
    return { t, s: current, e: Array.isArray(next) ? next : [next], ...ease };
  }),
});

const property = (value) => Array.isArray(value) && value[0] && typeof value[0] === "object" && "t" in value[0]
  ? { a: 1, k: value }
  : fixed(value);
const transform = ({ position = [0, 0], anchor = [0, 0], scale = [100, 100], rotation = 0, opacity = 100 } = {}) => ({
  o: property(opacity),
  r: property(rotation),
  p: property(position),
  a: fixed(anchor),
  s: property(scale),
});

const fill = (colour) => ({ ty: "fl", c: fixed(rgb(colour)), o: fixed(100), r: 1, bm: 0, nm: "Fill" });
const groupTransform = (position = [0, 0], rotation = 0, scale = [100, 100]) => ({
  ty: "tr", p: fixed(position), a: fixed([0, 0]), s: fixed(scale), r: fixed(rotation), o: fixed(100), sk: fixed(0), sa: fixed(0), nm: "Transform",
});
const group = (geometry, colour, position = [0, 0], rotation = 0) => ({
  ty: "gr", it: [geometry, fill(colour), groupTransform(position, rotation)], nm: "Shape group", bm: 0,
});
const ellipse = (size) => ({ ty: "el", d: 1, s: fixed(size), p: fixed([0, 0]), nm: "Ellipse" });
const rectangle = (size, radius = 0) => ({ ty: "rc", d: 1, s: fixed(size), p: fixed([0, 0]), r: fixed(radius), nm: "Rectangle" });
const path = (vertices, inTangents, outTangents, closed = false) => ({
  ty: "sh", d: 1, ks: fixed({ i: inTangents, o: outTangents, v: vertices, c: closed }), nm: "Path",
});

let layerIndex = 0;
const shapeLayer = (name, shapes, options = {}) => ({
  ddd: 0, ind: ++layerIndex, ty: 4, nm: name, sr: 1, ks: transform(options), ao: 0,
  shapes, ip: 0, op: OUT_FRAME, st: 0, bm: 0,
});

const composition = (layers) => {
  layerIndex = 0;
  return { v: "5.13.0", fr: FPS, ip: 0, op: OUT_FRAME, w: 400, h: 400, nm: "Beckett House card animation", ddd: 0, assets: [], layers, markers: [] };
};

function rings() {
  const layers = [
    shapeLayer("Base", [group(rectangle([270, 30], 15), palette.ink)], { position: [200, 324] }),
    shapeLayer("Peg", [group(rectangle([18, 190], 9), palette.deep)], { position: [200, 226] }),
  ];
  const widths = [226, 184, 142, 102];
  const ys = [292, 256, 220, 184];
  const colours = [palette.ink, palette.coral, palette.blue, palette.deep];
  widths.forEach((width, index) => {
    const gap = 28;
    const half = (width - gap) / 2;
    const x = gap / 2 + half / 2;
    const start = [200, -42 - index * 8];
    const drop = 20 + index * 25;
    const lift = 202 + (3 - index) * 13;
    layers.push(shapeLayer(`Ring ${index + 1}`, [
      group(rectangle([half, 28], 14), colours[index], [-x, 0]),
      group(rectangle([half, 28], 14), colours[index], [x, 0]),
    ], {
      position: animated([
        [0, start], [drop, start], [drop + 28, [200, ys[index] + 10]], [drop + 36, [200, ys[index] - 4]], [drop + 45, [200, ys[index]]],
        [lift, [200, ys[index]]], [lift + 8, [200, ys[index] + 5]], [lift + 40, start], [LAST_FRAME, start],
      ]).k,
      opacity: animated([[0, 0], [drop, 0], [drop + 6, 100], [lift + 24, 100], [lift + 36, 0], [LAST_FRAME, 0]]).k,
    }));
  });
  return composition(layers);
}

// A love of learning: cubes fly in from alternating sides in spinning arcs and
// land with squash and stretch, the finished tower does a happy bounce wave,
// then the cubes tumble off from the top one at a time.
function tower() {
  const layers = [shapeLayer("Ground", [group(rectangle([270, 12], 6), palette.ink)], { position: [200, 330] })];
  const sizes = [88, 70, 54, 38];
  const ys = [280, 201, 139, 93];
  const colours = [palette.deep, palette.coral, palette.sun, palette.ink];
  sizes.forEach((size, index) => {
    const side = index % 2 ? 1 : -1;
    const home = [200, ys[index]];
    const start = [200 + side * 250, ys[index] - 150];
    const peak = [200 + side * 90, ys[index] - 120];
    const land = 34 + index * 26;
    const bounce = 150 + index * 7;
    const leave = 212 + (3 - index) * 12;
    const flung = [200 - side * 240, ys[index] - 170];
    // Squash anchored at the cube's base so it compresses into the cube below.
    layers.push(shapeLayer(`Cube ${index + 1}`, [group(rectangle([size, size], 8), colours[index], [0, -size / 2])], {
      position: animated([
        [0, start], [land - 26, start], [land - 12, peak], [land, [home[0], home[1] + size / 2]], [land + 60, [home[0], home[1] + size / 2]],
        [bounce, [home[0], home[1] + size / 2]], [bounce + 8, [home[0], home[1] + size / 2 - 22]], [bounce + 18, [home[0], home[1] + size / 2]],
        [leave, [home[0], home[1] + size / 2]], [leave + 8, [home[0], home[1] + size / 2 - 18]], [leave + 30, flung], [LAST_FRAME, start],
      ].map(([t, [x, y]]) => [t, [x, y]])).k,
      rotation: animated([[0, side * -200], [land - 26, side * -200], [land, 0], [bounce + 8, side * 5], [bounce + 18, 0], [leave, 0], [leave + 30, side * 220], [LAST_FRAME, side * -200]]).k,
      scale: animated([
        [0, [100, 100]], [land, [100, 100]], [land + 4, [124, 74]], [land + 10, [92, 110]], [land + 16, [100, 100]],
        [bounce, [100, 100]], [bounce + 4, [114, 86]], [bounce + 10, [94, 108]], [bounce + 18, [104, 94]], [bounce + 24, [100, 100]],
        [leave, [100, 100]], [leave + 4, [116, 84]], [leave + 12, [96, 104]], [LAST_FRAME, [100, 100]],
      ]).k,
      opacity: animated([[0, 0], [land - 26, 0], [land - 20, 100], [leave + 22, 100], [leave + 30, 0], [LAST_FRAME, 0]]).k,
    }));
  });
  return composition(layers);
}

const quarterPath = (quadrant, radius = 92) => {
  const signs = [[-1, -1], [1, -1], [1, 1], [-1, 1]][quadrant];
  const [sx, sy] = signs;
  const vertices = [[0, 0], [sx * radius, 0], [0, sy * radius]];
  const handle = radius * 0.5523;
  return path(vertices, [[0, 0], [0, 0], [sx * handle, 0]], [[0, 0], [0, sy * handle], [0, 0]], true);
};

const nullLayer = (name, options = {}) => ({
  ddd: 0, ind: ++layerIndex, ty: 3, nm: name, sr: 1, ks: transform(options), ao: 0,
  ip: 0, op: OUT_FRAME, st: 0, bm: 0,
});
const rotate = ([x, y], degrees) => {
  const r = (degrees * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};
const round = ([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10];

// Learning the whole concept: quarters spiral in and snap together, the whole
// circle turns like a wheel with a springy pulse, then bursts apart spinning.
function puzzle() {
  const hub = nullLayer("Hub", {
    position: [200, 200],
    rotation: animated([[0, 0], [118, 0], [150, 100], [162, 84], [176, 90], [188, 90], [206, 186], [214, 176], [222, 180], [250, 180], [262, 0], [LAST_FRAME, 0]]).k,
    scale: animated([[0, [100, 100]], [104, [100, 100]], [112, [112, 112]], [120, [94, 94]], [128, [102, 102]], [134, [100, 100]], [226, [100, 100]], [232, [90, 90]], [238, [106, 106]], [LAST_FRAME, [100, 100]]]).k,
  });
  const directions = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, y]) => [x / Math.SQRT2, y / Math.SQRT2]);
  const colours = [palette.ink, palette.coral, palette.sun, palette.deep];
  const layers = directions.map((direction, index) => {
    const start = round(rotate([direction[0] * 150, direction[1] * 150], -100));
    const swirl = round(rotate([direction[0] * 78, direction[1] * 78], -45));
    const burst = round(rotate([direction[0] * 150, direction[1] * 150], 35));
    const arrive = 58 + index * 9;
    return {
      ...shapeLayer(`Quarter ${index + 1}`, [group(quarterPath(index), colours[index])], {
        position: animated([[0, start], [arrive - 40, start], [arrive - 16, swirl], [arrive, [0, 0]], [238, [0, 0]], [264, burst], [LAST_FRAME, start]]).k,
        rotation: animated([[0, -120], [arrive - 40, -120], [arrive, 0], [238, 0], [264, 140], [LAST_FRAME, -120]]).k,
        scale: animated([[0, [40, 40]], [arrive - 40, [40, 40]], [arrive - 2, [108, 108]], [arrive + 6, [95, 95]], [arrive + 12, [100, 100]], [238, [100, 100]], [264, [55, 55]], [LAST_FRAME, [40, 40]]]).k,
        opacity: animated([[0, 0], [arrive - 40, 0], [arrive - 30, 100], [246, 100], [264, 0], [LAST_FRAME, 0]]).k,
      }),
      parent: hub.ind,
    };
  });
  return composition([hub, ...layers]);
}

// Language and mathematics: beads pop in one at a time as if being counted,
// landing with squash and stretch, then a counting wave ripples diagonally
// through the staircase before it cascades away.
function beads() {
  const colours = [palette.ink, palette.coral, palette.deep, palette.blue, palette.ink];
  const layers = [];
  for (let row = 0; row < 5; row += 1) {
    for (let bead = 0; bead <= row; bead += 1) {
      const home = [124 + bead * 38, 100 + row * 48];
      const above = [home[0], home[1] - 44];
      const land = 10 + row * 15 + bead * 5;
      const wave = 132 + (row + bead) * 6;
      const exit = 208 + (4 - row) * 7 + bead * 3;
      const away = [home[0] + 46, home[1] + 70];
      layers.push(shapeLayer(`Bead ${row + 1}.${bead + 1}`, [group(ellipse([30, 30]), colours[row])], {
        position: animated([
          [0, above], [land, above], [land + 10, [home[0], home[1] + 4]], [land + 16, home],
          [wave, home], [wave + 7, [home[0], home[1] - 16]], [wave + 15, home],
          [exit, home], [exit + 6, [home[0] - 6, home[1] - 8]], [exit + 26, away], [LAST_FRAME, above],
        ]).k,
        scale: animated([
          [0, [0, 0]], [land, [0, 0]], [land + 8, [118, 118]], [land + 11, [122, 80]], [land + 15, [94, 108]], [land + 20, [100, 100]],
          [wave, [100, 100]], [wave + 7, [124, 124]], [wave + 15, [100, 100]],
          [exit, [100, 100]], [exit + 26, [0, 0]], [LAST_FRAME, [0, 0]],
        ]).k,
      }));
    }
  }
  return composition(layers);
}

const animations = { rings: rings(), tower: tower(), puzzle: puzzle(), beads: beads() };

function assertSeamless(value, trail = "root") {
  if (value && typeof value === "object") {
    if (value.a === 1 && Array.isArray(value.k) && value.k.length > 1 && "s" in value.k[0]) {
      const first = JSON.stringify(value.k[0].s);
      const last = JSON.stringify(value.k.at(-1).s);
      if (first !== last) throw new Error(`${trail} does not return to its first value`);
    }
    Object.entries(value).forEach(([key, child]) => assertSeamless(child, `${trail}.${key}`));
  }
}

await mkdir(OUTPUT, { recursive: true });
for (const [name, data] of Object.entries(animations)) {
  assertSeamless(data, name);
  const json = `${JSON.stringify(data)}\n`;
  if (Buffer.byteLength(json) >= 45_000) throw new Error(`${name}.json is 45KB or larger`);
  await writeFile(join(OUTPUT, `${name}.json`), json);
  console.log(`wrote ${name}.json (${Buffer.byteLength(json)} bytes)`);
}
