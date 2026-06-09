/* ============================================================
   FORGE GYM — Main JavaScript
   ============================================================ */

'use strict';

/* ---- LOADER ---- */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    document.body.style.overflow = '';
    animateHeroEntrance();
  }, 1900);
});
document.body.style.overflow = 'hidden';

/* ---- NAVBAR ---- */
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  highlightNavLink();
}, { passive: true });

function highlightNavLink() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 200) current = s.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- HERO ENTRANCE ---- */
function animateHeroEntrance() {
  const el = document.querySelector('.hero-glass');
  if (!el) return;
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.8s cubic-bezier(0.4,0,0.2,1), transform 0.8s cubic-bezier(0.4,0,0.2,1)';
  setTimeout(() => {
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, 100);
}

/* ---- SCROLL REVEAL ---- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---- COUNTER ANIMATIONS ---- */
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  const startVal = 0;
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const val = Math.floor(startVal + (target - startVal) * eased);
    el.textContent = val.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      animateCounter(el, target, 1800, suffix);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

/* ---- TESTIMONIALS CAROUSEL ---- */
(function initCarousel() {
  const track = document.querySelector('.testimonials-track');
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots = document.querySelectorAll('.carousel-dot');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  if (!track || !slides.length) return;

  let current = 0;
  let perView = window.innerWidth <= 900 ? 1 : 3;
  let total = Math.ceil(slides.length / perView);
  let autoInterval;

  function goTo(idx) {
    current = (idx + total) % total;
    const offset = current * (100 / perView) * perView;
    track.style.transform = `translateX(-${current * (100 / total)}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
  }

  function startAuto() {
    stopAuto();
    autoInterval = setInterval(() => goTo(current + 1), 5000);
  }
  function stopAuto() { clearInterval(autoInterval); }

  prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  // Touch support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  }, { passive: true });

  window.addEventListener('resize', () => {
    const newPer = window.innerWidth <= 900 ? 1 : 3;
    if (newPer !== perView) { perView = newPer; total = Math.ceil(slides.length / perView); goTo(0); }
  });

  goTo(0);
  startAuto();
})();

/* ---- GALLERY LIGHTBOX ---- */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const closeBtn = document.getElementById('lightboxClose');
  if (!lightbox) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const label = item.dataset.label || 'Gym Photo';
      lightboxContent.innerHTML = `
        <div style="
          width: min(80vw, 700px); height: min(70vh, 500px);
          background: linear-gradient(135deg, #1a1f2e, #111318);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 1rem; color: #BFC4C9;
        ">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <p style="font-size:0.8rem;letter-spacing:0.15em;text-transform:uppercase;opacity:0.5">${label}</p>
        </div>`;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

/* ---- BMI CALCULATOR ---- */
(function initBMI() {
  const tabs = document.querySelectorAll('.calc-tab');
  const heightInput = document.getElementById('calcHeight');
  const weightInput = document.getElementById('calcWeight');
  const calcBtn = document.getElementById('calcBtn');
  const result = document.getElementById('calcResult');
  const bmiVal = document.getElementById('bmiValue');
  const bmiLabel = document.getElementById('bmiLabel');
  const bmiRange = document.getElementById('bmiRange');

  let unit = 'metric'; // metric | imperial

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      unit = tab.dataset.unit;
      if (heightInput) heightInput.placeholder = unit === 'metric' ? 'e.g. 175' : 'e.g. 69';
      if (weightInput) weightInput.placeholder = unit === 'metric' ? 'e.g. 75' : 'e.g. 165';
      if (heightInput) {
        document.querySelector('label[for="calcHeight"]').textContent =
          unit === 'metric' ? 'Height (cm)' : 'Height (inches)';
      }
      if (weightInput) {
        document.querySelector('label[for="calcWeight"]').textContent =
          unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)';
      }
      result.classList.remove('show');
    });
  });

  calcBtn?.addEventListener('click', () => {
    const h = parseFloat(heightInput.value);
    const w = parseFloat(weightInput.value);
    if (!h || !w || h <= 0 || w <= 0) {
      shakeElement(calcBtn);
      return;
    }

    let bmi;
    if (unit === 'metric') {
      bmi = w / Math.pow(h / 100, 2);
    } else {
      bmi = (703 * w) / Math.pow(h, 2);
    }

    bmi = Math.round(bmi * 10) / 10;

    let label, color, range;
    if (bmi < 18.5)      { label = 'Underweight'; color = '#00C2FF'; range = 'BMI < 18.5'; }
    else if (bmi < 25)   { label = 'Normal Weight'; color = '#8DFF00'; range = '18.5 – 24.9'; }
    else if (bmi < 30)   { label = 'Overweight'; color = '#FFB400'; range = '25.0 – 29.9'; }
    else                  { label = 'Obese'; color = '#FF4D4D'; range = 'BMI ≥ 30'; }

    bmiVal.textContent = bmi;
    bmiVal.style.color = color;
    bmiLabel.textContent = label;
    bmiLabel.style.color = color;
    bmiRange.textContent = `Healthy range: 18.5 – 24.9  |  Your range: ${range}`;
    result.classList.add('show');
  });

  function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => el.style.animation = '', 400);
  }
})();

/* ---- CONTACT FORM ---- */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = 'Start Free Trial';
      btn.disabled = false;
      form.reset();
      showToast();
    }, 1400);
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
  }
})();

/* ---- PARALLAX ---- */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroBg = document.querySelector('.hero-bg');
  const heroGrid = document.querySelector('.hero-grid');
  if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.3}px)`;
  if (heroGrid) heroGrid.style.transform = `translateY(${scrollY * 0.15}px)`;
}, { passive: true });

/* ---- PROGRAM CARD TILT ---- */
document.querySelectorAll('.program-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
    card.style.transition = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
  });
});

/* ---- CSS shake keyframe injection ---- */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-8px)}
    40%{transform:translateX(8px)}
    60%{transform:translateX(-5px)}
    80%{transform:translateX(5px)}
  }
`;
document.head.appendChild(shakeStyle);