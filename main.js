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

// --- WHATSAPP WIDGET --------------------------------------
(function () {
  const widget = document.createElement('div');
  widget.className = 'wa-widget';
  widget.innerHTML = `
    <a
      class="wa-btn"
      href="https://wa.me/31633050039"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="App ons via WhatsApp"
    >
      <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.164 0 0 7.163 0 16c0 2.825.738 5.476 2.027 7.775L0 32l8.469-2.004A15.94 15.94 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.28 13.28 0 01-6.771-1.851l-.486-.29-5.027 1.189 1.215-4.894-.317-.5A13.26 13.26 0 012.667 16C2.667 8.637 8.637 2.667 16 2.667S29.333 8.637 29.333 16 23.363 29.333 16 29.333zm7.26-9.907c-.398-.199-2.353-1.161-2.718-1.293-.365-.133-.63-.199-.896.199-.266.398-1.03 1.293-1.263 1.558-.232.266-.465.299-.863.1-.398-.2-1.681-.62-3.2-1.977-1.183-1.056-1.981-2.36-2.213-2.757-.232-.398-.025-.613.174-.811.179-.178.398-.465.597-.698.199-.232.266-.398.398-.664.133-.265.066-.498-.033-.697-.1-.199-.896-2.16-1.228-2.957-.323-.776-.651-.671-.896-.683l-.764-.013c-.266 0-.697.1-1.063.498-.365.398-1.394 1.362-1.394 3.322s1.428 3.852 1.627 4.118c.199.265 2.81 4.29 6.81 6.018.952.411 1.695.656 2.274.84.955.304 1.824.261 2.511.158.766-.114 2.353-.962 2.686-1.891.332-.929.332-1.725.232-1.891-.1-.166-.365-.265-.763-.465z"/>
      </svg>
    </a>
    <span class="wa-tooltip">App ons direct</span>
  `;
  document.body.appendChild(widget);
})();
