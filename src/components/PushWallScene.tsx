// 캐릭터와 벽을 분리해 화면 크기가 달라져도 손이 벽 가장자리를 따라가게 한다.
export function PushWallScene() {
  return (
    <div className="push-wall-scene" data-push-wall hidden aria-hidden="true">
      <img className="push-wall-character" data-push-wall-character alt="" />
      <div className="push-wall-panel" data-push-wall-panel>
        <svg viewBox="0 0 6 800" preserveAspectRatio="none" focusable="false">
          <path
            d="M1 0C.6 87 1.4 121 1 198S.6 315 1 397s-.4 118 0 200-.4 124 0 203"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
