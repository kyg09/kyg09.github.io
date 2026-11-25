// 런타임의 문서당 한 번 초기화 흐름에서만 출력한다.
export function showConsoleWelcome(translate) {
  const artwork = [
    '╭────────────────────────────────╮',
    '│                                │',
    '│         < kyg / code >         │',
    '│      FRONTEND DEVELOPER        │',
    '│                                │',
    '╰────────────────────────────────╯',
  ].join('\n');

  console.log(
    '%c' + artwork,
    'color:#f24822;background:#181818;font:600 13px/1.5 monospace;padding:12px 18px;border-radius:12px;',
  );
  console.log(
    '%c' + translate('여기까지 찾아오셨네요 👀') + '\n%c' + translate('작은 디테일을 좋아하는 프론트엔드 개발자 김영근입니다.'),
    'color:#f24822;font-size:16px;font-weight:700;line-height:2;',
    'font-size:12px;line-height:1.8;',
  );
  console.log('%c✉ kygcode09@gmail.com  ·  © 2026 kyg Code', 'color:#888;font:12px/2 monospace;');
}
