// 스크롤 거리를 각 미디어 카드의 깊이에 대응시킨다. 같은 카드의 재선택이나
// 닫기 키로 포커스를 해제하면 이전 스크롤 흐름과 키보드 포커스를 복원한다.
var PERSPECTIVE = 900;   // px, how fast things shrink with depth
var SPACING = 340;       // px of depth between pieces; the dive is this × pieces long
var VIEW_DEPTH = 2600;   // px, how far ahead pieces are visible
var FOCAL = 700;         // px, the depth that is sharp
var SPAN = 1.1;          // field width in viewports (no panning, so it fits the screen)
var MAX_BLUR = 8;        // px
var SHARP_BAND = 380;    // px either side of FOCAL that stays sharp
var BLUR_FALLOFF = 160;  // px of depth per px of blur beyond the band
var SCROLL_RATE = 1.15;  // px of depth per px of page scroll
var MAGNET_RADIUS = 220; // px from a piece's edge where the pointer starts to pull
var MAGNET_PULL = 0.12;  // share of the distance a piece leans toward the pointer
var MAGNET_MAX = 22;     // px, the most a piece leans
var MAGNET_EASE = 420;   // ms, slow on purpose: it drifts, it doesn't snap

var FOCAL_SCALE = PERSPECTIVE / (PERSPECTIVE + FOCAL);

// Every blur change repaints that piece (expensive in Safari), so blur
// moves through a few fixed steps, with some slack before it switches.
var BLUR_STEPS = [0, 1, 2, 3.5, 5.5, 8, 12, 15, 19];

function blurStep(current, blur) {
  var i = Math.max(0, BLUR_STEPS.indexOf(current));
  while (i < BLUR_STEPS.length - 1 && blur > BLUR_STEPS[i] + (BLUR_STEPS[i + 1] - BLUR_STEPS[i]) * 0.7) i++;
  while (i > 0 && blur < BLUR_STEPS[i] - (BLUR_STEPS[i] - BLUR_STEPS[i - 1]) * 0.7) i--;
  return BLUR_STEPS[i];
}

function wrap(value) {
  return value - Math.floor(value + 0.5);
}

function mod(value, length) {
  return ((value % length) + length) % length;
}

function smooth(edge0, edge1, x) {
  var t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

// Deterministic scatter, so the field looks the same on every visit.
function random(seed) {
  var x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export function createPlayCanvas(section, tiles, callbacks) {
  var wall = section.querySelector('.play-wall');
  var track = document.createElement('div');
  track.className = 'play-track';
  var stage = document.createElement('div');
  stage.className = 'play-stage';
  var field = document.createElement('div');
  field.className = 'play-field';
  var panel = document.createElement('aside');
  panel.className = 'play-panel';
  panel.setAttribute('aria-live', 'polite');
  panel.inert = true;
  var panelContent = document.createElement('div');
  panelContent.className = 'lightbox-caption';
  var title = document.createElement('p');
  title.className = 'lightbox-title';
  var description = document.createElement('p');
  description.className = 'lightbox-description';
  panelContent.appendChild(title);
  panelContent.appendChild(description);
  panel.appendChild(panelContent);
  // The same round closer as an open card, bottom centre.
  var closer = document.createElement('button');
  closer.type = 'button';
  closer.className = 'play-close';
  closer.innerHTML = '<span aria-hidden="true"></span>';
  var hint = document.createElement('p');
  hint.className = 'play-hint';
  hint.textContent = 'Scroll to dive · Select to look closer';

  stage.appendChild(field);
  stage.appendChild(panel);
  stage.appendChild(closer);
  stage.appendChild(hint);
  track.appendChild(stage);
  wall.after(track);
  section.classList.add('is-canvas');

  var view = { w: 0, h: 0, small: false };
  var cam = { x: 0, y: 0, vx: 0, vy: 0, z: 0 };
  var items = [];
  var focused = null;      // the item in focus
  var opener = null;
  var focusAmount = 0;     // 0 → 1 while focusing
  var focusTarget = 0;
  var focusScrollY = 0;
  var hovered = null;
  // Mouse position for the magnet, in page coordinates; null when away.
  var mouse = null;
  var visible = false;
  var frame = null;
  var lastTime = 0;
  var interacted = false;

  // ---- Items ----
  // Each piece once, one after another along the dive.
  var copies = 1;
  // The first pieces wait a little way ahead; the dive ends once the last
  // one has flown past. DEPTH leaves room behind so nothing wraps around.
  var LEAD = VIEW_DEPTH * 0.35;
  var TRAVEL = LEAD + tiles.length * SPACING;
  var DEPTH = TRAVEL + VIEW_DEPTH;
  tiles.forEach(function (tile, index) {
    var ratio = parseFloat(getComputedStyle(tile).getPropertyValue('--r')) || 1;
    var source = tile.querySelector('video[data-src], img');
    var label = tile.getAttribute('aria-label');

    for (var copy = 0; copy < copies; copy++) {
      var seed = index * 7.13 + copy * 101.7 + 1;
      var n = copy * tiles.length + index + 1;
      var el = document.createElement('button');
      el.type = 'button';
      el.className = 'play-item';
      el.style.setProperty('--r', ratio);
      if (copy > 0) {
        el.tabIndex = -1;
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.setAttribute('aria-label', label);
      }

      var media = source.cloneNode(false);
      media.removeAttribute('data-src');
      if (media.tagName === 'IMG') media.loading = 'eager';
      el.appendChild(media);
      field.appendChild(el);

      items.push({
        el: el,
        media: media,
        index: index,
        ratio: ratio,
        focusRatio: parseFloat(tile.dataset.focusRatio) || 1.6,
        source: source.dataset.src || source.getAttribute('src'),
        // R2 low-discrepancy steps spread pieces evenly instead of clumping.
        // Copies sit half a field apart, so they are never on screen together.
        u: wrap(index * 0.7548777 + copy / copies + random(seed) * 0.12),
        v: wrap(index * 0.5698403 + copy / copies + random(seed + 3) * 0.12),
        // Each copy gets its own stretch of the depth loop, so the same
        // piece never turns up twice at the same depth (side by side).
        d0: LEAD + index * SPACING + random(seed + 5) * 120,
        // Some pieces larger, some smaller, so the field never reads as a grid.
        size: 0.7 + random(seed + 9) * 0.65,
        hover: 0,
        mx: 0,
        my: 0,
        blur: -1,
        hidden: null,
        z: -1,
        pose: null,
      });
    }
  });

  var videoItems = items.filter(function (item) { return item.media.tagName === 'VIDEO'; });
  var lastMotion = 0;

  // Initial stacking: far pieces first.
  var stack = { back: 0, front: items.length };
  items.map(function (item) { return { item: item, d: poseOf(item).d }; })
    .sort(function (a, b) { return b.d - a.d; })
    .forEach(function (entry, rank) { entry.item.rank = rank + 1; });

  function measure() {
    // Resize fires constantly while iOS Safari's bar slides; only a real
    // change of the stage is worth re-laying out every piece.
    if (stage.clientWidth === view.w && stage.clientHeight === view.h) return;
    view.w = stage.clientWidth;
    view.h = stage.clientHeight;
    view.small = view.w < 720;
    // Long enough to fly past every piece once.
    track.style.height = Math.round(view.h + TRAVEL / SCROLL_RATE) + 'px';
    // Size by area, so wide and tall pieces carry the same weight.
    var base = Math.min(view.w, view.h) * (view.small ? 0.5 : 0.36) / FOCAL_SCALE;
    items.forEach(function (item) {
      var w = base * item.size * Math.sqrt(item.ratio);
      var h = base * item.size / Math.sqrt(item.ratio);
      item.w = w;
      item.h = h;
      item.el.style.width = w + 'px';
      item.el.style.height = h + 'px';
      item.el.style.marginLeft = -w / 2 + 'px';
      item.el.style.marginTop = -h / 2 + 'px';
    });
    request();
  }

  // Where an item sits right now, before focus is mixed in.
  function poseOf(item) {
    var d = mod(item.d0 - cam.z, DEPTH);
    var s = PERSPECTIVE / (PERSPECTIVE + d);
    // Close things spread outward, so diving feels like flying through.
    var spread = Math.pow(s / FOCAL_SCALE, 0.6);
    var spanX = view.w * SPAN;
    var spanY = view.h * SPAN;
    var x = wrap(item.u - cam.x * s / spanX) * spanX * spread;
    var y = wrap(item.v - cam.y * s / spanY) * spanY * spread;
    var opacity = smooth(40, 260, d) * (1 - smooth(VIEW_DEPTH - 700, VIEW_DEPTH - 80, d));
    var blur = Math.min(MAX_BLUR, Math.max(0, Math.abs(d - FOCAL) - SHARP_BAND) / BLUR_FALLOFF);
    return { x: x, y: y, s: s, d: d, opacity: opacity, blur: blur };
  }

  function onScreen(p, item) {
    return Math.abs(p.x) - item.w * p.s / 2 < view.w / 2 &&
      Math.abs(p.y) - item.h * p.s / 2 < view.h / 2;
  }

  function focusPose(item) {
    // 배치 모양은 유지하고, 선택 시 이미지·영상 각각의 실제 비율을 보여준다.
    var maxW = view.w * (view.small ? 0.9 : 0.84);
    var maxH = view.h * (view.small ? 0.55 : 0.60);
    var w = Math.min(maxW, maxH * item.focusRatio);
    return {
      x: 0,
      y: view.small ? -view.h * 0.12 : -view.h * 0.09,
      s: w / item.w,
      opacity: 1,
      blur: 0,
    };
  }

  function render(dt) {
    var moving = false;

    // Drag inertia, then a slow drift so the field never feels frozen.
    if (!dragging) {
      cam.x += cam.vx * dt;
      cam.y += cam.vy * dt;
      var friction = Math.pow(0.0025, dt / 1000);
      cam.vx *= friction;
      cam.vy *= friction;
      if (Math.abs(cam.vx) + Math.abs(cam.vy) > 0.004) moving = true;
      if (Math.abs(cam.vx) + Math.abs(cam.vy) > 0.05) lastMotion = performance.now();
    }

    // Exits settle a little faster than entrances.
    var ease = 1 - Math.exp(-dt / (focusTarget ? 115 : 90));
    focusAmount += (focusTarget - focusAmount) * ease;
    if (Math.abs(focusTarget - focusAmount) < 0.001) focusAmount = focusTarget;
    else moving = true;
    if (focusTarget === 0 && focusAmount === 0 && focused) clearFocus();

    // Stacking follows depth, but z-index only changes for a piece that
    // wraps around the depth loop: it goes behind (or in front of) the rest.
    items.forEach(function (item) {
      var p = poseOf(item);
      if (item.pose && Math.abs(p.d - item.pose.d) > DEPTH / 2) {
        if (p.d > item.pose.d) item.rank = --stack.back;
        else item.rank = ++stack.front;
      }
      item.pose = p;
    });

    // One copy of a piece on screen at a time: the most prominent copy
    // stays, its twins fade out. A margin keeps the choice from flickering.
    var lead = {};
    items.forEach(function (item) {
      var score = item.pose.opacity * item.pose.s * (onScreen(item.pose, item) ? 1 : 0);
      item.score = score;
      var current = lead[item.index];
      if (!current) { lead[item.index] = item; return; }
      var margin = item.isLead ? 1 / 1.25 : current.isLead ? 1.25 : 1;
      if (score > current.score * margin) lead[item.index] = item;
    });
    items.forEach(function (item) {
      item.isLead = lead[item.index] === item || item === focused;
      var goal = item.isLead ? 1 : 0;
      if (item.twin === undefined) item.twin = goal;
      if (item.twin !== goal) {
        item.twin += (goal - item.twin) * (1 - Math.exp(-dt / 120));
        if (Math.abs(goal - item.twin) < 0.01) item.twin = goal;
        else moving = true;
      }
    });

    // The stage centre, so the pointer can be set against the pieces' poses
    var centre = null;
    if (mouse) {
      var box = stage.getBoundingClientRect();
      centre = { x: mouse.x - (box.left + box.width / 2), y: mouse.y - (box.top + box.height / 2) };
    }

    var sharpest = null;
    items.forEach(function (item) {
      var p = item.pose;
      var blur = p.blur;
      var opacity = p.opacity;
      var x = p.x;
      var y = p.y;
      var s = p.s;
      var z = item.rank;

      // Hover eases a piece out of the blur and a touch forward.
      var hoverGoal = item === hovered && !focused ? 1 : 0;
      if (item.hover !== hoverGoal) {
        item.hover += (hoverGoal - item.hover) * (1 - Math.exp(-dt / 140));
        if (Math.abs(hoverGoal - item.hover) < 0.01) item.hover = hoverGoal;
        else moving = true;
      }
      blur *= 1 - item.hover;
      s *= 1 + 0.04 * item.hover;

      // Magnet: near the pointer a piece leans a little toward it, more the
      // closer it is, and drifts back once the pointer moves on.
      var pullX = 0, pullY = 0;
      if (centre && !focused && !dragging) {
        var dx = centre.x - x;
        var dy = centre.y - y;
        var edge = Math.hypot(Math.max(0, Math.abs(dx) - item.w * s / 2), Math.max(0, Math.abs(dy) - item.h * s / 2));
        var strength = (1 - smooth(0, MAGNET_RADIUS, edge)) * MAGNET_PULL;
        pullX = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx * strength));
        pullY = Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy * strength));
      }
      var ease = 1 - Math.exp(-dt / MAGNET_EASE);
      item.mx += (pullX - item.mx) * ease;
      item.my += (pullY - item.my) * ease;
      if (Math.abs(pullX - item.mx) + Math.abs(pullY - item.my) > 0.1) moving = true;
      x += item.mx;
      y += item.my;
      opacity *= item.twin;
      opacity += (1 - opacity) * item.hover * 0.6;

      if (focused) {
        if (item === focused) {
          var t = focusPose(item);
          x += (t.x - x) * focusAmount;
          y += (t.y - y) * focusAmount;
          s += (t.s - s) * focusAmount;
          blur *= 1 - focusAmount;
          opacity += (1 - opacity) * focusAmount;
          z = stack.front + 10;
        } else {
          // The rest sinks well back: smaller, faint, and straight to the
          // deepest blur step, so each piece repaints once, not per step.
          s *= 1 - 0.3 * focusAmount;
          if (focusAmount > 0.1) blur = BLUR_STEPS[BLUR_STEPS.length - 1];
          opacity *= 1 - 0.93 * focusAmount;
        }
      }

      // Pieces outside the screen (or faded out) are hidden and left alone,
      // so they cost nothing to paint while the field moves. Vertically they
      // stay until a full screen past the stage, since they float over the
      // page above and below it while the stage scrolls in and out.
      var height = item === focused
        ? item.h + (item.w / item.focusRatio - item.h) * focusAmount
        : item.h;
      if (item.shownHeight !== height) {
        item.el.style.height = height + 'px';
        item.el.style.marginTop = -height / 2 + 'px';
        item.shownHeight = height;
      }

      var hidden = opacity < 0.01 ||
        Math.abs(x) - item.w * s / 2 > view.w / 2 + 24 ||
        Math.abs(y) - item.h * s / 2 > view.h * 1.5;
      if (hidden !== item.hidden) {
        item.el.style.visibility = hidden ? 'hidden' : '';
        item.hidden = hidden;
      }
      if (hidden) return;

      item.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
      item.el.style.opacity = opacity.toFixed(3);

      var step = blurStep(item.blur, blur);
      if (step !== item.blur) {
        item.el.style.filter = step < 0.5 ? 'none' : 'blur(' + step + 'px)';
        item.blur = step;
      }
      if (z !== item.z) {
        item.el.style.zIndex = z;
        item.z = z;
      }

      if (videoItems.indexOf(item) !== -1 && step <= 1.5 && opacity > 0.4 && (!sharpest || s > sharpest.s)) {
        sharpest = { item: item, s: s };
      }
    });

    syncVideos(sharpest && sharpest.item);
    return moving;
  }

  // Decoding video is the heaviest thing on the page, so only one piece
  // plays: the focused one, or else the sharpest once the field has settled.
  function syncVideos(candidate) {
    var settled = performance.now() - lastMotion > 400;
    var playing = focused && videoItems.indexOf(focused) !== -1 ? focused : settled ? candidate : null;
    if (!visible) playing = null;
    videoItems.forEach(function (item) { syncVideo(item, item === playing); });
  }

  function syncVideo(item, shouldPlay) {
    var video = item.media;
    if (shouldPlay && video.paused) {
      if (!video.getAttribute('src')) {
        video.src = item.source;
        video.load();
      }
      var playing = video.play();
      if (playing && playing.catch) playing.catch(function () {});
    } else if (!shouldPlay && !video.paused) {
      video.pause();
    }
  }

  function loop(time) {
    var dt = Math.min(48, lastTime ? time - lastTime : 16);
    lastTime = time;
    frame = null;
    if (render(dt) && visible) request();
  }

  function request() {
    if (!frame) frame = requestAnimationFrame(loop);
  }

  // ---- Scroll: the page scroll drives the dive ----
  function onScroll() {
    if (!visible) return;
    var rect = track.getBoundingClientRect();
    cam.z = Math.max(0, -rect.top) * SCROLL_RATE;
    lastMotion = performance.now();
    // Scrolling on releases the focus; the first scroll after focusing (a
    // deep link landing on the stage) only sets where that is measured from.
    if (focused && focusTarget === 1) {
      if (focusScrollY === null) focusScrollY = window.scrollY;
      else if (Math.abs(window.scrollY - focusScrollY) > 120) callbacks.release();
    }
    if (rect.top < -view.h * 0.15) dismissHint();
    request();
  }

  // ---- Pointer: a tap selects; a moved pointer is a scroll, not a tap ----
  var dragging = false;
  var pointer = null;

  stage.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || panel.contains(e.target) || closer.contains(e.target)) return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY, time: e.timeStamp, moved: false };
    cam.vx = cam.vy = 0;
  });

  stage.addEventListener('pointermove', function (e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    var dx = e.clientX - pointer.lastX;
    var dy = e.clientY - pointer.lastY;
    if (!pointer.moved && Math.hypot(e.clientX - pointer.x, e.clientY - pointer.y) > 6) {
      pointer.moved = true;
    }
    if (!pointer.moved) return;
    pointer.lastX = e.clientX;
    pointer.lastY = e.clientY;
    pointer.time = e.timeStamp;
    request();
  });

  function endPointer(e) {
    if (!pointer || e.pointerId !== pointer.id) return;
    var wasDrag = pointer.moved;
    var idle = e.timeStamp - pointer.time;
    pointer = null;
    dragging = false;
    stage.classList.remove('is-dragging');
    // A drag that stops before letting go should not glide on.
    if (idle > 80) cam.vx = cam.vy = 0;
    request();
    if (wasDrag) return;
    var target = e.target.closest && e.target.closest('.play-item');
    if (target) {
      var item = items.find(function (candidate) { return candidate.el === target; });
      if (focusTarget === 0) opener = target;
      callbacks.select(item.index);
    } else if (focused && !panel.contains(e.target) && !closer.contains(e.target)) {
      callbacks.release();
    }
  }

  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', function (e) {
    if (pointer && e.pointerId === pointer.id) {
      pointer = null;
      dragging = false;
      stage.classList.remove('is-dragging');
    }
  });

  // Keyboard: Enter/Space on an item selects it (pointer clicks are handled above).
  field.addEventListener('click', function (e) {
    if (e.detail !== 0) return;
    var target = e.target.closest('.play-item');
    if (!target) return;
    var item = items.find(function (candidate) { return candidate.el === target; });
    if (focusTarget === 0) opener = target;
    callbacks.select(item.index);
    if (focusTarget === 1) closer.focus({ preventScroll: true });
  });


  field.addEventListener('pointerover', function (e) {
    var target = e.target.closest('.play-item');
    if (e.pointerType !== 'mouse') return;
    hovered = target ? items.find(function (candidate) { return candidate.el === target; }) : null;
    request();
  });
  stage.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    mouse = { x: e.clientX, y: e.clientY };
    request();
  });
  stage.addEventListener('pointerleave', function () {
    mouse = null;
    request();
  });
  field.addEventListener('pointerleave', function () {
    hovered = null;
    request();
  });

  closer.addEventListener('click', function () { callbacks.release(); });

  function dismissHint() {
    if (interacted) return;
    interacted = true;
    hint.classList.add('is-hidden');
  }

  // ---- Focus ----
  function bestCopy(index) {
    var best = null;
    var bestScore = -1;
    items.forEach(function (item) {
      if (item.index !== index) return;
      var p = poseOf(item);
      var onScreen = Math.abs(p.x) < view.w / 2 && Math.abs(p.y) < view.h / 2 ? 1 : 0.2;
      var score = p.opacity * p.s * onScreen;
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    });
    return best;
  }

  function focus(index, options) {
    var item = bestCopy(index);
    if (!item) return;
    if (focused && focused !== item) clearFocus();
    focused = item;
    focusTarget = 1;
    if (options && options.instant) focusAmount = 1;
    focusScrollY = null;
    stage.classList.add('has-focus');
    item.el.classList.add('is-focused');

    title.textContent = tiles[index].dataset.title;
    description.textContent = tiles[index].dataset.description;
    items.forEach(function (entry) { entry.el.tabIndex = -1; });
    panel.inert = false;
    panel.classList.add('is-open');
    dismissHint();
    request();
  }

  function clearFocus() {
    if (!focused) return;
    focused.el.classList.remove('is-focused');
    focused = null;
  }

  function release() {
    items.forEach(function (entry) { entry.el.tabIndex = 0; });
    var active = document.activeElement;
    if (opener && (active === closer || panel.contains(active))) opener.focus({ preventScroll: true });
    opener = null;
    focusTarget = 0;
    stage.classList.remove('has-focus');
    panel.classList.remove('is-open');
    panel.inert = true;
    request();
  }

  // ---- Lifecycle ----
  var observer = new IntersectionObserver(function (entries) {
    visible = entries[0].isIntersecting;
    if (visible) {
      lastTime = 0;
      onScroll();
      request();
    } else {
      items.forEach(function (item) {
        if (item.media.tagName === 'VIDEO' && !item.media.paused) item.media.pause();
      });
    }
  }, { rootMargin: '100px 0px' });
  observer.observe(stage);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  measure();
  onScroll();

  return {
    track: track,
    focus: focus,
    release: release,
    refreshLabels: function (closeLabel) {
      closer.setAttribute('aria-label', closeLabel);
      items.forEach(function (item) {
        if (item.el.hasAttribute('aria-hidden')) return;
        item.el.setAttribute('aria-label', tiles[item.index].getAttribute('aria-label'));
      });
      if (focused) {
        title.textContent = tiles[focused.index].dataset.title;
        description.textContent = tiles[focused.index].dataset.description;
      }
    },
    isFocused: function () { return focusTarget === 1; },
  };
}
