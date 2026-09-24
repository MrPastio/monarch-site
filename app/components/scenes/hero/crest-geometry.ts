/**
 * 3D crest geometry, refined from the owner-approved Grok model
 * (1:1 trace of the official Monarch artwork → extruded solids).
 *
 * Refinements over the source model:
 * - cleaned polygons (straight edges straight, node holes true circles);
 * - rounded, multi-segment bevels with creased normals, so bevels catch
 *   light smoothly while hard corners stay hard;
 * - the crest is split into the parts it is made of — core plate, shield,
 *   circuit trunk and crown — so it can assemble piece by piece.
 */
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import crestData from "@/assets/crest-paths.json";

type Ring = number[][];
type Part = { outer: Ring; holes: Ring[] };
type CrestData = {
  size: number;
  white: Part[];
  gold: Part[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
};

const DATA = crestData as CrestData;

export type CrestGeometry = {
  core: THREE.BufferGeometry;
  shield: THREE.BufferGeometry;
  trunk: THREE.BufferGeometry;
  crown: THREE.BufferGeometry;
  /** Depth of the enamel face, used to place the parts. */
  layers: { core: number; shield: number; trunk: number; crown: number };
  height: number;
  width: number;
  /** Y of the trunk's lowest and highest node, in model space. */
  trunkSpan: [number, number];
};

function signedArea(points: [number, number][]) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]!;
    const [x2, y2] = points[(i + 1) % points.length]!;
    area += x1 * y2 - x2 * y1;
  }
  return area / 2;
}

function toShape(part: Part, map: (x: number, y: number) => [number, number]) {
  const ring = (points: Ring, ccw: boolean) => {
    let mapped = points.map(([x, y]) => map(x!, y!));
    if (signedArea(mapped) > 0 !== ccw) mapped = mapped.reverse();
    return mapped;
  };
  const outline = ring(part.outer, true);
  const shape = new THREE.Shape(outline.map(([x, y]) => new THREE.Vector2(x, y)));
  for (const hole of part.holes) {
    shape.holes.push(new THREE.Path(ring(hole, false).map(([x, y]) => new THREE.Vector2(x, y))));
  }
  return shape;
}

function solid(shape: THREE.Shape, depth: number, bevel: number) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel * 0.72,
    bevelOffset: 0,
    bevelSegments: 5,
    curveSegments: 1,
    steps: 1,
  });
  // Smooth across bevel segments and along curves; keep real corners crisp.
  const creased = toCreasedNormals(geometry, THREE.MathUtils.degToRad(38));
  geometry.dispose();
  creased.computeBoundingBox();
  creased.computeBoundingSphere();
  return creased;
}

export function buildCrestGeometry(): CrestGeometry {
  const { minX, minY, maxX, maxY } = DATA.bounds;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const scale = 2.6 / (maxY - minY);
  const map = (x: number, y: number): [number, number] => [(x - cx) * scale, -(y - cy) * scale];

  const [shieldPart, trunkPart] = DATA.white as [Part, Part];
  const bevel = 0.011;
  const layers = { core: 0.12, shield: 0.2, trunk: 0.23, crown: 0.19 };

  // The core is the shield's own outline, pulled a hair inside the enamel so
  // it only shows through the cut-outs — the black of the artwork.
  const coreShape = toShape({ outer: shieldPart.outer, holes: [] }, (x, y) => {
    const [mx, my] = map(x, y);
    return [mx * 0.992, my * 0.992];
  });

  const core = solid(coreShape, layers.core, 0.004);
  const shield = solid(toShape(shieldPart, map), layers.shield, bevel);
  const trunk = solid(toShape(trunkPart, map), layers.trunk, bevel);
  const crown = solid(
    toShape(
      { outer: DATA.gold[0]!.outer, holes: DATA.gold.flatMap((part) => part.holes) },
      map,
    ),
    layers.crown,
    bevel,
  );

  trunk.computeBoundingBox();
  const trunkBox = trunk.boundingBox!;

  return {
    core,
    shield,
    trunk,
    crown,
    layers,
    height: 2.6,
    width: (maxX - minX) * scale,
    trunkSpan: [trunkBox.min.y, trunkBox.max.y],
  };
}
