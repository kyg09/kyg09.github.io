import { preparePushWall } from "./push-wall";

const LOGO_HOLD_DURATION = 5000;
const HIDE_DURATION = 24 * 60 * 60 * 1000;

// 처음 방문하거나 새로고침할 때 인트로를 표시한다. '숨기기'는 24시간 동안 유지된다.
function canShowIntro(reduceMotion) {
  if (
    reduceMotion ||
    location.hash ||
    !["/", "/en", "/en/"].includes(location.pathname)
  )
    return false;

  try {
    if (
      Number(localStorage.getItem("portfolio:landing-hidden-until")) >
      Date.now()
    )
      return false;
  } catch {
    // 브라우저가 저장소 접근을 막아도 인트로는 동작한다.
  }

  const isReload =
    performance.getEntriesByType("navigation")[0]?.type === "reload";
  if (isReload) return true;

  try {
    return !sessionStorage.getItem("portfolio:landing-seen");
  } catch {
    return true;
  }
}

// 하나의 다이얼로그에서 벽 오프닝, 로고 표시, 헤더 이동을 차례로 실행한다.
export function showLandingIntro({ reduceMotion, initPortfolio }) {
  const root = document.documentElement;
  const dialog = document.getElementById("landing-intro");
  if (
    !dialog ||
    typeof dialog.showModal !== "function" ||
    !canShowIntro(reduceMotion)
  ) {
    root.classList.remove("has-landing-intro");
    initPortfolio();
    return;
  }

  const logo = dialog.querySelector(".landing-wordmark");
  const actions = dialog.querySelector(".landing-actions");
  const skip = dialog.querySelector(".landing-skip");
  const hide = dialog.querySelector(".landing-hide");
  const scene = dialog.querySelector("[data-push-wall]");
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  const dockAnimations = [];
  let autoDismiss;
  let settleLogoReady;
  const logoReady = new Promise((resolve) => { settleLogoReady = resolve; });
  let finished = false;
  let portfolioStarted = false;
  let focusHeading = false;

  if (location.pathname !== "/") {
    hide.lang = "en";
    hide.textContent = "Hide";
  }

  function startPortfolio() {
    if (portfolioStarted) return;
    portfolioStarted = true;
    initPortfolio();
  }

  function finish() {
    if (finished) return;
    finished = true;
    settleLogoReady(false);
    clearTimeout(autoDismiss);
    lifecycle.abort();
    dockAnimations.forEach((animation) => animation.cancel());
    if (dialog.open) dialog.close();
    root.classList.remove("has-landing-intro", "is-landing-transition");
    delete dialog.dataset.introPhase;
    startPortfolio();
    if (focusHeading)
      document.querySelector(".name")?.focus({ preventScroll: true });
  }

  function dockLogo() {
    if (finished || dialog.dataset.introPhase !== "logo") return;
    const dock = document.querySelector(".page-wordmark");
    if (
      !logo.classList.contains("is-loaded") ||
      !dock ||
      typeof logo.animate !== "function" ||
      typeof dock.animate !== "function"
    ) {
      finish();
      return;
    }

    const from = logo.getBoundingClientRect();
    dialog.focus({ preventScroll: true });
    dialog.dataset.introPhase = "dock";
    root.classList.add("is-landing-transition");
    window.scrollTo({ top: 0, behavior: "instant" });
    startPortfolio();
    const to = dock.getBoundingClientRect();

    const x = to.left + to.width / 2 - from.left - from.width / 2;
    const y = to.top + to.height / 2 - from.top - from.height / 2;
    const scale = Math.min(to.width / from.width, to.height / from.height);
    const dockTransform =
      "translate3d(" + x + "px, " + y + "px, 0) scale(" + scale + ")";
    const timing = { duration: 1050, fill: "both" };

    dialog.classList.add("is-leaving");
    const dockFade = dock.animate(
      [
        { opacity: 0 },
        { opacity: 0, offset: 0.74, easing: "ease-out" },
        { opacity: 1 },
      ],
      timing,
    );
    const flight = logo.animate(
      [
        { transform: "none", easing: "cubic-bezier(0.24, 0.72, 0.24, 1)" },
        { transform: dockTransform, offset: 0.9 },
        { transform: dockTransform },
      ],
      timing,
    );
    const logoFade = logo.animate(
      [
        { opacity: 1 },
        { opacity: 1, offset: 0.58, easing: "ease-in-out" },
        { opacity: 0 },
      ],
      timing,
    );
    dockAnimations.push(dockFade, flight, logoFade);
    flight.finished.then(finish, finish);
  }

  function revealLogo() {
    if (finished || !dialog.open || logo.hasAttribute("src")) return;
    // 벽 아래의 같은 SVG가 움직이는 경계를 따라 나타난다.
    logo.src = logo.dataset.src;
  }

  function setActionsCovered(covered) {
    if (actions.inert === covered) return;
    if (covered && actions.contains(document.activeElement)) {
      dialog.focus({ preventScroll: true });
    }
    actions.inert = covered;
    if (!covered) skip.focus({ preventScroll: true });
  }

  async function startLogo() {
    if (finished || !dialog.open) return;
    dialog.dataset.introPhase = "logo";
    revealLogo();
    // 다운로드·디코드가 끝나 실제 화면에 그려진 뒤부터 표시 시간을 센다.
    if (!(await logoReady) || finished || !dialog.open) return;
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (finished || !dialog.open) return;
    autoDismiss = setTimeout(dockLogo, LOGO_HOLD_DURATION);
    setActionsCovered(false);
  }

  function skipIntro(event) {
    focusHeading = event.detail === 0;
    finish();
  }

  skip.addEventListener("click", skipIntro, { signal });
  hide.addEventListener(
    "click",
    function (event) {
      try {
        localStorage.setItem(
          "portfolio:landing-hidden-until",
          String(Date.now() + HIDE_DURATION),
        );
      } catch {
        // 저장소를 사용할 수 없는 방문도 스킵은 가능하다.
      }
      skipIntro(event);
    },
    { signal },
  );
  dialog.addEventListener(
    "cancel",
    function (event) {
      event.preventDefault();
      focusHeading = true;
      finish();
    },
    { signal },
  );
  dialog.addEventListener("close", finish, { once: true, signal });
  logo.addEventListener(
    "load",
    function () {
      const ready = () => {
        if (finished) return;
        logo.classList.add("is-loaded");
        settleLogoReady(true);
      };
      if (typeof logo.decode === "function") logo.decode().then(ready, ready);
      else ready();
    },
    { once: true, signal },
  );
  logo.addEventListener("error", finish, { once: true, signal });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    function (event) {
      if (event.matches) finish();
    },
    { signal },
  );

  root.classList.add("has-landing-intro");
  dialog.dataset.introPhase = "preparing";
  dialog.showModal();
  try {
    sessionStorage.setItem("portfolio:landing-seen", "1");
  } catch {
    // 저장할 수 없어도 인트로 재생에는 영향이 없다.
  }

  async function playOpening() {
    try {
      const prepared = scene && (await preparePushWall(scene, logo, actions, signal));
      if (prepared && !finished && dialog.open) {
        dialog.dataset.introPhase = "wall";
        try {
          await prepared.play({
            onReveal: revealLogo,
            onActionsCovered: setActionsCovered,
          });
        } finally {
          prepared.dispose();
        }
      }
    } catch {
      // 벽 에셋이 없거나 재생에 실패하면 기존 로고 장면으로 이어간다.
    }
    void startLogo();
  }

  void playOpening();
}
