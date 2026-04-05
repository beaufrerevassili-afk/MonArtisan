import React, { useRef, useEffect } from 'react';

// Apple-style scroll animations — shared across Freample presentation pages

export function useFadeUp(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
    el.style.transition = `opacity 1s ${delay}s cubic-bezier(0.4,0,0,1), transform 1s ${delay}s cubic-bezier(0.4,0,0,1)`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function useScaleIn(delay = 0) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'scale(0.92)';
    el.style.transition = `opacity 1.2s ${delay}s cubic-bezier(0.4,0,0,1), transform 1.2s ${delay}s cubic-bezier(0.4,0,0,1)`;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        el.style.opacity = '1';
        el.style.transform = 'scale(1)';
        obs.disconnect();
      }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function StaggerChildren({ children, style = {} }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const kids = [...el.children];
    kids.forEach(k => {
      k.style.opacity = '0';
      k.style.transform = 'translateY(30px)';
    });
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        kids.forEach((k, i) => {
          setTimeout(() => {
            k.style.transition = 'opacity .8s cubic-bezier(0.4,0,0,1), transform .8s cubic-bezier(0.4,0,0,1)';
            k.style.opacity = '1';
            k.style.transform = 'translateY(0)';
          }, i * 100);
        });
        obs.disconnect();
      }
    }, { threshold: 0.05 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={style}>{children}</div>;
}
