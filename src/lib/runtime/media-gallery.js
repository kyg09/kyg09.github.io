import { createPlayCanvas } from '@/lib/runtime/media-canvas';
import { galleryItems } from '@/lib/runtime/gallery-items';

// 프로젝트 원본 영상과 UI 확대 이미지를 공유하고, 모션 감소 설정에서는 일반 갤러리를 사용한다.
export function initProjectMedia({ mediaDialog, i18n, reduceMotion, videoSource, behindOverlay, playVideo, locationRoute, projectCardVideo }) {
  var section = document.getElementById('playground');
  if (!section || !mediaDialog || typeof mediaDialog.showModal !== 'function') return;

  var grid = section.querySelector('.project-media-grid');
  var media = mediaDialog.querySelector('.lightbox-media');
  var title = mediaDialog.querySelector('.lightbox-title');
  var description = mediaDialog.querySelector('.lightbox-description');
  var opener;

  // 대표 카드와 캐러셀의 원본 카드만 읽어 같은 프로젝트의 시각용 사본을 제외한다.
  var cards = Array.from(document.querySelectorAll('#projects .card[data-media-description][data-controls]')).filter(function (card) {
    return projectCardVideo(card);
  });
  if (!cards.length) return;
  var cardBySlug = new Map(cards.map(function (card) {
    return [card.dataset.controls.replace(/^projects-/, ''), card];
  }));

  // 기존 스크롤 배치의 모양과 순서를 유지한다.
  var ratios = [0.9600, 1.7778, 1.4134, 0.8000, 0.8000, 1.7778, 0.8000, 0.7084, 1.6000, 0.6593,
    0.9740, 0.9091, 0.9045, 1.0000, 1.2793, 0.6657, 1.6000, 1.6000, 1.5385, 1.7481];
  var tiles = galleryItems.flatMap(function (entry, index) {
    var card = cardBySlug.get(entry.slug);
    if (!card) return [];
    var original = projectCardVideo(card);
    var source;
    if (entry.kind === 'image') {
      source = document.createElement('img');
      source.src = entry.image;
      source.alt = '';
      source.loading = 'lazy';
      source.decoding = 'async';
      source.draggable = false;
    } else {
      source = original.cloneNode(false);
    }
    var tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'project-media-tile reveal';
    tile.style.setProperty('--r', ratios[index]);
    tile.dataset.mediaKind = entry.kind;
    tile.dataset.focusRatio = String(entry.ratio || parseFloat(original.style.getPropertyValue('--r')) || 1.6);

    function labels() {
      var english = document.documentElement.lang === 'en';
      var label = card.querySelector('.card-title').textContent.trim();
      var caption = entry.caption ? entry.caption[english ? 1 : 0] : '';
      tile.dataset.title = label;
      tile.dataset.description = caption ? caption + ' · ' + card.dataset.mediaDescription : card.dataset.mediaDescription;
      tile.setAttribute('aria-label', english
        ? 'Enlarge ' + (entry.kind === 'image' ? 'image: ' : 'video: ') + label + (caption ? ' — ' + caption : '')
        : label + (caption ? ' · ' + caption : '') + (entry.kind === 'image' ? ' 이미지 확대' : ' 영상 확대'));
      if (opener === tile && mediaDialog.open) {
        title.textContent = label;
        description.textContent = tile.dataset.description;
        var activeMedia = media.querySelector('video, img');
        if (activeMedia) {
          if (entry.kind === 'image') activeMedia.alt = caption ? label + ' · ' + caption : label;
          else activeMedia.setAttribute('aria-label', english ? label + ' video' : label + ' 영상');
        }
      }
    }
    i18n.onChange(labels);
    tile.setAttribute('aria-haspopup', 'dialog');
    tile.setAttribute('aria-controls', mediaDialog.id);
    tile.appendChild(source);
    grid.appendChild(tile);

    tile.addEventListener('click', function () {
      opener = tile;
      title.textContent = tile.dataset.title;
      description.textContent = tile.dataset.description;
      var enlarged = source.cloneNode(false);
      enlarged.removeAttribute('aria-hidden');
      enlarged.removeAttribute('data-src');
      if (entry.kind === 'image') {
        enlarged.alt = tile.dataset.title + ' · ' + entry.caption[document.documentElement.lang === 'en' ? 1 : 0];
        enlarged.loading = 'eager';
      } else {
        enlarged.setAttribute('aria-label', document.documentElement.lang === 'en' ? tile.dataset.title + ' video' : tile.dataset.title + ' 영상');
        enlarged.controls = true;
        enlarged.autoplay = !reduceMotion;
        enlarged.src = videoSource(original);
      }
      media.replaceChildren(enlarged);
      mediaDialog.showModal();
      document.querySelectorAll('video[data-src]').forEach(function (preview) {
        if (!preview.paused) preview.pause();
      });
    });
    return [tile];
  });

  section.hidden = false;
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var canvas;
    var current = -1;
    function release() {
      current = -1;
      canvas.release();
    }
    function build() {
      canvas = createPlayCanvas(section, tiles, {
        select: function (index) {
          if (index === current) {
            release();
          } else {
            current = index;
            canvas.focus(index);
          }
        },
        release: release
      });
      i18n.onChange(function () { canvas.refreshLabels(i18n.translate('닫기')); });
    }
    if (locationRoute().section === 'playground') {
      build();
    } else {
      var near = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        near.disconnect();
        build();
      }, { rootMargin: '150% 0px' });
      near.observe(section);
    }
    document.addEventListener('keydown', function (event) {
      if (current !== -1 && event.key === 'Escape' && !document.querySelector('dialog[open]')) release();
    });
  }

  mediaDialog.querySelector('.lightbox-close').addEventListener('click', function () { mediaDialog.close(); });
  mediaDialog.addEventListener('click', function (event) {
    if (event.target === mediaDialog) mediaDialog.close();
  });
  mediaDialog.addEventListener('close', function () {
    if (mediaDialog.open) return;
    var video = media.querySelector('video');
    if (video) video.pause();
    media.replaceChildren();
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    if (document.hidden) return;
    document.querySelectorAll('video[data-src]').forEach(function (preview) {
      if (preview._inView && !preview.closest('[inert]') && !behindOverlay(preview)) playVideo(preview);
    });
  });
}
