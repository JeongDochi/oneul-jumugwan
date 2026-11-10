/* ============================================================
   민원인 캐릭터 (SVG로 직접 그림)
   - drawCharacter(캐릭터, 표정) → SVG 문자열
   - 캐릭터: owner(가게 사장님) | grandma(할매) | resident(아파트 주민)
   - 표정: calm(좋음) | upset(서운·걱정) | annoyed(언짢음) | angry(화남) | furious(폭발)
   ============================================================ */
(function () {
  'use strict';

  const SKIN = { owner: '#f2c29b', grandma: '#f3cfb3', resident: '#e9b48c' };
  const SKIN_SHADE = { owner: '#e3a97f', grandma: '#e6b898', resident: '#d69a6f' };
  const INK = '#2a1f1a';

  /* ---------- 몸 ---------- */
  function body(c) {
    const neck = `<path d="M86 136 h28 v22 q-14 8 -28 0 z" fill="${SKIN_SHADE[c]}"/>`;
    if (c === 'owner') {
      return neck + `
        <path d="M24 200 Q30 156 100 150 Q170 156 176 200 Z" fill="#f5f5f2"/>
        <path d="M84 152 L100 168 L116 152" fill="none" stroke="#d9d9d4" stroke-width="3"/>
        <path d="M64 200 L68 164 Q100 174 132 164 L136 200 Z" fill="#c9733a"/>
        <path d="M68 164 L80 150 M132 164 L120 150" stroke="#a85d2b" stroke-width="5" stroke-linecap="round"/>
        <rect x="88" y="178" width="24" height="16" rx="3" fill="#a85d2b"/>`;
    }
    if (c === 'grandma') {
      return neck + `
        <path d="M24 200 Q30 156 100 150 Q170 156 176 200 Z" fill="#8f6bb7"/>
        <path d="M80 152 L100 186 L120 152 Q100 160 80 152 Z" fill="#f4e8da"/>
        <circle cx="100" cy="168" r="3" fill="#fff" stroke="#d8c8b4"/>
        <circle cx="94" cy="160" r="3" fill="#fff" stroke="#d8c8b4"/>
        <circle cx="106" cy="160" r="3" fill="#fff" stroke="#d8c8b4"/>
        <path d="M100 186 V200" stroke="#7a5aa0" stroke-width="3"/>`;
    }
    return neck + `
      <path d="M22 200 Q28 154 100 148 Q172 154 178 200 Z" fill="#6c7a88"/>
      <path d="M82 150 L100 178 L118 150 Q100 158 82 150 Z" fill="#f2f2ee"/>
      <path d="M100 178 V200" stroke="#4f5b67" stroke-width="3"/>
      <path d="M78 152 L92 176 M122 152 L108 176" stroke="#56636f" stroke-width="4" stroke-linecap="round"/>`;
  }

  /* ---------- 머리(얼굴형·머리카락) ---------- */
  function headBack(c) {
    if (c === 'grandma') {
      return `
        <circle cx="100" cy="30" r="20" fill="#cfd0d6"/>
        <path d="M88 26 q12 -10 24 0" stroke="#b6b7bf" stroke-width="3" fill="none"/>
        <ellipse cx="100" cy="74" rx="60" ry="50" fill="#d9dae0"/>`;
    }
    return '';
  }

  function head(c) {
    const s = SKIN[c];
    return `
      <ellipse cx="48" cy="100" rx="10" ry="13" fill="${s}"/>
      <ellipse cx="152" cy="100" rx="10" ry="13" fill="${s}"/>
      <ellipse cx="100" cy="96" rx="52" ry="${c === 'resident' ? 56 : 58}" fill="${s}"/>`;
  }

  function hair(c) {
    if (c === 'owner') {
      return `<path d="M47 96 Q42 40 100 34 Q160 38 153 96 Q150 70 136 60 Q118 70 96 62 Q86 70 70 64 Q54 72 47 96 Z" fill="#2b2420"/>
              <path d="M96 62 Q110 50 136 60" fill="none" stroke="#3d342e" stroke-width="3"/>`;
    }
    if (c === 'grandma') {
      return `<path d="M46 98 Q40 48 100 40 Q160 48 154 98 Q150 70 128 62 Q100 74 72 62 Q50 72 46 98 Z" fill="#d9dae0"/>
              <path d="M62 66 q8 -8 18 -4 M120 62 q10 -4 18 4" stroke="#b9bac2" stroke-width="3" fill="none" stroke-linecap="round"/>`;
    }
    // resident: 짧게 깎은 머리 + 수염 자국
    return `<path d="M48 94 Q44 44 100 40 Q156 44 152 94 Q148 70 136 62 Q118 58 100 60 Q82 58 64 62 Q52 70 48 94 Z" fill="#3a3633"/>
            <path d="M50 92 Q50 76 56 68 M150 92 Q150 76 144 68" stroke="#a9a6a2" stroke-width="6" stroke-linecap="round" fill="none"/>
            <path d="M58 118 Q62 150 100 154 Q138 150 142 118 Q132 140 100 142 Q68 140 58 118 Z" fill="#5b4a3f" opacity=".22"/>`;
  }

  /* ---------- 표정 ---------- */
  function brows(c, m) {
    const col = c === 'grandma' ? '#a9a9b2' : '#2b2420';
    const w = c === 'resident' ? 8 : c === 'grandma' ? 4.5 : 6;
    const d = {
      calm:    'M68 78 Q79 72 90 77 M110 77 Q121 72 132 78',
      upset:   'M68 82 Q80 80 91 74 M109 74 Q120 80 132 82',
      annoyed: 'M68 80 L90 83 M110 83 L132 80',
      angry:   'M67 76 L91 87 M109 87 L133 76',
      furious: 'M65 72 L92 89 M108 89 L135 72'
    }[m];
    return `<path d="${d}" stroke="${col}" stroke-width="${m === 'furious' ? w + 2 : w}" stroke-linecap="round" fill="none"/>`;
  }

  function eyes(m) {
    const pupil = (x, rx, ry) =>
      `<ellipse cx="${x}" cy="100" rx="${rx}" ry="${ry}" fill="${INK}"/><circle cx="${x + 2}" cy="97" r="1.8" fill="#fff"/>`;
    switch (m) {
      case 'calm':
        return `<path d="M70 102 Q80 90 90 102 M110 102 Q120 90 130 102" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" fill="none"/>`;
      case 'upset':
        return pupil(80, 6, 7.5) + pupil(120, 6, 7.5);
      case 'annoyed':
        return `<path d="M72 98 h16 a8 7 0 0 1 -16 0 Z M112 98 h16 a8 7 0 0 1 -16 0 Z" fill="${INK}"/>
                <path d="M70 98 h20 M110 98 h20" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`;
      case 'angry':
        return pupil(80, 5.5, 6) + pupil(120, 5.5, 6);
      default: // furious: 흰자 + 작은 눈동자
        return `<ellipse cx="80" cy="100" rx="9" ry="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
                <ellipse cx="120" cy="100" rx="9" ry="8" fill="#fff" stroke="${INK}" stroke-width="2.5"/>
                <circle cx="80" cy="101" r="3.6" fill="${INK}"/><circle cx="120" cy="101" r="3.6" fill="${INK}"/>`;
    }
  }

  function glasses(c) {
    if (c !== 'grandma') return '';
    return `<g fill="none" stroke="#8a6a48" stroke-width="3">
              <circle cx="80" cy="100" r="15"/><circle cx="120" cy="100" r="15"/>
              <path d="M95 99 q5 -4 10 0 M65 98 L52 94 M135 98 L148 94"/>
            </g>`;
  }

  function nose(c) {
    const n = `<path d="M100 104 q-5 10 1 13" stroke="${SKIN_SHADE[c]}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
    if (c !== 'resident') return n;
    return n + `<path d="M82 121 Q90 112 100 117 Q110 112 118 121 Q109 123 100 120 Q91 123 82 121 Z" fill="#3a3633"/>`;
  }

  function mouth(m) {
    switch (m) {
      case 'calm':
        return `<path d="M82 124 Q100 146 118 124 Q100 131 82 124 Z" fill="#8a2f2f"/>
                <path d="M88 126 Q100 130 112 126" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>`;
      case 'upset':
        return `<path d="M88 134 Q100 124 112 134" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      case 'annoyed':
        return `<path d="M88 131 q6 -4 12 0 t12 -1" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
      case 'angry':
        return `<path d="M84 134 Q100 120 116 134 Q100 130 84 134 Z" fill="#6a2222" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
      default:
        return `<path d="M80 122 Q100 114 120 122 Q122 146 100 148 Q78 146 80 122 Z" fill="#5a1b1b"/>
                <path d="M84 123 Q100 118 116 123 L115 128 Q100 124 85 128 Z" fill="#fff"/>
                <ellipse cx="100" cy="141" rx="10" ry="4.5" fill="#c4504f"/>`;
    }
  }

  function cheeks(c, m) {
    if (m === 'calm') return `<ellipse cx="66" cy="118" rx="10" ry="6" fill="#ff8f8f" opacity=".45"/><ellipse cx="134" cy="118" rx="10" ry="6" fill="#ff8f8f" opacity=".45"/>`;
    if (m === 'angry') return `<ellipse cx="66" cy="116" rx="11" ry="7" fill="#e8504a" opacity=".35"/><ellipse cx="134" cy="116" rx="11" ry="7" fill="#e8504a" opacity=".35"/>`;
    if (c === 'grandma') return `<path d="M70 126 q-3 6 2 10 M130 126 q3 6 -2 10" stroke="${SKIN_SHADE[c]}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    return '';
  }

  /* ---------- 감정 효과 ---------- */
  function effects(c, m) {
    if (m === 'upset') {
      return `<path d="M146 64 q8 12 0 18 q-8 -6 0 -18 Z" fill="#7cc4f2" stroke="#4ea3dc" stroke-width="1.5"/>`;
    }
    if (m === 'furious') {
      return `<g stroke="#e0302a" stroke-width="5" stroke-linecap="round" fill="none" transform="translate(138 50)">
                <path d="M0 -10 q4 6 10 0 M0 10 q4 -6 10 0 M-10 0 q6 4 0 10 M20 0 q-6 4 0 10"/>
              </g>
              <g stroke="#9aa7b4" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8">
                <path d="M30 60 q-6 -10 2 -18 M170 60 q6 -10 -2 -18"/>
              </g>`;
    }
    return '';
  }

  window.drawCharacter = function (c, m) {
    c = SKIN[c] ? c : 'owner';
    m = m || 'calm';
    return `<svg class="char" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      ${body(c)}${headBack(c)}${head(c)}${m === 'furious' ? '<ellipse cx="100" cy="100" rx="51" ry="54" fill="#ff3b30" opacity=".2"/>' : ''}${hair(c)}
      ${cheeks(c, m)}${brows(c, m)}${eyes(m)}${glasses(c)}${nose(c)}${mouth(m)}${effects(c, m)}
    </svg>`;
  };
})();
