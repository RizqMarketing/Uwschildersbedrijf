/* ============================================================
   Voss Atelier — main.js
   ============================================================ */

// --- NAV: scroll & mobile ---------------------------------
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const menu   = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

burger.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// --- SCROLL REVEAL ----------------------------------------
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger siblings in the same parent
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, idx * 80);
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => observer.observe(el));

// Gallery items: eigen smoother observer (scale + blur)
const galleryItems = document.querySelectorAll('.gallery__item');
galleryItems.forEach(el => observer.unobserve(el));

const galleryObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), Math.min(i * 95, 420));
      galleryObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.06, rootMargin: '0px 0px -10px 0px' });

galleryItems.forEach(el => galleryObserver.observe(el));

// Diensten cards: lift + scale reveal
const dienstCards = document.querySelectorAll('.dienst__card');
dienstCards.forEach(el => observer.unobserve(el));

const dienstObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 110);
      dienstObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

dienstCards.forEach(el => dienstObserver.observe(el));

// --- HERO: subtle parallax --------------------------------
const heroBg = document.querySelector('.hero__bg');
window.addEventListener('scroll', () => {
  if (window.scrollY < window.innerHeight) {
    heroBg.style.transform = `translateY(${window.scrollY * 0.28}px)`;
  }
}, { passive: true });

// --- GALLERY: image reveal on hover -----------------------
document.querySelectorAll('.gallery__item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.zIndex = '2';
  });
  item.addEventListener('mouseleave', () => {
    item.style.zIndex = '1';
  });
});

// --- FORM: simple submit feedback -------------------------
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Verstuurd ✓';
    btn.style.background = '#4A7C59';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = 'Verstuur aanvraag <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

// --- OFFERTE POPUP ----------------------------------------
(function () {
  const overlay  = document.getElementById('offerteOverlay');
  const closeBtn = document.getElementById('offerteClose');
  const fills    = overlay.querySelectorAll('.offerte-progress__fill');
  const pSteps   = overlay.querySelectorAll('.offerte-progress__step');
  let   currentStep = 1;

  function openOfferte() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeOfferte() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  function resetOfferte() {
    goToStep(1, false);
    overlay.querySelectorAll('.offerte-type-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('onext1').disabled = true;
    overlay.querySelectorAll('.offerte-field-group input, .offerte-field-group select, .offerte-field-group textarea')
      .forEach(el => { el.value = ''; });
  }

  // Open triggers
  document.querySelectorAll('.offerte-trigger').forEach(btn => {
    btn.addEventListener('click', e => { e.preventDefault(); resetOfferte(); openOfferte(); });
  });

  // Close
  closeBtn.addEventListener('click', closeOfferte);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeOfferte(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeOfferte(); });
  document.getElementById('oclose-success').addEventListener('click', closeOfferte);

  // Type card selection
  overlay.querySelectorAll('.offerte-type-card').forEach(card => {
    card.addEventListener('click', () => {
      overlay.querySelectorAll('.offerte-type-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('onext1').disabled = false;
    });
  });

  // Step navigation
  function goToStep(n, forward = true) {
    const current = overlay.querySelector('.offerte-step-content.active');
    if (current) current.classList.remove('active');

    const next = overlay.querySelector(`#ostep${n}`) || overlay.querySelector('#ostepSuccess');
    if (next) {
      next.classList.remove('back-anim');
      void next.offsetWidth; // reflow for re-trigger
      if (!forward) next.classList.add('back-anim');
      next.classList.add('active');
    }

    // Progress steps
    pSteps.forEach(s => {
      const sn = parseInt(s.dataset.s);
      s.classList.remove('active', 'done');
      if (sn === n) s.classList.add('active');
      if (sn < n)  s.classList.add('done');
    });
    // Progress fills
    fills[0].classList.toggle('filled', n >= 2);
    fills[1].classList.toggle('filled', n >= 3);

    currentStep = n;
  }

  document.getElementById('onext1').addEventListener('click', () => goToStep(2, true));
  document.getElementById('onext2').addEventListener('click', () => goToStep(3, true));
  document.getElementById('oback2').addEventListener('click', () => goToStep(1, false));
  document.getElementById('oback3').addEventListener('click', () => goToStep(2, false));
  document.getElementById('osubmit').addEventListener('click', () => {
    const current = overlay.querySelector('.offerte-step-content.active');
    if (current) current.classList.remove('active');
    const success = document.getElementById('ostepSuccess');
    success.classList.add('active', 'back-anim');
    void success.offsetWidth;
    success.classList.remove('back-anim');
    pSteps.forEach(s => s.classList.add('done'));
    fills.forEach(f => f.classList.add('filled'));
  });
})();

// --- NAV: active section highlighting --------------------
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks  = document.querySelectorAll('.nav__links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.style.fontWeight = link.getAttribute('href') === `#${id}` ? '600' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));
