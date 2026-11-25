import { createPortfolioI18n } from '@/lib/runtime/language';
import { showLandingIntro } from '@/lib/runtime/landing-intro';
import { initRailPagination } from '@/lib/runtime/rail-pagination';
import { initProjectMedia } from '@/lib/runtime/media-gallery';
import { findTarget, locationRoute, parsePath, updateHistory } from '@/lib/runtime/routes';
import { initResume } from '@/lib/runtime/resume';
import { initCloseProgress } from '@/lib/runtime/scroll-progress';
import { showConsoleWelcome } from '@/lib/runtime/console-welcome';
import { lockHeroIntroScroll } from '@/lib/runtime/intro-scroll-lock';

const initializedDocuments = new WeakSet();

// 같은 문서에서 모든 섹션과 상세 패널이 URL을 공유한다.
// React 개발 모드의 반복 마운트에서도 인터랙션을 한 번만 연결한다.
export function startPortfolioRuntime() {
  if (initializedDocuments.has(document)) return;
  initializedDocuments.add(document);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 카드 장식은 데스크톱의 실제 마우스 hover에서만 실행한다.
  var cardHover = window.matchMedia('(min-width: 769px) and (hover: hover) and (pointer: fine)');
  function canHoverCard(event) { return cardHover.matches && event.pointerType === 'mouse'; }
  var baseTitle = '김영근 · Frontend Developer';
  var currentTitle = '';
  var mediaDialog = document.getElementById('project-media-dialog');
  var i18n = createPortfolioI18n();
  showConsoleWelcome(i18n.translate);

  // 이메일 복사와 결과 메시지
  var toastTimer;

  function showCopyToast(message) {
    var toast = document.querySelector('.copy-toast');
    clearTimeout(toastTimer);
    toast.replaceChildren(message);
    toast.classList.add('is-visible');
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
      toast.textContent = '';
    }, 2600);
  }

  function initEmailCopy() {
    var button = document.querySelector('.copy-email');
    if (!button) return;

    button.addEventListener('click', async function () {
      try {
        await navigator.clipboard.writeText(button.textContent.trim());
        showCopyToast('Email copied');
      } catch (error) {
        showCopyToast('Could not copy the email address');
      }
    });
  }

  // 첫 화면 문구의 순차 등장
  function animateHeroWords() {
    var hero = document.querySelector('.hero-statement');
    if (!hero || hero.dataset.animated) return;

    // Wrap every word in a span, inside links too, so the names keep their markup
    var wordIndex = 0;
    var lastWord;
    var walker = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (!node.textContent.trim()) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (word) {
        if (!word) return;
        if (!word.trim()) { frag.appendChild(document.createTextNode(word)); return; }
        var span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        span.style.animationDelay = (0.3 + wordIndex * 0.04) + 's';
        frag.appendChild(span);
        lastWord = span;
        wordIndex++;
      });
      node.parentNode.replaceChild(frag, node);
    });

    hero.dataset.animated = 'true';
    if (reduceMotion || locationRoute().section || location.hash || !lastWord || !lastWord.getAnimations) return;

    var reveal = lastWord.getAnimations().find(function (animation) {
      return animation.animationName === 'wordReveal';
    });
    if (!reveal) return;
    var root = document.documentElement;
    root.classList.add('is-intro-revealing');
    lockHeroIntroScroll({ root: root, reveal: reveal });
  }

  // 경력 카드의 포인터 반응
  // The tile leans a little toward the pointer and a faint grainy shade
  // follows it; the mark itself stays put. Every value eases toward its target each frame,
  // so the tile trails the mouse instead of snapping to it.
  function initCompanyTiles() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var TILT = 3, EASE = 0.05;

    document.querySelectorAll('.company-mark').forEach(function (tile) {
      var now = { x: 0, y: 0, on: 0 }, to = { x: 0, y: 0, on: 0 }, raf = 0;

      function frame() {
        now.x += (to.x - now.x) * EASE;
        now.y += (to.y - now.y) * EASE;
        now.on += (to.on - now.on) * EASE;
        tile.style.transform = 'perspective(800px) rotateX(' + (-now.y * TILT).toFixed(2) + 'deg) rotateY(' + (now.x * TILT).toFixed(2) + 'deg)';
        tile.style.setProperty('--lx', (50 + now.x * 100).toFixed(1) + '%');
        tile.style.setProperty('--ly', (50 + now.y * 100).toFixed(1) + '%');
        tile.style.setProperty('--lo', (now.on * 0.8).toFixed(3));
        var moving = Math.abs(to.x - now.x) + Math.abs(to.y - now.y) + Math.abs(to.on - now.on) > 0.001;
        raf = moving ? requestAnimationFrame(frame) : 0;
      }

      function aim(e) {
        if (!canHoverCard(e)) return;
        var r = tile.getBoundingClientRect();
        to.x = (e.clientX - r.left) / r.width - 0.5;
        to.y = (e.clientY - r.top) / r.height - 0.5;
        to.on = 1;
        if (!raf) raf = requestAnimationFrame(frame);
      }

      function clear() {
        if (!raf && now.x === 0 && now.y === 0 && now.on === 0) return;
        cancelAnimationFrame(raf); raf = 0;
        now = { x: 0, y: 0, on: 0 }; to = { x: 0, y: 0, on: 0 };
        tile.style.removeProperty('transform');
        ['--lx', '--ly', '--lo'].forEach(function (name) { tile.style.removeProperty(name); });
      }
      cardHover.addEventListener('change', function () { if (!cardHover.matches) clear(); });
      function reset() {
        if (!cardHover.matches) { clear(); return; }
        // 비활성 카드는 전역 스크롤·pointerup마다 같은 애니메이션을 다시 예약하지 않는다.
        if (to.x === 0 && to.y === 0 && to.on === 0) return;
        to.x = 0; to.y = 0; to.on = 0;
        if (!raf) raf = requestAnimationFrame(frame);
      }
      tile.addEventListener('pointerenter', function (event) { if (event.pointerType === 'mouse') aim(event); });
      tile.addEventListener('pointerdown', aim);
      tile.addEventListener('pointermove', function (event) { if (event.pointerType === 'mouse' || event.buttons) aim(event); });
      tile.addEventListener('pointerleave', reset);
      document.addEventListener('pointerup', reset);
      document.addEventListener('pointercancel', reset);
      document.addEventListener('scroll', reset, { capture: true, passive: true });
      window.addEventListener('blur', reset);
    });
  }

  // 표지 카드와 상세 패널이 같은 프로젝트 영상을 참조한다.
  function projectCardVideo(card) {
    if (!card) return null;
    var video = card.querySelector('video[data-src]');
    if (video) return video;
    var article = document.getElementById(card.dataset.controls);
    return article && article.querySelector('.case-cover video[data-src]');
  }

  // 소개 영역에 연결된 장식 효과
  // Hovering a name in the intro floats that project's card recording next to
  // the pointer. One shared card follows with a little lag; moving from one
  // name to the next swaps the clip without replaying the entrance.
  function initHeroPeek() {
    var links = document.querySelectorAll('.hero-statement a[data-controls^="projects-"], .now-statement a[data-peek], .experience-project');
    if (!links.length) return;

    var peek = document.createElement('div');
    peek.className = 'hero-peek';
    peek.setAttribute('aria-hidden', 'true');
    var video = document.createElement('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    peek.appendChild(video);
    document.body.appendChild(peek);

    var OFFSET = 20;
    var FOLLOW = reduceMotion ? 1 : 0.16;
    var x = 0, y = 0, tx = 0, ty = 0, raf = 0, active = null, hideTimer = 0;

    function clipFor(link) {
      // A link outside the site carries its own clip
      if (link.dataset.peek) {
        return { src: link.dataset.peek, poster: link.dataset.peekPoster || '', fill: link.dataset.peekFill || '', ratio: parseFloat(link.dataset.peekRatio) || 1.6, round: link.dataset.peekRound || '' };
      }
      var card = document.querySelector('.card[href="' + link.getAttribute('href') + '"]');
      if (card && card.dataset.peek) {
        return { src: card.dataset.peek, poster: card.dataset.peekPoster, fill: '', ratio: parseFloat(card.dataset.peekRatio) || 1.6 };
      }
      var v = projectCardVideo(card);
      if (!v) return null;
      var visual = v.closest('.card-media, .case-cover');
      return {
        src: videoSource(v),
        poster: v.getAttribute('poster') || '',
        fill: card.style.getPropertyValue('--fill') || '',
        ratio: parseFloat((visual && visual.style.getPropertyValue('--r')) || v.style.getPropertyValue('--r')) || 1.6
      };
    }

    function place() {
      var w = peek.offsetWidth, h = peek.offsetHeight;
      var nx = tx + OFFSET, ny = ty + OFFSET;
      if (nx + w > innerWidth - 12) nx = tx - OFFSET - w;
      if (ny + h > innerHeight - 12) ny = ty - OFFSET - h;
      return [Math.max(12, Math.min(nx, innerWidth - w - 12)), Math.max(12, Math.min(ny, innerHeight - h - 12))];
    }

    function tick() {
      var to = place();
      x += (to[0] - x) * FOLLOW;
      y += (to[1] - y) * FOLLOW;
      peek.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      raf = Math.abs(to[0] - x) + Math.abs(to[1] - y) > 0.2 ? requestAnimationFrame(tick) : 0;
    }

    function track(e) {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function show(link, e) {
      if (!canHoverCard(e)) return;
      var clip = clipFor(link);
      if (!clip) return;
      clearTimeout(hideTimer);
      tx = e.clientX;
      ty = e.clientY;
      if (!peek.classList.contains('is-visible')) {
        // Start where the pointer is, so it doesn't fly in from the corner
        peek.style.setProperty('--r', clip.ratio);
        var start = place();
        x = start[0];
        y = start[1];
        peek.style.translate = x + 'px ' + y + 'px';
      }
      if (active !== link) {
        active = link;
        peek.style.setProperty('--fill', clip.fill);
        peek.style.setProperty('--r', clip.ratio);
        // A capture with its own rounded corners is cut along them
        peek.style.setProperty('--peek-round', clip.round || '');
        if (video.getAttribute('src') !== clip.src) {
          video.poster = clip.poster;
          video.src = clip.src;
        }
        var playing = !reduceMotion && video.play();
        if (playing && playing.catch) playing.catch(function () {});
      }
      peek.classList.add('is-visible');
    }

    function hide() {
      hideTimer = setTimeout(function () {
        peek.classList.remove('is-visible');
        active = null;
        video.pause();
      }, 60);
    }

    function clearPeek() {
      clearTimeout(hideTimer); cancelAnimationFrame(raf); raf = 0;
      peek.classList.remove('is-visible'); active = null; video.pause();
    }
    cardHover.addEventListener('change', function () { if (!cardHover.matches) clearPeek(); });
    links.forEach(function (link) {
      link.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(link, e); });
      link.addEventListener('pointerdown', function (e) { if (!canHoverCard(e)) clearPeek(); });
      link.addEventListener('pointermove', function (e) {
        if (!canHoverCard(e)) return;
        if (active !== link) show(link, e);
        track(e);
      });
      link.addEventListener('pointerleave', hide);
      link.addEventListener('click', hide);
    });
    function endTouch(e) { if (e.pointerType !== 'mouse') hide(); }
    document.addEventListener('pointerup', endTouch, true);
    document.addEventListener('pointercancel', endTouch, true);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', function () {
      if (active) {
        peek.classList.remove('is-visible');
        active = null;
        video.pause();
      }
    }, { passive: true });
  }

  // 프로젝트 카드 제목 표시
  // On a pointer, the cards carry no text: a frosted label with the name and
  // one quiet word rides next to the cursor instead.
  function initCardTip() {
    var cards = document.querySelectorAll('.card-rail .card, .project-featured .card, .note-grid .card, .company-grid .card');
    if (!cards.length) return;

    var tip = document.createElement('div');
    tip.className = 'card-tip';
    tip.setAttribute('aria-hidden', 'true');
    tip.innerHTML = '<span class="card-tip-name"></span><span class="card-tip-info"></span>';
    document.body.appendChild(tip);
    var nameEl = tip.firstChild, infoEl = tip.lastChild;

    var OFFSET = 14;
    var FOLLOW = reduceMotion ? 1 : 0.22;
    var x = 0, y = 0, tx = 0, ty = 0, raf = 0, active = null;

    function tick() {
      x += (tx - x) * FOLLOW;
      y += (ty - y) * FOLLOW;
      tip.style.translate = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(tick) : 0;
    }

    function aim(e) {
      tx = Math.max(12, Math.min(e.clientX + OFFSET, innerWidth - tip.offsetWidth - 12));
      ty = Math.max(12, Math.min(e.clientY + OFFSET, innerHeight - tip.offsetHeight - 12));
    }

    function show(card, e) {
      if (!canHoverCard(e)) return;
      var title = card.querySelector('.card-title');
      nameEl.textContent = title ? title.textContent.replace('↗', '').trim() : '';
      var line = card.querySelector('.company-line');
      infoEl.textContent = card.dataset.tip || (line ? line.textContent : '');
      aim(e);
      if (!tip.classList.contains('is-visible')) {
        x = tx; y = ty;
        tip.style.translate = x + 'px ' + y + 'px';
      }
      active = card;
      tip.classList.add('is-visible');
    }

    function hide() {
      cancelAnimationFrame(raf); raf = 0;
      active = null;
      tip.classList.remove('is-visible');
    }

    cardHover.addEventListener('change', function () { if (!cardHover.matches) hide(); });
    cards.forEach(function (card) {
      card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') show(card, e); });
      card.addEventListener('pointermove', function (e) {
        if (!canHoverCard(e)) return;
        if (active !== card) show(card, e);
        aim(e);
        if (!raf) raf = requestAnimationFrame(tick);
      });
      card.addEventListener('pointerleave', hide);
      card.addEventListener('pointerdown', hide);
    });
    function endTouch(e) { if (e.pointerType !== 'mouse') hide(); }
    document.addEventListener('pointerup', endTouch, true);
    document.addEventListener('pointercancel', endTouch, true);
    window.addEventListener('blur', hide);
    window.addEventListener('scroll', function () { if (active) hide(); }, { passive: true });
  }

  // 업무 아코디언은 한 항목만 열고 닫힌 내용은 포커스에서 제외한다.
  function initWorkAccordion() {
    var openTrigger = document.querySelector('.work-trigger[aria-expanded="true"]');
    function setExpanded(trigger, expanded) {
      trigger.setAttribute('aria-expanded', String(expanded));
      trigger.closest('.work-card').classList.toggle('is-open', expanded);
      document.getElementById(trigger.getAttribute('aria-controls')).inert = !expanded;
    }

    document.querySelectorAll('.work-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var next = openTrigger === trigger ? null : trigger;
        if (openTrigger) setExpanded(openTrigger, false);
        if (next) setExpanded(next, true);
        openTrigger = next;
      });
    });
  }

  // 화면에 들어온 콘텐츠를 드러내고 영상은 필요한 때만 재생한다.
  // A project sheet's content fades in piece by piece as it scrolls into view:
  // cover, each paragraph, each fact, each screen. Whatever arrives together
  // staggers; the first batch waits for the sheet to finish opening.
  var sheetRevealItems = '.case-cover, .case-intro > *, .case-story > *, .case-facts > div, .case-shot, .case-strip, .case-posters > *, .case-download';

  function revealSheet(article) {
    if (reduceMotion || article._revealed || !('IntersectionObserver' in window)) return;
    var scroller = article.querySelector('.sheet-scroll');
    var items = article.querySelectorAll(sheetRevealItems);
    if (!scroller || !items.length) return;
    article._revealed = true;
    var first = true;
    var observer = new IntersectionObserver(function (entries) {
      var arriving = entries.filter(function (entry) { return entry.isIntersecting; })
        .map(function (entry) { return entry.target; })
        .sort(function (a, b) { return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1; });
      arriving.forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', (first ? 220 : 0) + Math.min(i, 7) * 140 + 'ms');
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
      if (arriving.length) first = false;
    }, { root: scroller, rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      el.classList.add('sheet-reveal');
      observer.observe(el);
    });
  }

  function initSectionReveals() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-section-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -48px 0px', threshold: 0 });

    document.querySelectorAll('#home > .site-section:not(#about)').forEach(function (section) {
      // Already visible sections and deep-link destinations stay immediately readable.
      if (section.getBoundingClientRect().top < window.innerHeight) return;
      section.classList.add('section-reveal');
      observer.observe(section);
    });
  }

  function initReveals() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Stagger only what arrives together, so late tiles never wait long.
        entry.target.style.setProperty('--reveal-delay', Math.min(batch, 6) * 70 + 'ms');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
        batch++;
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    var viewportBottom = window.innerHeight;
    items.forEach(function (el) {
      // The section entrance already moves these elements together.
      if (el.closest('#home > .site-section:not(#about)')) {
        el.classList.add('is-visible');
        return;
      }
      // Anything already on screen or scrolled past (a deep link landing
      // mid-page) shows right away; the observer handles what comes later.
      if (el.getBoundingClientRect().top < viewportBottom) {
        el.classList.add('is-visible');
        return;
      }
      observer.observe(el);
    });
  }

  function playVideo(video) {
    if (reduceMotion || video.closest('#projects .card-rail .card:not(.is-current)')) return;
    // A clip that plays once (no loop) holds its last frame instead of starting over
    if (video.ended && !video.loop) return;
    if (!video.getAttribute('src')) {
      video.src = videoSource(video);
      video.load();
    }
    var playing = video.play();
    if (playing && playing.catch) playing.catch(function () {});
  }

  // Transparent clips: Safari plays HEVC with alpha, the others VP9 with alpha;
  // anything else falls back to the mp4.
  var alphaKind = (function () {
    var probe = document.createElement('video');
    var safari = /^((?!chrome|chromium|android).)*safari/i.test(navigator.userAgent);
    if (safari) return probe.canPlayType('video/mp4; codecs="hvc1"') ? 'hevc' : '';
    return probe.canPlayType('video/webm; codecs="vp09.00.10.08"') ? 'webm' : '';
  })();

  function videoSource(video) {
    return (alphaKind && video.getAttribute('data-src-' + alphaKind)) ||
      video.getAttribute('data-src') || video.getAttribute('src');
  }

  var videoObserver = null;

  // A covered preview can pause without affecting the open media.
  function behindOverlay(video) {
    if (mediaDialog && mediaDialog.open && !mediaDialog.contains(video)) return true;
    // A closing case has its scroller set inert already, so it no longer counts
    return Array.prototype.some.call(document.querySelectorAll('.sheet.is-open'), function (sheet) {
      return !sheet.contains(video) && !sheet.querySelector('.sheet-scroll[inert]');
    });
  }

  function syncLazyVideo(video) {
    if (video._inView && !video.closest('[inert]') && !document.hidden && !behindOverlay(video)) playVideo(video);
    else if (!video.paused) video.pause();
  }

  function initLazyVideos() {
    var videos = document.querySelectorAll('video[data-src]:not(.project-media-tile video)');
    if (!videos.length || reduceMotion || !('IntersectionObserver' in window)) return;

    var observer = videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var video = entry.target;
        video._inView = entry.isIntersecting;
        // Videos in a closed project case wait until it opens (setSheetOpen).
        syncLazyVideo(video);
      });
    }, { rootMargin: '200px 0px' });

    videos.forEach(function (video) { observer.observe(video); });

    // A tab in the background plays nothing; coming back resumes what is on screen.
    document.addEventListener('visibilitychange', function () {
      videos.forEach(syncLazyVideo);
    });
  }

  // 프로젝트가 화면에 닿기 전에 포스터와 인접 영상만 준비한다. 재생은 기존 중앙 카드 판정이 관리한다.
  function initProjectPreviewPreload() {
    var projects = document.getElementById('projects');
    if (!projects) return;
    var targets = Array.from(projects.querySelectorAll('.project-featured .card, .card-rail'));
    var posters = new Map();
    var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    function warmCard(card) {
      if (!card || document.hidden) return;
      card.querySelectorAll('video[data-src]').forEach(function (video) {
        var poster = video.getAttribute('poster');
        if (poster && !posters.has(poster)) {
          var image = new Image();
          image.decoding = 'async';
          image.src = poster;
          posters.set(poster, image);
          if (image.decode) image.decode().catch(function () {});
        }
        // 데이터 절약·느린 연결·모션 감소에서는 정지 화면만 준비한다.
        if (reduceMotion || (connection && (connection.saveData || /(^|-)2g$/.test(connection.effectiveType || '')))) return;
        if (video.getAttribute('src')) return;
        var source = videoSource(video);
        if (!source) return;
        video.preload = 'auto';
        video.src = source;
        video.load();
      });
    }

    function warmTarget(target, current) {
      if (!target._previewNear || document.hidden) return;
      if (!target.classList.contains('card-rail')) { warmCard(target); return; }
      var track = target.querySelector('.card-track');
      var cards = track ? readRailCards(track) : [];
      var active = current || cards.find(function (card) { return card.classList.contains('is-current'); });
      var index = cards.indexOf(active);
      if (index < 0) return;
      // 무한 루프에서도 원본의 현재·다음·이전 카드만 사용하고 시각용 사본은 로드하지 않는다.
      [0, 1, -1].forEach(function (offset) {
        warmCard(cards[(index + offset + cards.length) % cards.length]);
      });
    }

    targets.forEach(function (target) {
      if (target.classList.contains('card-rail')) {
        target._preloadMedia = function (current) { warmTarget(target, current); };
      }
    });
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target._previewNear = entry.isIntersecting;
          if (entry.isIntersecting) warmTarget(entry.target);
        });
      }, { rootMargin: '600px 0px' });
      targets.forEach(function (target) { observer.observe(target); });
    }
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) targets.forEach(function (target) { warmTarget(target); });
    });
  }

  function scrollToTarget(el, smooth) {
    if (!el) return;
    // Sheets cover the screen; scroll the page to their section underneath.
    if (el.classList.contains('sheet')) el = el.closest('section') || document.getElementById('about');
    if (!el) return;
    el.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : 'auto', block: 'start' });
  }

  function setTitle(text) {
    currentTitle = text;
    var identity = i18n.translate(baseTitle);
    document.title = text ? text + ' — ' + identity : identity;
  }

  // 열린 상세 패널은 하나만 유지한다. 카드 위치에서 화면 전체로 확장하고 닫을 때는 역방향으로 전환한다.
  var openSheet = null;

  function cardFor(article) {
    return article._opener || document.querySelector('[data-controls="' + article.id + '"]:not(.experience-project)');
  }

  // Once the footer fills most of the screen the page turns over to white on
  // black; scrolling back up turns it back.
  function initFooterInvert() {
    var footer = document.querySelector('.site-footer');
    if (!footer || !('IntersectionObserver' in window)) return;
    var root = document.documentElement;
    new IntersectionObserver(function (entries) {
      var e = entries[0];
      root.classList.toggle('is-inverted', e.isIntersecting && e.intersectionRect.height > window.innerHeight * 0.55);
    }, { threshold: [0, 0.2, 0.4, 0.5, 0.6, 0.8, 1] }).observe(footer);
  }

  // The footer signature writes itself in once, when it comes into view.
  function initSignature() {
    var sig = document.querySelector('.signature');
    if (!sig || !('IntersectionObserver' in window)) return;
    var footer = sig.parentNode;
    sig.classList.add('will-sign');
    footer.classList.add('will-sign');
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      requestAnimationFrame(function () {
        sig.classList.add('is-signed');
        footer.classList.add('is-signed');
        if (!reduceMotion) writeSignature(sig, 450);
      });
    }, { rootMargin: '0px 0px -30% 0px' });
    // Watch the footer: the hidden signature itself counts as zero area.
    io.observe(footer);
  }

  // A hand doesn't move at one speed: it runs along straight lines and slows
  // into curves and loops, starts quickly and lands softly. Each stroke gets
  // that speed profile from its own shape, then plays as dash keyframes.
  var PEN_FAST = 1.1;   // units per ms on a straight run
  var PEN_CURVE = 34;   // how much a turn (radians per unit) slows the pen
  function strokeKeyframes(path) {
    var length = path.getTotalLength();
    var step = 1.5;
    var points = [];
    for (var s = 0; s <= length; s += step) points.push(path.getPointAtLength(s));
    points.push(path.getPointAtLength(length));
    var speeds = [];
    for (var i = 1; i < points.length; i++) {
      var a = points[Math.max(0, i - 2)], b = points[i - 1], c = points[i];
      var turn = Math.abs(Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x));
      if (turn > Math.PI) turn = 2 * Math.PI - turn;
      speeds.push(PEN_FAST / (1 + PEN_CURVE * turn / step));
    }
    // smooth the speed so the hand never jerks, then ease in and out of the stroke
    var smooth = speeds.map(function (v, i) {
      var sum = 0, n = 0;
      for (var k = -2; k <= 2; k++) { var w = speeds[i + k]; if (w !== undefined) { sum += w; n++; } }
      return sum / n;
    });
    var times = [0], t = 0, travelled = 0;
    for (var j = 0; j < smooth.length; j++) {
      var d = Math.hypot(points[j + 1].x - points[j].x, points[j + 1].y - points[j].y);
      var ramp = Math.min(1, 0.35 + travelled / 10, 0.35 + (length - travelled) / 8);
      t += d / (smooth[j] * ramp);
      travelled += d;
      times.push(t);
    }
    var frames = [];
    var every = Math.max(1, Math.round(times.length / 48));
    for (var f = 0; f < times.length; f += every) frames.push({ offset: times[f] / t, strokeDashoffset: 1 - Math.min(1, (f * step) / length) });
    frames[frames.length - 1].offset < 1 && frames.push({ offset: 1, strokeDashoffset: 0 });
    frames[0].offset = 0;
    return { frames: frames, duration: Math.max(t, 110) };
  }

  function writeSignature(sig, delay) {
    var at = delay;
    sig.querySelectorAll('path').forEach(function (path) {
      at += Number(path.dataset.lift || 0);
      var stroke = strokeKeyframes(path);
      path.animate(stroke.frames, { duration: stroke.duration, delay: at, fill: 'both' });
      path.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay: at, fill: 'forwards' });
      at += stroke.duration;
    });
  }

  // Where a rail holds its focused card: the centre of the first snap slot.
  // Centred rails put that slot mid-screen; the Thoughts rail at the text column.
  function railFocus(rail) {
    if (rail.hasAttribute('data-loop')) return rail.clientWidth / 2;
    var first = rail.querySelector('.card');
    var pad = parseFloat(getComputedStyle(rail).scrollPaddingLeft) || 0;
    return first ? pad + first.offsetWidth / 2 : rail.clientWidth / 2;
  }

  // Loop mode repositions the original cards with translate; offsets alone
  // point to their old slots and would send the rail backwards at the seam.
  function railCardLeft(rail, card) {
    var bounds = card.getBoundingClientRect();
    return rail.scrollLeft + bounds.left + bounds.width / 2 - rail.getBoundingClientRect().left - railFocus(rail);
  }

  function setRailLoopLeft(rail, left) {
    var cycle = rail._loopCycle;
    if (!cycle) return;
    var wrapped = ((left % cycle) + cycle) % cycle;
    rail.scrollTo({ left: wrapped, behavior: 'instant' });
    if (rail._positionLoop) rail._positionLoop();
  }

  function stopRailMove(rail) {
    cancelAnimationFrame(rail._loopFrame);
    rail._loopFrame = 0;
    rail.style.removeProperty('scroll-snap-type');
  }

  // Wide screens can show more than one cycle. Visual neighbours cover the
  // original's rebasing, without duplicating detail IDs or keyboard stops.
  function readRailCards(track) {
    return Array.from(track.children).filter(function (node) {
      return node.matches('.card:not(.is-loop-copy)');
    });
  }

  function copyLoopCards(track, cards) {
    cards.forEach(function (card, index) {
      [-1, 1].forEach(function (turn) {
        var copy = card.cloneNode(true);
        copy.classList.add('is-loop-copy');
        copy.classList.remove('is-current');
        copy.dataset.loopSource = index;
        copy.dataset.loopTurn = turn;
        copy.removeAttribute('id');
        copy.removeAttribute('data-controls');
        copy.removeAttribute('data-media-description');
        copy.setAttribute('aria-hidden', 'true');
        copy.tabIndex = -1;
        copy.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
        copy.querySelectorAll('a, button, [tabindex]').forEach(function (node) { node.tabIndex = -1; });
        copy.querySelectorAll('video').forEach(function (video) {
          video.removeAttribute('src');
          video.removeAttribute('data-src');
          video.preload = 'none';
        });
        track.appendChild(copy);
      });
    });
  }

  function prepareLoopCopies() {
    document.querySelectorAll('.card-rail[data-loop] .card-track').forEach(function (track) {
      if (!track.querySelector('.is-loop-copy')) copyLoopCards(track, readRailCards(track));
    });
  }

  function initRailLoop(rail, cards) {
    var track = rail.querySelector('.card-track');
    var copies = Array.from(track.querySelectorAll('.is-loop-copy'));
    var step = 0, padding = 0, measuredWidth = 0, wheelTimer, dragging = false, lastX = 0;
    function position() {
      cards.forEach(function (card, index) {
        var turns = Math.round((rail.scrollLeft - index * step) / rail._loopCycle);
        card.style.translate = (turns * rail._loopCycle) + 'px 0';
      });
      copies.forEach(function (copy) {
        var index = Number(copy.dataset.loopSource);
        var turns = Math.round((rail.scrollLeft - index * step) / rail._loopCycle);
        copy.style.translate = ((turns + Number(copy.dataset.loopTurn)) * rail._loopCycle) + 'px 0';
      });
    }
    function measure() {
      var style = getComputedStyle(track);
      var nextStep = parseFloat(style.gridAutoColumns);
      if (step === nextStep && measuredWidth === rail.clientWidth) return;
      var active = cards.findIndex(function (card) { return card.classList.contains('is-current'); });
      stopRailMove(rail);
      step = nextStep;
      padding = parseFloat(style.paddingLeft);
      measuredWidth = rail.clientWidth;
      rail._loopCycle = step * cards.length;
      copies.forEach(function (copy) {
        copy.style.left = (padding + Number(copy.dataset.loopSource) * step) + 'px';
      });
      setRailLoopLeft(rail, Math.max(0, active) * step);
      if (rail._markCurrent) rail._markCurrent();
    }
    function settle() {
      if (rail._markCurrent) rail._markCurrent();
      var card = rail.querySelector('.card.is-current');
      if (card) moveRailTo(rail, card, 0);
    }
    rail._positionLoop = position;
    rail._refreshLoop = function () {
      copies.forEach(function (copy) { copy.remove(); });
      copyLoopCards(track, cards);
      copies = Array.from(track.querySelectorAll('.is-loop-copy'));
      track.style.setProperty('--card-count', String(cards.length));
      measuredWidth = 0;
      measure();
    };
    measure();
    rail.addEventListener('scroll', position, { passive: true });
    var size = new ResizeObserver(measure);
    size.observe(rail);
    size.observe(track);
    // 새 카드 너비로 현재 인덱스를 재판정하기 전에 기존 슬롯 위치를 먼저 맞춘다.
    window.addEventListener('resize', measure);
    rail.addEventListener('wheel', function (event) {
      var delta = event.deltaX || (event.shiftKey ? event.deltaY : 0);
      if (!delta) return;
      event.preventDefault();
      stopRailMove(rail);
      var unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rail.clientWidth : 1;
      setRailLoopLeft(rail, rail.scrollLeft + delta * unit);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(settle, 140);
    }, { passive: false });
    rail.addEventListener('pointerdown', function (event) {
      stopRailMove(rail);
      clearTimeout(wheelTimer);
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      event.preventDefault();
      dragging = true;
      lastX = event.clientX;
    });
    window.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      setRailLoopLeft(rail, rail.scrollLeft + lastX - event.clientX);
      lastX = event.clientX;
    });
    function release() { if (dragging) { dragging = false; settle(); } }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
  }

  function moveRailTo(rail, card, direction) {
    cancelAnimationFrame(rail._loopFrame);
    if (!rail.hasAttribute('data-loop')) {
      rail.scrollTo({ left: railCardLeft(rail, card), behavior: reduceMotion ? 'instant' : 'smooth' });
      return;
    }
    var cycle = rail._loopCycle;
    var start = rail.scrollLeft;
    var delta = railCardLeft(rail, card) - start;
    if (direction > 0 && delta < 0) delta += cycle;
    if (direction < 0 && delta > 0) delta -= cycle;
    rail.style.setProperty('scroll-snap-type', 'none', 'important');
    function finish() {
      rail._loopFrame = 0;
      rail.style.removeProperty('scroll-snap-type');
      if (rail._markCurrent) rail._markCurrent();
    }
    if (reduceMotion) { setRailLoopLeft(rail, start + delta); finish(); return; }
    var began = performance.now();
    function tick(now) {
      var progress = Math.min(1, (now - began) / 480);
      var eased = 1 - Math.pow(1 - progress, 3);
      setRailLoopLeft(rail, start + delta * eased);
      if (progress < 1) rail._loopFrame = requestAnimationFrame(tick);
      else finish();
    }
    rail._loopFrame = requestAnimationFrame(tick);
  }

  // The card a sheet closes into comes to the focus of its rail first, at once.
  function centreCard(card) {
    var rail = card.closest('.card-rail');
    if (!rail) return;
    stopRailMove(rail);
    var r = card.getBoundingClientRect();
    var delta = r.left + r.width / 2 - (rail.getBoundingClientRect().left + railFocus(rail));
    if (Math.abs(delta) < 1) return;
    rail.style.scrollBehavior = 'auto';
    if (rail.hasAttribute('data-loop')) setRailLoopLeft(rail, rail.scrollLeft + delta);
    else rail.scrollLeft += delta;
    rail.style.scrollBehavior = '';
    // The card is hidden under the sheet: let it take its focused size at once.
    card.style.transition = 'none';
    if (rail._markCurrent) rail._markCurrent();
    card.getBoundingClientRect();
    card.style.transition = '';
  }

  // The sheet morphs out of what the card shows: its recording or still where it
  // has one (the card itself has no fill any more), at that picture's own radius.
  function cardClip(card) {
    // A focused visual is zoomed past its frame, so the frame is the shape
    var shape = card.querySelector('.is-focus, .card-media video, .card-shot img') || card;
    var r = shape.getBoundingClientRect();
    var round = parseFloat(getComputedStyle(shape).borderTopLeftRadius) || 8;
    return 'inset(' + r.top.toFixed(1) + 'px ' + (window.innerWidth - r.right).toFixed(1) + 'px ' +
      (window.innerHeight - r.bottom).toFixed(1) + 'px ' + r.left.toFixed(1) + 'px round ' + round + 'px)';
  }

  function syncSheetVideos(article, open) {
    // The page under the case pauses while it is open and asks again once it closes
    document.querySelectorAll('video[data-src]').forEach(function (video) {
      if (article.contains(video)) return;
      if (open) { if (!video.paused) video.pause(); }
      else if (videoObserver && (video.getAttribute('src') || video.closest('#projects .card-rail .card.is-current'))) {
        videoObserver.unobserve(video);
        videoObserver.observe(video);
      }
    });
    article.querySelectorAll('video[data-src]').forEach(function (video) {
      // Only what is on screen plays: observing again asks the observer afresh, now the case is open
      if (open) { if (videoObserver) { videoObserver.unobserve(video); videoObserver.observe(video); } else playVideo(video); }
      else if (video.getAttribute('src')) video.pause();
    });
  }

  function setSheetOpen(article, open, options) {
    var animate = !(options && options.instant) && !reduceMotion;
    var card = cardFor(article);
    var scroller = article.querySelector('.sheet-scroll');
    var closing = article.classList.contains('is-closing');
    if (open === (article.classList.contains('is-open') && !closing)) return;

    article.querySelector('.sheet-close').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (card) {
      card.classList.toggle('is-active', open);
      card.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (open) {
      if (openSheet && openSheet !== article) setSheetOpen(openSheet, false, { instant: true });
      openSheet = article;
      revealSheet(article);
      document.documentElement.classList.add('has-sheet');
      article.setAttribute('role', 'dialog');
      article.setAttribute('aria-modal', 'true');
      scroller.removeAttribute('inert');
      article.classList.remove('is-closing');
      if (animate && card) {
        article.style.transition = 'none';
        article.style.clipPath = cardClip(card);
        article.classList.add('is-open', 'is-from-card');
        scroller.scrollTop = 0;
        article.getBoundingClientRect();
        article.style.transition = '';
        article.style.clipPath = 'inset(0px 0px 0px 0px round 0px)';
        article.classList.remove('is-from-card');
      } else {
        article.classList.add('is-open');
        scroller.scrollTop = 0;
      }
      if (card) {
        card.classList.remove('is-returning');
        card.style.visibility = 'hidden';
      }
      syncSheetVideos(article, true);
      // Focus follows the sheet, so Tab and screen readers start inside it.
      var heading = article.querySelector('.sheet-title');
      if (!heading.id) heading.id = article.id + '-title';
      article.setAttribute('aria-labelledby', heading.id);
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
      return;
    }

    scroller.setAttribute('inert', '');
    syncSheetVideos(article, false);
    var returnTo = article._returnFocus || card;
    if (returnTo) centreCard(returnTo);
    var finish = function () {
      article.classList.remove('is-open', 'is-closing', 'is-from-card');
      article.removeAttribute('aria-modal');
      var ringCircle = article.querySelector('.sheet-ring circle');
      if (ringCircle) ringCircle.style.strokeDashoffset = '';
      article.style.clipPath = '';
      article.style.transition = '';
      if (card) {
        card.style.visibility = '';
        card.classList.remove('is-returning');
      }
      var active = document.activeElement;
      if (returnTo && (!active || active === document.body || article.contains(active))) {
        returnTo.focus({ preventScroll: true, focusVisible: false });
      }
      article._opener = null;
      article._returnFocus = null;
      if (openSheet === article) {
        openSheet = null;
        document.documentElement.classList.remove('has-sheet');
      }
    };
    if (!animate || !returnTo) return finish();

    // The card shows under the closing sheet; its text rises in once the sheet is gone.
    if (card) {
      card.classList.add('is-returning');
      card.style.visibility = '';
    }
    article.classList.add('is-closing', 'is-from-card');
    article.style.clipPath = cardClip(returnTo);
    var done = false;
    var end = function (e) {
      if (done || (e && (e.target !== article || e.propertyName !== 'clip-path'))) return;
      done = true;
      article.removeEventListener('transitionend', end);
      // Reopened while closing: keep it open.
      if (article.classList.contains('is-closing')) finish();
    };
    article.addEventListener('transitionend', end);
    setTimeout(end, 900);
  }

  function initSheetNavigation() {
    var groups = [
      { section: 'projects', title: '프로젝트 순서', previous: '이전 프로젝트', next: '다음 프로젝트' },
      { section: 'thoughts', title: 'Engineering Notes 순서', previous: '이전 글', next: '다음 글' }
    ];

    groups.forEach(function (group) {
      // 대표 작업·그리드·캐러셀 모두 같은 상세 탐색 순서를 공유한다.
      var cards = document.querySelectorAll('#' + group.section + ' .card[data-controls]');
      var articles = Array.from(cards, function (card) {
        return document.getElementById(card.dataset.controls);
      }).filter(Boolean);

      articles.forEach(function (article, index) {
        var nav = document.createElement('nav');
        nav.className = 'sheet-navigation';
        i18n.localizeAttribute(nav, 'aria-label', group.title);

        function makeStep(direction, label, target) {
          var button = document.createElement('button');
          button.type = 'button';
          button.className = 'sheet-step sheet-step-' + direction;
          i18n.localizeAttribute(button, 'aria-label', label);
          button.disabled = !target;
          button.addEventListener('click', function () {
            if (!target || openSheet !== article || article.classList.contains('is-closing')) return;
            target._returnFocus = article._returnFocus || cardFor(article);
            setSheetOpen(target, true, { instant: true });
            updateHistory('replaceState', i18n.path(target.dataset.path));
            setTitle(target.dataset.title);
          });
          return button;
        }

        nav.append(
          makeStep('previous', group.previous, articles.length > 1 ? articles[(index - 1 + articles.length) % articles.length] : null),
          makeStep('next', group.next, articles.length > 1 ? articles[(index + 1) % articles.length] : null)
        );
        article.appendChild(nav);
      });
    });
  }

  // 닫기 버튼을 선택하면 짧게 진동한다. iOS에서는 숨김 switch로 시스템 햅틱을 사용한다.
  var hapticLabel = null;
  function haptic() {
    if (navigator.vibrate) { navigator.vibrate(10); return; }
    if (!hapticLabel) {
      hapticLabel = document.createElement('label');
      hapticLabel.className = 'haptic';
      hapticLabel.setAttribute('aria-hidden', 'true');
      hapticLabel.innerHTML = '<input type="checkbox" switch tabindex="-1">';
      document.body.appendChild(hapticLabel);
    }
    hapticLabel.click();
  }

  // 스크롤은 읽기 진행만 표시한다. 휠·터치 제스처로 상세 화면을 닫지 않는다.
  function initSheetProgress(article) {
    initCloseProgress(article.querySelector('.sheet-scroll'), article.querySelector('.sheet-ring circle'), article.querySelector('.sheet-inner'));
  }

  function sectionOf(article) {
    return article.classList.contains('thought') ? 'thoughts' : 'projects';
  }

  var pushedForSheet = false;

  // Stepping back to the entry we pushed ourselves must not move the page:
  // restoration goes manual for that one traversal, then back to the default.
  function backInPlace() {
    if ('scrollRestoration' in history && !document.body.dataset.focus) {
      history.scrollRestoration = 'manual';
      window.addEventListener('popstate', function () {
        setTimeout(function () { history.scrollRestoration = 'auto'; }, 0);
      }, { once: true });
    }
    history.back();
  }

  // On touch the rail pages itself: a swipe has to travel a third of a card
  // (or be a clear flick) before the next card comes; anything less springs back.
  var SWIPE_SHARE = 0.18;
  var FLICK_SPEED = 0.35; // px per ms, with at least FLICK_MIN px of travel
  var FLICK_MIN = 24;
  function initRailSwipe(rail, cards, getCurrent) {
    var startX = 0, startY = 0, startLeft = 0, startTime = 0, lastX = 0, lastTime = 0, speed = 0;
    var axis = null, startCard = null;
    var settling = 0;
    rail.classList.add('is-paged');

    function maxLeft() { return rail.scrollWidth - rail.clientWidth; }

    rail.addEventListener('touchstart', function (e) {
      if (e.touches.length > 1) { axis = 'none'; return; }
      clearTimeout(settling);
      var t = e.touches[0];
      startX = lastX = t.clientX;
      startY = t.clientY;
      startTime = lastTime = e.timeStamp;
      startLeft = rail.scrollLeft;
      startCard = getCurrent() || cards[0];
      speed = 0;
      axis = null;
    }, { passive: true });

    rail.addEventListener('touchmove', function (e) {
      if (axis === 'none' || axis === 'y') return;
      var t = e.touches[0];
      var dx = t.clientX - startX;
      if (axis === null) {
        var dy = t.clientY - startY;
        if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (axis === 'y') return;
        rail.classList.add('is-swiping');
      }
      var dt = e.timeStamp - lastTime;
      if (dt > 0) speed = 0.8 * ((t.clientX - lastX) / dt) + 0.2 * speed;
      var step = lastX - t.clientX;
      lastX = t.clientX;
      lastTime = e.timeStamp;
      // Past either end the rail gives a little, then holds.
      var left = rail.hasAttribute('data-loop') ? rail.scrollLeft + step : startLeft - dx;
      if (!rail.hasAttribute('data-loop')) {
        if (left < 0) left *= 0.3;
        else if (left > maxLeft()) left = maxLeft() + (left - maxLeft()) * 0.3;
      }
      if (rail.hasAttribute('data-loop')) setRailLoopLeft(rail, left);
      else rail.scrollLeft = left;
    }, { passive: true });

    function release(event) {
      if (axis !== 'x') { axis = null; return; }
      axis = null;
      var dx = lastX - startX;
      var from = cards.includes(startCard) ? startCard : getCurrent() || cards[0];
      if (!from) return;
      var index = cards.indexOf(from);
      // The card the swipe started on, not the one nearest the centre now.
      var cancelled = event && event.type === 'touchcancel';
      var far = !cancelled && Math.abs(dx) > from.offsetWidth * SWIPE_SHARE;
      var flick = !cancelled && Math.abs(dx) > FLICK_MIN && Math.abs(speed) > FLICK_SPEED && (speed > 0) === (dx > 0);
      if (far || flick) index = (index + (dx < 0 ? 1 : -1) + cards.length) % cards.length;
      moveRailTo(rail, cards[index], far || flick ? (dx < 0 ? 1 : -1) : 0);
      // Snap comes back once the glide has settled.
      settling = setTimeout(function () { rail.classList.remove('is-swiping'); }, 700);
    }
    rail.addEventListener('touchend', release);
    rail.addEventListener('touchcancel', release);
  }

  // A click runs a download button through its states while the browser saves the file:
  // Downloading… with the fill growing, then Downloaded, then back to rest.
  function wireDownload(el) {
    var timer = null;
    el.addEventListener('click', function () {
      if (el.dataset.state !== 'idle') return;
      el.dataset.state = 'busy';
      var start = performance.now(), length = reduceMotion ? 600 : 1500;
      (function step(now) {
        var t = Math.min((now - start) / length, 1);
        el.style.setProperty('--p', (1 - Math.pow(1 - t, 3)).toFixed(3));
        if (t < 1) return requestAnimationFrame(step);
        el.dataset.state = 'done';
        clearTimeout(timer);
        timer = setTimeout(function () {
          el.dataset.state = 'idle';
          el.style.setProperty('--p', '0');
        }, 2200);
      })(start);
    });
    // The light inside the button follows the pointer
    el.addEventListener('pointermove', function (e) {
      var box = el.getBoundingClientRect();
      el.style.setProperty('--mx', e.clientX - box.left + 'px');
      el.style.setProperty('--my', e.clientY - box.top + 'px');
    });
  }

  // A case with a download keeps it at hand: a small pill rides next to the closer
  // once the cover has scrolled away, and steps aside when the download itself is in view.
  function initDownloadPill(article) {
    var button = article.querySelector('.case-download-button');
    var cover = article.querySelector('.case-cover');
    if (button) wireDownload(button, 'button');
    if (!button || !cover || !('IntersectionObserver' in window)) return;
    // The pill is the same button, riding next to the closer
    var pill = document.createElement('a');
    pill.className = 'case-download-button sheet-download';
    pill.href = button.getAttribute('href');
    pill.setAttribute('download', '');
    pill.dataset.state = 'idle';
    pill.tabIndex = -1;
    pill.innerHTML = button.innerHTML;
    wireDownload(pill);
    article.appendChild(pill);
    var seen = { cover: true, end: false };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { seen[e.target === cover ? 'cover' : 'end'] = e.isIntersecting; });
      var show = !seen.cover && !seen.end;
      pill.classList.toggle('is-shown', show);
      pill.tabIndex = show ? 0 : -1;
    }, { root: article.querySelector('.sheet-scroll') });
    io.observe(cover);
    io.observe(article.querySelector('.case-download'));
  }

  function initSheets() {
    initSheetNavigation();
    document.querySelectorAll('.sheet').forEach(function (article) {
      article.querySelector('.sheet-close').addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        if (!article.classList.contains('is-open') || article.classList.contains('is-closing')) return;
        // 명시적인 닫기 입력에만 햅틱을 준다.
        if (e.isTrusted) haptic();
        setSheetOpen(article, false);
        // Back after closing should leave the page, not reopen the sheet.
        if (pushedForSheet && history.state && history.state.sheet) backInPlace();
        else updateHistory('replaceState', i18n.path('/' + sectionOf(article)), false);
        pushedForSheet = false;
        setTitle({ thoughts: 'Engineering Notes', projects: 'Projects' }[sectionOf(article)] || '');
      });

      initSheetProgress(article);
      initDownloadPill(article);

      // Deep links arrive with the sheet already open.
      if (article.classList.contains('is-open')) {
        openSheet = article;
        document.documentElement.classList.add('has-sheet');
        var card = cardFor(article);
        if (card) card.style.visibility = 'hidden';
        syncSheetVideos(article, true);
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!openSheet || openSheet.classList.contains('is-closing')) return;
      if (e.key === 'Escape') {
        openSheet.querySelector('.sheet-close').click();
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.altKey && !e.ctrlKey && !e.metaKey &&
                 !document.activeElement.closest('video[controls], input, textarea, select, [contenteditable]')) {
        var step = e.key === 'ArrowLeft' ? '.sheet-step-previous' : '.sheet-step-next';
        var arrow = openSheet.querySelector(step + ':not(:disabled)');
        if (arrow) {
          e.preventDefault();
          arrow.click();
        }
      } else if (e.key === 'Tab') {
        var targets = Array.prototype.filter.call(
          openSheet.querySelectorAll('a[href], button, input, select, textarea, summary, video[controls], [tabindex]'),
          function (el) {
            return el.tabIndex >= 0 && !el.disabled && !el.closest('[inert]') &&
              el.getClientRects().length && getComputedStyle(el).visibility === 'visible';
          }
        );
        var first = targets[0];
        var last = targets[targets.length - 1];
        var active = document.activeElement;
        if (!first) return;
        if (!openSheet.contains(active) || active === (e.shiftKey ? first : last)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }
    });

    document.querySelectorAll('.card-rail').forEach(function (rail) {
      // The card nearest the rail's focus is the one in focus; its neighbours sit back.
      var isProjectRail = !!rail.closest('#projects');
      var track = rail.querySelector('.card-track');
      var cards = track ? readRailCards(track) : Array.from(rail.querySelectorAll('.card:not(.is-loop-copy)'));
      var controls = initRailPagination({
        rail: rail,
        cards: cards,
        onSelect: function (card) { moveRailTo(rail, card, 0); },
        translate: i18n.translate,
        reduceMotion: reduceMotion,
      });
      i18n.onChange(controls.updateLabels);
      var current = null;
      var frame = 0;
      var tabStops = new WeakMap();
      function syncCardFocus(card, active) {
        var targets = [card].concat(Array.from(card.querySelectorAll(
          'a[href], button, input, textarea, select, summary, video[controls], [tabindex]'
        )));
        targets.forEach(function (target) {
          if (!tabStops.has(target)) tabStops.set(target, target.getAttribute('tabindex'));
          var original = tabStops.get(target);
          if (!active) target.tabIndex = -1;
          else if (original === null) target.removeAttribute('tabindex');
          else target.setAttribute('tabindex', original);
        });
      }
      cards.forEach(function (card) { syncCardFocus(card, false); });

      function markCurrent() {
        frame = 0;
        var mid = rail.getBoundingClientRect().left + railFocus(rail);
        var best = null;
        var bestDist = Infinity;
        cards.forEach(function (card) {
          var r = card.getBoundingClientRect();
          var dist = Math.abs(r.left + r.width / 2 - mid);
          if (dist < bestDist) { bestDist = dist; best = card; }
        });
        if (best === current) return;
        var transferFocus = current && current.contains(document.activeElement);
        if (current) {
          current.classList.remove('is-current');
          syncCardFocus(current, false);
          if (isProjectRail) current.querySelectorAll('video[data-src]').forEach(function (video) { video.pause(); });
        }
        current = best;
        if (current) {
          current.classList.add('is-current');
          syncCardFocus(current, true);
          if (isProjectRail) current.querySelectorAll('video[data-src]').forEach(syncLazyVideo);
          if (transferFocus) current.focus({ preventScroll: true });
        }
        controls.update(current);
        if (isProjectRail && rail._preloadMedia) rail._preloadMedia(current);
      }
      if (cards.length || track) {
        rail.tabIndex = 0;
        rail._markCurrent = markCurrent;
        if (rail.hasAttribute('data-loop')) initRailLoop(rail, cards);
        markCurrent();
        rail.classList.add('has-current');
        rail.addEventListener('scroll', function () {
          if (!frame) frame = requestAnimationFrame(markCurrent);
        }, { passive: true });
        if (!rail.hasAttribute('data-loop')) window.addEventListener('resize', markCurrent);
        rail.addEventListener('keydown', function (e) {
          if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || e.altKey || e.ctrlKey || e.metaKey) return;
          if (!current || (e.target !== rail && e.target !== current)) return;
          var active = current;
          var next = cards[(cards.indexOf(active) + (e.key === 'ArrowRight' ? 1 : -1) + cards.length) % cards.length];
          e.preventDefault();
          if (!next) return;
          moveRailTo(rail, next, e.key === 'ArrowRight' ? 1 : -1);
        });
      }

      if (track) {
        // React 콘텐츠가 재구성돼도 원본 카드만 세고 루프와 버튼 수를 함께 갱신한다.
        new MutationObserver(function () {
          var nextCards = readRailCards(track);
          if (nextCards.length === cards.length && nextCards.every(function (card, index) {
            return card === cards[index];
          })) return;

          nextCards.forEach(function (card) {
            if (!cards.includes(card)) syncCardFocus(card, false);
          });
          cards.splice(0, cards.length, ...nextCards);
          controls.updateCards();
          if (rail._refreshLoop) rail._refreshLoop();
          markCurrent();
          controls.update(current);
        }).observe(track, { childList: true });
      }

      if ((cards.length || track) && 'ontouchstart' in window) initRailSwipe(rail, cards, function () { return current; });

      // 자동 이동을 켠 목록만 4초마다 순환하고, 읽거나 조작하는 동안은 멈춘다.
      if (rail.hasAttribute('data-autoplay') && cards.length > 1 && !reduceMotion) {
        var autoplayTimer;
        var hovering = false;
        var touching = false;
        function scheduleAutoplay() {
          clearTimeout(autoplayTimer);
          autoplayTimer = setTimeout(advance, 4000);
        }
        function advance() {
          var bounds = rail.getBoundingClientRect();
          var visible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.width > 0;
          if (cards.length > 1 && visible && !document.hidden && !hovering && !touching &&
              !rail.parentElement.contains(document.activeElement) && !document.querySelector('dialog[open]') &&
              !document.documentElement.classList.contains('has-sheet')) {
            var next = cards[(cards.indexOf(current) + 1) % cards.length];
            moveRailTo(rail, next, 1);
          }
          scheduleAutoplay();
        }
        rail.parentElement.addEventListener('pointerenter', function (event) {
          if (event.pointerType !== 'touch') hovering = true;
        });
        rail.parentElement.addEventListener('pointerleave', function () { hovering = false; scheduleAutoplay(); });
        rail.addEventListener('touchstart', function () { touching = true; }, { passive: true });
        function releaseAutoplay() { touching = false; scheduleAutoplay(); }
        rail.addEventListener('touchend', releaseAutoplay, { passive: true });
        rail.addEventListener('touchcancel', releaseAutoplay, { passive: true });
        rail.parentElement.addEventListener('focusout', scheduleAutoplay);
        rail.parentElement.addEventListener('click', function (event) {
          if (event.target.closest('.rail-pagination')) scheduleAutoplay();
        });
        rail.addEventListener('keydown', scheduleAutoplay);
        rail.addEventListener('wheel', scheduleAutoplay, { passive: true });
        document.addEventListener('visibilitychange', scheduleAutoplay);
        scheduleAutoplay();
      }


      // A drag through the rail ends on a card; that is not a click.
      var downX = 0;
      rail.addEventListener('pointerdown', function (e) { downX = e.clientX; });
      rail.addEventListener('click', function (e) {
        // A card peeking in at the side comes into focus first.
        var tapped = e.target.closest('.card');
        var copy = tapped && tapped.classList.contains('is-loop-copy') ? tapped : null;
        if (copy) tapped = cards[Number(copy.dataset.loopSource)];
        if (tapped && e.detail !== 0 && (tapped !== current || copy) && Math.abs(e.clientX - downX) <= 6) {
          e.preventDefault();
          var direction = copy ? (copy.getBoundingClientRect().left < rail.getBoundingClientRect().left + railFocus(rail) ? -1 : 1) : 0;
          moveRailTo(rail, tapped, direction);
          return;
        }
        var card = e.target.closest('.card[data-controls]');
        if (!card) return;
        // Keyboard clicks (detail 0) never come with a pointerdown.
        if (e.detail !== 0 && Math.abs(e.clientX - downX) > 6) { e.preventDefault(); return; }
        openFromCard(card, e);
      });
    });

    // The company tiles open their case the same way, without a rail around them.
    // Company tiles and buttons open their associated panels.
    document.querySelectorAll('.company-grid .card[data-controls], .project-featured .card[data-controls], .note-grid .card[data-controls], .experience-project[data-controls], button[data-controls]').forEach(function (card) {
      card.addEventListener('click', function (e) { openFromCard(card, e); });
    });
  }

  function openFromCard(card, e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    var article = document.getElementById(card.dataset.controls);
    if (!article) return;
    // The sheet grows from, and returns to, whatever opened it
    article._opener = card;
    setSheetOpen(article, true);
    updateHistory('pushState', i18n.path(article.dataset.path), true);
    pushedForSheet = true;
    setTitle(article.dataset.title);
  }

  function initPageScrollControls() {
    var trigger = document.getElementById('back-to-top');
    var heading = document.querySelector('#about h1');
    var root = document.documentElement;
    if (!trigger || !heading) return;

    function updateVisibility() {
      var visible = window.scrollY > 0;
      root.classList.toggle('is-page-scrolled', visible);
      // 헤더는 여유 있게 내려간 뒤 숨기고 TOP 버튼은 첫 스크롤부터 표시한다.
      root.classList.toggle('is-header-scrolled', window.scrollY > 160);
      if (!visible && document.activeElement === trigger) heading.focus({ preventScroll: true });
      trigger.classList.toggle('is-visible', visible);
      trigger.inert = !visible;
    }

    updateVisibility();
    trigger.hidden = false;
    window.addEventListener('scroll', updateVisibility, { passive: true });
    trigger.addEventListener('click', function () {
      heading.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  // 직접 접근한 URL과 브라우저 뒤로/앞으로 이동의 패널 상태를 동기화한다.
  function applyRoute(route, options) {
    // Sheets follow the URL: only the addressed one is open. setSheetOpen
    // skips no-ops itself, and reopens one that is still closing.
    var sheetId = route.section + '-' + route.slug;
    document.querySelectorAll('.sheet').forEach(function (article) {
      setSheetOpen(article, article.id === sheetId, { instant: options && options.instant });
    });

    document.querySelectorAll('.lightbox[open]').forEach(function (dialog) { dialog.close(); });

    if (options && options.scroll) scrollToTarget(findTarget(route), options.smooth);

    var target = route.slug ? findTarget(route) : null;
    setTitle(target && target.dataset.title ? target.dataset.title : '');
  }

  function initInternalLinks() {
    // Links inside the page that point at a section scroll instead of reload.
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="/"]');
      if (e.defaultPrevented || !link || link.matches('.card, .sheet-close')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || link.target === '_blank') return;
      var route = parsePath(link.getAttribute('href'));
      var target = findTarget(route);
      if (!target && route.section) return;
      e.preventDefault();
      pushedForSheet = false;
      updateHistory('pushState', i18n.path(link.getAttribute('href')), false);
      if (!route.section) window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      applyRoute(route, { scroll: Boolean(route.section), smooth: true });
    });

    window.addEventListener('popstate', function () {
      i18n.syncAddress();
      pushedForSheet = Boolean(history.state && history.state.sheet);
      applyRoute(locationRoute());
    });
  }

  // Every underlined link starts the drawn line at another point, so no two
  // words carry the same wobble. 97 does not divide the 240px tile.
  function initHandLines() {
    document.querySelectorAll('.hero-statement a, .content a, .post-content a, .experience-project, .copy-email').forEach(function (link, i) {
      link.style.setProperty('--hand-x', -((i * 97) % 240) + 'px');
    });
  }

  // Share hover visuals with actual touch presses, including decorative text/SVG.
  function initTouchFeedback() {
    var hover = window.matchMedia('(hover: hover) and (pointer: fine)');
    var touching = false;
    function syncHover() { document.documentElement.classList.toggle('can-hover', hover.matches && !touching); }
    syncHover();
    hover.addEventListener('change', syncHover);
    var targets = [
      '.landing-actions button', '.now-mark', '.now-pill', '.hero-statement a', '.intro-emphasis',
      '.page-parent a', '.content a', '.post-content a', '.experience-project', '.copy-email',
      '.work-card', '.stack-tile', '[data-interest-object]', '[data-hero-marker]', '.card', '.sheet-step', '.sheet-close', '.play-close',
      '.case-download-button', '.project-media-tile', '.lightbox-close', '.resume-open', '.back-to-top',
      '.language-switch button', '.kyg-wordmark', '.site-footer-links a', '.edit-toggle',
      '.site-footer-social a', '.name-identity', '.sheet-download'
    ].join(', ');
    var pressed = [], startX = 0, startY = 0;
    function clearPress() {
      pressed.forEach(function (element) { element.classList.remove('is-touch-active'); });
      pressed = [];
    }
    document.addEventListener('pointerdown', function (event) {
      clearPress();
      touching = event.pointerType === 'touch' || event.pointerType === 'pen';
      syncHover();
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
      startX = event.clientX;
      startY = event.clientY;
      var element = event.target;
      while (element instanceof Element) {
        if (element.matches(targets) && !(element.matches('.card') && !cardHover.matches)) {
          element.classList.add('is-touch-active');
          pressed.push(element);
        }
        element = element.parentElement;
      }
    }, true);
    document.addEventListener('pointermove', function (event) {
      if (event.pointerType === 'mouse' && touching) { touching = false; syncHover(); }
      if (Math.hypot(event.clientX - startX, event.clientY - startY) > 12) clearPress();
    }, { capture: true, passive: true });
    document.addEventListener('pointerup', clearPress, true);
    document.addEventListener('pointercancel', clearPress, true);
    document.addEventListener('scroll', clearPress, true);
    window.addEventListener('blur', clearPress);
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearPress(); });
  }

  // Focus rings are for the keyboard: after a tap, focus handed back to a card
  // (closing a sheet, the lightbox) should not draw one.
  function initInputModality() {
    var root = document.documentElement;
    document.addEventListener('pointerdown', function () { root.dataset.input = 'pointer'; }, true);
    document.addEventListener('keydown', function (e) {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) root.dataset.input = 'keyboard';
    }, true);
    document.querySelectorAll('.kyg-wordmark').forEach(function (wordmark) {
      wordmark.addEventListener('pointerdown', function (event) { event.preventDefault(); });
    });
  }

  function initPortfolio() {
    prepareLoopCopies();
    i18n.init();
    i18n.onChange(function () { setTitle(currentTitle); });
    var page = document.querySelector('.page');
    if (page) page.classList.add('active');

    if (document.body.dataset.page === 'home') animateHeroWords();
    initHeroPeek();
    initCardTip();
    initCompanyTiles();
    initSignature();
    initFooterInvert();
    initInputModality();
    initHandLines();
    initWorkAccordion();
    initSheets();
    initProjectMedia({ mediaDialog, i18n, reduceMotion, videoSource, behindOverlay, playVideo, locationRoute, projectCardVideo });
    initResume();
    initEmailCopy();
    initPageScrollControls();
    initInternalLinks();

    var route = document.body.dataset.focus ? parsePath('/' + document.body.dataset.focus) : locationRoute();
    if (route.section && findTarget(route)) {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      // Land directly on the addressed section; entrance motion is for the top.
      document.documentElement.classList.add('is-deep-link');
      applyRoute(route, { scroll: true, smooth: false, instant: true });
    }

    initSectionReveals();
    initReveals();
    initLazyVideos();
    initProjectPreviewPreload();
    document.querySelectorAll('.sheet.is-open').forEach(revealSheet);
  }

  initTouchFeedback();
  showLandingIntro({ reduceMotion, initPortfolio });
}
