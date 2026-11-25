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
  // 첫 방문의 느린 스크립트 다운로드 중에는 본문을 먼저 노출하지 않는다.
  // 페이지 로드가 끝나도 런타임이 시작하지 못했을 때만 보호 화면을 해제한다.
  const releaseIfUnavailable = () => setTimeout(() => {
    if (!document.querySelector('#landing-intro[open]')) root.classList.remove('has-landing-intro');
  }, 4500);
  if (document.readyState === 'complete') releaseIfUnavailable();
  else window.addEventListener('load', releaseIfUnavailable, { once: true });
})();`;
