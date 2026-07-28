import { useMemo } from "react";
import * as THREE from "three";

/**
 * The device screen as a rounded-rectangle mesh.
 *
 * A plain planeGeometry cannot work here. Its square corners overhang the
 * chassis's rounded ones, which is visible the moment the device turns away
 * from head-on, and it reads instantly as a sticker laid on top of a phone
 * rather than as the phone's own glass.
 *
 * THREE.Shape gives the outline; ShapeGeometry triangulates it. The catch is
 * that ShapeGeometry's default UVs are derived from world-space shape
 * coordinates, not normalised to the shape's bounds, so the texture arrives
 * arbitrarily offset and scaled. They have to be recomputed from the geometry's
 * own bounding box — that is what the second half of this does.
 */
export function useRoundedScreenGeometry(width: number, height: number, radius: number) {
  return useMemo(() => {
    const r = Math.min(radius, width / 2, height / 2);
    const x = -width / 2;
    const y = -height / 2;

    const shape = new THREE.Shape();
    shape.moveTo(x + r, y);
    shape.lineTo(x + width - r, y);
    shape.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(x + width, y + height - r);
    shape.absarc(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
    shape.lineTo(x + r, y + height);
    shape.absarc(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(x, y + r);
    shape.absarc(x + r, y + r, r, Math.PI, (3 * Math.PI) / 2, false);

    // curveSegments drives how many points each corner arc gets. Too few and the
    // corner reads as a chamfer; 24 is smooth at hero size without bloating a
    // mesh that is drawn five times.
    const geo = new THREE.ShapeGeometry(shape, 24);

    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const w = bb.max.x - bb.min.x;
    const h = bb.max.y - bb.min.y;
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - bb.min.x) / w, (pos.getY(i) - bb.min.y) / h);
    }
    uv.needsUpdate = true;

    return geo;
  }, [width, height, radius]);
}

export function RoundedScreen({
  width,
  height,
  radius,
  map,
  position,
}: {
  width: number;
  height: number;
  radius: number;
  map: THREE.Texture;
  position: [number, number, number];
}) {
  const geometry = useRoundedScreenGeometry(width, height, radius);
  return (
    <mesh geometry={geometry} position={position}>
      {/* Screens emit rather than reflect. A lit material would make the UI
          respond to the scene lights and read as printed paper. */}
      <meshBasicMaterial map={map} toneMapped={false} transparent />
    </mesh>
  );
}
