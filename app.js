/* SoloOS prototype — interactions */
(() => {
  'use strict';

  /* ── nav: scrolled state + mobile menu ── */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  burger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') navLinks.classList.remove('open');
  });

  /* ── reveal on scroll ── */
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ── footer year ── */
  document.getElementById('yr').textContent = new Date().getFullYear();

  /* ══════════ HERO LIVE FEED ══════════ */
  const feed = document.getElementById('heroFeed');
  const FEED_EVENTS = [
    { ico: '🎯', tag: 'blue', txt: '<b>ceo</b> published morning briefing — delegated 4 tasks', when: '08:00' },
    { ico: '💼', tag: 'blue', txt: '<b>sales</b> drafted follow-up to Maria Chen <em>(BrightFry)</em>', when: '08:02' },
    { ico: '💼', tag: 'yellow', txt: 'follow-up email queued for <b>your approval</b>', when: '08:02' },
    { ico: '🎧', tag: 'blue', txt: '<b>support</b> triaged 2 open tickets — replies drafted', when: '08:15' },
    { ico: '💰', tag: 'blue', txt: '<b>finance</b> payment reminder for INV-1041 → Wolf Brew', when: '08:31' },
    { ico: '📣', tag: 'blue', txt: '<b>marketing</b> drafted LinkedIn post from case study', when: '09:00' },
    { ico: '⚙️', tag: 'blue', txt: '<b>ops</b> closed 3 done tasks, rewrote 2 vague ones', when: '07:30' },
    { ico: '📥', tag: 'yellow', txt: '3 actions waiting in <b>approval inbox</b>', when: 'now' },
    { ico: '✅', tag: 'green', txt: 'you approved the Dana Reyes reply — <b>sent</b>', when: 'now' },
    { ico: '💼', tag: 'green', txt: '<b>sales</b> advanced Priya Nair to negotiation', when: 'now' },
    { ico: '🎯', tag: 'green', txt: '<b>ceo</b> flagged: invoice aging &gt; 14 days', when: 'now' },
  ];
  let feedIdx = 0;
  const MAX_FEED = 5;
  function pushFeed() {
    const ev = FEED_EVENTS[feedIdx % FEED_EVENTS.length];
    feedIdx++;
    const li = document.createElement('li');
    li.innerHTML = `<span class="f-ico">${ev.ico}</span><span class="f-txt">${ev.txt}</span><span class="f-when">${ev.when}</span>`;
    feed.prepend(li);
    while (feed.children.length > MAX_FEED) feed.lastElementChild.remove();
  }
  for (let i = 0; i < MAX_FEED; i++) pushFeed();
  setInterval(pushFeed, 2600);

  /* ══════════ PRODUCT DEMO TABS ══════════ */
  const tabs = document.querySelectorAll('.app-tab');
  const panels = { cc: document.getElementById('panel-cc'), runs: document.getElementById('panel-runs'), appr: document.getElementById('panel-appr') };
  const appTitle = document.getElementById('appTitle');
  const TITLES = { cc: 'Command Center', runs: 'Runs', appr: 'Approval Inbox' };
  const URLS = { cc: 'app.soloos.dev/command-center', runs: 'app.soloos.dev/runs', appr: 'app.soloos.dev/inbox' };
  const urlPill = document.querySelector('.url');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const key = tab.dataset.tab;
      Object.entries(panels).forEach(([k, el]) => el.classList.toggle('active', k === key));
      appTitle.textContent = TITLES[key];
      urlPill.textContent = URLS[key];
      if (key === 'runs') resumeLog();
      if (key === 'cc') restartTypewriter();
    });
  });

  /* ══════════ COUNT-UP METRICS ══════════ */
  const counted = new Set();
  const countIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      if (counted.has(el)) continue;
      counted.add(el);
      const target = Number(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const t0 = performance.now();
      const DUR = 1100;
      const tick = (t) => {
        const p = Math.min((t - t0) / DUR, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const v = Math.round(target * eased);
        el.textContent = prefix + v.toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    }
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

  /* ══════════ TYPEWRITER BRIEFING ══════════ */
  const twEl = document.getElementById('typewriter');
  const BRIEFING = 'Good morning. Pipeline sits at $87,000 across 3 active leads — Priya is one reply from signing. Two support tickets are open (Dana flagged low panel output — high priority). INV-1041 is outstanding at $8,200. Today: follow up with BrightFry, draft Dana’s answer, and ship the Wolf Brew case study.';
  let twTimer = null;
  function restartTypewriter() {
    clearInterval(twTimer);
    twEl.textContent = '';
    let i = 0;
    twTimer = setInterval(() => {
      twEl.textContent = BRIEFING.slice(0, i);
      i++;
      if (i > BRIEFING.length) {
        clearInterval(twTimer);
        setTimeout(() => { if (panels.cc.classList.contains('active')) restartTypewriter(); }, 7000);
      }
    }, 14);
  }

  /* ══════════ RUN LOG STREAM ══════════ */
  const runLog = document.getElementById('runLog');
  const LOG_SCRIPT = [
    { t: 'step', p: '◈', s: 'Reading company brief…' },
    { t: 'tool', p: '⚙', s: 'ticket_list({}) → 2 open tickets' },
    { t: 'tool', p: '⚙', s: 'ticket_reply({id:"tkt_9f", body:"Hi Dana…"}) → approval created' },
    { t: 'text', p: '›', s: 'Drafted reply to Dana Reyes — queued for founder approval.' },
    { t: 'tool', p: '⚙', s: 'ticket_reply({id:"tkt_2a", body:"Hi Sam…"}) → approval created' },
    { t: 'text', p: '›', s: 'Drafted reply to Sam Ortiz re: warranty transfer.' },
    { t: 'system', p: '·', s: 'run completed · 2 approvals filed · 3,412 tokens' },
    { t: 'step', p: '◈', s: 'Support agent idle — next run in 30m' },
  ];
  let logIdx = 0;
  let logTimer = null;
  function addLogLine() {
    const ev = LOG_SCRIPT[logIdx % LOG_SCRIPT.length];
    logIdx++;
    const div = document.createElement('div');
    div.className = `log-line ${ev.t}`;
    div.innerHTML = `<span class="pfx">${ev.p}</span>${ev.s}`;
    runLog.appendChild(div);
    while (runLog.children.length > 14) runLog.firstElementChild.remove();
    runLog.scrollTop = runLog.scrollHeight;
    logTimer = setTimeout(addLogLine, ev.t === 'system' ? 2400 : 1300);
  }
  function resumeLog() {
    if (logTimer) return;
    addLogLine();
  }
  // prefill a few lines so the panel never looks empty
  for (let i = 0; i < 5; i++) {
    const ev = LOG_SCRIPT[i];
    const div = document.createElement('div');
    div.className = `log-line ${ev.t}`;
    div.innerHTML = `<span class="pfx">${ev.p}</span>${ev.s}`;
    runLog.appendChild(div);
    logIdx = i + 1;
  }

  /* ══════════ APPROVAL INTERACTION ══════════ */
  const apprCard = document.getElementById('apprCard');
  const apprApprove = document.getElementById('apprApprove');
  const apprReject = document.getElementById('apprReject');
  const pendingCount = document.getElementById('pendingCount');
  let pending = 3;
  apprApprove.addEventListener('click', () => {
    if (apprCard.classList.contains('approved') || apprCard.classList.contains('rejected')) return;
    apprCard.classList.add('approved');
    pending = Math.max(0, pending - 1);
    pendingCount.textContent = String(pending);
    pushFeed();
  });
  apprReject.addEventListener('click', () => {
    if (apprCard.classList.contains('approved') || apprCard.classList.contains('rejected')) return;
    apprCard.classList.add('rejected');
    pending = Math.max(0, pending - 1);
    pendingCount.textContent = String(pending);
  });

  /* ── kick off typewriter when demo scrolls into view ── */
  const demoIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        restartTypewriter();
        resumeLog();
        demoIO.disconnect();
      }
    }
  }, { threshold: 0.25 });
  demoIO.observe(document.getElementById('demo'));

  /* ── hero card subtle tilt (desktop, fine pointers) ── */
  if (window.matchMedia('(pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const card = document.querySelector('.glass-card');
    const hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    });
    hero.addEventListener('mouseleave', () => { card.style.transform = ''; });
  }
})();
