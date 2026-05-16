/* ══════════════════════════════════════════
   НАДЯ — Interactions & Animations
   ══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Hero Load Animation --- */
  const hero = document.getElementById('hero');
  if (hero) {
    requestAnimationFrame(() => {
      hero.classList.add('is-loaded');
    });
  }

  /* --- Scroll Reveal (IntersectionObserver) --- */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  }

  /* --- Nav Scroll State --- */
  const nav = document.getElementById('nav');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('is-scrolled', window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* --- Smooth Scroll for Nav Links --- */
  document.querySelectorAll('.nav__link, .hero__tagline-item').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close mobile nav if open
        const nav = document.getElementById('nav');
        const burger = document.getElementById('navBurger');
        if (nav && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          burger.classList.remove('is-active');
        }
      }
    });
  });

  /* --- Mobile Menu --- */
  const burger = document.getElementById('navBurger');
  const navEl = document.getElementById('nav');
  if (burger && navEl) {
    burger.addEventListener('click', () => {
      navEl.classList.toggle('is-open');
      burger.classList.toggle('is-active');
    });
  }

  /* --- Custom Cursor --- */
  const cursor = document.querySelector('.cursor');
  if (cursor && window.matchMedia('(min-width: 641px)').matches) {
    let cursorX = 0, cursorY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    const animateCursor = () => {
      currentX += (cursorX - currentX) * 0.15;
      currentY += (cursorY - currentY) * 0.15;
      cursor.style.transform = `translate(${currentX}px, ${currentY}px)`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();

    const hoverTargets = document.querySelectorAll('a, button, .card, .therapy__feature, .prices__card, .writing__card, .therapy__issue');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
    });
  }

  /* --- Contact Form --- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const btn = form.querySelector('.contact__submit');
      const originalText = btn.querySelector('span').textContent;
      btn.querySelector('span').textContent = 'Отправлено ✓';
      btn.style.background = 'var(--color-sage)';

      setTimeout(() => {
        btn.querySelector('span').textContent = originalText;
        btn.style.background = '';
        form.reset();
      }, 3000);
    });
  }

  /* --- Parallax on hero background image --- */
  const heroBg = document.querySelector('.hero__bg-img');
  if (heroBg && window.matchMedia('(min-width: 641px)').matches) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroHeight = hero.offsetHeight;
          if (scrollY < heroHeight) {
            // Slow scroll effect on the background image
            heroBg.style.transform = `translateY(${scrollY * 0.4}px) scale(1.1)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* --- Parallax on writing-hero background image --- */
  const writingBg = document.querySelector('.writing-hero__bg-img');
  if (writingBg && window.matchMedia('(min-width: 641px)').matches) {
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = writingBg.closest('.writing-hero').getBoundingClientRect();
          const viewHeight = window.innerHeight;

          if (rect.top < viewHeight && rect.bottom > 0) {
            const progress = (viewHeight - rect.top) / (viewHeight + rect.height);
            writingBg.style.transform = `translateY(${(progress - 0.5) * 60}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* --- Lightbox --- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');

  if (lightbox && lightboxImg) {
    document.querySelectorAll('.education__diploma-img, .education__diploma, .education__diploma-inline').forEach(el => {
      el.addEventListener('click', () => {
        const src = el.src || el.dataset.src || el.querySelector('img')?.src;
        if (src) {
          lightboxImg.src = src;
          lightbox.classList.add('is-open');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* --- Therapy Issues Auto-Cycle --- */
  const issues = document.querySelectorAll('.therapy__issue');
  const issuesImg = document.getElementById('therapyIssuesImg');

  if (issues.length && issuesImg) {
    let currentIndex = 0;
    let cycleTimer = null;

    const activateIssue = (index) => {
      issues.forEach(el => el.classList.remove('is-active'));
      issues[index].classList.add('is-active');

      const imgSrc = issues[index].dataset.img;
      const visual = issuesImg.closest('.therapy__issues-visual');
      if (imgSrc) {
        issuesImg.classList.remove('is-visible');
        setTimeout(() => {
          issuesImg.src = imgSrc;
          issuesImg.classList.add('is-visible');
          if (visual) visual.classList.add('is-lit');
        }, 200);
      } else {
        issuesImg.classList.remove('is-visible');
        if (visual) visual.classList.remove('is-lit');
      }
    };

    const startCycle = () => {
      if (cycleTimer) clearInterval(cycleTimer);
      cycleTimer = setInterval(() => {
        currentIndex = (currentIndex + 1) % issues.length;
        activateIssue(currentIndex);
      }, 3000);
    };

    // Start on scroll into view
    const issuesSection = document.querySelector('.therapy__issues');
    if (issuesSection) {
      const issuesObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            activateIssue(0);
            startCycle();
            issuesObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      issuesObserver.observe(issuesSection);
    }

    // Click on tag — manual select
    issues.forEach((issue, i) => {
      issue.addEventListener('click', () => {
        currentIndex = i;
        activateIssue(i);
        startCycle();
      });
    });
  }

  /* --- Writing Stars Animation --- */
  const starsCanvas = document.getElementById('writingStars');
  if (starsCanvas) {
    const ctx = starsCanvas.getContext('2d');
    let stars = [];
    let animId = null;

    const resize = () => {
      starsCanvas.width = starsCanvas.offsetWidth;
      starsCanvas.height = starsCanvas.offsetHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = Math.floor((starsCanvas.width * starsCanvas.height) / 2500);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * starsCanvas.width,
          y: Math.random() * starsCanvas.height,
          r: Math.random() * 1.8 + 0.3,
          baseAlpha: Math.random() * 0.85 + 0.55,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.01 + 0.004,
          drift: (Math.random() - 0.5) * 0.3,
          driftY: (Math.random() - 0.5) * 0.1,
          isComet: false
        });
      }
    };

    let comets = [];
    let cometTimer = 0;

    const spawnComet = () => {
      const fromLeft = Math.random() > 0.5;
      comets.push({
        x: fromLeft ? -20 : starsCanvas.width + 20,
        y: Math.random() * starsCanvas.height * 0.6,
        vx: (fromLeft ? 1 : -1) * (1.2 + Math.random() * 1.5),
        vy: 0.4 + Math.random() * 0.8,
        life: 1,
        decay: 0.003 + Math.random() * 0.003,
        len: 50 + Math.random() * 70
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

      stars.forEach(s => {
        s.phase += s.speed;
        s.x += s.drift;
        s.y += s.driftY;

        if (s.x < -5) s.x = starsCanvas.width + 5;
        if (s.x > starsCanvas.width + 5) s.x = -5;
        if (s.y < -5) s.y = starsCanvas.height + 5;
        if (s.y > starsCanvas.height + 5) s.y = -5;

        const alpha = s.baseAlpha * (0.4 + 0.6 * Math.sin(s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 248, 243, ${alpha})`;
        ctx.fill();

        if (s.r > 1.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196, 107, 74, ${alpha * 0.2})`;
          ctx.fill();
        }
      });

      // Comets
      cometTimer++;
      if (cometTimer > 120 + Math.random() * 180) {
        spawnComet();
        cometTimer = 0;
      }

      comets = comets.filter(c => c.life > 0);
      comets.forEach(c => {
        c.x += c.vx;
        c.y += c.vy;
        c.life -= c.decay;

        // Random bright flash
        const flash = Math.random() < 0.02 ? 1 : 0;
        const flashBoost = flash ? 1.5 : 1;

        const alpha = Math.min(c.life * flashBoost, 1);
        const dx = -c.vx / Math.sqrt(c.vx * c.vx + c.vy * c.vy);
        const dy = -c.vy / Math.sqrt(c.vx * c.vx + c.vy * c.vy);

        const grad = ctx.createLinearGradient(c.x, c.y, c.x + dx * c.len, c.y + dy * c.len);
        grad.addColorStop(0, `rgba(251, 248, 243, ${alpha})`);
        grad.addColorStop(0.3, `rgba(196, 107, 74, ${alpha * 0.6})`);
        grad.addColorStop(1, `rgba(196, 107, 74, 0)`);

        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x + dx * c.len, c.y + dy * c.len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = flash ? 4 : 2;
        ctx.stroke();

        // Glow
        if (flash) {
          ctx.beginPath();
          ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 248, 243, 0.4)`;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 248, 243, 0.7)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 248, 243, ${alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    // Start on scroll into view
    const starsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          resize();
          draw();
          starsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    starsObserver.observe(starsCanvas);

    window.addEventListener('resize', resize);
  }

  /* --- Business Video Autoplay --- */
  const businessVideo = document.querySelector('.business__video-player');
  if (businessVideo) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          businessVideo.play().catch(() => {});
        } else {
          businessVideo.pause();
        }
      });
    }, { threshold: 0.3 });
    videoObserver.observe(businessVideo);
  }

  /* --- Business Carousel --- */
  const carousel = document.querySelector('.business__carousel');
  if (carousel) {
    const images = carousel.querySelectorAll('.business__carousel-img');
    if (images.length > 0) {
      let current = 0;
      images[0].classList.add('is-active');

      setInterval(() => {
        images[current].classList.remove('is-active');
        current = (current + 1) % images.length;
        images[current].classList.add('is-active');
      }, 4000);
    }
  }

  /* --- Education Group Toggle --- */
  document.querySelectorAll('.education__group-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.education__item--group');
      if (item) item.classList.toggle('is-open');
    });
  });
});