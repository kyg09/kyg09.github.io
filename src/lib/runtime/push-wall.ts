import { pushWallFrameSize, pushWallPoses } from "./push-wall-poses";

type PushWallCallbacks = {
  onReveal(): void;
  onActionsCovered(covered: boolean): void;
};

export type PreparedPushWall = {
  play(callbacks: PushWallCallbacks): Promise<void>;
  dispose(): void;
};

const duration = 2950;
const preloadDeadline = 1100;
const reachStart = 410;
const contactTime = 600;
const strainTime = 720;
const pushStart = 880;
const strideStart = 1200;
const exitStart = 2650;
const firstStepShare = (strideStart - pushStart) / (duration - pushStart);

const poses = {
  stride: 0,
  passing: 1,
  strideAlternate: 2,
  stop: 3,
  reach: 4,
  contact: 5,
  strain: 6,
  push: 7,
  step: 8,
  drive: 9,
  shift: 10,
  exit: 11,
} as const;

const walkCycle = [
  poses.stride,
  poses.passing,
  poses.strideAlternate,
  poses.passing,
];
const pushCycle = [poses.push, poses.step, poses.drive, poses.shift];
const firstStepHeight = [1, 0.987, 0.964, 0.984, 1];
const strainFrame = pushWallPoses[poses.strain];
const pushFrame = pushWallPoses[poses.push];
const firstStepTravel = (pushFrame.handX - pushFrame.rearFootX) -
  (strainFrame.handX - strainFrame.rearFootX);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(from: number, to: number, fraction: number) {
  return from + (to - from) * fraction;
}

function easedStop(fraction: number) {
  return 1 - (1 - fraction) ** 2;
}

function arrange(
  width: number,
  height: number,
  logoLeft: number,
  logoRight: number,
  contentBottom: number,
) {
  const gap = Math.min(14, height * 0.035);
  const remainingHeight = height - contentBottom - gap;
  const bottomSpace = Math.min(78, Math.max(8, remainingHeight * 0.3));
  const artHeight = Math.max(1, remainingHeight - bottomSpace);
  const scale = Math.min(
    226 / pushWallFrameSize.height,
    (height * 0.46) / pushWallFrameSize.height,
    (width * 0.38) / pushWallFrameSize.width,
    artHeight / (0.9 * pushWallFrameSize.height),
  );
  const frameWidth = pushWallFrameSize.width * scale;
  const frameHeight = pushWallFrameSize.height * scale;
  // 손그림이 로고와 SKIP을 가리지 않도록 발 기준선을 아래에 둔다.
  const baseline = Math.max(
    height * 0.74,
    contentBottom + gap + frameHeight * 0.9,
  );
  return {
    width,
    height,
    scale,
    frameWidth,
    frameHeight,
    baseline,
    logoLeft,
    logoRight,
  };
}

type Layout = ReturnType<typeof arrange>;
type WallSample = {
  pose: number;
  wall: number;
  x: number;
  shear?: number;
  height?: number;
};

// 로고를 지나는 구간의 속도를 고르게 유지하고, 앞뒤 구간에도 같은 속도로 이어 붙인다.
function wallPosition(progress: number, layout: Layout) {
  const { logoLeft, logoRight, width, frameWidth } = layout;
  const revealShare = 0.48;
  const speed = Math.max(1, logoRight - logoLeft) / revealShare;
  const entry = Math.min(0.32, (1.4 * logoLeft) / speed);
  const revealEnd = entry + revealShare;
  if (progress < entry) {
    const t = progress / entry;
    return (
      logoLeft * (3 * t ** 2 - 2 * t ** 3) + speed * entry * (t ** 3 - t ** 2)
    );
  }
  if (progress <= revealEnd) return logoLeft + speed * (progress - entry);

  const after = progress - revealEnd;
  const exit = 1 - revealEnd;
  const distance = width + frameWidth + 2 - logoRight;
  return (
    logoRight + speed * after + (distance - speed * exit) * (after / exit) ** 2
  );
}

// 화면마다 기존 벽 경로에서 첫 디딤에 해당하는 이동 지점을 찾는다.
function firstStepWallProgress(layout: Layout) {
  const travel = firstStepTravel * layout.scale;
  let low = 0;
  let high = firstStepShare;
  for (let step = 0; step < 12; step++) {
    const middle = (low + high) / 2;
    if (wallPosition(middle, layout) < travel) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

function sampleFirstStep(progress: number, wall: number, scale: number) {
  const pose = wall < firstStepTravel * scale / 2 ? poses.strain : poses.push;
  const frame = pushWallPoses[pose];
  // 뒷발을 지면에 고정한 채 몸이 앞으로 기울어도 손은 벽에 닿게 한다.
  const plantedX = (strainFrame.rearFootX - strainFrame.handX) * scale;
  const reach = wall - plantedX - (frame.handX - frame.rearFootX) * scale;
  const shear = reach / ((frame.handY - frame.soleY) * scale);
  const x = plantedX - (frame.rearFootX + shear * frame.soleY) * scale;

  // 원본 그림에 하중을 받는 중간 자세 세 개를 보간한다.
  const heightFrame = progress * (firstStepHeight.length - 1);
  const frameIndex = Math.floor(heightFrame);
  const height = interpolate(firstStepHeight[frameIndex], firstStepHeight[frameIndex + 1], heightFrame - frameIndex);
  return { pose, wall, x, shear, height };
}

function sample(elapsed: number, layout: Layout, stepProgress: number): WallSample {
  const { scale, frameWidth, frameHeight } = layout;
  if (elapsed < contactTime) {
    const stopX = -pushWallPoses[poses.contact].handX * scale;
    const leaningRoom = frameHeight * 0.095;
    const startX = -frameWidth;
    let pose: number = poses.stop;
    let x = stopX - leaningRoom;

    if (elapsed < reachStart - 50) {
      const approach = clamp(elapsed / (reachStart - 50), 0, 1);
      // Arrive at the wall with momentum, then plant both feet before reaching.
      const travel = easedStop(approach);
      const distance = (stopX - leaningRoom - startX) * travel;
      const stride = frameHeight * 0.48;
      // 거리에 따라 디딤발을 교대해 화면 크기가 달라도 같은 보폭을 유지한다.
      pose =
        walkCycle[Math.floor(distance / (stride * 0.5)) % walkCycle.length];
      x = startX + distance;
    } else if (elapsed >= reachStart) {
      pose = poses.reach;
      const reach = easedStop(
        clamp((elapsed - reachStart) / (contactTime - reachStart), 0, 1),
      );
      x = interpolate(stopX - leaningRoom, stopX, reach);
    }

    return {
      pose,
      wall: 0,
      x: Math.min(x, -pushWallPoses[pose].handX * scale),
    };
  }

  let pose: number = poses.contact;
  let wall = 0;
  if (elapsed >= pushStart) {
    const push = clamp((elapsed - pushStart) / (duration - pushStart), 0, 1);
    const remainingRate = (1 - stepProgress) / (1 - firstStepShare);
    if (elapsed < strideStart) {
      const firstStep = push / firstStepShare;
      const exponent = remainingRate * firstStepShare / stepProgress;
      wall = wallPosition(stepProgress * firstStep ** exponent, layout);
      return sampleFirstStep(firstStep, wall, scale);
    }

    // 첫 디딤이 끝난 속도에서 원래 벽 이동 경로에 이어 붙인다.
    wall = wallPosition(stepProgress + (push - firstStepShare) * remainingRate, layout);
    pose = poses.push;

    if (elapsed >= exitStart) {
      pose = poses.exit;
    } else {
      const strideWidth = Math.max(1, frameHeight * 0.63);
      const cycle = (wall / strideWidth) % 1;
      pose = pushCycle[Math.floor(cycle * pushCycle.length)];
    }
  } else if (elapsed >= strainTime) {
    pose = poses.strain;
  }

  return { pose, wall, x: wall - pushWallPoses[pose].handX * scale };
}

async function loadFrames(signal: AbortSignal) {
  if (signal.aborted) return null;

  const frames = pushWallPoses.map(({ src }) => {
    const frame = new Image();
    frame.src = src;
    return frame;
  });
  let cancelWait = () => {};
  let timeout: number | undefined;
  const interrupted = new Promise<false>((resolve) => {
    cancelWait = () => resolve(false);
    signal.addEventListener("abort", cancelWait, { once: true });
    timeout = window.setTimeout(cancelWait, preloadDeadline);
  });
  const loaded = await Promise.race([
    interrupted,
    Promise.all(frames.map((frame) => frame.decode())).then(
      () =>
        frames.every(
          (frame) =>
            frame.naturalWidth === pushWallFrameSize.width &&
            frame.naturalHeight === pushWallFrameSize.height,
        ),
      () => false,
    ),
  ]);

  window.clearTimeout(timeout);
  signal.removeEventListener("abort", cancelWait);
  if (loaded && !signal.aborted) return frames;
  for (const frame of frames) frame.removeAttribute("src");
  return null;
}

export async function preparePushWall(
  scene: HTMLElement,
  logo: HTMLImageElement,
  actions: HTMLElement,
  signal: AbortSignal,
): Promise<PreparedPushWall | null> {
  const characterElement = scene.querySelector<HTMLImageElement>(
    "[data-push-wall-character]",
  );
  const panelElement = scene.querySelector<HTMLElement>(
    "[data-push-wall-panel]",
  );
  if (
    !characterElement ||
    !panelElement ||
    pushWallPoses.length <= poses.exit ||
    !Number.isFinite(pushWallFrameSize.width) ||
    pushWallFrameSize.width <= 0 ||
    !Number.isFinite(pushWallFrameSize.height) ||
    pushWallFrameSize.height <= 0 ||
    pushWallPoses.some(
      ({ src, handX, soleY }) =>
        !src ||
        !Number.isFinite(handX) ||
        handX < 0 ||
        handX > pushWallFrameSize.width ||
        !Number.isFinite(soleY) ||
        soleY <= 0 ||
        soleY > pushWallFrameSize.height,
    )
  )
    return null;

  const loadedFrames = await loadFrames(signal);
  if (!loadedFrames) return null;
  const frames = loadedFrames;
  const character = characterElement;
  const panel = panelElement;

  let played: Promise<void> | undefined;
  let complete: (() => void) | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let layout = arrange(1, 1, 0, 1, 0);
  let stepProgress = firstStepWallProgress(layout);
  let reveal: (() => void) | undefined;
  let onActionsCovered: PushWallCallbacks["onActionsCovered"] | undefined;
  let actionsRight = 0;
  let actionsCovered = true;
  let animationFrame = 0;
  let pose = -1;
  let elapsed = 0;
  let lastTime: number | undefined;
  let disposed = false;
  const doc = scene.ownerDocument;

  function render() {
    const next = sample(elapsed, layout, stepProgress);
    if (pose !== next.pose) {
      pose = next.pose;
      character.src = frames[pose].src;
    }
    const height = next.height ?? 1;
    const y = layout.baseline - pushWallPoses[pose].soleY * layout.scale * height;
    character.style.transform = next.shear === undefined
      ? "translate3d(" + next.x + "px," + y + "px,0)"
      : "matrix(1,0," + next.shear + "," + height + "," + next.x + "," + y + ")";
    panel.style.transform = "translate3d(" + next.wall + "px,0,0)";

    // 버튼 영역 전체를 벽이 지나간 뒤 입력을 허용한다.
    const covered = next.wall < actionsRight;
    if (covered !== actionsCovered) {
      actionsCovered = covered;
      onActionsCovered?.(covered);
    }
  }

  function resize() {
    if (disposed) return;
    if (!scene.isConnected || scene.clientWidth < 1 || scene.clientHeight < 1) {
      dispose();
      return;
    }
    const width = scene.clientWidth;
    const sceneRect = scene.getBoundingClientRect();
    const logoRect = logo.getBoundingClientRect();
    const actionsRect = actions.getBoundingClientRect();
    actionsRight = actionsRect.right - sceneRect.left;
    layout = arrange(
      width,
      scene.clientHeight,
      clamp(logoRect.left - sceneRect.left, 0, width),
      clamp(logoRect.right - sceneRect.left, 0, width),
      Math.max(logoRect.bottom, actionsRect.bottom) - sceneRect.top,
    );
    stepProgress = firstStepWallProgress(layout);
    character.style.width = layout.frameWidth + "px";
    character.style.height = layout.frameHeight + "px";
    panel.style.width = layout.width + "px";
    panel.style.height = layout.height + "px";
    render();
  }

  function tick(now: number) {
    animationFrame = 0;
    if (disposed || doc.hidden) return;
    if (!scene.isConnected) {
      dispose();
      return;
    }
    if (lastTime !== undefined) elapsed += now - lastTime;
    lastTime = now;
    if (elapsed >= duration) {
      dispose();
      return;
    }
    if (reveal && elapsed >= pushStart) {
      reveal();
      reveal = undefined;
    }
    render();
    animationFrame = requestAnimationFrame(tick);
  }

  function syncPageVisibility() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    lastTime = undefined;
    if (!doc.hidden && !disposed) animationFrame = requestAnimationFrame(tick);
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    scene.hidden = true;
    cancelAnimationFrame(animationFrame);
    resizeObserver?.disconnect();
    doc.removeEventListener("visibilitychange", syncPageVisibility);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pagehide", dispose);
    signal.removeEventListener("abort", dispose);
    character.removeAttribute("src");
    for (const frame of frames) frame.removeAttribute("src");
    complete?.();
  }

  function play(callbacks: PushWallCallbacks) {
    if (disposed || signal.aborted) return Promise.resolve();
    if (played) return played;

    played = new Promise<void>((resolve) => {
      complete = resolve;
      reveal = callbacks.onReveal;
      onActionsCovered = callbacks.onActionsCovered;
      scene.hidden = false;
      resize();
      if (disposed) return;

      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(scene);
        resizeObserver.observe(actions);
      } else {
        window.addEventListener("resize", resize);
      }
      doc.addEventListener("visibilitychange", syncPageVisibility);
      syncPageVisibility();
    });
    return played;
  }

  window.addEventListener("pagehide", dispose, { once: true });
  signal.addEventListener("abort", dispose, { once: true });
  return { play, dispose };
}
