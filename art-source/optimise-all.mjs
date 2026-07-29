/**
 * Shipping-quality optimiser for every candidate device model.
 *
 * Generalised from the single-model version. Differences that matter for the
 * colour exports versus the original white one:
 *   - base colour arrives at 8192², which no pure-JS decoder here will touch,
 *     so all resizing goes through headless Chrome
 *   - they carry no TANGENT attribute; three derives tangents in-shader, so
 *     normal mapping still works and there is nothing to preserve
 *   - they carry no emissive map, so the budget table simply has no entry
 *
 * Still no Draco/meshopt: both need a WASM decoder in a blob worker, which the
 * site's CSP (default-src 'self', no blob:, no wasm-unsafe-eval) forbids.
 * KHR_mesh_quantization decodes natively in three.
 */
import { NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from "@gltf-transform/extensions";
import { dedup, weld, simplify, quantize, prune } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import { mkdirSync, statSync } from "node:fs";
import { createResizer } from "./img-resize.mjs";

const DL = "C:/Users/Liv Thomsen/Downloads";
const OUT = "D:/Alex/VirtusNordic/Virtus-Nordic/app/public/lab-models/opt";
const MODELS = {
  copper: "0728190705",
  green: "0728190737",
  graphite: "0728190751",
  silver: "0728205958",
  navy: "0728210036",
};

/** Base colour and normal carry what the eye reads; metallic-roughness is a
 *  broad low-detail mask and survives half the resolution. */
const BUDGET = { base_color: 1024, normal: 1024, metallic_roughness: 512, emissive: 256 };

mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
await MeshoptSimplifier.ready;
const resizer = await createResizer();

try {
  for (const [name, stamp] of Object.entries(MODELS)) {
    const src = `${DL}/Meshy_AI_iPhone_14_Pro_back_vi_${stamp}_texture.glb`;
    const doc = await io.read(src);

    // Meshy does not always name its textures, so fall back to the slot the
    // material actually binds them to rather than trusting getName().
    const mat = doc.getRoot().listMaterials()[0];
    const slot = new Map([
      [mat.getBaseColorTexture(), "base_color"],
      [mat.getNormalTexture(), "normal"],
      [mat.getMetallicRoughnessTexture(), "metallic_roughness"],
      [mat.getEmissiveTexture(), "emissive"],
    ]);

    for (const tex of doc.getRoot().listTextures()) {
      const role = slot.get(tex) ?? tex.getName() ?? "base_color";
      tex.setImage(await resizer.resize(tex.getImage(), BUDGET[role] ?? 1024, 0.86));
      tex.setMimeType("image/jpeg");
      tex.setName(role);
    }

    await doc.transform(
      dedup(),
      weld(),
      simplify({ simplifier: MeshoptSimplifier, ratio: 0.35, error: 0.001 }),
      quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 14 }),
      prune(),
    );

    const dst = `${OUT}/${name}.glb`;
    await io.write(dst, doc);

    let tris = 0;
    for (const mesh of doc.getRoot().listMeshes())
      for (const prim of mesh.listPrimitives())
        tris += (prim.getIndices()?.getCount() ?? prim.getAttribute("POSITION").getCount()) / 3;

    console.log(
      `${name.padEnd(9)} ${(statSync(src).size / 1048576).toFixed(1).padStart(5)}MB -> ` +
        `${(statSync(dst).size / 1048576).toFixed(2)}MB   ${Math.round(tris)} tris`,
    );
  }
} finally {
  await resizer.close();
}
