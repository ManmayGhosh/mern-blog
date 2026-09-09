import { createInkDrift } from './inkDrift.js';
import { createPaperWaves } from './paperWaves.js';
import { createPostmarkOrbit } from './postmarkOrbit.js';
import { createConstellation } from './constellation.js';
import { SCENE_META } from './meta.js';

export const SCENES = {
  'ink-drift': { ...SCENE_META['ink-drift'], create: createInkDrift },
  'paper-waves': { ...SCENE_META['paper-waves'], create: createPaperWaves },
  'postmark-orbit': { ...SCENE_META['postmark-orbit'], create: createPostmarkOrbit },
  constellation: { ...SCENE_META.constellation, create: createConstellation }
};

export { SCENE_KEYS, randomSceneKey } from './meta.js';
