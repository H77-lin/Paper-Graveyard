// GSAP core/timeline: abstract direction and depth, with no book metaphor.
export function createPageTransitions({main, render, depth}) {
  const gsap = window.gsap;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const route = () => location.hash || '#home';
  const stateKey = '__paperGraveyardRoute';
  const scrollPositions = new Map();
  let renderedRoute = route(), active = null, serial = 0;
  let historyIndex = Number(history.state?.[stateKey]?.index) || 0;
  let nextIndex = historyIndex;
  history.scrollRestoration = 'manual';

  function tagHistory(hash, index) {
    const previous = history.state && typeof history.state === 'object' ? history.state : {};
    history.replaceState({...previous, [stateKey]: {hash, index}}, '');
  }
  tagHistory(renderedRoute, historyIndex);

  function clearMotion() {
    if (active) active.kill();
    active = null;
    if (gsap) gsap.set(main, {clearProps: 'transform,transformOrigin,opacity,visibility'});
    main.classList.remove('route-changing');
    main.removeAttribute('aria-busy');
    main.dataset.motionPhase = 'idle';
  }

  function showRoute(hash, scrollY) {
    render();
    renderedRoute = hash;
    window.scrollTo(0, scrollY);
    main.focus({preventScroll: true});
  }

  function navigate() {
    const target = route();
    if (target === renderedRoute && !active) return;
    scrollPositions.set(renderedRoute, window.scrollY);
    const tagged = history.state?.[stateKey];
    const revisiting = tagged?.hash === target && Number.isFinite(tagged.index);
    const targetIndex = revisiting ? tagged.index : ++nextIndex;
    const depthDifference = depth(target) - depth(renderedRoute);
    const direction = depthDifference ? Math.sign(depthDifference) : targetIndex < historyIndex ? -1 : 1;
    historyIndex = targetIndex;
    tagHistory(target, targetIndex);
    const targetScroll = direction < 0 || revisiting ? scrollPositions.get(target) || 0 : 0;
    const run = ++serial;
    clearMotion();
    main.dataset.motionDirection = direction > 0 ? 'forward' : 'back';

    // Instant navigation also covers missing runtime and open editing dialogs.
    if (!gsap || reduced.matches || document.querySelector('dialog[open]')) {
      showRoute(target, targetScroll);
      return;
    }
    const mobile = innerWidth <= 700;
    const distance = mobile ? 18 : 34;
    const angle = mobile ? 3 : 5;
    main.classList.add('route-changing');
    main.setAttribute('aria-busy', 'true');
    main.dataset.motionPhase = 'leaving';
    gsap.set(main, {transformPerspective: 1500, transformOrigin: '50% 180px'});
    active = gsap.timeline({defaults: {ease: 'power2.out'}, onComplete: () => {
      if (run === serial) clearMotion();
    }});
    active.addLabel('leave', 0)
      .to(main, {x: -direction * distance * .65, rotationY: -direction * angle,
        scale: .992, autoAlpha: 0, duration: .14}, 'leave')
      .addLabel('enter')
      .call(() => {
        if (run !== serial) return;
        showRoute(target, targetScroll);
        main.dataset.motionPhase = 'entering';
      }, [], 'enter')
      .fromTo(main, {x: direction * distance, rotationY: direction * angle, scale: .992, autoAlpha: 0},
        {x: 0, rotationY: 0, scale: 1, autoAlpha: 1, duration: .28, immediateRender: false}, 'enter');
  }

  const rememberScroll = () => {
    if (!active) scrollPositions.set(renderedRoute, window.scrollY);
  };
  const onReducedChange = () => {
    if (!reduced.matches || !active) return;
    ++serial;
    clearMotion();
    showRoute(route(), 0);
  };
  window.addEventListener('hashchange', navigate);
  window.addEventListener('scroll', rememberScroll, {passive: true});
  reduced.addEventListener('change', onReducedChange);
  return {destroy() {
    ++serial;
    clearMotion();
    window.removeEventListener('hashchange', navigate);
    window.removeEventListener('scroll', rememberScroll);
    reduced.removeEventListener('change', onReducedChange);
  }};
}
