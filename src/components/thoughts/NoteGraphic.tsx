import type { ReactNode } from 'react';
import styles from './NoteGraphic.module.css';

// 글의 주제를 흑백 컴포넌트 도식으로 표현한다. 카드 제목이 접근 가능한 이름을 제공한다.
const graphics: Record<string, ReactNode> = {
  'on-taste': (
    <>
      <span className={styles.componentPieces}>
        <i className={styles.inputPiece}>
          <i />
        </i>
        <i className={styles.buttonPiece}>
          <i />
        </i>
        <i className={styles.togglePiece}>
          <i />
        </i>
      </span>
      <i className={styles.arrow} />
      <span className={styles.package}>
        <span className={styles.packageLabel}>Shared UI</span>
        <span className={styles.componentGrid}>
          <i />
          <i />
          <i />
        </span>
      </span>
    </>
  ),
  'operating-a-welfare-store': (
    <>
      <span className={styles.window}>
        <i className={styles.windowBar} />
        <span className={styles.productGrid}>
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
      <i className={styles.arrow} />
      <span className={styles.review}>
        <i className={styles.reviewLine}>
          <i className={styles.check} />
        </i>
        <i className={styles.reviewLine}>
          <i className={styles.check} />
        </i>
        <i className={styles.reviewLine}>
          <i className={styles.check} />
        </i>
      </span>
    </>
  ),
  'prompting-naturally': (
    <>
      <span className={styles.productList}>
        <span>
          <i />
          <i className={styles.check} />
        </span>
        <span>
          <i />
          <i className={styles.check} />
        </span>
        <span>
          <i />
          <i className={styles.emptyCheck} />
        </span>
      </span>
      <i className={styles.arrow} />
      <span className={styles.cart}>
        <i />
        <i />
        <i />
      </span>
    </>
  ),
  'rendering-and-product-seo': (
    <>
      <span className={styles.servers}>
        <i />
        <i />
        <i />
      </span>
      <i className={styles.arrow} />
      <span className={`${styles.window} ${styles.resultWindow}`}>
        <i className={styles.windowBar} />
        <span className={styles.searchField}>
          <i />
        </span>
        <i className={styles.resultLine} />
        <i className={styles.resultLine} />
      </span>
    </>
  ),
  'ims-order-intake': (
    <>
      <span className={styles.recipient}>
        <i className={styles.avatar} />
        <i className={styles.identityLine} />
        <i className={styles.identityLine} />
      </span>
      <i className={styles.arrow} />
      <span className={styles.order}>
        <i className={styles.formField} />
        <i className={styles.formField} />
        <i className={styles.check} />
      </span>
    </>
  ),
  'care-records-and-document-export': (
    <>
      <span className={styles.record}>
        <i className={styles.cross} />
        <i className={styles.recordLine} />
        <i className={styles.recordLine} />
        <i className={styles.recordLine} />
      </span>
      <i className={styles.arrow} />
      <span className={styles.exports}>
        <i>PDF</i>
        <i>Excel</i>
        <i>HML</i>
      </span>
    </>
  ),
  'ims-editor-images': (
    <>
      <span className={styles.window}>
        <i className={styles.windowBar} />
        <span className={styles.productGrid}>
          <i />
          <i />
        </span>
      </span>
      <i className={styles.arrow} />
      <span className={styles.exports}>
        <i>IMG</i>
        <i>URL</i>
      </span>
    </>
  ),
  'ddoga-platform': (
    <>
      <span className={styles.facilityMap}>
        <i className={styles.mapStreet} />
        <i className={styles.mapStreet} />
        <i className={styles.facilityPin} />
        <i className={styles.facilityPin} />
        <i className={styles.facilityPin} />
      </span>
      <i className={styles.arrow} />
      <span className={styles.facilityResults}>
        <i>
          <i />
        </i>
        <i>
          <i />
        </i>
        <i>
          <i />
        </i>
      </span>
    </>
  ),
  'care-note': (
    <>
      <span className={styles.phone}>
        <span className={styles.phoneScreen}>
          <i className={styles.phoneAvatar} />
          <i className={styles.phoneLine} />
          <i className={styles.phoneLine} />
          <span className={styles.phoneTiles}>
            <i />
            <i />
          </span>
        </span>
      </span>
      <i className={styles.arrow} />
      <span className={styles.healthChart}>
        <i className={styles.chartHeading} />
        <span className={styles.chartBars}>
          <i />
          <i />
          <i />
          <i />
        </span>
      </span>
    </>
  ),
  'uplus-baseball': (
    <>
      <span className={styles.videoPlayer}>
        <i className={styles.windowBar} />
        <i className={styles.playSymbol} />
        <i className={styles.videoProgress} />
      </span>
      <span className={styles.baseball} />
    </>
  ),
};

const projectGraphicAliases: Record<string, string> = {
  'ddoga-store': 'prompting-naturally',
  ims: 'ims-order-intake',
  'care-solution': 'care-records-and-document-export',
};

export function NoteGraphic({ slug }: { slug: string }) {
  return (
    <span className={styles.graphic} aria-hidden="true">
      {graphics[projectGraphicAliases[slug] ?? slug]}
    </span>
  );
}
