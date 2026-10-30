(() => {
  'use strict';

  const root = document.documentElement;

  /* ---------- Headline words: match the design width ----------
     Each .t word has --w (target width in design px). The font size already
     matches the cap height (CSS); here we squeeze/stretch it horizontally. */
  const words = [...document.querySelectorAll('.t')];
  const desktop = window.matchMedia('(min-width: 1024px)'); // matches the CSS breakpoint

  function fitWords() {
    const unit = parseFloat(getComputedStyle(root).fontSize) / 10; // px per design px
    const prop = desktop.matches ? '--dw' : '--w';
    words.forEach((el) => {
      const target = parseFloat(getComputedStyle(el).getPropertyValue(prop));
      if (!target) return;
      el.style.transform = 'none';
      const natural = el.getBoundingClientRect().width;
      if (natural) el.style.transform = `scaleX(${(target * unit) / natural})`;
    });
  }

  let raf = 0;
  fitWords();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWords);
  window.addEventListener('load', fitWords);
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(fitWords);
  });

  /* ---------- Menu ---------- */
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('menu');

  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
    if (open) {
      menu.hidden = false;
      void menu.offsetHeight; // start the fade from opacity 0
      menu.classList.add('is-open');
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => {
        if (!menu.classList.contains('is-open')) menu.hidden = true;
      }, 300);
    }
  }

  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      burger.focus();
    }
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll('.js-year').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Contact form ---------- */
  const form = document.querySelector('.form');
  if (!form) return;

  const status = form.querySelector('.form__status');
  const { name, phone } = form.elements;

  phone.addEventListener('input', () => {
    const clean = phone.value.replace(/[^\d+()\-\s]/g, '');
    if (clean !== phone.value) phone.value = clean;
  });

  function check(input, ok) {
    input.closest('.field').classList.toggle('field--err', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  [name, phone].forEach((input) => {
    input.addEventListener('input', () => check(input, true));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const okName = check(name, name.value.trim().length >= 2);
    const okPhone = check(phone, phone.value.replace(/\D/g, '').length >= 10);

    if (!okName || !okPhone) {
      status.textContent = !okName ? 'Please enter your name' : 'Please check your phone number';
      (okName ? phone : name).focus();
      return;
    }

    // TODO: connect submission (e-mail, CRM, messenger). The request is not sent anywhere yet.
    const who = name.value.trim();
    form.reset();
    status.textContent = `Thank you, ${who}! We will get back to you soon.`;
  });
})();
