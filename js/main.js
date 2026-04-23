/**
 * 漫香小舖 만향소포 — Main JavaScript
 * Features:
 *  - 漫香小舖 Loader animation
 *  - Smooth scroll navigation
 *  - Header scroll effects
 *  - Mobile hamburger menu
 *  - Product filter tabs
 *  - Scroll reveal animations
 *  - Count-up stats animation
 *  - Wishlist toggle
 *  - Newsletter form feedback
 *  - Scroll-to-top button
 */

'use strict';

/* ══════════════════════════════════════════════
   🔄  LOADER
══════════════════════════════════════════════ */
(function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;

  const minDuration = 2200;
  const startTime = Date.now();

  function hideLoader() {
    const elapsed = Date.now() - startTime;
    const delay = Math.max(0, minDuration - elapsed);
    setTimeout(() => {
      loader.classList.add('hidden');
      // overflow만 제거 — padding-top은 CSS에서 관리하므로 건드리지 않음
      document.documentElement.classList.remove('is-loading');
    }, delay);
  }

  // overflow 잠금: body 인라인 스타일 대신 html 클래스로 관리
  document.documentElement.classList.add('is-loading');

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader);
  }
})();

/* ══════════════════════════════════════════════
   📌  HEADER — 스크롤 효과
══════════════════════════════════════════════ */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastScroll = 0;
  let ticking = false;

  function handleScroll() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
})();

/* ══════════════════════════════════════════════
   🍔  HAMBURGER — 모바일 메뉴
══════════════════════════════════════════════ */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // 링크 클릭 시 메뉴 닫기
  mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
})();

/* ══════════════════════════════════════════════
   🔗  SMOOTH SCROLL — 앵커 이동
══════════════════════════════════════════════ */
(function initSmoothScroll() {
  const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ══════════════════════════════════════════════
   🛍️  PRODUCT FILTER TABS
══════════════════════════════════════════════ */
(function initProductFilter() {
  const tabs  = document.querySelectorAll('.products__tab');
  const cards = document.querySelectorAll('.product-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // 탭 활성화
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      // 카드 필터
      cards.forEach((card, idx) => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.classList.remove('hidden');
          // 스태거 애니메이션
          card.style.animationDelay = `${idx * 60}ms`;
          card.style.animation = 'none';
          void card.offsetWidth; // reflow
          card.style.animation = 'cardReveal 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
})();

/* ══════════════════════════════════════════════
   👁️  SCROLL REVEAL
══════════════════════════════════════════════ */
(function initReveal() {
  // 애니메이션 대상 자동 지정
  const targets = document.querySelectorAll([
    '.section__header',
    '.ingredient-card',
    '.philosophy__image-side',
    '.philosophy__text-side',
    '.product-card',
    '.story__text-block',
    '.newsletter__text',
    '.newsletter__form',
    '.footer__brand',
    '.footer__col',
  ].join(', '));

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // 같은 부모 내에서 순서에 따른 딜레이
    const siblingIdx = Array.from(el.parentElement.children).indexOf(el);
    if (siblingIdx > 0 && siblingIdx <= 4) {
      el.classList.add(`reveal-delay-${siblingIdx}`);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════
   🔢  COUNT-UP STATS
══════════════════════════════════════════════ */
(function initCountUp() {
  const statNumbers = document.querySelectorAll('.story__stat-number[data-target]');
  if (!statNumbers.length) return;

  function countUp(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(ease * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUp(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => observer.observe(el));
})();

/* ══════════════════════════════════════════════
   ❤️  WISHLIST TOGGLE
══════════════════════════════════════════════ */
(function initWishlist() {
  document.querySelectorAll('.product-card__wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const isActive = btn.classList.toggle('active');
      const icon = btn.querySelector('i');
      if (isActive) {
        icon.classList.remove('far');
        icon.classList.add('fas');
        showToast('위시리스트에 추가되었습니다 ♥');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
        showToast('위시리스트에서 제거되었습니다');
      }
    });
  });
})();

/* ══════════════════════════════════════════════
   📧  NEWSLETTER FORM
══════════════════════════════════════════════ */
(function initNewsletter() {
  const form = document.querySelector('.newsletter__form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter__input');
    const email = input.value.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('올바른 이메일 주소를 입력해주세요.', 'error');
      input.focus();
      return;
    }

    showToast('구독해주셔서 감사합니다! 🌿 소식을 보내드릴게요.');
    input.value = '';
  });
})();

/* ══════════════════════════════════════════════
   ⬆  SCROLL TO TOP
══════════════════════════════════════════════ */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      btn.classList.add('visible');
      btn.setAttribute('aria-hidden', 'false');
    } else {
      btn.classList.remove('visible');
      btn.setAttribute('aria-hidden', 'true');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ══════════════════════════════════════════════
   💬  TOAST NOTIFICATION
══════════════════════════════════════════════ */
function showToast(message, type = 'success') {
  // 기존 토스트 제거
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = message;

  // 스타일 인라인 (CSS 의존도 최소화)
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '88px',
    left: '50%',
    transform: 'translateX(-50%) translateY(20px)',
    background: type === 'error' ? '#c0392b' : '#2D3B25',
    color: '#fff',
    padding: '12px 28px',
    borderRadius: '40px',
    fontSize: '13px',
    fontFamily: 'var(--font-sans, sans-serif)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    zIndex: '9998',
    opacity: '0',
    transition: 'opacity 0.35s ease, transform 0.35s ease',
    letterSpacing: '0.5px',
  });

  document.body.appendChild(toast);
  // 트리거 reflow
  void toast.offsetWidth;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}

/* ══════════════════════════════════════════════
   🎨  PRODUCT CARD REVEAL KEYFRAME (dynamic injection)
══════════════════════════════════════════════ */
(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes cardReveal {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

/* ══════════════════════════════════════════════
   🌸  NAV ACTIVE STATE — 스크롤 위치에 따른 네비 활성화
══════════════════════════════════════════════ */
(function initNavActiveState() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');
  if (!sections.length || !navLinks.length) return;

  // 네비: 메인(0=hero), 카탈로그(1=products), 브랜드스토리(2=story)
  const sectionMap = {
    'hero'     : 0,
    'products' : 1,
    'story'    : 2,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = sectionMap[entry.target.id];
        if (idx === undefined) return;
        navLinks.forEach((link, i) => {
          link.style.color = (i === idx) ? 'var(--amber)' : '';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => {
    if (sectionMap.hasOwnProperty(section.id)) {
      observer.observe(section);
    }
  });
})();

/* 패럴랙스 비활성화 — 실제 브랜드 사진에는 고정 뷰가 더 어울림 */

console.log('%c漫香小舖 만향소포 🌿', 'color:#8B7355;font-size:18px;font-weight:bold;');
console.log('%c자연에서 온 향, 한국적 내추럴 코스메틱', 'color:#7A8B6E;font-size:12px;');
