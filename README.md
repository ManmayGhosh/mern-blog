# Inkwell — a full-stack blogging platform

MERN stack blog with image uploads, emoji support in posts and comments, and a generative 3D animated hero.

## The animation pass

Beyond the 3D hero, the whole site runs on a small, deliberate animation stack — the same kind of layering that gets used in the "beautiful animated site" builds you see floating around: scroll-triggered reveals, inertia scrolling, route transitions, and mouse-reactive details, not any single magic tool.

- **Lenis** (`src/lib/smoothScroll.jsx`) — inertia smooth-scroll, synced to GSAP's ticker so `ScrollTrigger` positions stay accurate. Skips itself entirely if the browser has `prefers-reduced-motion` set.
- **GSAP + ScrollTrigger** — `src/components/Reveal.jsx` fades/rises any wrapped content into view once, the first time it scrolls into the viewport. Used on post cards and the hero tagline.
- **Page transitions** (`src/components/PageTransition.jsx`) — each route's content fades/rises in on mount; re-keying `<Routes>` by pathname in `App.jsx` triggers a fresh mount (and thus the animation) on every navigation.
- **Magnetic buttons** (`src/components/MagneticWrap.jsx`) — primary CTAs (join, publish, sign in, post comment, like) subtly follow the cursor on hover and spring back on leave.
- **Micro-interactions** — post cards tilt slightly toward the cursor (GSAP, capped at 3°, purely cosmetic), the hero title letters stagger in on load, the like button pops on click, nav links get an animated underline on hover (CSS only, no JS needed there).

All of it respects `prefers-reduced-motion` — every animated component checks it and either skips the animation or jumps straight to the end state.

I deliberately did **not** add Framer Motion alongside GSAP — two animation libraries doing overlapping work (both can handle enter/exit transitions) is redundant weight for no real gain. Page transitions are GSAP-only; the trade-off is no exit animation on route change, only entrance, which is a fine compromise for the ~50kb it saves.

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS, React Router, react-markdown, emoji-picker-react (lazy-loaded), Three.js (lazy-loaded), GSAP + ScrollTrigger, Lenis
- **Backend**: Node.js + Express, MongoDB + Mongoose, JWT auth, Multer (2.x) for image uploads

## Features
- JWT auth (register/login), avatar upload
- Post CRUD with cover image upload, tags, markdown content, publish toggle
- Full-text search across title/content/tags, pagination
- Like/unlike, view counter
- Threaded comments, emoji picker in post body and comments
- Emoji/unicode stored natively — MongoDB is UTF-8, no special handling needed
- **Generative 3D animated hero** (see below) with content-based scene selection

## The 3D animated view

The home page hero is a live Three.js canvas with four generative scenes, all built from primitives (no textures, no external assets) so it works fully offline inside an isolated Docker container:

| Scene | Look |
|---|---|
| `ink-drift` | Particles drifting upward, like ink diffusing in water |
| `paper-waves` | An undulating wireframe plane |
| `postmark-orbit` | Concentric rings orbiting, echoing the app's postmark stamp motif |
| `constellation` | A drifting point cloud with connecting lines |

**On "AI-recommended animation based on blog content":** I looked for a free public API that does this — analyze a blog's content and recommend a matching 3D scene — and nothing like it exists as a packaged service. What's out there (SayMotion, Animotion/HY-Motion, Krikey) is heavy text-to-3D-*character*-animation tooling built for VFX/game pipelines, not lightweight content-to-ambient-scene matching, and it isn't free.

So this ships with a local heuristic instead: `GET /api/scene/suggest?author=<userId>` (see `server/controllers/sceneController.js`) pulls a person's recent posts, scores the combined title/tags/excerpt text against four keyword buckets (journal/personal → `ink-drift`, travel/nature → `paper-waves`, news/project → `postmark-orbit`, tech/research → `constellation`), and returns the best match. No external API call, no cost, no network dependency — works the same with the container fully offline. Falls back to a random scene if there's no post history or no keyword signal. A manual "shuffle" button on the hero lets you override it any time.

**If you want smarter topic detection later:** swap the keyword scorer in `sceneController.js` for a call to Hugging Face's free-tier zero-shot-classification Inference API — it's the closest real match to "AI classify this text's theme," and free within its rate limits:
```js
const res = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-mnli', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
  body: JSON.stringify({
    inputs: corpusText,
    parameters: { candidate_labels: ['personal', 'travel', 'news', 'technology'] }
  })
});
```
Map the top returned label to a scene key the same way the keyword version does. This requires outbound internet access from the container, which the keyword version deliberately doesn't.

## Local setup (without Docker)

### 1. Backend
```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI (local mongodb://localhost:27017/blogapp or an Atlas URI)
#            set JWT_SECRET to a long random string
npm install
npm run dev      # nodemon, or `npm start` for plain node
```
Server runs on `http://localhost:5000`.

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173` and proxies `/api` and `/uploads` to the backend (see `vite.config.js`).

Open `http://localhost:5173`, register an account, and start writing.

## Running in Docker (isolated container)

Everything — MongoDB, the Express API, and the built frontend behind nginx — runs in its own container on a private bridge network (`inkwell-net`), talking to each other only by service name. Nothing needs to be installed on the host except Docker.

```bash
cd blog-app
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend API directly (optional, for debugging): `http://localhost:5000`
- Mongo is not exposed to the host by default — only reachable from inside `inkwell-net`

Set a real JWT secret before running in anything beyond local testing:
```bash
JWT_SECRET=$(openssl rand -hex 32) docker compose up --build
```

**Persistence**: `mongo-data`, `uploads-posts`, and `uploads-avatars` are named Docker volumes, so your database and uploaded images survive `docker compose down` (but not `docker compose down -v`, which deletes volumes too).

**Tear down**:
```bash
docker compose down          # stop containers, keep data
docker compose down -v       # stop containers AND wipe volumes
```

**Rebuild after code changes**:
```bash
docker compose up --build
```

## Deployment (non-Docker hosts)

### Backend (Render / Railway / Fly.io / a VPS)
1. Set environment variables: `PORT`, `MONGO_URI` (Atlas recommended for prod), `JWT_SECRET`, `CLIENT_URL` (your deployed frontend origin, for CORS).
2. `npm install && npm start`.
3. **Uploads persistence**: `server/uploads/` is local disk storage. On most PaaS platforms (Render, Railway, Heroku-style) the filesystem is ephemeral — uploaded images will be wiped on redeploy/restart. For production, either:
   - Mount a persistent volume at `server/uploads`, or
   - Swap the Multer disk storage in `middleware/upload.js` for an S3/Cloudinary storage engine (`multer-s3` or similar) — the rest of the app only cares that `coverImage`/`avatar` end up as a URL string, so this is a contained change.

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. `npm run build` → deploy the `client/dist` folder.
2. Set the API base URL: currently the frontend calls relative `/api` paths (works via Vite's dev proxy locally, and via nginx's reverse proxy in Docker). In a non-Docker cloud deploy, either:
   - Reverse-proxy `/api` and `/uploads` to your backend from the same domain, or
   - Set an env var and update `client/src/api/client.js`'s `baseURL` to point at your deployed backend's full URL, and update CORS `CLIENT_URL` on the backend accordingly.

### Database
Use MongoDB Atlas free tier for a zero-maintenance production database — create a cluster, whitelist your backend's IP (or `0.0.0.0/0` for PaaS with dynamic IPs), and drop the connection string into `MONGO_URI`.

## Project structure
```
blog-app/
├── docker-compose.yml
├── server/
│   ├── Dockerfile
│   ├── models/         User, Post, Comment (Mongoose schemas)
│   ├── controllers/    auth, post, comment, scene business logic
│   ├── routes/          Express routers
│   ├── middleware/      JWT auth guard, Multer upload config
│   └── uploads/         posts/ and avatars/ (local image storage)
└── client/
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── api/          Axios instance with JWT interceptor
        ├── context/      AuthContext (login/register/logout, localStorage token)
        ├── animations/   Three.js generative scene modules + lightweight metadata
        ├── components/   Navbar, PostCard, EmojiTextarea, ImageUploader, CommentSection, AnimatedScene, etc.
        └── pages/        Home, PostDetail, Login, Register, PostEditor, Profile, NotFound
```

## Notes
- `.gitignore` excludes `node_modules`, `.env`, and `server/uploads/*` (keep the folder, ignore its contents) — add your own before committing real data.
- Multer is pinned to 2.x (1.x has known vulnerabilities).
- Three.js and emoji-picker-react are both lazy-loaded so the initial page load stays reasonably light (~520KB main bundle — the animation stack sitewide adds weight vs. a bare-bones build, but nothing is duplicated across libraries).

