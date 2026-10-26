/**
 * Voice agent demo: user-triggered call simulation with labelled turns,
 * waveform states, a call timer and an out-of-hours script variant.
 * No audio exists anywhere in this module.
 */

type Turn = { who: 'agent' | 'caller'; text: string };

const SCRIPTS: Record<'hours' | 'after', Turn[]> = {
  hours: [
    { who: 'agent', text: 'Thanks for calling, this is the virtual receptionist for Demo Studio. How can I help?' },
    { who: 'caller', text: 'Hi, do you have appointments available this week?' },
    { who: 'agent', text: 'Yes. I can check availability for you. Which day works best?' },
    { who: 'caller', text: 'Thursday afternoon, please.' },
    { who: 'agent', text: 'Thursday at 3:30 PM is open. May I take your name and number to hold it?' },
    { who: 'caller', text: 'Priya, on the number that is calling.' },
    { who: 'agent', text: 'Held for Priya. You will get a confirmation message shortly. Anything else I can check?' },
  ],
  after: [
    { who: 'agent', text: 'Thanks for calling Demo Studio. Our team has finished for the day, but I can still help.' },
    { who: 'caller', text: 'Oh. I was hoping to ask about pricing for a small project.' },
    { who: 'agent', text: 'I can share our standard starting points: projects begin at the rates published on our site, and custom scopes are quoted after a short call.' },
    { who: 'caller', text: 'Got it. Can someone call me back tomorrow?' },
    { who: 'agent', text: 'Yes. I will take your name, number and the best time to reach you, and the team will call back on the next working day.' },
    { who: 'caller', text: 'Priya, tomorrow morning works.' },
    { who: 'agent', text: 'Recorded for a tomorrow morning callback. Thank you for calling, Priya.' },
  ],
};

const CAPTURES = {
  hours: {
    inquiry: 'Appointment request for a studio project, Thursday preferred.',
    intent: 'Appointment request',
    next: 'Thursday, 3:30 PM hold',
  },
  after: {
    inquiry: 'Pricing question after hours, callback requested for tomorrow morning.',
    intent: 'Quote question + callback',
    next: 'Callback, tomorrow AM',
  },
};

function initVoice(root: HTMLElement) {
  if (root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const callPanel = root.querySelector<HTMLElement>('.vo-call');
  const stateEl = root.querySelector<HTMLElement>('[data-vo-state]');
  const timerEl = root.querySelector<HTMLElement>('[data-vo-timer]');
  const wave = root.querySelector<HTMLElement>('[data-vo-wave]');
  const statusEl = root.querySelector<HTMLElement>('[data-vo-status]');
  const turnsEl = root.querySelector<HTMLElement>('[data-vo-turns]');
  const summary = root.querySelector<HTMLElement>('[data-vo-summary]');
  const capture = root.querySelector<HTMLElement>('[data-vo-capture]');
  const inquiryEl = root.querySelector<HTMLElement>('[data-vo-inquiry]');
  const playBtn = root.querySelector<HTMLButtonElement>('[data-vo-play]');
  const modeBtns = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-vo-mode]'));
  const capIntent = root.querySelector<HTMLElement>('[data-cap-intent]');
  const capNext = root.querySelector<HTMLElement>('[data-cap-next]');
  const capName = root.querySelector<HTMLElement>('[data-cap-name]');
  const idleEl = root.querySelector<HTMLElement>('[data-vo-idle]');
  const teaserText = root.querySelector<HTMLElement>('[data-teaser-text]');
  const teaserWho = root.querySelector<HTMLElement>('[data-teaser-who]');
  const teaserBubble = root.querySelector<HTMLElement>('[data-teaser-bubble]');

  if (!turnsEl || !playBtn) return;

  let mode: 'hours' | 'after' = 'hours';
  let playing = false;
  let timers: number[] = [];
  let timerInterval = 0;
  let seconds = 0;

  function setState(state: 'idle' | 'ringing' | 'active' | 'done', label: string) {
    if (callPanel) callPanel.dataset.callState = state;
    if (stateEl) stateEl.textContent = label;
    if (statusEl) {
      statusEl.textContent = state === 'done' ? 'captured' : state === 'active' ? 'on call' : state;
      statusEl.classList.toggle('is-run', state === 'active');
      statusEl.classList.toggle('is-done', state === 'done');
      statusEl.classList.toggle('is-wait', state === 'ringing');
    }
  }

  function setWave(cls: string) {
    if (!wave) return;
    wave.classList.remove('speaking-agent', 'speaking-caller');
    if (cls) wave.classList.add(cls);
  }

  function tickTimer() {
    seconds += 1;
    if (timerEl) {
      const m = String(Math.floor(seconds / 60)).padStart(2, '0');
      const s = String(seconds % 60).padStart(2, '0');
      timerEl.textContent = `${m}:${s}`;
    }
  }

  function clearAll() {
    timers.forEach((t) => window.clearTimeout(t));
    timers = [];
    window.clearInterval(timerInterval);
    seconds = 0;
    if (timerEl) timerEl.textContent = '00:00';
  }

  function applyCapture() {
    const c = CAPTURES[mode];
    if (inquiryEl) inquiryEl.textContent = c.inquiry;
    if (capIntent) capIntent.textContent = c.intent;
    if (capNext) capNext.textContent = c.next;
    if (capName) capName.textContent = mode === 'hours' ? 'Priya M.' : 'Priya M. (callback)';
  }

  let hasPlayed = false;
  let teaserTimer: number | undefined;
  let teaserOn = false;

  function stopTeaser() {
    teaserOn = false;
    window.clearTimeout(teaserTimer);
  }

  /** Idle state: one line at a time, typed, erased, replaced. Nothing more. */
  function startTeaser() {
    if (!teaserText || !teaserWho || !teaserBubble) return;
    const lines = SCRIPTS[mode].slice(0, 3);
    if (reduced) {
      teaserText.textContent = lines[0].text;
      teaserWho.textContent = 'Agent';
      return;
    }
    stopTeaser();
    teaserOn = true;
    let li = 0;
    const playLine = () => {
      if (!teaserOn) return;
      const line = lines[li % lines.length];
      teaserWho!.textContent = line.who === 'agent' ? 'Agent' : 'Caller';
      teaserBubble!.classList.toggle('agent', line.who === 'agent');
      teaserBubble!.classList.toggle('caller', line.who === 'caller');
      let i = 0;
      teaserText!.textContent = '';
      const eraseStep = () => {
        if (!teaserOn) return;
        i -= 5;
        if (i <= 0) {
          teaserText!.textContent = '';
          li += 1;
          teaserTimer = window.setTimeout(playLine, 380);
        } else {
          teaserText!.textContent = line.text.slice(0, i);
          teaserTimer = window.setTimeout(eraseStep, 10);
        }
      };
      const typeStep = () => {
        if (!teaserOn) return;
        i += 1;
        teaserText!.textContent = line.text.slice(0, i);
        if (i < line.text.length) teaserTimer = window.setTimeout(typeStep, 30);
        else teaserTimer = window.setTimeout(eraseStep, 1500);
      };
      typeStep();
    };
    playLine();
  }

  function renderIdle() {
    stopTeaser();
    clearAll();
    playing = false;
    turnsEl!.innerHTML = '';
    turnsEl!.setAttribute('hidden', '');
    idleEl?.removeAttribute('hidden');
    summary?.setAttribute('hidden', '');
    capture?.setAttribute('hidden', '');
    setState('idle', 'Sample call ready');
    setWave('');
    playBtn!.innerHTML = playBtnHTML(hasPlayed ? 'Replay demo call' : 'Play demo call');
    applyCapture();
    startTeaser();
  }

  function makeTurn(t: Turn): HTMLLIElement {
    const li = document.createElement('li');
    li.className = `turn ${t.who}`;
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = t.who === 'agent' ? 'Agent' : 'Caller';
    const p = document.createElement('p');
    p.textContent = t.text;
    li.append(who, p);
    return li;
  }

  function stopPlayState() {
    playing = false;
    playBtn!.innerHTML = playBtnHTML('Replay demo call');
    setWave('');
  }

  function play() {
    if (playing) return;
    clearAll();
    playing = true;
    hasPlayed = true;
    stopTeaser();
    idleEl?.setAttribute('hidden', '');
    turnsEl!.removeAttribute('hidden');
    capture?.setAttribute('hidden', '');
    summary?.setAttribute('hidden', '');
    turnsEl!.innerHTML = '';
    applyCapture();
    playBtn!.innerHTML = playBtnHTML('Playing…');

    if (reduced) {
      // Show the full exchange immediately, no choreography.
      SCRIPTS[mode].forEach((t) => turnsEl!.append(makeTurn(t)));
      capture?.removeAttribute('hidden');
      summary?.removeAttribute('hidden');
      setState('done', 'Call complete (demo)');
      stopPlayState();
      return;
    }

    setState('ringing', 'Ringing…');
    setWave('speaking-caller');

    const ringEnd = window.setTimeout(() => {
      setState('active', 'On call');
      timerInterval = window.setInterval(tickTimer, 1000);

      const script = SCRIPTS[mode];
      let at = 0;
      script.forEach((turn, i) => {
        const duration = Math.max(1400, Math.min(3400, turn.text.length * 46));
        at += i === 0 ? 500 : duration;
        const t = window.setTimeout(() => {
          const li = makeTurn(turn);
          li.classList.add('enter');
          turnsEl!.append(li);
          requestAnimationFrame(() => li.classList.remove('enter'));
          setWave(turn.who === 'agent' ? 'speaking-agent' : 'speaking-caller');

          if (i === 4) capture?.removeAttribute('hidden');

          if (i === script.length - 1) {
            const endT = window.setTimeout(() => {
              window.clearInterval(timerInterval);
              setWave('');
              setState('done', 'Call complete (demo)');
              summary?.removeAttribute('hidden');
              stopPlayState();
            }, duration + 400);
            timers.push(endT);
          }
        }, at);
        timers.push(t);
      });
    }, 1600);
    timers.push(ringEnd);
  }

  function playBtnHTML(label: string) {
    return `<svg width="12" height="13" viewBox="0 0 12 13" aria-hidden="true"><path d="M1.5 1.8v9.4L10.5 6.5z" fill="currentColor"></path></svg> ${label}`;
  }

  playBtn.addEventListener('click', play);

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = (btn.dataset.voMode === 'after' ? 'after' : 'hours') as 'hours' | 'after';
      if (next === mode) return;
      mode = next;
      modeBtns.forEach((b) =>
        b.setAttribute('aria-pressed', String(b.dataset.voMode === mode))
      );
      clearAll();
      stopPlayState();
      renderIdle();
    });
  });

  renderIdle();
}

function boot() {
  document.querySelectorAll<HTMLElement>('[data-voice]').forEach(initVoice);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}

export {};
