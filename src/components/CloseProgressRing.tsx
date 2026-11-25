// 상세·이력서 모달의 닫기 버튼에서 같은 읽기 진행 테두리를 사용한다.
export function CloseProgressRing() {
  return (
    <svg className="sheet-ring" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="19.25" />
    </svg>
  );
}
