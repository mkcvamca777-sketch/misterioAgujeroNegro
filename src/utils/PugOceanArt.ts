import Phaser from 'phaser';

export function createPugSubmarine(
  scene: Phaser.Scene,
  x: number,
  y: number,
  depth = 8,
  showBeam = true
): Phaser.GameObjects.Container {
  const sub = scene.add.container(x, y);
  sub.setDepth(depth);

  const parts: Phaser.GameObjects.GameObject[] = [];

  if (showBeam) {
    const beam = scene.add.graphics();
    beam.fillStyle(0xf7fff7, 0.16);
    beam.fillTriangle(78, -11, 235, -58, 235, 58);
    parts.push(beam);
  }

  const body = scene.add.graphics();

  body.fillStyle(0xffc928, 1);
  body.fillEllipse(0, 0, 170, 64);
  body.fillStyle(0xff9f1c, 1);
  body.fillEllipse(28, 7, 118, 39);
  body.fillStyle(0xffda4a, 1);
  body.fillEllipse(-19, -12, 112, 28);

  body.lineStyle(5, 0x6a3d00, 1);
  body.strokeEllipse(0, 0, 170, 64);

  body.fillStyle(0xffc928, 1);
  body.fillRoundedRect(-35, -56, 50, 28, 10);
  body.fillRoundedRect(-22, -78, 18, 33, 7);
  body.fillRoundedRect(-12, -84, 46, 13, 6);
  body.lineStyle(4, 0x6a3d00, 1);
  body.strokeRoundedRect(-35, -56, 50, 28, 10);
  body.strokeRoundedRect(-22, -78, 18, 33, 7);
  body.strokeRoundedRect(-12, -84, 46, 13, 6);

  body.fillStyle(0x7ee7ff, 1);
  [-40, 0, 40].forEach((windowX) => {
    body.fillCircle(windowX, -2, 15);
    body.lineStyle(4, 0x23607a, 1);
    body.strokeCircle(windowX, -2, 15);
    body.fillStyle(0xffffff, 0.72);
    body.fillCircle(windowX - 5, -8, 4);
    body.fillStyle(0x7ee7ff, 1);
  });

  body.fillStyle(0xff6b35, 1);
  body.fillTriangle(-83, 0, -123, -27, -123, 27);
  body.lineStyle(4, 0x6a3d00, 1);
  body.strokeTriangle(-83, 0, -123, -27, -123, 27);

  body.fillStyle(0x5b6f7a, 1);
  body.fillRect(-141, -5, 22, 10);
  body.lineStyle(4, 0x263238, 1);
  body.strokeCircle(-153, 0, 18);
  body.lineBetween(-171, 0, -135, 0);
  body.lineBetween(-153, -18, -153, 18);

  body.fillStyle(0xfff06a, 1);
  body.fillCircle(85, -2, 12);
  body.lineStyle(3, 0x6a3d00, 1);
  body.strokeCircle(85, -2, 12);

  parts.push(body);
  sub.add(parts);

  return sub;
}
