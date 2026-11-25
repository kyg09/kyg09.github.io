// 경력과 이력서에서 같은 날짜 형식을 표시하고 기계가 읽을 수 있는 날짜를 보존한다.
export function DateRange({ from, to }: { from: string; to: string }) {
  return (
    <>
      <time dateTime={from}>{from.replaceAll('-', '.')}</time>
      {'–'}
      <time dateTime={to}>{to.replaceAll('-', '.')}</time>
    </>
  );
}
