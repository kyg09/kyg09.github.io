// 첫 소개의 글자·주변 흐림 전환이 끝날 때까지만 페이지의 휠 입력을 막는다.
// 스크롤 위치나 body 레이아웃을 바꾸지 않아 해제할 때 화면이 튀지 않는다.
export function lockHeroIntroScroll({ root, reveal }) {
  var doc = root.ownerDocument;
  var view = doc.defaultView;
  var home = doc.getElementById('home');
  var lifecycle = new AbortController();
  var motion = view.matchMedia('(prefers-reduced-motion: reduce)');
  var closed = false;
  var frame = 0;
  var language = root.lang;
  var fog = doc.getAnimations().filter(function (animation) {
    return animation.animationName === 'heroFog' && animation.playState !== 'finished';
  }).map(function (animation) { return animation.finished; });
  // 취소된 CSS 애니메이션도 즉시 수거해 처리되지 않은 rejection을 남기지 않는다.
  var fogDone = Promise.allSettled(fog);

  function release() {
    if (closed) return;
    closed = true;
    root.classList.remove('is-intro-revealing');
    delete root.dataset.introScrollLocked;
    lifecycle.abort();
    view.cancelAnimationFrame(frame);
    state.disconnect();
  }

  function preventWheel(event) {
    // 트랙패드 확대/축소는 스크롤 잠금과 별개로 유지한다.
    if (!event.ctrlKey && event.cancelable) event.preventDefault();
  }

  function syncState() {
    if (root.lang !== language || root.classList.contains('has-sheet')) release();
  }

  var state = new MutationObserver(syncState);
  state.observe(root, { attributes: true, attributeFilter: ['class', 'lang'] });
  var options = { signal: lifecycle.signal };
  view.addEventListener('wheel', preventWheel, { capture: true, passive: false, signal: lifecycle.signal });
  view.addEventListener('pagehide', release, options);
  view.addEventListener('hashchange', release, options);
  view.addEventListener('popstate', release, options);
  doc.addEventListener('visibilitychange', function () { if (doc.hidden) release(); }, options);
  doc.addEventListener('focusin', function (event) {
    if (event.target !== doc.body && !event.target.closest('#about, #landing-intro')) release();
  }, options);
  doc.querySelectorAll('dialog:not(#landing-intro)').forEach(function (dialog) {
    dialog.addEventListener('toggle', function () { if (dialog.open) release(); }, options);
  });
  motion.addEventListener('change', function () { if (motion.matches) release(); }, options);
  root.dataset.introScrollLocked = 'true';

  reveal.finished.then(function () {
    if (closed) return;
    root.classList.remove('is-intro-revealing');
    // 클래스 해제로 시작되는 실제 opacity/filter 복원까지 기다린다.
    // 무한 반복되는 구직 상태 불빛 등의 애니메이션은 포함하지 않는다.
    frame = view.requestAnimationFrame(function () {
      frame = 0;
      if (closed) return;
      var exits = home ? Array.from(home.children).filter(function (section) {
        return section.id !== 'about';
      }).flatMap(function (section) {
        return section.getAnimations().filter(function (animation) {
          return ['opacity', 'filter'].includes(animation.transitionProperty);
        }).map(function (animation) { return animation.finished; });
      }) : [];
      Promise.allSettled([fogDone].concat(exits)).then(release);
    });
  }, release);

  if (motion.matches) release();
  return release;
}
