const markerWidth = 20;
const markerHeight = 8;

export function initRailPagination({ rail, cards, onSelect, translate, reduceMotion = false }) {
  const doc = rail.ownerDocument;
  const view = doc.defaultView;
  const container = doc.createElement('div');
  container.className = 'rail-pagination';
  container.setAttribute('role', 'group');
  const marker = doc.createElement('span');
  marker.className = 'rail-pagination-marker';
  marker.setAttribute('aria-hidden', 'true');
  const motion = view.matchMedia?.('(prefers-reduced-motion: reduce)');
  let renderedCards = [];
  let dots = [];
  let positions = [];
  let current = null;
  let transitionFrame = 0;

  function applyPosition(position) {
    container.style.setProperty('--pagination-marker-left', position.left + 'px');
    container.style.setProperty('--pagination-marker-right', position.right + 'px');
    container.style.setProperty('--pagination-marker-top', position.top + 'px');
  }

  function measure() {
    view.cancelAnimationFrame(transitionFrame);
    container.classList.remove('is-positioned');
    const { left, top, width } = container.getBoundingClientRect();
    if (!width || !dots.length || container.hidden) {
      positions = [];
      marker.style.visibility = 'hidden';
      return;
    }

    positions = dots.map(dot => {
      const bounds = dot.getBoundingClientRect();
      const x = bounds.left - left + bounds.width / 2;
      return {
        x,
        left: x - markerWidth / 2,
        right: width - x - markerWidth / 2,
        top: bounds.top - top + (bounds.height - markerHeight) / 2,
      };
    });
    const position = positions[renderedCards.indexOf(current)];
    if (position) applyPosition(position);
    marker.style.visibility = position ? '' : 'hidden';
    transitionFrame = view.requestAnimationFrame(() => {
      transitionFrame = 0;
      container.classList.add('is-positioned');
    });
  }

  function updateLabels() {
    const section = rail.getAttribute('aria-label');
    const action = translate('슬라이드 페이지 선택');
    container.setAttribute('aria-label', section ? section + ' · ' + action : action);
    const label = translate('총 {total}개 중 {index}번째 슬라이드로 이동');
    dots.forEach((dot, index) => {
      dot.setAttribute('aria-label', label
        .replace('{total}', String(renderedCards.length))
        .replace('{index}', String(index + 1)));
    });
  }

  function update(card) {
    const target = renderedCards.indexOf(card);
    if (target < 0 || card === current) return;
    const previous = renderedCards.indexOf(current);
    if (previous >= 0) dots[previous].removeAttribute('aria-current');
    dots[target].setAttribute('aria-current', 'true');
    current = card;

    const destination = positions[target];
    const origin = positions[previous];
    if (!destination || !origin) {
      if (!container.hidden) measure();
      return;
    }

    let direction = destination.x < origin.x ? 'left' : 'right';
    // 방향이 바뀔 때만 진행 중인 표시의 실제 위치를 확인한다. 점의 자리는
    // 그대로 두고, CSS가 현재 양끝 좌표에서 새 위치로 이어서 움직인다.
    if (container.dataset.direction && direction !== container.dataset.direction &&
        container.classList.contains('is-positioned') && !(motion?.matches ?? reduceMotion)) {
      const bounds = marker.getBoundingClientRect();
      const visualCenter = bounds.left - container.getBoundingClientRect().left + bounds.width / 2;
      direction = destination.x < visualCenter ? 'left' : 'right';
    }
    container.dataset.direction = direction;
    applyPosition(destination);
  }

  function updateCards() {
    const focused = renderedCards[dots.indexOf(doc.activeElement)];
    renderedCards = [...cards];
    if (!renderedCards.includes(current)) current = renderedCards[0] ?? null;
    dots = renderedCards.map(card => {
      const dot = doc.createElement('button');
      dot.type = 'button';
      dot.className = 'rail-pagination-dot';
      if (card === current) dot.setAttribute('aria-current', 'true');
      return dot;
    });
    container.hidden = renderedCards.length < 2;
    container.replaceChildren(...dots, marker);
    updateLabels();
    measure();
    if (!container.hidden && renderedCards.includes(focused)) {
      dots[renderedCards.indexOf(focused)].focus({ preventScroll: true });
    }
  }

  function select(event) {
    const dot = event.target.closest('.rail-pagination-dot');
    const index = dots.indexOf(dot);
    if (index >= 0) onSelect(renderedCards[index]);
  }

  container.addEventListener('click', select);
  rail.after(container);
  updateCards();
  const resize = view.ResizeObserver ? new view.ResizeObserver(measure) : null;
  if (resize) resize.observe(container);
  else view.addEventListener('resize', measure);

  return {
    element: container,
    update,
    updateCards,
    updateLabels,
    dispose() {
      view.cancelAnimationFrame(transitionFrame);
      resize?.disconnect();
      view.removeEventListener('resize', measure);
      container.removeEventListener('click', select);
      container.remove();
    },
  };
}
