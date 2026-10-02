const { createAvatar } = require('@dicebear/core');
const { personas } = require('@dicebear/collection');
const fs = require('fs');
// Run from the repo root after: npm i -D @dicebear/core@9 @dicebear/collection@9
const OUT = require('path').join(__dirname, '../public/media/test-personas/');
const people = {
  'leer-midwife':        { eyes: 'happy', skinColor: ['623d36'], hair: ['curlyBun'],  hairColor: ['362c47'], clothingColor: ['f55d81'], facialHairProbability: 0, mouth: ['bigSmile'], bg: 'f6e3cf' },
  'leer-mother':         { skinColor: ['92594b'], hair: ['pigtails'],  hairColor: ['362c47'], clothingColor: ['f3b63a'], facialHairProbability: 0, mouth: ['smile'],    bg: 'f3dccb' },
  'juba-phsi-graduate':  { skinColor: ['623d36'], hair: ['bobCut'],    hairColor: ['362c47'], clothingColor: ['54d7c7'], facialHairProbability: 0, mouth: ['smile'],    bg: 'e9e1d0' },
  'pochalla-farmer':     { skinColor: ['623d36'], hair: ['buzzcut'],   hairColor: ['362c47'], clothingColor: ['6dbb58'], facialHairProbability: 100, facialHair: ['shadow'], mouth: ['smile'], bg: 'e7e4cc' },
  'uror-water':          { eyes: 'happy', skinColor: ['92594b'], hair: ['curly'],     hairColor: ['362c47'], clothingColor: ['456dff'], facialHairProbability: 0, mouth: ['bigSmile'], bg: 'dfe7e6' },
  'bor-flood':           { skinColor: ['623d36'], hair: ['fade'],      hairColor: ['362c47'], clothingColor: ['e24553'], facialHairProbability: 100, facialHair: ['beardMustache'], mouth: ['smirk'], bg: 'f1ddd2' },
  'akobo-health-worker': { skinColor: ['92594b'], hair: ['shortCombover'], hairColor: ['362c47'], clothingColor: ['7555ca'], facialHairProbability: 0, mouth: ['smile'], bg: 'e6def0' },
};
for (const [id, o] of Object.entries(people)) {
  const { bg, eyes, ...opts } = o;
  let svg = createAvatar(personas, { seed: id, backgroundColor: [bg], radius: 0, scale: 92, translateY: 6, eyes: [o.eyes || 'open'], nose: ['smallRound'], ...opts }).toString();
  // Drop the white face highlight, which washes out darker skin tones
  svg = svg.replace(/<path d="M32 13a14 14 0 0 1 14 14v6[^>]*fill="#fff"[^>]*\/>/, '');
  fs.writeFileSync(OUT + id + '.svg', svg);
  console.log(id, svg.length);
}
