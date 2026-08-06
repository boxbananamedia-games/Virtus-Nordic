/**
 * Build cheap evaluation copies of every candidate model.
 *
 * Textures go to 512px purely so the raw 8K maps do not have to be uploaded to
 * the GPU just to judge colour and form — these are throwaway proofs, not the
 * shipping assets. Geometry is left untouched so what we are looking at is the
 * model's real silhouette.
 */
import { NodeIO } from "@gltf-transform/core";
import { KHRMeshQuantization } from "@gltf-transform/extensions";
import { createResizer } from "./img-resize.mjs";
import { mkdirSync, statSync } from "node:fs";

const DL = "C:/Users/Liv Thomsen/Downloads";
const OUT = "D:/Alex/VirtusNordic/Virtus-Nordic/app/public/lab-models/eval";
const MODELS = {
  white: "0728190307",
  "c-0705": "0728190705",
  "c-0737": "0728190737",
  "c-0751": "0728190751",
  "c-5958": "0728205958",
  "c-0036": "0728210036",
};

mkdirSync(OUT, { recursive: true });
const io = new NodeIO().registerExtensions([KHRMeshQuantization]);
const resizer = await createResizer();

for (const [name, stamp] of Object.entries(MODELS)) {
  const src = `${DL}/Meshy_AI_iPhone_14_Pro_back_vi_${stamp}_texture.glb`;
  const doc = await io.read(src);

  for (const tex of doc.getRoot().listTextures()) {
    tex.setImage(await resizer.resize(tex.getImage(), 512, 0.78));
    tex.setMimeType("image/jpeg");
  }

  const dst = `${OUT}/${name}.glb`;
  await io.write(dst, doc);
  console.log(
    `${name.padEnd(8)} ${(statSync(src).size / 1048576).toFixed(1)}MB -> ` +
      `${(statSync(dst).size / 1048576).toFixed(2)}MB`,
  );
}

await resizer.close();
