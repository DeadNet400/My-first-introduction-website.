document.addEventListener('DOMContentLoaded', function () {

  const handleFontLoading = async () => {
    const preloader = document.getElementById('preloader');
 
    try {
      await document.fonts.ready;
    } catch (e) {
      console.error('Font loading failed or is not supported.', e);
    } finally {
      document.documentElement.classList.add('fonts-ready');
      
      if (preloader) preloader.classList.add('hidden');
    }
  };

  const createAnimatedTabs = async (config) => {
    const { container, buttonSelector, panelSelector, activePanelClass, getPanelId } = config;
    if (!container) return;

    container.addEventListener('click', async (e) => {
      const button = e.target.closest(buttonSelector);
      if (!button || button.classList.contains('active')) return;

      container.style.pointerEvents = 'none';

      const panelId = getPanelId(button.dataset);
      const panelToShow = document.getElementById(panelId);
      const panelToHide = container.querySelector(`${panelSelector}.${activePanelClass}`);

      if (!panelToShow) {
        container.style.pointerEvents = 'auto';
        return;
      }

      container.querySelector(`${buttonSelector}.active`)?.classList.remove('active');
      button.classList.add('active');

      if (panelToHide) {
        await panelToHide.animate({ opacity: [1, 0], transform: ['translateY(0)', 'translateY(-10px)'] }, { duration: 200, easing: 'ease-in' }).finished;
        panelToHide.classList.remove(activePanelClass);
      }

      panelToShow.classList.add(activePanelClass);
      await panelToShow.animate({ opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0)'] }, { duration: 250, easing: 'ease-out' }).finished;

      container.style.pointerEvents = 'auto';
    });
  };

  const initMainTabs = async () => {
    const header = document.querySelector('header');
    if (!header) return;

    document.body.addEventListener('click', async (e) => {
      const target = e.target.closest('button.tab, .home-btn, .brand-logo');
      if (!target) return;

      let targetId;

      if (target.matches('.brand-logo')) {
        e.preventDefault();
        targetId = 'home';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        targetId = target.dataset.target || target.dataset.goto;
      }

      if (!targetId) return;

      const panelToShow = document.getElementById(targetId);
      const panelToHide = document.querySelector('.panel.active');

      if (!panelToShow || panelToShow === panelToHide) return;

      header.style.pointerEvents = 'none';

      const activeTab = document.querySelector('button.tab.active');
      const newActiveTab = document.querySelector(`button.tab[data-target="${targetId}"]`);
      if (activeTab) activeTab.classList.remove('active');
      if (newActiveTab) newActiveTab.classList.add('active');

      if (panelToHide) {
        await panelToHide.animate({ opacity: [1, 0], transform: ['translateY(0)', 'translateY(-20px)'] }, { duration: 250, easing: 'ease-in' }).finished;
        panelToHide.classList.remove('active');
      }

      panelToShow.classList.add('active');
      await panelToShow.animate({ opacity: [0, 1], transform: ['translateY(20px)', 'translateY(0)'] }, { duration: 300, easing: 'ease-out' }).finished;

      document.body.classList.toggle('is-home', targetId === 'home');
      header.style.pointerEvents = 'auto';
    });
  };

  const initProfileSwitcher = () => {
    const profileSection = document.getElementById('about');
    createAnimatedTabs({
      container: profileSection,
      buttonSelector: '.profile-switch-btn',
      panelSelector: '.profile-switch-panel',
      activePanelClass: 'is-active',
      getPanelId: (dataset) => `profile-${dataset.profile}`
    });
  };

  const initBlogTabs = () => {
    const blogSection = document.getElementById('blog');
    createAnimatedTabs({
      container: blogSection,
      buttonSelector: '.blog-category-btn',
      panelSelector: '.blog-content-panel',
      activePanelClass: 'active',
      getPanelId: (dataset) => `blog-${dataset.category}`
    });
  };

  const initBlogExpand = () => {
    const blogContainer = document.getElementById('blog');
    if (!blogContainer) return;

    let currentExpandedCard = null; // To keep track of the currently expanded card

    // Helper function to collapse a card
    const collapseCard = (card) => {
      if (!card) return;
      card.classList.remove('is-expanded');
      const button = card.querySelector('.read-more-btn');
      if (button) {
        button.firstChild.textContent = 'Read more ';
      }
    };

    // Helper function to expand a card
    const expandCard = (card) => {
      if (!card) return;
      card.classList.add('is-expanded');
      const button = card.querySelector('.read-more-btn');
      if (button) {
        button.firstChild.textContent = 'Read less ';
      }
    };

    blogContainer.addEventListener('click', (e) => {
      const readMoreBtn = e.target.closest('.read-more-btn');
      if (!readMoreBtn) return;

      const postCard = readMoreBtn.closest('.card.post');
      if (!postCard) return;

      const isAlreadyExpanded = postCard.classList.contains('is-expanded');

      if (isAlreadyExpanded) {
        // If the clicked card is already open, just close it.
        collapseCard(postCard);
        currentExpandedCard = null;
      } else {
        // If another card is open, close it first.
        if (currentExpandedCard) {
          collapseCard(currentExpandedCard);
        }
        // Then, open the new card.
        expandCard(postCard);
        currentExpandedCard = postCard;
      }
    });
  };

  const initBackToTop = () => {
    const backToTopButton = document.getElementById('back-to-top');
    if (!backToTopButton) return;

    let isVisible = false;
    window.addEventListener('scroll', () => {
      const shouldBeVisible = window.scrollY > 300;
      if (shouldBeVisible !== isVisible) {
        backToTopButton.classList.toggle('show', shouldBeVisible);
        isVisible = shouldBeVisible;
      }
    }, { passive: true });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const initThemeSwitcher = () => {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;

    const currentTheme = localStorage.getItem('theme') || 'light';

    const applyTheme = (theme) => {
      document.body.classList.toggle('dark-mode', theme === 'dark');
      toggle.setAttribute('aria-pressed', theme === 'dark');
    };

    toggle.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });

    applyTheme(currentTheme);
  };

  const initParticles = () => {
    if (typeof particlesJS === 'undefined') {
      console.error('particles.js not loaded.');
      return;
    }
    particlesJS('particles-js', {
      "particles": {
        "number": {
          "value": 80,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#22d3ee"
        },
        "shape": {
          "type": "circle",
        },
        "opacity": {
          "value": 0.5,
          "random": true,
          "anim": {
            "enable": true,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 3,
          "random": true,
          "anim": {
            "enable": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#22d3ee",
          "opacity": 0.2,
          "width": 1
        },
        "move": {
          "enable": true,
          "speed": 2,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
        }
      },
      "interactivity": { "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } },
      "retina_detect": true
    });
  };

  const initCustomCursor = () => {
    // More robust check for touch devices. This prevents the custom cursor on most tablets and all phones.
    const isTouchDevice = () => {
      return ( 'ontouchstart' in window ) ||
             ( navigator.maxTouchPoints > 0 );
    }
    if (isTouchDevice()) return;

    const cursorDot = document.querySelector('.cursor-dot');
    const cursorCircle = document.querySelector('.cursor-circle');
    const interactiveElements = document.querySelectorAll('a, button, iframe');

    if (!cursorDot || !cursorCircle) return;

    let mouse = { x: -100, y: -100 }; 
    let pos = { x: 0, y: 0 }; 
    const speed = 0.1; 

    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    document.body.addEventListener('mouseenter', () => {
      // Show cursor only if the mouse is not over an iframe
      const isOverIframe = document.querySelector('iframe:hover');
      if (!isOverIframe) {
        cursorDot.style.opacity = '1';
        cursorCircle.style.opacity = '1';
      }
    });

    document.body.addEventListener('mouseleave', () => {
      // Don't hide if the mouse is entering an iframe, as the iframe's own listener will handle it.
      // This check is tricky, so we let the mouseenter on the iframe handle hiding.
      // The main purpose of this is to hide the cursor when leaving the browser window itself.
      cursorDot.style.opacity = '0';
      cursorCircle.style.opacity = '0';
    });

    const updatePosition = () => {
      cursorDot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;

      const dx = mouse.x - pos.x;
      const dy = mouse.y - pos.y;
      pos.x += dx * speed;
      pos.y += dy * speed;

      cursorCircle.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;

      requestAnimationFrame(updatePosition);
    };

    updatePosition();

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        if (el.tagName.toLowerCase() === 'iframe') {
          cursorDot.style.opacity = '0';
          cursorCircle.style.opacity = '0';
        } else {
          cursorCircle.classList.add('grow');
        }
      });
      el.addEventListener('mouseleave', () => {
        if (el.tagName.toLowerCase() === 'iframe') {
          cursorDot.style.opacity = '1';
          cursorCircle.style.opacity = '1';
        } else {
          cursorCircle.classList.remove('grow');
        }
      });
    });
  };

  const initScrollAnimations = () => {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    if (!animatedElements.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      animatedElements.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target); 
        }
      });
    }, { threshold: 0.1 }); 

    animatedElements.forEach(el => observer.observe(el));
  };

  const initLightbox = () => {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    let previouslyFocusedElement;
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = lightbox.querySelector('.lightbox-close');

    document.body.addEventListener('click', (e) => {
      const trigger = e.target.closest('.lightbox-trigger');
      if (trigger) {
        e.preventDefault();
        previouslyFocusedElement = document.activeElement;
        lightboxImg.src = trigger.href;
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
        closeBtn.focus();
      }
    });

    const closeLightbox = () => {
      lightbox.classList.remove('show');
      document.body.style.overflow = '';
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    };

    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('show')) closeLightbox();
    });
  };

  handleFontLoading();
  initParticles();
  initMainTabs();
  initProfileSwitcher();
  initBlogTabs();
  initBlogExpand();
  initBackToTop();
  initThemeSwitcher();
  initCustomCursor();
  initScrollAnimations();
  initLightbox();

  const lastUpdatedEl = document.getElementById('lastUpdated');
  if (lastUpdatedEl) {
    const d = new Date();
    const fmt = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    lastUpdatedEl.textContent = fmt;
  }

});
