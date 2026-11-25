// 기존 20개 미디어 위치에 전체 영상과 기능 확대 이미지를 섞는다.
// still 파일은 extract-project-stills.swift로 현재 영상에서 직접 추출한다.
export const galleryItems = [
  { slug: 'ddoga-store', kind: 'video' },
  { slug: 'ims', kind: 'image', image: '/assets/portfolio-concepts/details/ims-dashboard.jpg', ratio: 1220 / 780, caption: ['조회·등록 대시보드', 'Lookup and registration dashboard'] },
  { slug: 'care-solution', kind: 'image', image: '/assets/portfolio-concepts/details/care-solution-nursing.jpg', ratio: 1232 / 780, caption: ['간호급여 제공기록', 'Nursing care records'] },
  { slug: 'care-note', kind: 'video' },
  { slug: 'uplus-baseball', kind: 'image', image: '/assets/portfolio-concepts/details/uplus-baseball-news.jpg', ratio: 390 / 808, caption: ['뉴스 목록', 'News feed'] },
  { slug: 'ddoga-platform', kind: 'video' },
  { slug: 'ddoga-store', kind: 'image', image: '/assets/portfolio-concepts/details/ddoga-store-home.jpg', ratio: 575 / 787, caption: ['복지용구 스토어 홈', 'Assistive equipment store home'] },
  { slug: 'ddoga-platform', kind: 'image', image: '/assets/portfolio-concepts/details/ddoga-platform-facilities.jpg', ratio: 575 / 787, caption: ['시설찾기 화면', 'Facility finder'] },
  { slug: 'ims', kind: 'video' },
  { slug: 'care-note', kind: 'image', image: '/assets/portfolio-concepts/details/care-note-home.jpg', ratio: 364 / 808, caption: ['보호자용 돌봄노트 홈', 'Care Note home for family members'] },
  { slug: 'care-solution', kind: 'video' },
  { slug: 'ddoga-platform', kind: 'image', image: '/assets/portfolio-concepts/details/ddoga-platform-guides.jpg', ratio: 575 / 787, caption: ['요양정보 화면', 'Care information'] },
  { slug: 'ddoga-store', kind: 'image', image: '/assets/portfolio-concepts/details/ddoga-store-products.jpg', ratio: 575 / 787, caption: ['복지용구 상품 목록', 'Assistive equipment product list'] },
  { slug: 'ims', kind: 'image', image: '/assets/portfolio-concepts/details/ims-customers.jpg', ratio: 1220 / 780, caption: ['고객·수급자 관리', 'Customer and beneficiary management'] },
  { slug: 'uplus-baseball', kind: 'video' },
  { slug: 'care-note', kind: 'image', image: '/assets/portfolio-concepts/details/care-note-switching.jpg', ratio: 364 / 808, caption: ['어르신·시설 정보 전환', 'Switching resident and facility details'] },
  { slug: 'care-solution', kind: 'image', image: '/assets/portfolio-concepts/details/care-solution-therapy.jpg', ratio: 1232 / 780, caption: ['물리치료 기록', 'Physical therapy records'] },
  { slug: 'ddoga-store', kind: 'image', image: '/assets/portfolio-concepts/details/ddoga-store-categories.jpg', ratio: 575 / 346, caption: ['복지용구 카테고리', 'Assistive equipment categories'] },
  { slug: 'ims', kind: 'image', image: '/assets/portfolio-concepts/details/ims-members.jpg', ratio: 1220 / 780, caption: ['회원 가입 관리', 'Account request management'] },
  { slug: 'uplus-baseball', kind: 'image', image: '/assets/portfolio-concepts/details/uplus-baseball-schedule.jpg', ratio: 390 / 808, caption: ['경기 일정', 'Game schedule'] },
];
