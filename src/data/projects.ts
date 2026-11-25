export type ProjectVideoData = {
  src: string;
  poster: string;
  label: string;
  aspectRatio: string;
  maxWidth?: number;
};

export type ProjectCaseStudy = {
  overview: string;
  roles: string[];
  flow: { steps: string[]; caption: string };
  implementation: string[];
};

export type Project = {
  slug: string;
  title: string;
  period: string;
  paragraphs: string[];
  credit?: string;
  website?: { url: string; label: string };
  video?: ProjectVideoData;
  caseStudy?: ProjectCaseStudy;
  preview?: { title: string; tip: string; description: string; summary: string; roles?: string[] };
};

// 서비스 소개와 담당 역할, 업무 흐름을 구분하고 기존 상세 URL과 미디어를 유지한다.
export const projects: Project[] = [
  {
    slug: "joa-silvercare",
    title: "JOA Silvercare",
    period: "2026.11.01–2026.11.30",
    paragraphs: [
      "2026년 11월 헥톤프로젝트의 사업 분사에 따라 조아실버케어로 고용이 승계됐습니다."
    ]
  },
  {
    slug: "hecton-project",
    title: "Hecton Project",
    period: "2022.05–2026.10",
    paragraphs: [
      "복지용구 커머스와 주문 관리 백오피스, 요양기관 업무 시스템을 개발했습니다.",
      "2022.05–2023.12 프리랜서로 근무한 뒤 2024.01 정규직으로 전환했습니다."
    ]
  },
  {
    slug: "ddoga-store",
    title: "DDOGA · Assistive Equipment Store",
    period: "2025.03–2026.10",
    paragraphs: [
      "어르신과 가족이 보행기·휠체어 등 복지용구를 구매하거나 대여하는 스토어입니다.",
      "팀 합류 시점부터 새 복지용구 스토어의 초기 프론트엔드 구축을 맡았습니다.",
      "수급자별 구매 흐름, 공통 UI·Storybook 문서화와 서비스 운영 개선에 참여했습니다.",
      "공단 조회로 확인한 수급자 정보에 따라 상품 노출과 급여 적용 여부를 표시하고, 장바구니에서 구매 가능 품목과 잔여 지원금 한도를 검증했습니다.",
      "색상·타이포그래피 토큰과 공통 UI를 패키지로 구성하고 Storybook에 사용 예시를 정리했습니다.",
      "TanStack Query의 서버 사전 조회와 캐시 재사용을 구성하고, 상품·카테고리 메타데이터와 canonical URL, Product JSON-LD를 적용했습니다.",
      "또하나의가족 서비스 전반의 운영 이슈에 대응했습니다. 스토어에서는 옵션·재고·결제 문제를 수정하고, Beusable로 상품 탐색과 구매 흐름을 살폈습니다."
    ],
    credit: "또하나의가족의 공식 복지용구 스토어 화면을 바탕으로 구성한 소개 영상입니다.",
    website: {
      url: "https://ddoga.co.kr/",
      label: "DDOGA 운영 사이트 ↗"
    },
    video: {
      src: "/assets/portfolio-concepts/ddoga-store-macos.mp4",
      poster: "/assets/portfolio-concepts/ddoga-store-macos.jpg",
      label: "또하나의가족 복지용구 스토어 화면 소개",
      aspectRatio: "1.6",
      maxWidth: 780
    },
    preview: {
      title: "또하나의가족 복지용구 스토어",
      tip: "복지용구 스토어 초기 구축",
      summary: "스토어 초기 구축부터 수급자별 구매 흐름, 공통 UI와 운영 개선까지 참여했습니다.",
      description: "보행기·휠체어 등을 구매하거나 대여하는 스토어의 초기 화면을 구축하고, 수급자별 급여 적용과 장바구니 검증을 구현했습니다.",
      roles: [
        "초기 구축",
        "공통 UI·운영 개선"
      ]
    },
    caseStudy: {
      overview: "어르신과 가족이 보행기·휠체어 등 복지용구를 구매하거나 대여하는 스토어입니다.",
      roles: [
        "팀 합류 시점부터 새 복지용구 스토어의 초기 프론트엔드 구축을 맡았습니다.",
        "수급자별 구매 흐름, 공통 UI·Storybook 문서화와 서비스 운영 개선에 참여했습니다."
      ],
      flow: {
        steps: [
          "수급자 정보 확인",
          "품목·잔여 한도 검증",
          "급여·일반 구매 연결"
        ],
        caption: "급여 구매 조건에 맞지 않을 때에는 일반상품으로 전환해 구매를 이어갈 수 있게 했습니다."
      },
      implementation: [
        "공단 조회로 확인한 수급자 정보에 따라 상품 노출과 급여 적용 여부를 표시하고, 장바구니에서 구매 가능 품목과 잔여 지원금 한도를 검증했습니다.",
        "색상·타이포그래피 토큰과 공통 UI를 패키지로 구성하고 Storybook에 사용 예시를 정리했습니다.",
        "TanStack Query의 서버 사전 조회와 캐시 재사용을 구성하고, 상품·카테고리 메타데이터와 canonical URL, Product JSON-LD를 적용했습니다.",
        "또하나의가족 서비스 전반의 운영 이슈에 대응했습니다. 스토어에서는 옵션·재고·결제 문제를 수정하고, Beusable로 상품 탐색과 구매 흐름을 살폈습니다."
      ]
    }
  },
  {
    slug: "ddoga-platform",
    title: "DDOGA · Platform Redesign",
    period: "2025.03–2026.10",
    paragraphs: [
      "어르신과 가족이 장기요양기관을 찾고 비교하며 요양정보를 확인하는 플랫폼입니다.",
      "기존 플랫폼 리뉴얼에 참여해 장기요양기관의 조건별 검색·비교 화면을 구현했습니다.",
      "PASS 본인확인의 결과에 따라 사용자가 확인할 안내를 구분해 구현했습니다.",
      "장기요양기관을 조건별로 검색하고 비교할 수 있도록 화면과 조회 흐름을 구현했습니다.",
      "PASS 인증 결과에 맞는 안내를 표시해 사용자가 본인확인 상태를 이해할 수 있도록 구성했습니다."
    ],
    credit: "또하나의가족 공식 사이트의 시설찾기와 요양정보를 캡처해 구성한 소개 영상입니다.",
    video: {
      src: "/assets/portfolio-concepts/ddoga-platform-macos.mp4",
      poster: "/assets/portfolio-concepts/ddoga-platform-macos.jpg",
      label: "또하나의가족 리뉴얼 · 시설찾기와 요양정보",
      aspectRatio: "1.6",
      maxWidth: 780
    },
    preview: {
      title: "또하나의가족",
      tip: "또하나의가족 리뉴얼 참여",
      summary: "조건별 시설 검색·비교와 PASS 인증 결과별 안내를 구현했습니다.",
      description: "또하나의가족 리뉴얼에서 장기요양기관 검색·비교와 PASS 본인확인 결과 안내를 구현했습니다. 영상은 공식 시설찾기와 요양정보를 보여줍니다.",
      roles: [
        "플랫폼 리뉴얼",
        "시설 검색·본인확인"
      ]
    },
    caseStudy: {
      overview: "어르신과 가족이 장기요양기관을 찾고 비교하며 요양정보를 확인하는 플랫폼입니다.",
      roles: [
        "기존 플랫폼 리뉴얼에 참여해 장기요양기관의 조건별 검색·비교 화면을 구현했습니다.",
        "PASS 본인확인의 결과에 따라 사용자가 확인할 안내를 구분해 구현했습니다."
      ],
      flow: {
        steps: [
          "시설 조건 선택",
          "검색 결과 확인",
          "기관 정보 비교"
        ],
        caption: "시설 탐색과 비교 화면을 구현하고, 본인확인이 필요한 흐름에 PASS 결과별 안내를 연결했습니다."
      },
      implementation: [
        "장기요양기관을 조건별로 검색하고 비교할 수 있도록 화면과 조회 흐름을 구현했습니다.",
        "PASS 인증 결과에 맞는 안내를 표시해 사용자가 본인확인 상태를 이해할 수 있도록 구성했습니다."
      ]
    }
  },
  {
    slug: "ims",
    title: "IMS · Order Management",
    period: "2024.01–2025.02",
    paragraphs: [
      "복지용구 도·소매 주문과 물류 업무를 관리하는 비공개 사내 시스템입니다.",
      "초기 프론트엔드 개발에 참여해 Next.js·MUI 기반 공통 레이아웃과 입력 폼을 구성했습니다.",
      "소매 주문 입력, 고객·수급자 관리와 회원 승인·반려·권한 관리 화면을 개발했습니다.",
      "TanStack Query로 운영 데이터 조회를 연동하고, 고객 정보와 장기요양정보 및 구매·대여 가능 품목을 확인하는 화면을 개발했습니다.",
      "KendoReact Editor를 공지사항 등록·수정 화면에 적용하고, 이미지 형식·용량을 검증했습니다. 본문에 남은 이미지만 선별해 업로드하고 URL을 치환했습니다.",
      "프로젝트가 진행 중인 가운데 조직 개편으로 또하나의가족 팀으로 이동했습니다."
    ],
    credit: "조회·등록, 수급자 관리, 가입 관리의 데모 화면을 바탕으로 구성한 시연 영상입니다. 표에 표시되는 식별 정보는 가상 예시입니다.",
    video: {
      src: "/assets/portfolio-concepts/ims-macos.mp4",
      poster: "/assets/portfolio-concepts/ims-macos.jpg",
      label: "IMS 조회·등록, 수급자 관리, 가입 관리",
      aspectRatio: "1.6",
      maxWidth: 780
    },
    preview: {
      title: "IMS",
      tip: "사내 시스템 초기 개발 참여",
      summary: "수급자 조회부터 신청인·배송 정보와 필수 동의 확인까지 주문 입력을 연결했습니다.",
      description: "복지용구 주문 관리 업무에 필요한 수급자 조회, 고객 정보 관리, 회원 승인·반려 화면을 개발했습니다.",
      roles: [
        "주문 입력",
        "공통 폼·운영 관리"
      ]
    },
    caseStudy: {
      overview: "복지용구 도·소매 주문과 물류 업무를 관리하는 비공개 사내 시스템입니다.",
      roles: [
        "초기 프론트엔드 개발에 참여해 Next.js·MUI 기반 공통 레이아웃과 입력 폼을 구성했습니다.",
        "소매 주문 입력, 고객·수급자 관리와 회원 승인·반려·권한 관리 화면을 개발했습니다."
      ],
      flow: {
        steps: [
          "고객·수급자 조회",
          "신청인·배송 정보 입력",
          "필수 동의 확인"
        ],
        caption: "수급자·비수급자 조회부터 신청인 변경과 배송 메모, 필수 동의 검증까지 주문 입력 화면을 연결했습니다."
      },
      implementation: [
        "TanStack Query로 운영 데이터 조회를 연동하고, 고객 정보와 장기요양정보 및 구매·대여 가능 품목을 확인하는 화면을 개발했습니다.",
        "KendoReact Editor를 공지사항 등록·수정 화면에 적용하고, 이미지 형식·용량을 검증했습니다. 본문에 남은 이미지만 선별해 업로드하고 URL을 치환했습니다.",
        "프로젝트가 진행 중인 가운데 조직 개편으로 또하나의가족 팀으로 이동했습니다."
      ]
    }
  },
  {
    slug: "care-solution",
    title: "DDOGA · Care Facility Management",
    period: "2022.05–2023.10",
    paragraphs: [
      "요양시설 직원이 입소와 돌봄 계획, 간호 기록과 업무 문서를 관리하는 PC 업무 시스템입니다.",
      "수급자 관리, 기초평가·급여제공계획과 간호 업무 화면을 개발했습니다.",
      "OZ Report 문서 출력 연동을 구현하고 요양기관 현장의 간호 기능 파일럿에 참여했습니다.",
      "욕구사정, 낙상·욕창 위험도와 인지선별검사 결과를 급여제공계획 및 결과평가 화면과 연계했습니다.",
      "간호일지와 투약·바이탈 일괄 등록 화면을 개선하고, 현장에서 간호 기능 파일럿 테스트에 참여했습니다.",
      "수급자 목록·계약서·입퇴소 이력·급여제공계획서의 출력 데이터를 구성하고, 공통 뷰어에 문서별 템플릿과 PDF·Excel·HML 저장 옵션을 연결했습니다.",
      "프로젝트는 사업 철수로 종료됐습니다."
    ],
    credit: "시설 정보, 간호급여 제공기록, 물리치료 기록의 데모 화면을 바탕으로 구성한 시연 영상입니다.",
    video: {
      src: "/assets/portfolio-concepts/care-solution-macos.mp4",
      poster: "/assets/portfolio-concepts/care-solution-macos.jpg",
      label: "시설 정보, 간호급여 제공기록, 물리치료 기록",
      aspectRatio: "1.6",
      maxWidth: 780
    },
    preview: {
      title: "또하나의가족 솔루션",
      tip: "요양기관 PC 업무 화면 개발",
      summary: "수급자 관리와 간호 기록, 돌봄 계획과 문서 출력을 현장 업무 화면으로 구현했습니다.",
      description: "요양기관 직원이 수급자 정보와 급여제공계획을 관리하고 간호 업무를 기록하는 PC 화면을 개발했습니다.",
      roles: [
        "업무 화면",
        "기록·문서 출력"
      ]
    },
    caseStudy: {
      overview: "요양시설 직원이 입소와 돌봄 계획, 간호 기록과 업무 문서를 관리하는 PC 업무 시스템입니다.",
      roles: [
        "수급자 관리, 기초평가·급여제공계획과 간호 업무 화면을 개발했습니다.",
        "OZ Report 문서 출력 연동을 구현하고 요양기관 현장의 간호 기능 파일럿에 참여했습니다."
      ],
      flow: {
        steps: [
          "수급자·기초평가",
          "돌봄 계획·간호 기록",
          "문서 출력·저장"
        ],
        caption: "평가와 계획, 일상 기록과 문서 출력을 요양기관의 업무 화면으로 구성했습니다."
      },
      implementation: [
        "욕구사정, 낙상·욕창 위험도와 인지선별검사 결과를 급여제공계획 및 결과평가 화면과 연계했습니다.",
        "간호일지와 투약·바이탈 일괄 등록 화면을 개선하고, 현장에서 간호 기능 파일럿 테스트에 참여했습니다.",
        "수급자 목록·계약서·입퇴소 이력·급여제공계획서의 출력 데이터를 구성하고, 공통 뷰어에 문서별 템플릿과 PDF·Excel·HML 저장 옵션을 연결했습니다.",
        "프로젝트는 사업 철수로 종료됐습니다."
      ]
    }
  },
  {
    slug: "care-note",
    title: "Care Note · Family Mobile App",
    period: "2023.11–2023.12",
    paragraphs: [
      "보호자가 어르신의 건강·돌봄 기록과 청구서를 확인하고 시설에 상담을 요청하는 모바일 서비스입니다.",
      "보호자가 기록과 청구서를 확인하고 시설에 상담을 요청하는 모바일 화면을 개발했습니다.",
      "ApexCharts로 어르신의 건강 기록을 시각화했습니다.",
      "건강·돌봄 기록과 청구서 확인, 시설 상담 요청 기능을 모바일 화면으로 구현했습니다.",
      "건강 기록을 차트로 표시하는 화면에 ApexCharts를 적용했습니다."
    ],
    credit: "Adobe XD 화면의 배치와 색상을 유지하고, 어르신과 시설 표시는 가상 예시로 바꾼 시연 영상입니다.",
    video: {
      src: "/assets/portfolio-concepts/care-note-iphone-v2.mp4",
      poster: "/assets/portfolio-concepts/care-note-iphone-v2.jpg",
      label: "돌봄노트 홈과 어르신·시설 전환",
      aspectRatio: "1.6",
      maxWidth: 780
    },
    preview: {
      title: "돌봄노트",
      tip: "보호자용 모바일 화면 개발",
      summary: "건강·돌봄 기록과 청구서 확인, 시설 상담 요청을 모바일 화면으로 구현했습니다.",
      description: "보호자가 어르신의 돌봄과 건강 기록을 확인하고 요양기관에 상담을 요청하는 모바일 화면을 개발했습니다.",
      roles: [
        "보호자용 모바일",
        "건강 기록 시각화"
      ]
    },
    caseStudy: {
      overview: "보호자가 어르신의 건강·돌봄 기록과 청구서를 확인하고 시설에 상담을 요청하는 모바일 서비스입니다.",
      roles: [
        "보호자가 기록과 청구서를 확인하고 시설에 상담을 요청하는 모바일 화면을 개발했습니다.",
        "ApexCharts로 어르신의 건강 기록을 시각화했습니다."
      ],
      flow: {
        steps: [
          "건강·돌봄 기록 확인",
          "건강 기록 시각화",
          "시설 상담 요청"
        ],
        caption: "건강·돌봄 정보를 확인하고 시설과 소통할 수 있는 보호자용 모바일 화면을 구성했습니다."
      },
      implementation: [
        "건강·돌봄 기록과 청구서 확인, 시설 상담 요청 기능을 모바일 화면으로 구현했습니다.",
        "건강 기록을 차트로 표시하는 화면에 ApexCharts를 적용했습니다."
      ]
    }
  },
  {
    slug: "uplus-baseball",
    title: "U+ Baseball · Web Video Playback",
    period: "2021.10–2022.03",
    paragraphs: [
      "프로야구 경기 중계와 하이라이트 영상을 시청하는 웹·웹앱 서비스입니다.",
      "루니젠에서 U+프로야구 웹·웹앱의 화면 개발과 유지보수를 맡았습니다.",
      "Shaka Player·PallyCon DRM을 연동하고 브라우저별 영상 재생을 설정했습니다.",
      "React 기반 화면과 Redux를 사용하는 서비스의 웹·웹앱을 개발하고 유지보수했습니다.",
      "Shaka Player에 PallyCon DRM을 연동하고, 브라우저별 DASH·HLS 재생 설정과 DRM 라이선스 처리를 구현했습니다.",
      "표기 기간은 루니젠 재직 기간입니다."
    ],
    credit: "첨부한 U+프로야구 화면을 바탕으로 구성한 소개 영상입니다.",
    video: {
      src: "/assets/portfolio-concepts/uplus-baseball-iphone.mp4",
      poster: "/assets/portfolio-concepts/uplus-baseball-iphone.jpg",
      label: "U+프로야구 시작 화면, 뉴스와 팀별 하이라이트, 경기 일정과 결과",
      aspectRatio: "1.6",
      maxWidth: 780
    },
    preview: {
      title: "U+프로야구",
      tip: "웹·웹앱 개발 및 유지보수",
      summary: "웹·웹앱 화면을 개발하고 Shaka Player·PallyCon DRM으로 영상 재생을 연결했습니다.",
      description: "프로야구 영상 서비스의 웹·웹앱을 유지보수하고 브라우저별 재생과 DRM을 연동했습니다.",
      roles: [
        "웹·웹앱",
        "영상 재생·DRM"
      ]
    },
    caseStudy: {
      overview: "프로야구 경기 중계와 하이라이트 영상을 시청하는 웹·웹앱 서비스입니다.",
      roles: [
        "루니젠에서 U+프로야구 웹·웹앱의 화면 개발과 유지보수를 맡았습니다.",
        "Shaka Player·PallyCon DRM을 연동하고 브라우저별 영상 재생을 설정했습니다."
      ],
      flow: {
        steps: [
          "영상 재생 요청",
          "DRM 라이선스 처리",
          "DASH·HLS 재생"
        ],
        caption: "서비스 화면에서 영상 재생과 콘텐츠 보호까지, 플레이어와 DRM 연동을 구현했습니다."
      },
      implementation: [
        "React 기반 화면과 Redux를 사용하는 서비스의 웹·웹앱을 개발하고 유지보수했습니다.",
        "Shaka Player에 PallyCon DRM을 연동하고, 브라우저별 DASH·HLS 재생 설정과 DRM 라이선스 처리를 구현했습니다.",
        "표기 기간은 루니젠 재직 기간입니다."
      ]
    }
  }
];
