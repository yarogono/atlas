const sharp = require('d:/project/atlas/node_modules/sharp');
const fs = require('fs');
const path = require('path');

const imgDir = 'd:/project/atlas/public/game/images';

async function processStage1() {
  console.log('Processing Stage 1 (Hanok courtyard)...');
  const src = path.join(imgDir, 'bg1.png');
  const outA = path.join(imgDir, 'stage1_a.png');
  const outB = path.join(imgDir, 'stage1_b.png');

  fs.copyFileSync(src, outA);

  // 1. Cloud in top-left sky: Erase it completely by copying empty blue sky from the right
  const skyPatch = await sharp(src)
    .extract({ left: 360, top: 60, width: 140, height: 60 })
    .toBuffer();

  // 2. Persimmon (감나무 열매): Erase the fruit on the right branch
  const leavesPatch = await sharp(src)
    .extract({ left: 840, top: 415, width: 35, height: 35 })
    .toBuffer();

  // 3. Table Cups (찻잔): Erase the small cups on the veranda table
  const tablePatch = await sharp(src)
    .extract({ left: 245, top: 648, width: 35, height: 25 })
    .toBuffer();

  await sharp(src)
    .composite([
      { input: skyPatch, left: 50, top: 60 },
      { input: leavesPatch, left: 880, top: 415 },
      { input: tablePatch, left: 212, top: 638 }
    ])
    .toFile(outB);

  console.log('Stage 1 images created successfully.');
}

async function processStage2() {
  console.log('Processing Stage 2 (Countryside)...');
  const src = path.join(imgDir, 'bg2.png');
  const outA = path.join(imgDir, 'stage2_a.png');
  const outB = path.join(imgDir, 'stage2_b.png');

  fs.copyFileSync(src, outA);

  // 1. Cloud in the sky (top-left): Erase it completely by copying blue sky from the left
  const cloudPatch = await sharp(src)
    .extract({ left: 130, top: 75, width: 145, height: 80 })
    .toBuffer();

  // 2. Utility Pole (전신주): Erase it by copying empty horizon to the left
  const polePatch = await sharp(src)
    .extract({ left: 590, top: 380, width: 20, height: 75 })
    .toBuffer();

  // 3. Farmer in the right rice field: Erase by copying empty green field from the left of him
  const farmerPatch = await sharp(src)
    .extract({ left: 860, top: 640, width: 30, height: 35 })
    .toBuffer();

  await sharp(src)
    .composite([
      { input: cloudPatch, left: 270, top: 75 },
      { input: polePatch, left: 615, top: 380 },
      { input: farmerPatch, left: 905, top: 640 }
    ])
    .toFile(outB);

  console.log('Stage 2 images created successfully.');
}

async function processStage3() {
  console.log('Processing Stage 3 (Traditional Dining Table)...');
  const src = path.join(imgDir, 'bg3.png');
  const outA = path.join(imgDir, 'stage3_a.png');
  const outB = path.join(imgDir, 'stage3_b.png');

  fs.copyFileSync(src, outA);

  // 1. Drawing on the Scroll (족자 그림): Erase it by copying empty white paper from the top of the scroll
  const scrollPaperPatch = await sharp(src)
    .extract({ left: 335, top: 235, width: 50, height: 60 })
    .toBuffer();

  // 2. Hanging Basket (바구니): Erase it by copying empty clay wall to the left (avoiding wooden pillar)
  const basketPatch = await sharp(src)
    .extract({ left: 488, top: 220, width: 30, height: 130 })
    .toBuffer();

  // 3. Ceiling Lamp (천장 등): Erase it by copying horizontal ceiling beams from the right (keeping the main pillar intact)
  const lampPatch = await sharp(src)
    .extract({ left: 600, top: 40, width: 70, height: 135 })
    .toBuffer();

  await sharp(src)
    .composite([
      { input: scrollPaperPatch, left: 335, top: 295 },
      { input: basketPatch, left: 520, top: 220 },
      { input: basketPatch, left: 550, top: 220 },
      { input: basketPatch, left: 580, top: 220 },
      { input: lampPatch, left: 480, top: 40 }
    ])
    .toFile(outB);

  console.log('Stage 3 images created successfully.');
}

async function main() {
  try {
    await processStage1();
    await processStage2();
    await processStage3();
    console.log('All stages processed successfully with refined coordinates!');
  } catch (err) {
    console.error('Error processing images:', err);
  }
}

main();
