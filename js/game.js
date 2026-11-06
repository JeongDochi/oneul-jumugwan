(function () {
  'use strict';

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const MOOD_FACE = { calm: '🙂', upset: '😟', annoyed: '😒', angry: '😠', furious: '😡' };

  const state = {
    si: 0,            // 고른 상황 index
    node: null,       // 지금 선택지 묶음(노드) 이름
    turn: 0,          // 몇 번째 대응인지
    ending: null,     // 도착한 결말 이름
    line: null,       // 지금 말풍선에 나온 대사 {text, mood, audio}
    locked: false,    // 화면 전환 중 중복 클릭 방지
    typing: null,
    typeFull: '',
    typeDone: null,
    choicesReady: false,
    currentChoices: []
  };

  /* ---------------- 음성 ---------------- */
  const Voice = {
    el: new Audio(),
    muted: false,
    init() {
      this.el.preload = 'auto';
      this.el.addEventListener('playing', () => setSpeaking(true));
      ['ended', 'pause', 'error'].forEach((ev) =>
        this.el.addEventListener(ev, () => setSpeaking(false))
      );
      // 아직 녹음 파일이 없는 대사는 '다시 듣기' 버튼을 숨김
      this.el.addEventListener('error', () => { $('#replayBtn').hidden = true; });
    },
    play(src) {
      this.stop();
      if (!src || this.muted) return;
      this.el.src = src;
      // 재생 속도 (src 를 바꾸면 속도가 초기화되므로 매번 다시 지정, 목소리 높낮이는 그대로 유지)
      const rate = GAME_CONFIG.voiceRate || 1;
      this.el.defaultPlaybackRate = rate;
      this.el.playbackRate = rate;
      this.el.preservesPitch = true;
      this.el.currentTime = 0;
      const p = this.el.play();
      if (p && p.catch) p.catch(() => setSpeaking(false)); // 파일 없음/자동재생 차단 시 조용히 무시
    },
    stop() {
      this.el.pause();
      setSpeaking(false);
    },
    toggleMute() {
      this.muted = !this.muted;
      if (this.muted) this.stop();
      return this.muted;
    }
  };

  function setSpeaking(on) {
    $('#speaking').hidden = !on;
    $('#avatar').classList.toggle('is-speaking', on);
  }

  /* ---------------- 화면 전환 ---------------- */
  function go(screenId, onSwap) {
    if (state.locked) return;
    state.locked = true;
    const curtain = $('#curtain');
    curtain.classList.add('on');
    setTimeout(() => {
      $$('.screen').forEach((s) => s.classList.remove('is-active'));
      $('#screen-' + screenId).classList.add('is-active');
      document.body.dataset.screen = screenId;
      if (onSwap) onSwap();
      curtain.classList.remove('on');
      state.locked = false;
    }, 260);
  }

  function setProgress(text) {
    const el = $('#progress');
    el.hidden = !text;
    el.textContent = text || '';
  }

  const pad = (n) => String(n).padStart(2, '0');

  /* ---------------- 흐름 ---------------- */
  function showSelect() {
    Voice.stop();
    go('select', () => setProgress('민원 고르기'));
  }

  function buildSelectCards() {
    const grid = $('#selectGrid');
    grid.innerHTML = '';
    SCENARIOS.forEach((sc, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pick';
      b.style.animationDelay = i * 90 + 'ms';
      b.innerHTML = `
        <span class="pick__top">
          <span class="chip"></span>
          <span class="pick__face"></span>
        </span>
        <strong class="pick__title"></strong>
        <span class="pick__desc"></span>
        <span class="pick__value"></span>`;
      b.querySelector('.chip').textContent = `상황 ${pad(i + 1)} · ${sc.type}`;
      b.querySelector('.pick__face').textContent = MOOD_FACE[sc.opening.mood] || MOOD_FACE.calm;
      b.querySelector('.pick__title').textContent = sc.title;
      b.querySelector('.pick__desc').textContent = sc.intro;
      b.querySelector('.pick__value').textContent = `# ${sc.value}`;
      b.addEventListener('click', () => pickScenario(i));
      grid.appendChild(b);
    });
  }

  function pickScenario(i) {
    state.si = i;
    const sc = SCENARIOS[i];
    go('intro', () => {
      $('#introChip').textContent = `상황 ${pad(i + 1)} · ${sc.type}`;
      $('#introTitle').textContent = sc.title;
      $('#introDesc').textContent = sc.intro;
      setProgress(`상황 ${pad(i + 1)} · ${sc.type}`);
    });
  }

  function startScenario() {
    const sc = SCENARIOS[state.si];
    state.node = sc.start;
    state.turn = 1;
    state.ending = null;
    go('scene', () => {
      $('#speakerName').textContent = sc.complainant.name;
      showLine(sc.opening, showChoices);
    });
  }

  function updateProgress() {
    const sc = SCENARIOS[state.si];
    setProgress(`${sc.type}  ·  대응 ${state.turn}`);
  }

  // 민원인 대사 한 줄을 말풍선에 띄우고, 다 나오면 done 실행
  function showLine(line, done) {
    state.line = line;
    updateProgress();
    $('#avatarFace').textContent = MOOD_FACE[line.mood] || MOOD_FACE.calm;
    $('#avatar').dataset.mood = line.mood || 'calm';
    $('#choices').innerHTML = '';
    $('#replayBtn').hidden = !line.audio;
    $('#skipHint').hidden = false;
    state.choicesReady = false;

    const bubble = $('#bubble');
    bubble.classList.remove('pop');
    void bubble.offsetWidth;
    bubble.classList.add('pop');

    typeText($('#dialogue'), line.text, done);
    Voice.play(line.audio);
  }

  function typeText(el, text, done) {
    clearTimeout(state.typing);
    state.typeFull = text;
    state.typeDone = done;
    el.textContent = '';
    let i = 0;
    const tick = () => {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        state.typing = null;
        done();
      } else {
        state.typing = setTimeout(tick, GAME_CONFIG.typeSpeedMs);
      }
    };
    state.typing = setTimeout(tick, GAME_CONFIG.typeSpeedMs);
  }

  function skipTyping() {
    if (!state.typing) return;
    clearTimeout(state.typing);
    state.typing = null;
    $('#dialogue').textContent = state.typeFull;
    state.typeDone && state.typeDone();
  }

  function showChoices() {
    $('#skipHint').hidden = true;
    const list = SCENARIOS[state.si].nodes[state.node].choices || [];
    state.currentChoices = list;

    const wrap = $('#choices');
    wrap.innerHTML = '';
    list.forEach((c, idx) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.style.animationDelay = idx * 90 + 'ms';
      b.innerHTML = `<span class="choice__no">${idx + 1}</span><span class="choice__text"></span>`;
      b.querySelector('.choice__text').textContent = c.text;
      b.addEventListener('click', () => choose(idx, b));
      wrap.appendChild(b);
    });
    state.choicesReady = true;
  }

  function choose(idx, btn) {
    if (!state.choicesReady || state.locked) return;
    state.choicesReady = false;
    const c = state.currentChoices[idx];
    $$('.choice').forEach((b) => (b.disabled = true));
    btn.classList.add('is-picked');
    Voice.stop();

    setTimeout(() => {
      // 고른 선택지의 반응이 곧 다음 대사. next 가 있으면 대화가 이어지고, ending 이면 끝
      if (c.next) {
        state.node = c.next;
        showLine(c.reply, () => { state.turn++; updateProgress(); showChoices(); });
      } else {
        state.ending = c.ending;
        showLine(c.reply, showReportButton);
      }
    }, 450);
  }

  function showReportButton() {
    $('#skipHint').hidden = true;
    const wrap = $('#choices');
    wrap.innerHTML = '';
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'btn btn--primary btn--lg choices__next';
    b.textContent = '보고서 확인하기 →';
    b.addEventListener('click', showResult);
    wrap.appendChild(b);
  }

  function showResult() {
    const sc = SCENARIOS[state.si];
    const end = sc.endings[state.ending];
    const ending = end.result;
    Voice.stop();

    go('result', () => {
      setProgress(`${sc.type}  ·  결과`);
      $('#resultCard').dataset.ending = ending;
      $('#resultNo').textContent = `결말 · ${end.title}`;
      $('#resultChip').textContent = `상황 ${pad(state.si + 1)} · ${sc.type}`;
      $('#resultTitle').textContent = sc.title;
      $('#resultSummary').textContent = end.summary;

      const stamp = $('#stamp');
      stamp.textContent = GAME_CONFIG.stampLabel[ending];
      stamp.dataset.ending = ending;
      stamp.classList.remove('hit');
      void stamp.offsetWidth;
      setTimeout(() => stamp.classList.add('hit'), 350); // 화면이 열린 뒤 도장 쾅!
    });
  }

  function restart() {
    Voice.stop();
    go('start', () => setProgress(''));
  }

  /* ---------------- 이벤트 ---------------- */
  function bind() {
    $('#heroMeta').textContent = `약 2분 · 민원 ${SCENARIOS.length}종 중 하나 선택 · 선택에 따라 달라지는 결말`;
    buildSelectCards();

    $('#startBtn').addEventListener('click', showSelect);
    $('#introBtn').addEventListener('click', startScenario);
    $('#againBtn').addEventListener('click', showSelect);
    $('#restartBtn').addEventListener('click', restart);

    $('#bubble').addEventListener('click', skipTyping);
    $('#replayBtn').addEventListener('click', () => state.line && Voice.play(state.line.audio));

    $('#muteBtn').addEventListener('click', (e) => {
      const muted = Voice.toggleMute();
      e.currentTarget.textContent = muted ? '🔇' : '🔊';
      e.currentTarget.setAttribute('aria-pressed', String(muted));
    });

    // 키보드: 상황 고르기·선택지 1~3, Enter/Space 로 대사 건너뛰기
    document.addEventListener('keydown', (e) => {
      const screen = document.body.dataset.screen;
      const n = parseInt(e.key, 10);
      if (screen === 'select') {
        if (n >= 1 && n <= SCENARIOS.length) pickScenario(n - 1);
        return;
      }
      if (screen !== 'scene') return;
      if (state.typing && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        skipTyping();
        return;
      }
      if (n >= 1 && n <= state.currentChoices.length && state.choicesReady) {
        const btns = $$('.choice');
        if (btns[n - 1]) choose(n - 1, btns[n - 1]);
      }
    });

    // 부스 운영용: 일정 시간 조작이 없으면 첫 화면으로
    if (GAME_CONFIG.idleResetMs > 0) {
      let timer;
      const arm = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (document.body.dataset.screen !== 'start') {
            state.locked = false;
            restart();
          }
        }, GAME_CONFIG.idleResetMs);
      };
      ['pointerdown', 'keydown'].forEach((ev) => document.addEventListener(ev, arm));
      arm();
    }
  }

  Voice.init();
  bind();
})();
