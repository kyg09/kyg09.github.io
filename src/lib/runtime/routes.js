// 섹션과 상세 페이지는 URL을 공유 가능한 상태로 사용한다. /en 접두사는 언어만 바꾼다.
export function parsePath(pathname) {
  var parts = pathname.split(/[?#]/, 1)[0].split('/').filter(Boolean);
  if (parts[0] === 'en') parts.shift();
  return { section: parts[0] || '', slug: parts[1] || '' };
}

export function locationRoute() {
  return parsePath(location.pathname);
}

var itemPrefix = { projects: 'projects', thoughts: 'thoughts' };

export function findTarget(route) {
  if (route.slug && itemPrefix[route.section]) {
    var item = document.getElementById(itemPrefix[route.section] + '-' + route.slug);
    if (item) return item;
  }
  return route.section ? document.getElementById(route.section) : null;
}

// Next.js가 같은 페이지 트리를 브라우저의 뒤로/앞으로 이동에서 재사용하도록
// 기존 히스토리 상태는 보존하고 포트폴리오의 패널 표시 여부만 갱신한다.
export function updateHistory(method, path, sheet) {
  const state = { ...history.state };
  if (sheet !== undefined) state.sheet = sheet;
  history[method](state, '', path);
}
