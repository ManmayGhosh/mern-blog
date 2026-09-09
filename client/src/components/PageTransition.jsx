import { useRef, useEffect } from 'react';
import gsap from 'gsap';

// Fades/rises each page's content in on mount. Re-keying the Routes element by
// pathname (done in App.jsx) forces a fresh mount on every navigation, which is
// what triggers this. No exit animation — that needs a library like Framer Motion
// to delay unmount, which isn't worth the extra ~50kb for a fade-out most people
// won't consciously notice anyway.
export default function PageTransition({ children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, []);

  return <div ref={ref}>{children}</div>;
}
