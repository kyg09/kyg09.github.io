import type { CSSProperties } from 'react';
import { Wordmark } from '@/components/Wordmark';
import { FooterConversation } from '@/components/FooterConversation';

// 손그림 프로필의 대화 전환과 반응형 워드마크, 이메일을 푸터에 배치한다.
export function PortfolioFooter() {
  return (
    <footer id="contact" data-path="/contact" className="site-footer content-width">
      <h2 className="visually-hidden" lang="en" style={{ top: 0, left: 0 }}>Contact</h2>
      <FooterConversation>
      <div className="footer-profile">
        <img
          className="footer-portrait"
          src="/assets/profile-character.svg?v=transparent"
          width="840"
          height="840"
          alt="노트북을 든 김영근의 손그림 캐릭터"
          loading="lazy"
          decoding="async"
        />
        <svg
          className="footer-profile-accent"
          viewBox="0 0 36 32"
          aria-hidden="true"
          focusable="false"
        >
          <use href="#profile-accent-strokes" />
        </svg>
      </div>
      </FooterConversation>
      <Wordmark placement="footer" />
      <p
        className="footer-in footer-email"
        style={{ '--i': '2' } as CSSProperties}
      >
        <button className="copy-email" type="button">
          {'kygcode09@gmail.com'}
        </button>
      </p>
      <small className="footer-copyright" lang="en">
        {'© 2026 Kim Young Geun. All rights reserved.'}
      </small>
    </footer>
  );
}
