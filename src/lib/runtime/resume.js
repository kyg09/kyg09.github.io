import { initCloseProgress } from '@/lib/runtime/scroll-progress';

// 헤더와 플로팅 버튼이 같은 이력서 모달을 연다. 닫으면 시작 버튼으로 키보드 포커스를 돌려준다.
export function initResume() {
  var dialog = document.getElementById('resume-dialog');
  var triggers = document.querySelectorAll('button[aria-controls="resume-dialog"]');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  var scroller = dialog.querySelector('.resume-scroll');
  var progress = initCloseProgress(scroller, dialog.querySelector('.sheet-ring circle'), dialog.querySelector('.resume-paper'));
  var canHover = window.matchMedia('(hover: hover)');
  var opener;
  triggers.forEach(function (trigger) {
    var actionLabel = trigger.querySelector('.now-pill-action');
    trigger.hidden = false;
    trigger.disabled = false;

    if (actionLabel) {
      function resetLabel() { trigger.classList.remove('is-resume-ready'); }
      trigger.addEventListener('blur', resetLabel);
      document.addEventListener('pointerdown', function (event) {
        if (!trigger.contains(event.target)) resetLabel();
      });
    }

    trigger.addEventListener('click', function (event) {
      if (actionLabel && event.detail !== 0) {
        var touch = event.pointerType === 'touch' || !canHover.matches;
        if (touch && !trigger.classList.contains('is-resume-ready')) {
          trigger.classList.add('is-resume-ready');
          return;
        }
        if (Number(getComputedStyle(actionLabel).opacity) < 0.99) return;
      }

      trigger.classList.remove('is-resume-ready');
      opener = trigger;
      dialog.showModal();
      scroller.scrollTop = 0;
      progress.update();
    });
  });
  dialog.querySelector('.sheet-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('close', function () {
    var active = document.activeElement;
    if (!opener) return;
    opener.classList.remove('is-resume-ready');
    // A mouse/touch dismissal should not leave the restored trigger focused.
    // Keyboard dismissal keeps the trigger available for the next action.
    if (document.documentElement.dataset.input === 'pointer') {
      if (active === opener || dialog.contains(active)) active.blur();
      return;
    }
    if (opener && (active === document.body || dialog.contains(active))) {
      opener.focus({ preventScroll: true });
    }
  });
}
