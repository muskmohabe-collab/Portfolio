/* Scroll progress — a thin column of dashes on the right edge.
   Dashes light up as you scroll; click a dash to jump to that point.
   Usage: <script src="assets/scroll-progress.js" data-color="#f2cf8f" defer></script>
   data-color is optional (defaults to white). */
(function () {
  const script = document.currentScript;
  const color = (script && script.dataset.color) || '#ffffff';
  const COUNT = 18;

  const css = `
  .sp-bar{
    position:fixed; right:1.5rem; top:50%; transform:translateY(-50%); z-index:5;
    display:flex; flex-direction:column; gap:6px; padding:6px 4px;
  }
  .sp-dash{
    width:2px; height:12px; border-radius:2px; cursor:pointer;
    background:${color}; opacity:0.16;
    transition: opacity .35s ease, box-shadow .35s ease, transform .35s ease;
  }
  .sp-dash.on{ opacity:0.85; }
  .sp-dash.here{ opacity:1; transform:scaleX(1.6); box-shadow:0 0 8px ${color}; }
  .sp-dash:hover{ opacity:0.7; }
  @media (max-width:640px){
    .sp-bar{ right:0.45rem; gap:5px; }
    .sp-dash{ height:9px; width:1.5px; }
  }
  @media (prefers-reduced-motion: reduce){ .sp-dash{ transition:none; } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.className = 'sp-bar';
  bar.setAttribute('aria-hidden', 'true');
  const dashes = [];
  for (let i = 0; i < COUNT; i++) {
    const d = document.createElement('div');
    d.className = 'sp-dash';
    d.addEventListener('click', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: max * (i / (COUNT - 1)), behavior: 'smooth' });
    });
    bar.appendChild(d);
    dashes.push(d);
  }
  document.body.appendChild(bar);

  function update() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 1;
    const here = Math.round(p * (COUNT - 1));
    dashes.forEach((d, i) => {
      d.classList.toggle('on', i <= here);
      d.classList.toggle('here', i === here);
    });
    bar.style.display = max > 40 ? '' : 'none';   // hide on pages that don't scroll
  }
  let raf;
  const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  update();
})();
