/* ==========================================================
   ANVILAR — INTERAÇÕES E ANIMAÇÕES DE SCROLL
========================================================== */
document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------
     1) CABEÇALHO: muda de estilo ao rolar + menu mobile
  ------------------------------------------------------ */
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');

  const onScrollHeader = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  onScrollHeader();

  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ------------------------------------------------------
     2) SCROLLSPY: destaca o link da seção visível
  ------------------------------------------------------ */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(section => spyObserver.observe(section));

  /* ------------------------------------------------------
     3) REVEAL ON SCROLL: elementos com [data-reveal]
  ------------------------------------------------------ */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ------------------------------------------------------
     4) HERO: título "desenha" e blueprint técnico ao carregar
  ------------------------------------------------------ */
  const heroTitle = document.querySelector('.hero-title');
  const heroBlueprint = document.getElementById('heroBlueprint');

  window.requestAnimationFrame(() => {
    setTimeout(() => {
      heroTitle?.classList.add('is-drawn');
      heroBlueprint?.classList.add('is-drawn');
    }, 150);
  });

  /* ------------------------------------------------------
     5) PARALLAX SUAVE NO HERO (grade + blueprint)
  ------------------------------------------------------ */
  const heroGrid = document.getElementById('heroGrid');
  const heroSection = document.getElementById('hero') || document.querySelector('.hero');
  let parallaxTicking = false;

  if (!prefersReducedMotion && heroGrid) {
    const updateParallax = () => {
      const scrollY = window.scrollY;
      const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;
      if (scrollY < heroHeight) {
        heroGrid.style.transform = `translateY(${scrollY * 0.12}px)`;
        if (heroBlueprint) {
          heroBlueprint.style.transform = `translateY(calc(-50% + ${scrollY * 0.08}px))`;
        }
      }
      parallaxTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------
     6) BARRA DE PROGRESSO DE LEITURA
  ------------------------------------------------------ */
  const scrollProgress = document.getElementById('scrollProgress');
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + '%';
  };

  /* ------------------------------------------------------
     7) BOTÃO VOLTAR AO TOPO — combinado no mesmo listener de scroll
  ------------------------------------------------------ */
  const backToTop = document.getElementById('backToTop');
  let scrollTicking = false;

  const onScrollCombined = () => {
    onScrollHeader();
    updateProgress();
    backToTop.classList.toggle('is-visible', window.scrollY > 700);
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScrollCombined);
      scrollTicking = true;
    }
  }, { passive: true });

  onScrollCombined();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------
     8) CONTADORES NUMÉRICOS (stats)
  ------------------------------------------------------ */
  const counters = document.querySelectorAll('.stat-number[data-count]');

  const animateCounter = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const isYear = el.getAttribute('data-format') === 'year';
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = isYear ? value : value.toLocaleString('pt-BR');
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isYear ? target : target.toLocaleString('pt-BR');
      }
    };
    requestAnimationFrame(step);
  };

  if (prefersReducedMotion) {
    counters.forEach(el => { el.textContent = el.getAttribute('data-count'); });
  } else {
    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(el => counterObserver.observe(el));
  }

  /* ------------------------------------------------------
     9) EMPRESA — STORYTELLING COM SCROLL (STICKY)
     Alterna o painel fixo (ano + traço de progresso) conforme
     o passo da linha do tempo que está em foco.
  ------------------------------------------------------ */
  const empresaSteps = document.querySelectorAll('#empresaSteps .timeline-item');
  const empresaStickyYear = document.getElementById('empresaStickyYear');
  const empresaStickyTag = document.getElementById('empresaStickyTag');
  const empresaProgressLine = document.getElementById('empresaProgressLine');

  const empresaData = {
    '1': { year: '2008', tag: 'Início na construção civil', offset: 320 },
    '2': { year: '2019', tag: 'Produção própria de alto padrão', offset: 160 },
    '3': { year: 'Hoje', tag: 'Tecnologia e capacitação contínua', offset: 0 }
  };

  if (empresaSteps.length && empresaStickyYear) {
    const empresaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stepNum = entry.target.getAttribute('data-step');
          const data = empresaData[stepNum];
          if (data) {
            empresaStickyYear.textContent = data.year;
            empresaStickyTag.textContent = data.tag;
            if (empresaProgressLine && !prefersReducedMotion) {
              empresaProgressLine.style.strokeDashoffset = data.offset;
            }
          }
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    empresaSteps.forEach(step => empresaObserver.observe(step));
  }

  /* ------------------------------------------------------
     10) PRODUTOS — VITRINE COM SCROLL (STICKY)
     Alterna o painel visual fixo e o "dot" ativo conforme o
     card de produto que está em foco na coluna de texto.
  ------------------------------------------------------ */
  const produtoSteps = document.querySelectorAll('#produtosSteps .produto-step');
  const produtoPanels = document.querySelectorAll('#produtosSticky .produto-panel');
  const produtoDots = document.querySelectorAll('#produtosDots .p-dot');

  if (produtoSteps.length && produtoPanels.length) {
    const setActiveProduct = (name) => {
      produtoPanels.forEach(p => p.classList.toggle('is-active', p.getAttribute('data-panel') === name));
      produtoDots.forEach(d => d.classList.toggle('is-active', d.getAttribute('data-dot') === name));
    };

    const produtoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveProduct(entry.target.getAttribute('data-step-name'));
        }
      });
    }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

    produtoSteps.forEach(step => produtoObserver.observe(step));
  }

  /* ------------------------------------------------------
     11) PROCESSO — linha de progresso ligada ao scroll da seção
  ------------------------------------------------------ */
  const processoSection = document.querySelector('.processo-scrolly');
  const processLineFill = document.getElementById('processLineFill');
  const processItems = document.querySelectorAll('[data-process-step]');
  let processTicking = false;

  if (processoSection && processLineFill) {
    const updateProcessLine = () => {
      const rect = processoSection.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const total = rect.height - viewportH * 0.6;
      const traveled = viewportH * 0.75 - rect.top;
      const pct = total > 0 ? Math.min(Math.max((traveled / total) * 100, 0), 100) : 0;
      processLineFill.style.width = pct + '%';

      const activeIndex = Math.floor((pct / 100) * processItems.length);
      processItems.forEach((item, i) => {
        item.classList.toggle('is-active', i <= activeIndex && pct > 2);
      });
      processTicking = false;
    };

    window.addEventListener('scroll', () => {
      if (!processTicking) {
        window.requestAnimationFrame(updateProcessLine);
        processTicking = true;
      }
    }, { passive: true });

    updateProcessLine();
  }

  /* ------------------------------------------------------
     12) DIFERENCIAIS — ícones desenham ao entrar na tela
     (a classe is-visible já é adicionada pelo observer de
     reveal genérico; o CSS cuida do stroke-dashoffset)
  ------------------------------------------------------ */

  /* ------------------------------------------------------
     13) ABAS — "Para quem trabalhamos"
  ------------------------------------------------------ */
  const tabs = document.querySelectorAll('.tab');
  const tabpanels = document.querySelectorAll('.tabpanel');

  const activateTab = (tab) => {
    tabs.forEach(t => {
      const selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.setAttribute('tabindex', selected ? '0' : '-1');
      t.classList.toggle('is-active', selected);
    });
    tabpanels.forEach(panel => {
      const match = panel.id === tab.getAttribute('aria-controls');
      panel.hidden = !match;
      panel.classList.toggle('is-active', match);
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      let newIndex = null;
      if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
      if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
      if (newIndex !== null) {
        e.preventDefault();
        tabs[newIndex].focus();
        activateTab(tabs[newIndex]);
      }
    });
  });

  /* ------------------------------------------------------
     14) ACORDEÃO — FAQ
  ------------------------------------------------------ */
  const accordionTriggers = document.querySelectorAll('.accordion-trigger');

  accordionTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));

      trigger.setAttribute('aria-expanded', String(!expanded));
      if (panel) panel.hidden = expanded;
    });
  });

  /* ------------------------------------------------------
     15) BOTÃO FLUTUANTE DE CONTATO (FAB)
  ------------------------------------------------------ */
  const fabToggle = document.getElementById('fabToggle');
  const fabMenu = document.getElementById('fabMenu');

  fabToggle?.addEventListener('click', () => {
    const isOpen = fabMenu.classList.toggle('is-open');
    fabToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (e) => {
    if (fabMenu?.classList.contains('is-open') && !e.target.closest('.fab-wrap')) {
      fabMenu.classList.remove('is-open');
      fabToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ------------------------------------------------------
     16) FORMULÁRIO DE CONTATO — validação acessível
     Observação: este formulário é apenas de front-end.
     Para receber os pedidos por e-mail/WhatsApp de verdade,
     conecte-o a um serviço como Formspree, EmailJS ou um
     backend próprio, usando os mesmos campos já existentes.
  ------------------------------------------------------ */
  const contactForm = document.getElementById('contactForm');
  const formNote = document.getElementById('formNote');

  const setFieldError = (input, errorEl, message) => {
    const row = input.closest('.form-row');
    if (message) {
      row.classList.add('has-error');
      input.setAttribute('aria-invalid', 'true');
      errorEl.textContent = message;
    } else {
      row.classList.remove('has-error');
      input.removeAttribute('aria-invalid');
      errorEl.textContent = '';
    }
  };

  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('fname');
    const phoneInput = document.getElementById('fphone');
    const nameError = document.getElementById('fname-error');
    const phoneError = document.getElementById('fphone-error');

    let hasError = false;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, nameError, 'Informe seu nome.');
      hasError = true;
    } else {
      setFieldError(nameInput, nameError, '');
    }

    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setFieldError(phoneInput, phoneError, 'Informe um telefone válido com DDD.');
      hasError = true;
    } else {
      setFieldError(phoneInput, phoneError, '');
    }

    if (hasError) {
      formNote.textContent = 'Verifique os campos destacados antes de enviar.';
      formNote.classList.add('is-error');
      return;
    }

    formNote.classList.remove('is-error');
    formNote.textContent = `Obrigado, ${nameInput.value.trim()}! Recebemos seus dados e entraremos em contato pelo telefone informado.`;
    contactForm.reset();
  });

  /* ------------------------------------------------------
     17) ANO ATUAL NO RODAPÉ
  ------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
