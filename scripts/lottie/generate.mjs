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
const polygon = (points, radius) => ({
  ty: "sr", sy: 2, d: 1, pt: fixed(points), p: fixed([0, 0]), r: fixed(0), or: fixed(radius), os: fixed(0), ir: fixed(0), is: fixed(0), nm: "Polygon",
});
const star = (points, outerRadius, innerRadius) => ({
  ty: "sr", sy: 1, d: 1, pt: fixed(points), p: fixed([0, 0]), r: fixed(0), or: fixed(outerRadius), os: fixed(8), ir: fixed(innerRadius), is: fixed(5), nm: "Star",
});
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

const k = (frames) => animated(frames).k;
const child = (layer, parent) => ({ ...layer, parent: parent.ind });
const plus = ([x, y], [dx, dy]) => [x + dx, y + dy];

// Individual attention: rings are tossed onto the stacker from alternating
// sides, a ball tops it off, the stacker wiggles happily, then it all flies off.
function rings() {
  const hub = nullLayer("Stacker", {
    position: [200, 318],
    rotation: k([[0, 0], [174, 0], [182, -7], [192, 6], [202, -3], [212, 0], [LAST_FRAME, 0]]),
  });
  const rel = ([x, y]) => [x - 200, y - 318];
  const widths = [226, 184, 142, 102];
  const ys = [292, 256, 220, 184];
  const colours = [palette.ink, palette.deep, palette.coral, palette.blue];
  const topperStart = rel([200, -60]);
  const topperHome = rel([200, 113]);
  const topper = child(shapeLayer("Topper", [group(ellipse([44, 44]), palette.white)], {
    position: k([[0, topperStart], [122, topperStart], [140, plus(topperHome, [0, 3])], [146, plus(topperHome, [0, -14])], [154, topperHome],
      [222, topperHome], [230, plus(topperHome, [0, 6])], [250, rel([200, -90])], [LAST_FRAME, topperStart]]),
    scale: k([[0, [100, 100]], [140, [100, 100]], [143, [122, 76]], [150, [94, 108]], [156, [100, 100]], [222, [100, 100]], [228, [112, 86]], [236, [100, 100]], [LAST_FRAME, [100, 100]]]),
    opacity: k([[0, 0], [122, 0], [126, 100], [244, 100], [250, 0], [LAST_FRAME, 0]]),
  }), hub);
  const ringLayers = widths.map((width, index) => {
    const side = index % 2 ? 1 : -1;
    const gap = 28;
    const half = (width - gap) / 2;
    const x = gap / 2 + half / 2;
    const home = rel([200, ys[index]]);
    const start = rel([200 + side * 260, ys[index] - 150]);
    const peak = rel([200 + side * 100, ys[index] - 170]);
    const land = 26 + index * 26;
    const leave = 232 + (3 - index) * 8;
    const flung = rel([200 - side * 150, -90]);
    return child(shapeLayer(`Ring ${index + 1}`, [
      group(rectangle([half, 28], 14), colours[index], [-x, 0]),
      group(rectangle([half, 28], 14), colours[index], [x, 0]),
    ], {
      position: k([[0, start], [land - 24, start], [land - 12, peak], [land, plus(home, [0, 6])], [land + 6, plus(home, [0, -4])], [land + 12, home],
        [leave, home], [leave + 8, plus(home, [0, 8])], [leave + 30, flung], [LAST_FRAME, start]]),
      rotation: k([[0, side * -200], [land - 24, side * -200], [land, 0], [leave + 8, 0], [leave + 30, side * 180], [LAST_FRAME, side * -200]]),
      scale: k([[0, [100, 100]], [land, [100, 100]], [land + 4, [114, 78]], [land + 10, [95, 108]], [land + 16, [100, 100]],
        [leave, [100, 100]], [leave + 6, [108, 86]], [leave + 14, [100, 100]], [LAST_FRAME, [100, 100]]]),
      opacity: k([[0, 0], [land - 24, 0], [land - 18, 100], [leave + 22, 100], [leave + 30, 0], [LAST_FRAME, 0]]),
    }), hub);
  }).reverse();
  const peg = child(shapeLayer("Peg", [group(rectangle([18, 190], 9), palette.deep)], { position: rel([200, 226]) }), hub);
  const base = shapeLayer("Base", [group(rectangle([270, 30], 15), palette.ink)], { position: [200, 324] });
  return composition([hub, topper, ...ringLayers, peg, base]);
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
        [0, start], [land - 26, start], [land - 12, peak], [land, [home[0], home[1] + size / 2]], [land + 30, [home[0], home[1] + size / 2]],
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

// Family-run since 1996: a house assembles with bouncy landings, then a family
// of three hops in beside it and does a group hop before everything pops away.
function family() {
  const ground = 326;
  const members = [
    { r: 13, colour: palette.sun, x: 330 },
    { r: 19, colour: palette.coral, x: 292 },
    { r: 25, colour: palette.ink, x: 246 },
  ];
  const memberLayers = members.map(({ r, colour, x }, index) => {
    const order = 2 - index; // tallest arrives first
    const y = ground - r;
    const arrive = 104 + order * 16;
    const start = [460, y - 40];
    const hop = 168 + order * 9;
    const hop2 = 198 + order * 6;
    const exit = 226 + order * 5;
    return shapeLayer(`Family ${order + 1}`, [group(ellipse([r * 2, r * 2]), colour)], {
      position: k([[0, start], [arrive - 22, start], [arrive - 10, [(x + 460) / 2, y - 90]], [arrive, [x, y]],
        [hop, [x, y]], [hop + 9, [x, y - 36]], [hop + 18, [x, y]], [hop2, [x, y]], [hop2 + 7, [x, y - 16]], [hop2 + 14, [x, y]], [LAST_FRAME, start]]),
      scale: k([[0, [100, 100]], [arrive, [100, 100]], [arrive + 3, [120, 78]], [arrive + 8, [94, 108]], [arrive + 13, [100, 100]],
        [hop + 18, [100, 100]], [hop + 21, [114, 86]], [hop + 26, [100, 100]], [exit, [100, 100]], [exit + 5, [118, 118]], [exit + 14, [0, 0]], [LAST_FRAME, [100, 100]]]),
      opacity: k([[0, 0], [arrive - 22, 0], [arrive - 18, 100], [exit + 12, 100], [exit + 14, 0], [LAST_FRAME, 0]]),
    });
  });
  const windowLayer = shapeLayer("Window", [group(ellipse([30, 30]), palette.sun)], {
    position: [112, 268],
    scale: k([[0, [0, 0]], [70, [0, 0]], [78, [120, 120]], [83, [94, 94]], [88, [100, 100]], [238, [100, 100]], [243, [115, 115]], [252, [0, 0]], [LAST_FRAME, [0, 0]]]),
  });
  const door = shapeLayer("Door", [group(rectangle([30, 48], 8), palette.coral, [0, -24])], {
    position: [168, ground],
    scale: k([[0, [100, 0]], [78, [100, 0]], [88, [100, 114]], [94, [100, 96]], [100, [100, 100]], [238, [100, 100]], [252, [100, 0]], [LAST_FRAME, [100, 0]]]),
  });
  const roofStart = [140, -110];
  const roof = shapeLayer("Roof", [group(polygon(3, 80), palette.ink)], {
    position: k([[0, roofStart], [34, roofStart], [54, [140, 190]], [60, [140, 180]], [66, [140, 186]], [244, [140, 186]], [250, [140, 176]], [262, [140, 186]], [LAST_FRAME, roofStart]]),
    rotation: k([[0, -35], [34, -35], [54, 4], [60, -3], [66, 0], [262, 0], [LAST_FRAME, -35]]),
    scale: k([[0, [100, 100]], [244, [100, 100]], [250, [112, 112]], [262, [0, 0]], [LAST_FRAME, [100, 100]]]),
    opacity: k([[0, 0], [34, 0], [38, 100], [260, 100], [262, 0], [LAST_FRAME, 0]]),
  });
  const bodyStart = [140, -120];
  const body = shapeLayer("House", [group(rectangle([120, 100], 8), palette.deep, [0, -50])], {
    position: k([[0, bodyStart], [8, bodyStart], [28, [140, ground]], [248, [140, ground]], [LAST_FRAME, bodyStart]]),
    scale: k([[0, [100, 100]], [28, [100, 100]], [32, [118, 78]], [38, [94, 108]], [44, [100, 100]], [248, [100, 100]], [254, [110, 110]], [266, [0, 0]], [LAST_FRAME, [100, 100]]]),
    opacity: k([[0, 0], [8, 0], [12, 100], [264, 100], [266, 0], [LAST_FRAME, 0]]),
  });
  const floor = shapeLayer("Ground", [group(rectangle([310, 8], 4), palette.ink)], { position: [200, ground + 4] });
  return composition([...memberLayers, windowLayer, door, roof, body, floor]);
}

// Montessori accredited (Angel): a rosette spins in, ribbon tails unfurl and
// swing, a tick pops in, the badge celebrates, then spins away.
function badge() {
  const hub = nullLayer("Badge", {
    position: [200, 170],
    scale: k([[0, [0, 0]], [12, [0, 0]], [36, [116, 116]], [46, [94, 94]], [54, [100, 100]], [150, [100, 100]], [158, [112, 112]], [166, [96, 96]], [172, [100, 100]],
      [236, [100, 100]], [244, [108, 108]], [262, [0, 0]], [LAST_FRAME, [0, 0]]]),
    rotation: k([[0, -200], [12, -200], [40, 0], [150, 0], [158, -10], [166, 8], [174, -4], [182, 0], [244, 0], [262, 160], [LAST_FRAME, -200]]),
  });
  const tick = child(shapeLayer("Tick", [
    group(rectangle([18, 46], 9), palette.white, [-17, 10], -45),
    group(rectangle([18, 88], 9), palette.white, [22, -9], 40),
  ], {
    scale: k([[0, [0, 0]], [58, [0, 0]], [68, [98, 98]], [74, [74, 74]], [80, [80, 80]], [226, [80, 80]], [234, [0, 0]], [LAST_FRAME, [0, 0]]]),
  }), hub);
  const centre = child(shapeLayer("Centre", [group(ellipse([140, 140]), palette.ink)]), hub);
  const rosette = child(shapeLayer("Rosette", [group(star(16, 106, 92), palette.deep)]), hub);
  const tail = (side) => shapeLayer(`Tail ${side < 0 ? "left" : "right"}`, [group(rectangle([36, 100], 8), palette.coral, [0, 50])], {
    position: [200 + side * 20, 230],
    scale: k([[0, [100, 0]], [46, [100, 0]], [60, [100, 110]], [68, [100, 100]], [226, [100, 100]], [238, [100, 0]], [LAST_FRAME, [100, 0]]]),
    rotation: k([[0, -side * 20], [60, -side * 20], [74, -side * 34], [90, -side * 10], [104, -side * 27], [118, -side * 16], [132, -side * 22], [146, -side * 20], [LAST_FRAME, -side * 20]]),
  });
  return composition([hub, tick, centre, rosette, tail(-1), tail(1)]);
}

// Funded places available: coins drop onto three stacks with squashy landings,
// a bounce wave runs across the stacks, then the coins tumble off.
function coins() {
  const stacks = [118, 200, 282];
  const counts = [2, 3, 4];
  const drops = [];
  for (let level = 0; level < 4; level += 1) {
    stacks.forEach((x, stack) => { if (level < counts[stack]) drops.push({ stack, level, x }); });
  }
  const layers = drops.map(({ stack, level, x }, order) => {
    const y = 314 - level * 15;
    const start = [x, -40];
    const land = 22 + order * 12;
    const wave = 150 + stack * 10;
    const exit = 224 + (counts[stack] - 1 - level) * 6 + stack * 4;
    return {
      level,
      layer: shapeLayer(`Coin ${stack + 1}.${level + 1}`, [
        group(ellipse([84, 28]), palette.sun, [0, -5]),
        group(ellipse([84, 28]), palette.deep, [0, 4]),
      ], {
        position: k([[0, start], [land - 18, start], [land, [x, y]], [land + 5, [x, y - 7]], [land + 10, [x, y]],
          [wave, [x, y]], [wave + 9, [x, y - 26]], [wave + 18, [x, y]], [exit, [x, y]], [exit + 8, [x + 8, y - 22]], [exit + 30, [x + 150, y + 40]], [LAST_FRAME, start]]),
        rotation: k([[0, 0], [exit + 8, 0], [exit + 30, 70], [LAST_FRAME, 0]]),
        scale: k([[0, [100, 100]], [land, [100, 100]], [land + 3, [112, 78]], [land + 8, [96, 106]], [land + 12, [100, 100]],
          [wave, [100, 100]], [wave + 4, [106, 90]], [wave + 9, [98, 104]], [wave + 18, [100, 100]], [LAST_FRAME, [100, 100]]]),
        opacity: k([[0, 0], [land - 18, 0], [land - 14, 100], [exit + 24, 100], [exit + 30, 0], [LAST_FRAME, 0]]),
      }),
    };
  }).sort((a, b) => b.level - a.level).map(({ layer }) => layer);
  const floor = shapeLayer("Ground", [group(rectangle([300, 8], 4), palette.ink)], { position: [200, 334] });
  return composition([...layers, floor]);
}

// Montessori accredited (Abbey Road): a medal drops in on its ribbon and
// swings to rest, its star spins while sparkles twinkle, then it's pulled up.
function medal() {
  const hub = nullLayer("Medal", {
    position: k([[0, [200, -330]], [10, [200, -330]], [36, [200, 34]], [42, [200, 22]], [48, [200, 30]], [232, [200, 30]], [240, [200, 40]], [264, [200, -330]], [LAST_FRAME, [200, -330]]]),
    rotation: k([[0, 0], [48, 0], [60, 16], [76, -12], [92, 8], [106, -5], [120, 2], [132, 0], [LAST_FRAME, 0]]),
  });
  const centre = [200, 220];
  const sparkleAngles = [-150, -100, -40, 20, 70, 140];
  const sparkles = sparkleAngles.map((angle, index) => {
    const at = round(plus(centre, rotate([118, 0], angle)));
    const twinkle = 150 + index * 10;
    return shapeLayer(`Sparkle ${index + 1}`, [group(star(4, 18, 5), index % 2 ? palette.white : palette.sun)], {
      position: at,
      scale: k([[0, [0, 0]], [twinkle, [0, 0]], [twinkle + 8, [110, 110]], [twinkle + 18, [0, 0]], [twinkle + 40, [0, 0]], [twinkle + 48, [80, 80]], [twinkle + 58, [0, 0]], [LAST_FRAME, [0, 0]]]),
      rotation: k([[0, 0], [twinkle, 0], [twinkle + 58, 90], [LAST_FRAME, 0]]),
    });
  });
  const medalStar = child(shapeLayer("Star", [group(star(5, 38, 16), palette.sun)], {
    position: [0, 190],
    rotation: k([[0, 0], [140, 0], [176, 360], [200, 360], [201, 0], [LAST_FRAME, 0]]),
    scale: k([[0, [100, 100]], [140, [100, 100]], [158, [135, 135]], [176, [100, 100]], [LAST_FRAME, [100, 100]]]),
  }), hub);
  const inner = child(shapeLayer("Inner", [group(ellipse([104, 104]), palette.ink)], { position: [0, 190] }), hub);
  const disc = child(shapeLayer("Disc", [group(ellipse([136, 136]), palette.sun)], { position: [0, 190] }), hub);
  const ribbons = child(shapeLayer("Ribbon", [
    group(rectangle([28, 134], 4), palette.coral, [-20, 62], 16),
    group(rectangle([28, 134], 4), palette.deep, [20, 62], -16),
  ]), hub);
  return composition([hub, ...sparkles, medalStar, inner, disc, ribbons]);
}

// Open 50 weeks a year: a sun with spinning rays rises in an arc and sets,
// lighting up a row of week dots as it passes.
function sun() {
  const hub = nullLayer("Sun", {
    position: k([[0, [86, 300]], [18, [86, 300]], [60, [120, 214]], [104, [164, 162]], [150, [200, 148]], [196, [236, 162]], [240, [280, 214]], [262, [314, 300]], [LAST_FRAME, [86, 300]]]),
    scale: k([[0, [0, 0]], [18, [0, 0]], [34, [118, 118]], [44, [96, 96]], [52, [100, 100]], [244, [100, 100]], [262, [0, 0]], [LAST_FRAME, [0, 0]]]),
  });
  const disc = child(shapeLayer("Disc", [group(ellipse([78, 78]), palette.sun)]), hub);
  const rays = child(shapeLayer("Rays", Array.from({ length: 8 }, (_, index) => {
    const angle = index * 45;
    return group(rectangle([12, 26], 6), palette.deep, round(rotate([0, -60], angle)), angle);
  }), {
    rotation: k([[0, 0], [18, 0], [262, 300], [LAST_FRAME, 0]]),
    scale: k([[0, [100, 100]], [120, [100, 100]], [140, [118, 118]], [160, [100, 100]], [LAST_FRAME, [100, 100]]]),
  }), hub);
  const horizon = shapeLayer("Horizon", [group(rectangle([300, 8], 4), palette.ink)], { position: [200, 304] });
  const lit = Array.from({ length: 7 }, (_, index) => {
    const on = 58 + index * 26;
    const off = 268 + index * 3;
    return shapeLayer(`Week ${index + 1} lit`, [group(ellipse([24, 24]), palette.sun)], {
      position: [110 + index * 30, 344],
      scale: k([[0, [0, 0]], [on, [0, 0]], [on + 8, [124, 124]], [on + 14, [100, 100]], [off, [100, 100]], [off + 10, [0, 0]], [LAST_FRAME, [0, 0]]]),
    });
  });
  const weeks = shapeLayer("Weeks", Array.from({ length: 7 }, (_, index) => group(ellipse([16, 16]), palette.deep, [-90 + index * 30, 0])), { position: [200, 344] });
  return composition([hub, horizon, disc, rays, ...lit, weeks]);
}

// 15 or 30 funded hours: bars grow in, a ball bounces from bar to bar with
// squashy landings, celebrates on the tallest, then hops up and pops.
function hours() {
  const xs = [120, 200, 280];
  const heights = [80, 124, 168];
  const colours = [palette.deep, palette.coral, palette.ink];
  const landings = [[84], [110], [136, 162, 186, 212]];
  const bars = xs.map((x, index) => {
    const h = heights[index];
    const grow = 14 + index * 18;
    const shrink = 226 + index * 8;
    const squash = landings[index].flatMap((t) => [[t, [100, 100]], [t + 4, [106, 90]], [t + 10, [100, 100]]]);
    return shapeLayer(`Bar ${index + 1}`, [group(rectangle([52, h], 10), colours[index], [0, -h / 2])], {
      position: [x, 316],
      scale: k([[0, [100, 0]], [grow, [100, 0]], [grow + 16, [100, 112]], [grow + 22, [100, 96]], [grow + 28, [100, 100]], ...squash,
        [shrink, [100, 100]], [shrink + 16, [100, 0]], [LAST_FRAME, [100, 0]]]),
    });
  });
  const top = (index) => 316 - heights[index] - 20;
  const ball = shapeLayer("Ball", [group(ellipse([40, 40]), palette.sun)], {
    position: k([[0, [120, 60]], [66, [120, 60]], [84, [120, top(0)]], [97, [160, top(1) - 70]], [110, [200, top(1)]], [123, [240, top(2) - 70]], [136, [280, top(2)]],
      [150, [280, top(2) - 40]], [162, [280, top(2)]], [176, [280, top(2) - 24]], [186, [280, top(2)]], [212, [280, top(2)]], [232, [280, 44]], [LAST_FRAME, [120, 60]]]),
    scale: k([[0, [0, 0]], [66, [0, 0]], [74, [100, 100]], [84, [100, 100]], [87, [118, 82]], [92, [100, 100]], [110, [100, 100]], [113, [118, 82]], [118, [100, 100]],
      [136, [100, 100]], [139, [118, 82]], [144, [100, 100]], [162, [100, 100]], [165, [114, 86]], [170, [100, 100]], [186, [100, 100]], [189, [114, 86]], [194, [100, 100]],
      [212, [100, 100]], [216, [112, 88]], [222, [100, 100]], [232, [126, 126]], [238, [0, 0]], [LAST_FRAME, [0, 0]]]),
  });
  const burst = Array.from({ length: 6 }, (_, index) => {
    const direction = rotate([0, -1], index * 60);
    const from = [280, 44];
    return shapeLayer(`Burst ${index + 1}`, [group(ellipse([12, 12]), index % 2 ? palette.white : palette.sun)], {
      position: k([[0, from], [236, from], [254, round(plus(from, [direction[0] * 46, direction[1] * 46]))], [LAST_FRAME, from]]),
      scale: k([[0, [0, 0]], [236, [0, 0]], [240, [110, 110]], [254, [0, 0]], [LAST_FRAME, [0, 0]]]),
    });
  });
  const baseline = shapeLayer("Baseline", [group(rectangle([290, 10], 5), palette.ink)], { position: [200, 321] });
  return composition([...burst, ball, ...bars, baseline]);
}

const animations = {
  rings: rings(), tower: tower(), puzzle: puzzle(), beads: beads(),
  family: family(), badge: badge(), coins: coins(), medal: medal(), sun: sun(), hours: hours(),
};

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
