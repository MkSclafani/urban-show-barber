/**
 * ================================================================
 * BARBER & CO. — MASTER TEMPLATE JAVASCRIPT
 * ================================================================
 * INDICE:
 * 01. Inizializzazione DOM
 * 02. Header: Sticky & scroll-state
 * 03. Navigazione: Hamburger mobile
 * 04. Navigazione: Chiudi menu su link click
 * 05. Navigazione: Active link su scroll (ScrollSpy)
 * 06. Animazioni: IntersectionObserver (scroll reveal)
 * 07. Animazioni: Hero entry animazione iniziale
 * 08. Scroll morbido & offset per sticky header
 * 09. Utility: Throttle per performance
 * ================================================================
 */

'use strict';

/* ================================================================
   01. INIZIALIZZAZIONE DOM
   Attendi che il DOM sia pronto prima di inizializzare tutto.
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initScrollAnimations();
  initScrollSpy();
  initHeroAnimation();
  initSmoothScroll();
});


/* ================================================================
   02. HEADER: STICKY & SCROLL-STATE
   Aggiunge la classe .is-scrolled all'header quando si scrolla
   oltre una certa soglia — attiva lo sfondo scuro/blur.
   ================================================================ */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const SCROLL_THRESHOLD = 80; // px prima di attivare lo stato scrolled

  const updateHeaderState = () => {
    const isScrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('is-scrolled', isScrolled);
  };

  // Esegui subito al caricamento (utile se la pagina è già scrollata)
  updateHeaderState();

  // Throttle per non martellare il browser durante lo scroll
  window.addEventListener('scroll', throttle(updateHeaderState, 100), { passive: true });
}


/* ================================================================
   03. NAVIGAZIONE: HAMBURGER MOBILE
   Toggle del menu mobile — gestisce aria-expanded e
   blocco dello scroll del body quando il menu è aperto.
   ================================================================ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const nav       = document.querySelector('.nav');
  if (!hamburger || !nav) return;

  const toggleMenu = (forceClose = false) => {
    const isOpen = !forceClose && hamburger.getAttribute('aria-expanded') === 'false';

    hamburger.setAttribute('aria-expanded', String(isOpen));
    nav.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  hamburger.addEventListener('click', () => toggleMenu());

  // Chiudi menu cliccando fuori (overlay)
  document.addEventListener('click', (e) => {
    if (
      nav.classList.contains('is-open') &&
      !nav.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(true);
    }
  });

  // Chiudi menu con tasto ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      toggleMenu(true);
      hamburger.focus();
    }
  });
}


/* ================================================================
   04. NAVIGAZIONE: CHIUDI MENU SU LINK CLICK
   Quando si clicca un link di navigazione su mobile,
   chiudi il menu e rimuovi il blocco scroll.
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const navLinks  = document.querySelectorAll('.nav__link');
  const hamburger = document.getElementById('hamburger');
  const nav       = document.querySelector('.nav');

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (nav && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        hamburger?.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });
});


/* ================================================================
   05. NAVIGAZIONE: SCROLLSPY
   Evidenzia il link di navigazione corrispondente alla sezione
   attualmente visibile nello schermo.
   ================================================================ */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const HEADER_OFFSET = 100; // px — tiene conto dell'altezza dell'header fisso

  const getActiveSection = () => {
    const scrollY = window.scrollY + HEADER_OFFSET;

    let activeId = null;
    sections.forEach((section) => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;

      if (scrollY >= top && scrollY < top + height) {
        activeId = section.getAttribute('id');
      }
    });

    return activeId;
  };

  const updateActiveLink = () => {
    const activeId = getActiveSection();

    navLinks.forEach((link) => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('is-active', href === activeId);
    });
  };

  window.addEventListener('scroll', throttle(updateActiveLink, 150), { passive: true });
  updateActiveLink(); // Esegui subito al caricamento
}


/* ================================================================
   06. ANIMAZIONI: INTERSECTION OBSERVER
   Rivela gli elementi con effetti di fade/slide quando entrano
   nel viewport durante lo scroll. Usa IntersectionObserver
   per performance ottimali (nessun listener scroll).
   ================================================================ */
function initScrollAnimations() {
  // Se il browser non supporta IntersectionObserver, mostra tutto subito
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-fade-up, .animate-slide-right, .animate-slide-left')
      .forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const OBSERVER_OPTIONS = {
    root:       null,        // Viewport del browser
    rootMargin: '0px 0px -80px 0px', // Attiva l'animazione 80px prima del fondo
    threshold:  0.1,         // 10% dell'elemento deve essere visibile
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Una volta visibile, smetti di osservarlo (ottimizzazione)
        observer.unobserve(entry.target);
      }
    });
  }, OBSERVER_OPTIONS);

  // Osserva tutti gli elementi animabili
  const animatedElements = document.querySelectorAll(
    '.animate-fade-up, .animate-slide-right, .animate-slide-left'
  );

  animatedElements.forEach((el) => observer.observe(el));
}


/* ================================================================
   07. ANIMAZIONI: HERO ENTRY
   Attiva le animazioni dell'hero con un piccolo delay
   sequenziale per un effetto di "ingresso" elegante.
   ================================================================ */
function initHeroAnimation() {
  const heroAnimElements = document.querySelectorAll('.hero .animate-fade-up');
  if (!heroAnimElements.length) return;

  // Override: l'hero è visibile subito, non aspetta lo scroll
  heroAnimElements.forEach((el, index) => {
    // Delay progressivo per ogni elemento hero (badge → titolo → sottotitolo → CTA → stats)
    setTimeout(() => {
      el.classList.add('is-visible');
    }, 200 + index * 150);
  });
}


/* ================================================================
   08. SCROLL MORBIDO & OFFSET PER HEADER FISSO
   Gestisce i link ancorali interni per compensare
   l'altezza dell'header fisso durante lo scroll.
   ================================================================ */
function initSmoothScroll() {
  const HEADER_HEIGHT = () => {
    const header = document.getElementById('header');
    return header ? header.offsetHeight : 70;
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href    = anchor.getAttribute('href');
      const target  = href === '#' ? document.body : document.querySelector(href);

      if (!target) return;

      e.preventDefault();

      const targetOffset = target.getBoundingClientRect().top + window.scrollY;
      const scrollTo     = targetOffset - HEADER_HEIGHT() - 16; // 16px extra padding

      window.scrollTo({
        top:      Math.max(0, scrollTo),
        behavior: 'smooth',
      });
    });
  });
}


/* ================================================================
   09. UTILITY: THROTTLE
   Limita la frequenza di esecuzione di una funzione.
   Usata per gli event listener scroll/resize per prestazioni ottimali.

   @param {Function} fn       - Funzione da eseguire
   @param {number}   wait     - Millisecondi minimi tra esecuzioni
   @returns {Function}
   ================================================================ */
function throttle(fn, wait) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= wait) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}


/* ================================================================
   PERSONALIZZAZIONE RAPIDA
   ── Come adattare questo template a un nuovo cliente ────────

   1. NOME SALONE
      Cerca "Barber & Co." in index.html e sostituisci con il nome reale.

   2. COLORI BRAND
      In style.css, modifica le variabili in ":root":
        --color-accent      → colore principale del brand
        --color-primary     → solitamente scuro/nero

   3. FONT
      In index.html, sostituisci il link Google Fonts.
      In style.css, aggiorna --font-heading e --font-body.

   4. IMMAGINI
      Sostituisci ogni div.img-placeholder con:
        <img src="assets/nomefile.jpg" alt="Descrizione" />
      Oppure imposta background-image su .hero__bg.

   5. CONTATTI
      Cerca "XXXXXXXXXX" in index.html → numero WhatsApp reale.
      Aggiorna indirizzo, telefono, email e orari.

   6. LINK GOOGLE MAPS
      Nella sezione contatti, sostituisci il .map-placeholder
      con l'iframe embed di Google Maps del salone.

   7. SOCIAL
      Aggiorna i link href di Instagram, Facebook, TikTok.
      Aggiungi o rimuovi piattaforme a seconda del cliente.

   8. SERVIZI & PREZZI
      Modifica testo e prezzi nelle .servizio-card in index.html.
      Aggiungi/rimuovi cards secondo necessità.

   9. RECENSIONI
      Sostituisci le blockquote con le recensioni reali del salone
      (preferibilmente da Google Maps o Treatwell).

   10. SEO
       Aggiorna <title>, <meta name="description"> e <meta og:*>
       con i dati reali del cliente.
   ================================================================ */
