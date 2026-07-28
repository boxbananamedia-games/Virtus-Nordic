/**
 * Split the optimised colour models into shared geometry + per-colour textures.
 *
 * Geometry is 83% of each packed file (0.60MB of 0.73MB), so shipping five
 * standalone models wastes most of 3.65MB in the hero's critical path.
 *
 * The raw exports contain two distinct meshes, but welding, simplification and
 * quantisation collapse them into ONE: they were the same base model differing
 * only at float precision. So the output is:
 *
 *   geo-a.glb                   a single mesh, textures stripped
 *   tex/<colour>/{...}.jpg      the three maps for each colour, as loose files
 *
 * Total 0.99MB for all five finishes. Sharing is only valid because UV layouts
 * match, which step 1 verifies by hashing post-optimisation geometry rather
 * than assuming the simplifier treated every input the same way — if a future
 * export genuinely differs it will emit a second geometry file instead.
 */
import { NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from "@gltf-transform/extensions";
import { prune } from "@gltf-transform/functions";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync, statSync } from "node:fs";

const OPT = "D:/Alex/VirtusNordic/Virtus-Nordic/art-source/opt";
const OUT = "D:/Alex/VirtusNordic/Virtus-Nordic/app/public/lab-models/shared";

/** Grouping established by hashing the ORIGINAL geometry buffers. */
const GROUPS = { a: ["copper", "graphite"], b: ["green", "silver", "navy"] };

const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const sha = (b) => createHash("sha1").update(Buffer.from(b)).digest("hex").slice(0, 12);

const geoHash = (doc) => {
  const prim = doc.getRoot().listMeshes()[0].listPrimitives()[0];
  const parts = [prim.getIndices(), ...prim.listAttributes()]
    .filter(Boolean)
    .map((a) => Buffer.from(a.getArray().buffer, a.getArray().byteOffset, a.getArray().byteLength));
  return sha(Buffer.concat(parts));
};

mkdirSync(OUT, { recursive: true });
const docs = {};
for (const name of Object.values(GROUPS).flat()) docs[name] = await io.read(`${OPT}/${name}.glb`);

/* ── 1. derive the real grouping from the OPTIMISED geometry ─────────────
   The raw exports contained two distinct meshes, but welding, simplification
   and quantisation collapse them: they were the same base mesh differing only
   at float precision. Grouping is therefore computed here rather than assumed,
   so this stays correct if a future export genuinely differs. */
const byHash = new Map();
for (const name of Object.keys(docs)) {
  const h = geoHash(docs[name]);
  if (!byHash.has(h)) byHash.set(h, []);
  byHash.get(h).push(name);
}
for (const [h, names] of byHash) console.log(`geometry ${h}: ${names.join(", ")}`);
console.log(
  `${byHash.size} distinct mesh(es) after optimisation ` +
    `(raw exports had ${new Set(Object.values(GROUPS).flatMap((g, i) => g.map(() => i))).size})`,
);

/* ── 2. per-colour texture sets ──────────────────────────────────────────── */
const ROLES = [
  ["base_color", (m) => m.getBaseColorTexture()],
  ["normal", (m) => m.getNormalTexture()],
  ["metallic_roughness", (m) => m.getMetallicRoughnessTexture()],
];

let texBytes = 0;
for (const [name, doc] of Object.entries(docs)) {
  const mat = doc.getRoot().listMaterials()[0];
  mkdirSync(`${OUT}/tex/${name}`, { recursive: true });
  for (const [role, get] of ROLES) {
    const tex = get(mat);
    if (!tex) continue;
    const file = `${OUT}/tex/${name}/${role}.jpg`;
    writeFileSync(file, Buffer.from(tex.getImage()));
    texBytes += statSync(file).size;
  }
}

/* ── 3. one geometry-only GLB per distinct mesh ──────────────────────────── */
let geoBytes = 0;
const geoFiles = [];
let i = 0;
for (const [, names] of byHash) {
  const doc = docs[names[0]];
  const mat = doc.getRoot().listMaterials()[0];
  // Detach every map; the runtime binds the right colour's textures instead.
  mat.setBaseColorTexture(null).setNormalTexture(null).setMetallicRoughnessTexture(null);
  await doc.transform(prune());
  const file = `${OUT}/geo-${String.fromCharCode(97 + i++)}.glb`;
  await io.write(file, doc);
  geoFiles.push(`${file.split("/").pop()} -> ${names.join(", ")}`);
  geoBytes += statSync(file).size;
}
geoFiles.forEach((f) => console.log(f));

const before = Object.keys(docs).length * 0.73;
console.log(
  `\ngeometry : ${(geoBytes / 1048576).toFixed(2)} MB (2 files)\n` +
    `textures : ${(texBytes / 1048576).toFixed(2)} MB (5 sets)\n` +
    `total    : ${((geoBytes + texBytes) / 1048576).toFixed(2)} MB  ` +
    `(was ~${before.toFixed(2)} MB as five standalone GLBs)`,
);
