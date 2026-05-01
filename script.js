'use strict';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCursor();
  initHeroAnimation();
  initScrollReveals();
  initPriceCounters();
  initFAQ();
  fetchDiscordCount();
  initSuccessModal();
});

// ─── Nav: transparent → frosted on scroll ────────────────────
function initNav() {
  const nav  = document.getElementById('nav');
  const hero = document.getElementById('hero');
  if (!nav || !hero) return;

  const obs = new IntersectionObserver(
    ([e]) => nav.classList.toggle('scrolled', !e.isIntersecting),
    { threshold: 0 }
  );
  obs.observe(hero);
}

// ─── Custom cursor ────────────────────────────────────────────
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let mx = 0, my = 0, raf = null;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    if (!raf) raf = requestAnimationFrame(moveCursor);
  });

  function moveCursor() {
    cursor.style.transform = `translate(calc(${mx}px - 50%), calc(${my}px - 50%))`;
    raf = null;
  }

  document.querySelectorAll('a, button, [role="button"], label').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expanded'));
  });
}

// ─── Hero: stagger character reveal ──────────────────────────
function initHeroAnimation() {
  if (reducedMotion) return;

  const line1 = document.querySelector('.hero-line-1');
  const line2 = document.querySelector('.hero-line-2');
  if (!line1 || !line2) return;

  function wrapChars(el, startDelay) {
    const text  = el.textContent.trim();
    const words = text.split(' ');
    el.setAttribute('aria-hidden', 'true');

    let ci = 0; // global char index, increments for each char AND each space
    const html = words.map((word, wi) => {
      const charSpans = [...word].map(ch => {
        const delay = startDelay + ci * 30;
        ci++;
        const safe = ch.replace(/[&<>"']/g,
          c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
        return `<span class="hero-char" style="animation-delay:${delay}ms">${safe}</span>`;
      }).join('');

      if (wi < words.length - 1) ci++; // reserve timing slot for the space

      // Word wrapped in inline-block keeps characters together at line breaks;
      // the text space after each word (except the last) is a real breakpoint.
      return `<span style="display:inline-block">${charSpans}</span>${wi < words.length - 1 ? ' ' : ''}`;
    }).join('');

    el.innerHTML = html;
    return text.length;
  }

  const len1 = wrapChars(line1, 120);
  wrapChars(line2, 120 + len1 * 30 + 200);
}

// ─── Scroll reveals with optional stagger ────────────────────
function initScrollReveals() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  if (reducedMotion) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  // Apply stagger delay to siblings inside [data-stagger] containers
  document.querySelectorAll('[data-stagger]').forEach(wrap => {
    wrap.querySelectorAll('[data-reveal]').forEach((el, i) => {
      el.style.transitionDelay = `${i * 75}ms`;
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -24px 0px' });

  els.forEach(el => obs.observe(el));
}

// ─── Price counter animation ──────────────────────────────────
function initPriceCounters() {
  const els = document.querySelectorAll('.price-value[data-price]');
  if (!els.length || reducedMotion) return;

  // Reset to 0 before first paint completes (script is at end of body)
  els.forEach(el => { el.textContent = '0'; });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        countUp(e.target, parseInt(e.target.dataset.price, 10));
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  els.forEach(el => obs.observe(el));
}

function countUp(el, target) {
  const duration = 600;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(eased * target);
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}

// ─── FAQ accordion ────────────────────────────────────────────
function initFAQ() {
  document.querySelectorAll('.faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item    = btn.closest('.faq-item');
      const content = item.querySelector('.faq-content');
      const wasOpen = item.classList.contains('open');

      // Close all open items
      document.querySelectorAll('.faq-item.open').forEach(open => {
        open.classList.remove('open');
        open.querySelector('.faq-content').style.maxHeight = '0';
        open.querySelector('.faq-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// ─── Discord online count ─────────────────────────────────────
async function fetchDiscordCount() {
  const el = document.getElementById('discord-count');
  if (!el) return;

  try {
    const res = await fetch(
      'https://discord.com/api/v9/invites/83kE7ddq7F?with_counts=true'
    );
    if (!res.ok) throw new Error();
    const data  = await res.json();
    const count = data.approximate_presence_count;
    if (typeof count === 'number' && count > 0) {
      el.querySelector('.count').textContent = count.toLocaleString();
      el.style.display = 'flex';
    }
  } catch {
    // Fail silently — element stays hidden
  }
}

// ─── Success modal (?success=true from Stripe redirect) ───────
function initSuccessModal() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('success') !== 'true') return;

  // Clean the URL immediately so a refresh doesn't re-trigger
  history.replaceState(null, '', window.location.pathname);

  const overlay = document.createElement('div');
  overlay.id = 'success-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'success-title');

  overlay.innerHTML = `
    <div id="success-modal">
      <div id="success-check" aria-hidden="true">✓</div>
      <h2 id="success-title">Payment received.</h2>
      <p class="success-sub">Your access will be activated in your Discord within 1 hour.<br>Follow these two steps now:</p>

      <ol id="success-steps">
        <li>
          <span class="step-num">1</span>
          <div>
            <strong>Join the Mech Discord</strong>
            <a href="https://discord.gg/83kE7ddq7F"
               target="_blank" rel="noopener noreferrer"
               class="success-discord-btn">Join Discord →</a>
          </div>
        </li>
        <li>
          <span class="step-num">2</span>
          <div>
            <strong>Post your username in <code>#order-confirmation</code></strong>
            <span class="success-step-detail">Your role will be activated within 1 hour.</span>
          </div>
        </li>
      </ol>

      <p class="success-contact">Questions? Email <a href="mailto:loverlywd@gmail.com">loverlywd@gmail.com</a></p>
      <button id="success-close" aria-label="Close this dialog">Close</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Focus the modal for accessibility
  const modal = overlay.querySelector('#success-modal');
  modal.setAttribute('tabindex', '-1');
  modal.focus();

  function close() {
    if (reducedMotion) {
      overlay.remove();
    } else {
      overlay.style.opacity = '0';
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    }
    document.body.style.overflow = '';
  }

  overlay.querySelector('#success-close').addEventListener('click', close);

  // Close on backdrop click (not on modal itself)
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  // Close on Escape
  document.addEventListener('keydown', function onKey(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); }
  });
}
