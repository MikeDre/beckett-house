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

function tower() {
  const layers = [shapeLayer("Ground", [group(rectangle([270, 12], 6), palette.ink)], { position: [200, 330] })];
  const sizes = [88, 70, 54, 38];
  const ys = [280, 201, 139, 93];
  const colours = [palette.deep, palette.coral, palette.sun, palette.ink];
  sizes.forEach((size, index) => {
    const start = [200, -54 - index * 10];
    const drop = 18 + index * 27;
    layers.push(shapeLayer(`Cube ${index + 1}`, [group(rectangle([size, size], 8), colours[index])], {
      position: animated([
        [0, start], [drop, start], [drop + 25, [200, ys[index] + 8]], [drop + 33, [200, ys[index] - 4]], [drop + 42, [200, ys[index]]],
        [200, [200, ys[index]]], [214, [200, ys[index] - 7]], [254, [200, ys[index] - 92]], [276, start], [LAST_FRAME, start],
      ]).k,
      rotation: animated([[0, 0], [150, 0], [162, index % 2 ? -2.4 : 2.4], [176, index % 2 ? 1.2 : -1.2], [190, 0], [LAST_FRAME, 0]]).k,
      opacity: animated([[0, 0], [drop, 0], [drop + 5, 100], [242, 100], [270, 0], [LAST_FRAME, 0]]).k,
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

function puzzle() {
  const offsets = [[-70, -70], [70, -70], [70, 70], [-70, 70]];
  const colours = [palette.ink, palette.coral, palette.sun, palette.deep];
  const layers = offsets.map((offset, index) => {
    const separated = [200 + offset[0], 200 + offset[1]];
    return shapeLayer(`Quarter ${index + 1}`, [group(quarterPath(index), colours[index])], {
      position: animated([[0, separated], [18 + index * 7, separated], [88 + index * 7, [200, 200]], [208, [200, 200]], [278 - index * 5, separated], [LAST_FRAME, separated]]).k,
      scale: animated([[0, [100, 100]], [140, [100, 100]], [156, [108, 108]], [174, [100, 100]], [LAST_FRAME, [100, 100]]]).k,
      rotation: animated([[0, index % 2 ? 7 : -7], [96 + index * 5, 0], [208, 0], [278 - index * 5, index % 2 ? 7 : -7], [LAST_FRAME, index % 2 ? 7 : -7]]).k,
    });
  });
  return composition(layers);
}

function beads() {
  const colours = [palette.ink, palette.coral, palette.deep, palette.blue, palette.ink];
  const layers = [];
  for (let row = 0; row < 5; row += 1) {
    const count = row + 1;
    const shapes = Array.from({ length: count }, (_, bead) => group(ellipse([30, 30]), colours[row], [bead * 38, 0]));
    const final = [124, 100 + row * 48];
    const dropped = [124, final[1] + 54];
    const rise = 18 + row * 20;
    const fall = 218 + row * 9;
    layers.push(shapeLayer(`Bead bar ${count}`, shapes, {
      position: animated([[0, dropped], [rise, dropped], [rise + 24, [124, final[1] - 6]], [rise + 34, final], [fall, final], [fall + 32, dropped], [LAST_FRAME, dropped]]).k,
      opacity: animated([[0, 0], [rise, 0], [rise + 7, 100], [fall + 14, 100], [fall + 31, 0], [LAST_FRAME, 0]]).k,
      scale: animated([[0, [88, 88]], [rise + 24, [104, 104]], [rise + 36, [100, 100]], [LAST_FRAME, [88, 88]]]).k,
    }));
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
  if (Buffer.byteLength(json) >= 30_000) throw new Error(`${name}.json is 30KB or larger`);
  await writeFile(join(OUTPUT, `${name}.json`), json);
  console.log(`wrote ${name}.json (${Buffer.byteLength(json)} bytes)`);
}
