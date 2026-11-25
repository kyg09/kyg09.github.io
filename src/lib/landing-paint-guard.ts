// 인트로가 필요한 경우 로고가 로드되기 전 본문이 잠깐 보이는 현상을 막는다.
// 저장소에 접근할 수 없거나 로고가 열리지 않아도 본문을 다시 표시한다.
export const landingPaintGuard = `(() => {
  if (!['/', '/en', '/en/'].includes(location.pathname) || location.hash) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  try {
    if (Number(localStorage.getItem('portfolio:landing-hidden-until')) > Date.now()) return;
  } catch {}

  const reloading = performance.getEntriesByType('navigation')[0]?.type === 'reload';
  try {
    if (!reloading && sessionStorage.getItem('portfolio:landing-seen')) return;
  } catch {}

  const root = document.documentElement;
  root.classList.add('has-landing-intro');
  setTimeout(() => {
    if (!document.querySelector('#landing-intro[open]')) root.classList.remove('has-landing-intro');
  }, 4500);
})();`;
