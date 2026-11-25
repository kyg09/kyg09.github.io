export type NoteParagraph =
  | string
  | { before: string; highlight: string; after: string };

export type EngineeringNote = {
  slug: string;
  title: string;
  category: string;
  fill: string;
  preview: { highlight: string; summary: string };
  paragraphs: NoteParagraph[];
  sections?: { label: string; body: string }[];
};

// 짧은 소개 뒤에 배경·구현·주요 조건을 구분해 기록한다.
export const engineeringNotes: EngineeringNote[] = [
  {
    slug: "on-taste",
    title: "Building a Shared UI Package",
    category: "DDOGA · Design System",
    fill: "var(--color-bg)",
    preview: {
      highlight: "Shared UI",
      summary: "색상·타이포그래피 토큰부터 공통 UI 패키지와 Storybook 사용 예시까지."
    },
    paragraphs: [
      "반복해서 쓰는 UI의 모양과 사용 방법을 공통 기준으로 정리했습니다."
    ],
    sections: [
      {
        label: "Context",
        body: "DDOGA에서 반복되는 화면 요소를 공통으로 사용할 수 있도록 색상·타이포그래피와 UI의 기준을 모으는 작업을 맡았습니다."
      },
      {
        label: "Implementation",
        body: "색상·타이포그래피를 디자인 토큰으로 정리하고, 공통 UI를 패키지로 구성했습니다. Storybook에는 컴포넌트를 적용한 사용 예시를 남겼습니다."
      },
      {
        label: "Key Detail",
        body: "토큰과 컴포넌트뿐 아니라 적용 예시도 함께 정리했습니다. IMS에서는 별도로 Next.js·MUI 기반의 공통 레이아웃과 입력 폼을 구성했습니다."
      }
    ]
  },
  {
    slug: "operating-a-welfare-store",
    title: "Improving DDOGA in Production",
    category: "DDOGA · Operations",
    fill: "var(--color-bg)",
    preview: {
      highlight: "Production",
      summary: "탐색부터 결제까지, 운영 이슈와 실제 사용 흐름을 함께 개선했습니다."
    },
    paragraphs: [
      "운영 중 발생한 문제와 사용자가 화면을 이용하는 흐름을 함께 살폈습니다."
    ],
    sections: [
      {
        label: "Context",
        body: "운영 대응의 범위는 복지용구 스토어를 포함한 또하나의가족 서비스 전반이었습니다. 스토어에서는 옵션·재고·결제 단계의 문제를 수정했습니다."
      },
      {
        label: "Implementation",
        body: "각 이슈에 해당하는 화면과 기능을 수정하고, Beusable로 상품 탐색에서 구매까지의 사용 흐름을 분석했습니다."
      },
      {
        label: "Key Detail",
        body: "운영 이슈 수정과 사용 흐름 분석을 함께 진행했습니다. 개별 화면의 동작뿐 아니라 상품을 찾고 다음 구매 단계로 넘어가는 흐름도 살폈습니다."
      }
    ]
  },
  {
    slug: "prompting-naturally",
    title: "Handling Benefit Eligibility in Checkout",
    category: "DDOGA · Checkout",
    fill: "var(--color-bg)",
    preview: {
      highlight: "Eligibility",
      summary: "구매 가능 품목과 잔여 한도를 확인하고 다음 구매 흐름으로 연결했습니다."
    },
    paragraphs: [
      "수급자마다 달라지는 구매 조건을 상품 목록과 장바구니에 반영했습니다."
    ],
    sections: [
      {
        label: "Context",
        body: "복지용구 급여 구매에서는 수급자 정보에 따라 구매 가능한 품목과 지원금 한도를 함께 확인해야 했습니다."
      },
      {
        label: "Implementation",
        body: "공단 조회로 확인한 수급자 정보에 맞춰 상품 노출과 급여 적용 여부를 표시하고, 장바구니에서 품목과 잔여 한도를 검증했습니다."
      },
      {
        label: "Key Detail",
        body: "급여 조건에 맞지 않을 때는 일반상품으로 전환할 수 있게 했습니다. 조건 확인 결과가 구매 흐름의 다음 선택으로 이어지도록 구성했습니다."
      }
    ]
  },
  {
    slug: "rendering-and-product-seo",
    title: "Server Prefetching & Product SEO",
    category: "DDOGA · Rendering",
    fill: "var(--color-bg)",
    preview: {
      highlight: "Prefetching",
      summary: "서버에서 먼저 조회한 데이터를 재사용하고, 상품의 검색 정보를 구성했습니다."
    },
    paragraphs: [
      "스토어의 상품 데이터를 먼저 조회하고, 검색 엔진에 전달할 상품 정보를 구성했습니다."
    ],
    sections: [
      {
        label: "Context",
        body: "스토어 화면에서 사용하는 상품 데이터와 검색 엔진이 읽는 상품·카테고리 정보를 각각 구성했습니다."
      },
      {
        label: "Implementation",
        body: "TanStack Query로 서버에서 필요한 데이터를 사전 조회하고, 클라이언트가 해당 조회 결과와 캐시를 재사용하도록 구성했습니다."
      },
      {
        label: "Key Detail",
        body: "상품·카테고리 메타데이터와 canonical URL을 설정하고, 상품 상세에 Product JSON-LD를 구성했습니다. 페이지 주소와 상품 정보를 함께 제공하도록 구성했습니다."
      }
    ]
  },
  {
    slug: "ims-order-intake",
    title: "Building IMS Order Intake",
    category: "IMS · Back Office",
    fill: "var(--color-bg)",
    preview: {
      highlight: "Order Intake",
      summary: "고객 조회부터 신청인·배송 메모·필수 동의까지 주문 입력을 연결했습니다."
    },
    paragraphs: [
      "고객 조회와 여러 입력 조건을 하나의 소매 주문 화면에 연결했습니다."
    ],
    sections: [
      {
        label: "Context",
        body: "주문 입력 화면은 수급자·비수급자 고객 정보를 불러오고 신청인과 배송 관련 정보를 입력할 수 있어야 했습니다."
      },
      {
        label: "Implementation",
        body: "고객 검색과 정보 불러오기, 신청인 추가·변경, 주문 경로와 배송 메모 입력을 구현했습니다. 공통 레이아웃과 폼은 Next.js·MUI로 구성했습니다."
      },
      {
        label: "Key Detail",
        body: "필수 동의 조건을 검증하고, 고객 관리에서는 장기요양정보와 구매·대여 가능한 품목을 조회하도록 구성했습니다."
      }
    ]
  },
  {
    slug: "care-records-and-document-export",
    title: "Care Records & Document Export",
    category: "Care Solution · Workflow",
    fill: "var(--color-bg)",
    preview: {
      highlight: "Document Export",
      summary: "간호 기록과 일괄 입력을 개선하고, 업무 문서를 여러 형식으로 출력했습니다."
    },
    paragraphs: [
      "요양기관의 기록 입력과 문서별 출력 데이터를 공통 업무 화면에 연결했습니다."
    ],
    sections: [
      {
        label: "Context",
        body: "간호일지와 투약·바이탈 일괄 입력, 수급자 목록과 계약서 등 서로 다른 기록과 출력 문서를 다뤘습니다."
      },
      {
        label: "Implementation",
        body: "간호 기록과 일괄 등록 화면을 개선하고, 수급자 목록·계약서·입퇴소 이력·급여제공계획서의 출력 데이터를 구성했습니다."
      },
      {
        label: "Key Detail",
        body: "OZ Report 공통 뷰어에 문서별 템플릿과 PDF·Excel·HML 저장 옵션을 연결했습니다. 현장에서 간호 기능 파일럿 테스트에도 참여했습니다."
      }
    ]
  },
  {
    slug: "ims-editor-images",
    title: "Handling Images in the Editor",
    category: "IMS · Editor",
    fill: "var(--color-bg)",
    preview: {
      highlight: "Images",
      summary: "본문에 남은 이미지만 골라 업로드하고, 저장할 본문의 URL을 치환했습니다."
    },
    paragraphs: [
      "공지사항 에디터에서 작성 중인 이미지와 저장할 이미지의 연결을 처리했습니다."
    ],
    sections: [
      {
        label: "Context",
        body: "IMS 공지사항 등록·수정 화면에 공통 KendoReact Editor를 적용하고, 삽입 이미지의 형식과 용량을 검증했습니다."
      },
      {
        label: "Implementation",
        body: "저장할 본문에 남아 있는 이미지를 선별해 업로드하고, 업로드 결과의 URL로 본문 안의 이미지 주소를 치환했습니다."
      },
      {
        label: "Key Detail",
        body: "이미지 검증과 본문 이미지 선별, 업로드와 URL 치환을 함께 구현했습니다. 작성 중 삽입했던 이미지와 최종 본문에 남은 이미지를 구분해 처리했습니다."
      }
    ]
  }
];
