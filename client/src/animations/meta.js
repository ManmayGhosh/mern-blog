export const SCENE_META = {
  'ink-drift': { label: 'Ink Drift' },
  'paper-waves': { label: 'Paper Waves' },
  'postmark-orbit': { label: 'Postmark Orbit' },
  constellation: { label: 'Constellation' }
};

export const SCENE_KEYS = Object.keys(SCENE_META);

export function randomSceneKey(excludeKey) {
  const choices = SCENE_KEYS.filter((k) => k !== excludeKey);
  return choices[Math.floor(Math.random() * choices.length)] || SCENE_KEYS[0];
}
