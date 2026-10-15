/* Gentle entrance animation — the same easing as the home page slides.
   Hero text rises and fades in, one line after another, when the page opens;
   sections and cards further down do the same as they scroll into view.
   Usage: <script src="assets/reveal.js" defer></script>
   Skipped entirely for visitors who ask their device for reduced motion. */
(function () {
  const lift = () => document.documentElement.classList.remove('rv-wait');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return lift();
  if (!('IntersectionObserver' in window)) return lift();

  const EASE = 'cubic-bezier(.22,.68,0,1)';
  const style = document.createElement('style');
  style.textContent = `
    html.rv .rv-item{ opacity:0; translate:0 26px; }
    html.rv .rv-item.rv-in{
      opacity:1; translate:0 0;
      transition: opacity .8s ${EASE}, translate .9s ${EASE};
      transition-delay: var(--rv-delay, 0s);
    }`;
  document.head.appendChild(style);

  const selectors = [
    '.hero > *:not(.hero-bg)',          // eyebrow, title, artwork, tagline
    '.grid-header',                      // "Articles" / "Case Studies" headings
    '.card',                             // article and case-study cards
    'main section:not(.hero) > *:not(.article-grid):not(.project-grid)',   // section content (grids reveal card by card)
    '.close-line'
  ];
  const items = Array.from(document.querySelectorAll(selectors.join(',')))
    .filter((el, i, all) => all.indexOf(el) === i && !el.closest('[hidden]'));
  if (!items.length) return lift();

  items.forEach((el) => el.classList.add('rv-item'));
  document.documentElement.classList.add('rv');
  document.documentElement.classList.remove('rv-wait');   // set in <head> to avoid a flash before this runs

  // once an item has arrived, hand its styles back so hovers etc. work as before
  const settle = (el, delay) => {
    const clean = () => {
      el.classList.remove('rv-item', 'rv-in');
      el.style.removeProperty('--rv-delay');
    };
    el.addEventListener('transitionend', function done(e) {
      if (e.propertyName !== 'opacity') return;
      el.removeEventListener('transitionend', done);
      clean();
    });
    setTimeout(clean, (delay + 1.3) * 1000);   // fallback if the event never fires
  };

  let first = true;
  const io = new IntersectionObserver((entries) => {
    const arriving = entries.filter((e) => e.isIntersecting);
    arriving.forEach((e, k) => {
      const step = first ? 0.13 : 0.08;          // the opening lines stagger a bit slower
      const start = first ? 0.1 : 0;
      const delay = start + k * step;
      const el = e.target;
      el.style.setProperty('--rv-delay', delay.toFixed(2) + 's');
      io.unobserve(el);
      void el.offsetWidth;   // make sure the hidden starting state is painted first
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.classList.add('rv-in');
        settle(el, delay);
      }));
    });
    if (arriving.length) first = false;
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

  requestAnimationFrame(() => items.forEach((el) => io.observe(el)));
})();
