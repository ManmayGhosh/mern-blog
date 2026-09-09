import Post from '../models/Post.js';

// Keyword buckets mapped to each generative scene. Purely local heuristic —
// no external AI call, no cost, works fully offline inside an isolated container.
const SCENE_KEYWORDS = {
  'ink-drift': ['journal', 'diary', 'personal', 'reflection', 'thoughts', 'memoir', 'poetry', 'letter', 'emotion'],
  'paper-waves': ['travel', 'nature', 'ocean', 'journey', 'outdoors', 'field', 'hike', 'weather', 'wander'],
  'postmark-orbit': ['news', 'update', 'announcement', 'project', 'launch', 'milestone', 'review', 'report'],
  constellation: ['tech', 'code', 'engineering', 'ai', 'ml', 'data', 'research', 'science', 'idea', 'system']
};

function scoreText(text) {
  const scores = {};
  const lower = text.toLowerCase();
  for (const [scene, keywords] of Object.entries(SCENE_KEYWORDS)) {
    scores[scene] = keywords.reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0);
  }
  return scores;
}

export const suggestScene = async (req, res, next) => {
  try {
    const { author } = req.query;
    const filter = { published: true };
    if (author) filter.author = author;

    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(30).select('title tags excerpt');

    if (posts.length === 0) {
      return res.json({ scene: null, reason: 'no posts yet — showing a random scene' });
    }

    const corpus = posts.map((p) => `${p.title} ${p.tags.join(' ')} ${p.excerpt}`).join(' ');
    const scores = scoreText(corpus);

    const [bestScene, bestScore] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

    if (bestScore === 0) {
      return res.json({ scene: null, reason: 'no strong topical signal — showing a random scene' });
    }

    res.json({ scene: bestScene, reason: `matched based on recurring themes in ${posts.length} post(s)`, scores });
  } catch (err) {
    next(err);
  }
};
