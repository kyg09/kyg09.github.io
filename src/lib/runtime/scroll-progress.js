const progressControls = new WeakMap();

// 진행률만 그린다. 스크롤·터치 이벤트로 모달을 닫는 동작은 연결하지 않는다.
export function initCloseProgress(scroller, ring, content) {
  if (!scroller || !ring) return { update() {} };
  if (progressControls.has(scroller)) return progressControls.get(scroller);

  var circumference = 2 * Math.PI * Number(ring.getAttribute('r'));
  var frame = 0;
  function update() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    var max = scroller.scrollHeight - scroller.clientHeight;
    var progress = max > 0 ? Math.max(0, Math.min(1, scroller.scrollTop / max)) : 0;
    ring.style.strokeDashoffset = (circumference * (1 - progress)).toFixed(2);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }
  scroller.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  var observer = typeof ResizeObserver === 'function' ? new ResizeObserver(schedule) : null;
  observer?.observe(scroller);
  if (content) observer?.observe(content);
  document.fonts?.ready.then(schedule);
  var control = { update };
  progressControls.set(scroller, control);
  update();
  return control;
}
