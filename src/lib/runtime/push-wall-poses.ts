// 손그림 원본을 같은 캔버스로 자르고 손끝과 지면 좌표를 프레임별로 기록한다.
export const pushWallFrameSize = { width: 352, height: 334 } as const;

export const pushWallPoses = [
  {
    src: "/assets/intro/push-wall/01.webp",
    handX: 259,
    handY: 183,
    soleY: 324,
  },
  {
    src: "/assets/intro/push-wall/02.webp",
    handX: 248,
    handY: 182,
    soleY: 324,
  },
  {
    src: "/assets/intro/push-wall/03.webp",
    handX: 248,
    handY: 203,
    soleY: 324,
  },
  { src: "/assets/intro/push-wall/04.webp", handX: 235, handY: 86, soleY: 324 },
  {
    src: "/assets/intro/push-wall/05.webp",
    handX: 270,
    handY: 131,
    soleY: 324,
  },
  {
    src: "/assets/intro/push-wall/06.webp",
    handX: 251,
    handY: 175,
    soleY: 324,
  },
  {
    src: "/assets/intro/push-wall/07.webp",
    handX: 248,
    handY: 163,
    soleY: 324,
    rearFootX: 58.5,
  },
  {
    src: "/assets/intro/push-wall/08.webp",
    handX: 270,
    handY: 164,
    soleY: 324,
    rearFootX: 42,
  },
  {
    src: "/assets/intro/push-wall/09.webp",
    handX: 244,
    handY: 166,
    soleY: 324,
  },
  {
    src: "/assets/intro/push-wall/10.webp",
    handX: 244,
    handY: 147,
    soleY: 324,
  },
  {
    src: "/assets/intro/push-wall/11.webp",
    handX: 248,
    handY: 171,
    soleY: 324,
  },
  {
    src: "/assets/intro/push-wall/12.webp",
    handX: 280,
    handY: 169,
    soleY: 324,
  },
] as const;
