/*
 * Video renderer of the Social-studio (docs/video.md §7 and §10).
 *
 * One source for two places:
 * - the Social-studio page loads this file as `videoart.js` (published next to the page), and
 * - video/studio/render.mjs loads it in headless Chromium to render MP4s on GitHub.
 * Change it here, then republish the Social-studio with this file, so both stay the same.
 */
/* Animates a video script (scenes) on a canvas in the jouwhockeystick.nl house style:
   a YouTube Short / Reel / TikTok (1080 x 1920) and a YouTube video (1920 x 1080),
   with our own music, plus a YouTube thumbnail (1280 x 720). Records to MP4 (H.264) in the browser:
   with MediaRecorder where it can, else with WebCodecs and the small MP4 writer below. */
window.VideoArt = (() => {
  const C = { veld: '#1846A3', inkt: '#0D1B2E', bal: '#FF8A1F', krijt: '#EEF3FA', grijs: '#5B6B7F', nl: '#C9D6F0', wit: '#FFFFFF' };
  const FD = '"Bricolage Grotesque", "Segoe UI", sans-serif';
  const FB = '"Instrument Sans", "Segoe UI", sans-serif';
  const FPS = 30;
  const BEAT = 14 / FPS; // one beat of muziek.mp3 (≈128.6 BPM); scenes last whole beats
  const WIPE = 7 / FPS;
  const FORMATS = {
    // Shorts, Reels and TikTok cover the bottom and the right edge with buttons.
    short: { W: 1080, H: 1920, pad: 90, top: 250, bottom: 430, right: 160, portrait: true },
    uitleg: { W: 1920, H: 1080, pad: 130, top: 130, bottom: 190, right: 130, portrait: false },
  };
  const STICK = new Path2D('M58 32 L58 67 C58 82 50 88 40 85');
  const GRIP = new Path2D('M50 40 L66 38 M50 48 L66 46');

  const str = (v, max = 400) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, max);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const words = (t) => str(t, 2000).split(/\s+/).filter(Boolean).length;
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
  const spring = (x) => (x <= 0 ? 0 : 1 - Math.exp(-x * 8) * Math.cos(x * 13)); // overshoots a little
  const scenesOf = (v) => (v && Array.isArray(v.scenes) ? v.scenes : []).filter((s) => s && typeof s === 'object').slice(0, 10);

  /* ---------- timing ---------- */
  function sceneBeats(s) {
    switch (s.soort) {
      // The hook is on screen from the first frame, so the opening can be short.
      case 'opening': return clamp(Math.ceil((1.4 + (words(s.kop) + words(s.tekst)) * 0.17) / BEAT), 4, 7);
      case 'item': {
        const pts = Array.isArray(s.punten) ? s.punten.slice(0, 3) : [];
        const w = pts.reduce((a, p) => a + words(p), words(s.kop) + words(s.label));
        return clamp(Math.ceil((1.3 + w * 0.2 + pts.length * 0.3) / BEAT), 5, 11);
      }
      case 'lijst': {
        const items = Array.isArray(s.punten) ? s.punten.slice(0, 5) : [];
        const w = items.reduce((a, p) => a + words(p), words(s.kop));
        return clamp(Math.ceil((1.6 + w * 0.24 + items.length * 0.35) / BEAT), 8, 24);
      }
      case 'tabel': {
        const rows = Array.isArray(s.rijen) ? s.rijen.slice(0, 12).length : 0;
        return clamp(Math.ceil((3 + rows * 0.55) / BEAT), 9, 24);
      }
      case 'slot': return 8;
      case 'bow': {
        const steps = bowSteps(s);
        const sec = 1.5 + words(s.kop) * 0.15 + steps.reduce((a, st) => a + 1.5 + words(st.tekst) * 0.22, 0);
        return clamp(Math.ceil(sec / BEAT), 10, 30);
      }
      default: return clamp(Math.ceil((1.6 + (words(s.kop) + words(s.tekst)) * 0.24) / BEAT), 7, 18);
    }
  }
  function timeline(video, fmt) {
    const slower = fmt === 'uitleg' ? 1.15 : 1; // the YouTube version reads at a calmer pace
    let at = 0;
    const scenes = scenesOf(video).map((s, i) => {
      const dur = Math.round(sceneBeats(s) * slower) * BEAT;
      const item = { s, i, start: at, dur };
      at += dur;
      return item;
    });
    return { scenes, total: at };
  }

  /* ---------- text layout ---------- */
  function wrapWords(ctx, text, maxW) {
    const lines = [];
    for (const para of str(text, 2000).split('\n')) {
      let line = [];
      let width = 0;
      for (const w of para.split(/\s+/).filter(Boolean)) {
        const ww = ctx.measureText(w).width;
        const space = line.length ? ctx.measureText(' ').width : 0;
        if (line.length && width + space + ww > maxW) { lines.push(line); line = []; width = 0; }
        line.push({ w, x: line.length ? width + ctx.measureText(' ').width : 0, width: ww });
        width = line.length > 1 ? width + ctx.measureText(' ').width + ww : ww;
      }
      lines.push(line);
    }
    return lines;
  }
  // Largest size at which the text fits the box (down to minSize; then cut with an ellipsis).
  function fitText(ctx, text, weight, family, maxW, maxH, maxSize, minSize, lh) {
    for (let size = maxSize; size >= minSize; size -= 2) {
      ctx.font = `${weight} ${size}px ${family}`;
      const lines = wrapWords(ctx, text, maxW);
      // A single long word (Dutch compounds like "zaalhockeystick") cannot wrap: it must fit on its own, with 7% room for the hook's punch.
      const widest = lines.reduce((m, l) => Math.max(m, ...l.map((wd) => wd.width)), 0);
      if (lines.length * size * lh <= maxH && widest <= maxW / 1.07) return { size, lines, lh, font: ctx.font, height: lines.length * size * lh };
    }
    ctx.font = `${weight} ${minSize}px ${family}`;
    const max = Math.max(1, Math.floor(maxH / (minSize * lh)));
    const lines = wrapWords(ctx, text, maxW).slice(0, max);
    const last = lines[lines.length - 1];
    if (last && last.length) last[last.length - 1] = { ...last[last.length - 1], w: last[last.length - 1].w + '…' };
    return { size: minSize, lines, lh, font: ctx.font, height: lines.length * minSize * lh };
  }
  /** Body text: each line rises in after the previous one. */
  function drawLines(ctx, block, x, y, t, color, stagger = 0.12) {
    ctx.font = block.font;
    ctx.textBaseline = 'top';
    ctx.fillStyle = color;
    block.lines.forEach((line, li) => {
      const p = ease((t - li * stagger) / 0.45);
      if (p <= 0) return;
      ctx.save();
      ctx.globalAlpha = p;
      ctx.translate(0, (1 - p) * 30);
      for (const wd of line) ctx.fillText(wd.w, x + wd.x, y + li * block.size * block.lh);
      ctx.restore();
    });
  }

  /* ---------- brand ---------- */
  function logo(ctx, x, y, s, ground) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(s / 100, s / 100);
    ctx.translate(58, 55); ctx.rotate(8 * Math.PI / 180); ctx.translate(-58, -55);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = C.wit; ctx.lineWidth = 13; ctx.stroke(STICK);
    ctx.strokeStyle = ground; ctx.lineWidth = 3; ctx.stroke(GRIP);
    ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(58, 15, 8.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function badge(ctx, x, y, s, ground) {
    ctx.fillStyle = ground; ctx.beginPath(); ctx.roundRect(x, y, s, s, s * 0.22); ctx.fill();
    logo(ctx, x, y, s, ground);
  }
  function siteName(ctx, x, y, size, dark) {
    badge(ctx, x, y, size * 1.5, dark ? C.inkt : C.veld);
    ctx.font = `800 ${size}px ${FD}`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    ctx.fillStyle = dark ? C.wit : C.veld;
    ctx.fillText('jouwhockeystick.nl', x + size * 1.95, y + size * 0.76);
    ctx.textBaseline = 'top';
  }
  function pill(ctx, label, x, y, size, scale = 1, align = 'left') {
    ctx.font = `800 ${size}px ${FD}`;
    const w = ctx.measureText(label).width + size * 1.2;
    const h = size * 1.5;
    const left = align === 'center' ? x - w / 2 : x;
    ctx.save();
    ctx.translate(left + (align === 'center' ? w / 2 : 0), y + h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-(align === 'center' ? w / 2 : 0), -h / 2);
    ctx.fillStyle = C.bal; ctx.beginPath(); ctx.roundRect(0, 0, w, h, h / 2); ctx.fill();
    ctx.fillStyle = C.inkt; ctx.textBaseline = 'middle'; ctx.fillText(label, size * 0.6, h / 2 + size * 0.04);
    ctx.restore();
    ctx.textBaseline = 'top';
    return { w, h };
  }
  function backdrop(ctx, F, t, dark) {
    ctx.fillStyle = dark ? C.veld : C.krijt; ctx.fillRect(0, 0, F.W, F.H);
    const line = dark ? 'rgba(255,255,255,' : 'rgba(24,70,163,';
    const drift = t * 24;
    const r = Math.max(F.W, F.H) * 0.55;
    ctx.lineWidth = 14; ctx.strokeStyle = line + (dark ? '0.12)' : '0.07)');
    ctx.beginPath(); ctx.arc(F.W * 0.95 - drift, F.H * 1.02, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 10; ctx.strokeStyle = line + (dark ? '0.09)' : '0.05)');
    ctx.setLineDash([40, 40]); ctx.lineDashOffset = -drift * 2;
    ctx.beginPath(); ctx.arc(F.W * 0.95 - drift, F.H * 1.02, r * 1.3, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ---------- scenes ---------- */
  const box = (F) => ({ x: F.pad, y: F.top, w: F.W - F.pad - F.right, h: F.H - F.top - F.bottom });

  function sceneOpening(ctx, F, s, t, first) {
    backdrop(ctx, F, t, true);
    const b = box(F);
    // The hook of the video: a stick swings in and sends the ball flying.
    if (first) {
      const sw = spring(t * 0.9);
      const ang = (-70 + 82 * sw) * Math.PI / 180;
      const size = F.portrait ? 520 : 440;
      const ox = F.W - F.right - size * 0.55, oy = F.H - F.bottom - size * 1.0;
      ctx.save();
      ctx.translate(ox + size * 0.58, oy + size * 0.1); ctx.rotate(ang); ctx.translate(-size * 0.58, -size * 0.1);
      ctx.scale(size / 100, size / 100);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = C.wit; ctx.lineWidth = 8; ctx.stroke(new Path2D('M58 10 L58 67 C58 82 50 88 40 85'));
      ctx.strokeStyle = C.veld; ctx.lineWidth = 1.8; ctx.stroke(new Path2D('M53 22 L63 21 M53 28 L63 27'));
      ctx.restore();
      const hit = 0.3;
      const fly = Math.max(0, t - hit) * FPS;
      const bx = ox + size * 0.2 - fly * fly * 3.2 - fly * 40;
      const by = oy + size * 0.86 - fly * 16;
      if (bx > -80) { ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(bx, by, 24, 0, Math.PI * 2); ctx.fill(); }
    }
    let y = b.y + (F.portrait ? 160 : 40);
    const kicker = str(s.boven, 60);
    if (kicker) {
      // The first scene is the hook: everything is readable on the very first frame.
      const p = first ? 1 : ease(t / 0.4);
      ctx.globalAlpha = p;
      ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(b.x + 14, y + 22, 14, 0, Math.PI * 2); ctx.fill();
      ctx.font = `600 ${F.portrait ? 38 : 34}px ${FB}`; ctx.fillStyle = C.nl; ctx.textBaseline = 'top';
      ctx.fillText(kicker.toUpperCase(), b.x + 46, y + 2);
      ctx.globalAlpha = 1;
      y += 90;
    }
    const head = headBlock(ctx, F, s.kop, b.w * (F.portrait ? 1 : 0.72), F.portrait ? 640 : 470, first ? (F.portrait ? 128 : 112) : null);
    const dt = first ? drawHook(ctx, head, b.x, y, t, C.wit) : drawHead(ctx, head, b.x, y, t - 0.12, C.wit);
    y += head.height + 46;
    if (str(s.tekst)) {
      const sub = fitText(ctx, str(s.tekst, 240), 400, FB, b.w * (F.portrait ? 1 : 0.65), b.y + b.h - y, F.portrait ? 50 : 42, 32, 1.3);
      drawLines(ctx, sub, b.x, y, first ? t + 0.45 : t - 0.25 - dt, C.nl);
    }
    return true;
  }

  /** The hook: the whole heading is on screen from frame 0, with a short punch and the accent words pulsing on the beat. */
  function drawHook(ctx, block, x, y, t, color) {
    ctx.font = block.font; ctx.textBaseline = 'top';
    // The whole block punches in from its top-left corner, so word spacing stays intact.
    const punch = 1 + 0.06 * (1 - ease(t / 0.3));
    // The accent words pulse on the beat, but only after the opening punch: frame 0 stays clean.
    const pulse = t < 0.4 ? 1 : 1 + 0.04 * Math.exp(-((t % BEAT) / 0.1));
    ctx.save();
    ctx.translate(x, y); ctx.scale(punch, punch);
    block.lines.forEach((line, li) => {
      for (const wd of line) {
        const ly = li * block.size * block.lh;
        ctx.fillStyle = wd.accent ? C.bal : color;
        if (wd.accent && pulse > 1.001) {
          ctx.save();
          // Pulse from the middle of the word, so it never runs into its neighbours.
          ctx.translate(wd.x + wd.width / 2, ly + block.size / 2); ctx.scale(pulse, pulse);
          ctx.fillText(wd.w, -wd.width / 2, -block.size / 2);
          ctx.restore();
        } else ctx.fillText(wd.w, wd.x, ly);
      }
    });
    ctx.restore();
    return 0;
  }

  /** Heading block. Words between *stars* turn orange; without stars, the last word of a question. */
  function headBlock(ctx, F, text, maxW, maxH, maxSize = null) {
    const raw = str(text, 140);
    const block = fitText(ctx, raw.replace(/\*/g, ''), 800, FD, maxW, maxH, maxSize || (F.portrait ? 104 : 96), 56, 1.06);
    const marked = [...raw.matchAll(/\*([^*]+)\*/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean));
    const all = block.lines.flat();
    all.forEach((wd, i) => {
      wd.accent = marked.length ? marked.includes(wd.w.replace(/[.,!?:;]+$/, '')) || marked.includes(wd.w) : (i === all.length - 1 && /\?$/.test(raw.trim()));
    });
    return block;
  }
  function drawHead(ctx, block, x, y, t, color) {
    ctx.font = block.font; ctx.textBaseline = 'top';
    let n = 0;
    block.lines.forEach((line, li) => {
      for (const wd of line) {
        const p = spring(t - n * 0.07);
        if (p > 0) {
          ctx.save();
          ctx.globalAlpha = clamp(p * 1.6, 0, 1);
          ctx.translate(x + wd.x + wd.width / 2, y + li * block.size * block.lh + block.size / 2 + (1 - p) * block.size * 0.55);
          ctx.rotate((1 - p) * -0.16);
          ctx.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p);
          ctx.fillStyle = wd.accent ? C.bal : color;
          ctx.fillText(wd.w, -wd.width / 2, -block.size / 2);
          ctx.restore();
        }
        n++;
      }
    });
    return n * 0.07;
  }
  // Light scenes on landscape get a big, faint stick on the right, so the frame isn't half empty.
  function sideArt(ctx, F, t) {
    if (F.portrait) return;
    const s = 6.4, x = F.W - F.right - 100 * s * 0.62, y = F.H * 0.5 - 100 * s * 0.55;
    ctx.save(); ctx.globalAlpha = 0.1 + 0.02 * Math.sin(t * 2);
    ctx.translate(x, y); ctx.scale(s, s); ctx.translate(58, 55); ctx.rotate((8 + Math.sin(t * 0.8) * 2) * Math.PI / 180); ctx.translate(-58, -55);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.veld; ctx.lineWidth = 12; ctx.stroke(STICK);
    ctx.globalAlpha = 0.9; ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(58, 15, 8.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  const textW = (F, b) => (F.portrait ? b.w : b.w * 0.62);
  const centerY = (b, h) => b.y + Math.max(0, (b.h - h) * 0.42);

  function sceneTekst(ctx, F, s, t) {
    backdrop(ctx, F, t, false); sideArt(ctx, F, t);
    const b = box(F), w = textW(F, b);
    const head = headBlock(ctx, F, s.kop, w, F.portrait ? 440 : 330);
    const gap = 56;
    const body = fitText(ctx, str(s.tekst, 600), 400, FB, w, b.h - head.height - gap, F.portrait ? 60 : 50, 32, 1.36);
    const y = centerY(b, head.height + gap + body.height);
    const dt = drawHead(ctx, head, b.x, y, t, C.inkt);
    drawLines(ctx, body, b.x, y + head.height + gap, t - 0.3 - dt, C.inkt);
    return false;
  }

  function sceneLijst(ctx, F, s, t, isFirst, dur, sfx) {
    backdrop(ctx, F, t, false); sideArt(ctx, F, t);
    const b = box(F), w = textW(F, b);
    const head = headBlock(ctx, F, s.kop, w, F.portrait ? 380 : 260);
    const gap = 60;
    const items = (Array.isArray(s.punten) ? s.punten : []).slice(0, 5).map((p) => str(p, 200));
    let size = F.portrait ? 58 : 50, blocks = [], listH = 0;
    for (; size >= 30; size -= 2) {
      ctx.font = `400 ${size}px ${FB}`;
      blocks = items.map((p) => wrapWords(ctx, p, w - 70));
      listH = blocks.reduce((a, l) => a + l.length * size * 1.3, 0) + size * 0.75 * (blocks.length - 1);
      if (listH <= b.h - head.height - gap) break;
    }
    size = Math.max(size, 30);
    const y0 = centerY(b, head.height + gap + listH);
    const dt = drawHead(ctx, head, b.x, y0, t, C.inkt);
    const first = 0.5 + dt;
    const step = items.length ? clamp((dur - first - 1.2) / items.length, 0.35, 1.3) : 1;
    let y = y0 + head.height + gap;
    blocks.forEach((lines, i) => {
      const at = first + i * step;
      if (sfx) sfx('pop', at);
      const pb = spring(t - at);
      const pt = ease((t - at - 0.06) / 0.4);
      if (pb > 0) {
        ctx.save(); ctx.translate(b.x + 18, y + size * 0.62); ctx.scale(pb, pb);
        ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(0, 0, Math.max(12, size * 0.26), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      if (pt > 0) {
        ctx.save(); ctx.globalAlpha = pt; ctx.translate((1 - pt) * 60, 0);
        ctx.fillStyle = C.inkt; ctx.font = `400 ${size}px ${FB}`; ctx.textBaseline = 'top';
        lines.forEach((l, li) => { for (const wd of l) ctx.fillText(wd.w, b.x + 70 + wd.x, y + li * size * 1.3); });
        ctx.restore();
      }
      y += lines.length * size * 1.3 + size * 0.75;
    });
    return false;
  }

  function sceneTabel(ctx, F, s, t) {
    backdrop(ctx, F, t, false);
    const b = box(F);
    const x0 = b.x, x1 = F.portrait ? b.x + b.w : b.x + Math.min(b.w, 1180);
    const head = headBlock(ctx, F, s.kop, x1 - x0, F.portrait ? 300 : 170);
    const gap = F.portrait ? 50 : 34;
    const cols = (Array.isArray(s.kolommen) ? s.kolommen : []).slice(0, 2).map((v) => str(v, 40));
    const rows = (Array.isArray(s.rijen) ? s.rijen : []).slice(0, 12).map((r) => (Array.isArray(r) ? r : []).slice(0, 2).map((v) => str(v, 40)));
    const note = str(s.voetnoot, 160);
    const avail = b.h - head.height - gap - (note ? 80 : 0);
    // Two text columns that don't fit side by side: put the right cell under the left one.
    let rowH = Math.min(F.portrait ? 96 : 66, Math.floor(avail / (rows.length + 1)));
    let fs = Math.round(rowH * 0.46);
    const fits = (size) => {
      let w = 0;
      for (const r of rows) {
        ctx.font = `400 ${size}px ${FB}`; const a = ctx.measureText(r[0] || '').width;
        ctx.font = `800 ${size}px ${FD}`; const c = ctx.measureText(r[1] || '').width;
        w = Math.max(w, a + c);
      }
      return w + 90 <= x1 - x0;
    };
    const stacked = !fits(fs);
    let lineH = rowH;
    if (stacked) {
      lineH = Math.min(F.portrait ? 130 : 96, Math.floor(avail / (rows.length * 1 + 0.75)));
      rowH = Math.round(lineH * 0.62);
      fs = Math.round(lineH * 0.3);
    }
    const tableH = rowH + rows.length * (stacked ? lineH : rowH);
    const y0 = centerY(b, head.height + gap + tableH + (note ? 80 : 0));
    const dt = drawHead(ctx, head, x0, y0, t, C.inkt);
    let y = y0 + head.height + gap;
    const start = 0.35 + dt;
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = ease((t - start) / 0.3);
    ctx.fillStyle = C.veld; ctx.beginPath(); ctx.roundRect(x0, y, x1 - x0, rowH, 14); ctx.fill();
    ctx.fillStyle = C.wit; ctx.font = `600 ${fs}px ${FB}`;
    if (stacked) {
      ctx.fillText([cols[0], cols[1]].filter(Boolean).join('  ·  '), x0 + 30, y + rowH / 2);
    } else {
      ctx.fillText(cols[0] || '', x0 + 30, y + rowH / 2);
      ctx.textAlign = 'right'; ctx.fillText(cols[1] || '', x1 - 30, y + rowH / 2); ctx.textAlign = 'left';
    }
    ctx.globalAlpha = 1;
    y += rowH;
    const h = stacked ? lineH : rowH;
    rows.forEach((r, i) => {
      const p = ease((t - start - 0.2 - i * (stacked ? 0.18 : 0.09)) / 0.35);
      if (p > 0) {
        ctx.save(); ctx.globalAlpha = p; ctx.translate((1 - p) * 120, 0);
        if (i % 2 === 0) { ctx.fillStyle = C.wit; ctx.fillRect(x0, y, x1 - x0, h); }
        if (stacked) {
          ctx.fillStyle = C.grijs; ctx.font = `600 ${Math.round(fs * 0.8)}px ${FB}`;
          ctx.fillText((cols[0] ? cols[0] + ': ' : '') + (r[0] || ''), x0 + 30, y + h * 0.32);
          ctx.fillStyle = C.veld; ctx.font = `800 ${fs}px ${FD}`;
          ctx.fillText((cols[1] ? cols[1] + ': ' : '') + (r[1] || ''), x0 + 30, y + h * 0.7);
        } else {
          ctx.fillStyle = C.inkt; ctx.font = `400 ${fs}px ${FB}`;
          ctx.fillText(r[0] || '', x0 + 30, y + h / 2);
          ctx.font = `800 ${fs}px ${FD}`; ctx.fillStyle = C.veld; ctx.textAlign = 'right';
          ctx.fillText(r[1] || '', x1 - 30, y + h / 2); ctx.textAlign = 'left';
        }
        ctx.restore();
      }
      y += h;
    });
    ctx.textBaseline = 'top';
    if (note) {
      const n = fitText(ctx, note, 400, FB, x1 - x0, 80, F.portrait ? 34 : 28, 22, 1.3);
      drawLines(ctx, n, x0, y + 24, t - start - 0.4 - rows.length * 0.09, C.grijs);
    }
    return false;
  }

  /** One item of a list video ("3 sticks om te vergelijken", "3 tekenen dat …"): a big number, a heading, a label and 1–3 facts. */
  function sceneItem(ctx, F, s, t, isFirst, dur, sfx) {
    backdrop(ctx, F, t, false); sideArt(ctx, F, t);
    const b = box(F), w = textW(F, b);
    const nummer = str(s.nummer, 6) || '•';
    const badgeR = F.portrait ? 92 : 74;
    const head = headBlock(ctx, F, s.kop, w, F.portrait ? 330 : 220);
    const label = str(s.label, 48);
    const pillSize = F.portrait ? 44 : 36;
    const pts = (Array.isArray(s.punten) ? s.punten : []).slice(0, 3).map((p) => str(p, 120));
    const size = F.portrait ? 50 : 42;
    ctx.font = `400 ${size}px ${FB}`;
    const blocks = pts.map((p) => wrapWords(ctx, p, w - 70));
    const listH = blocks.reduce((a, l) => a + l.length * size * 1.3, 0) + size * 0.7 * Math.max(0, blocks.length - 1);
    const totalH = badgeR * 2 + 40 + head.height + (label ? pillSize * 1.5 + 34 : 0) + 40 + listH;
    let y = centerY(b, totalH);
    // Number badge pops in.
    if (sfx) sfx('pop', 0.05);
    const pb = spring(t / 0.9);
    ctx.save(); ctx.translate(b.x + badgeR, y + badgeR); ctx.scale(pb, pb);
    ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(0, 0, badgeR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.inkt; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.round(badgeR * (nummer.length > 2 ? 0.62 : 0.95))}px ${FD}`;
    ctx.fillText(nummer, 0, badgeR * 0.06);
    ctx.restore(); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    y += badgeR * 2 + 40;
    const dt = drawHead(ctx, head, b.x, y, t - 0.1, C.inkt);
    y += head.height;
    if (label) {
      y += 30;
      const at = 0.3 + dt;
      if (sfx) sfx('pop', at);
      const p = spring(t - at);
      if (p > 0) {
        ctx.save(); ctx.font = `800 ${pillSize}px ${FD}`;
        const lw = ctx.measureText(label).width + pillSize * 1.2, lh = pillSize * 1.5;
        ctx.translate(b.x, y + lh / 2); ctx.scale(p, p);
        ctx.fillStyle = C.veld; ctx.beginPath(); ctx.roundRect(0, -lh / 2, lw, lh, lh / 2); ctx.fill();
        ctx.fillStyle = C.wit; ctx.textBaseline = 'middle'; ctx.fillText(label, pillSize * 0.6, pillSize * 0.04);
        ctx.restore(); ctx.textBaseline = 'top';
      }
      y += pillSize * 1.5;
    }
    y += 40;
    const first = 0.55 + dt;
    const step = blocks.length ? clamp((dur - first - 1.0) / blocks.length, 0.3, 1.0) : 1;
    blocks.forEach((lines, i) => {
      const at = first + i * step;
      const pt = ease((t - at) / 0.35);
      if (pt > 0) {
        ctx.save(); ctx.globalAlpha = pt; ctx.translate((1 - pt) * 50, 0);
        ctx.fillStyle = C.veld; ctx.beginPath(); ctx.arc(b.x + 16, y + size * 0.62, Math.max(10, size * 0.22), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.inkt; ctx.font = `400 ${size}px ${FB}`; ctx.textBaseline = 'top';
        lines.forEach((l, li) => { for (const wd of l) ctx.fillText(wd.w, b.x + 64 + wd.x, y + li * size * 1.3); });
        ctx.restore();
      }
      y += lines.length * size * 1.3 + size * 0.7;
    });
    const note = str(s.voetnoot, 120);
    if (note) {
      ctx.globalAlpha = ease((t - first) / 0.4);
      ctx.font = `400 ${F.portrait ? 30 : 24}px ${FB}`; ctx.fillStyle = C.grijs; ctx.textBaseline = 'top';
      ctx.fillText(note, b.x, Math.min(y + 10, b.y + b.h - 30));
      ctx.globalAlpha = 1;
    }
    return false;
  }

  function sceneSlot(ctx, F, s, t, isFirst, dur, sfx) {
    backdrop(ctx, F, t, true);
    const b = box(F);
    let y = b.y + (F.portrait ? 220 : 60);
    const head = headBlock(ctx, F, s.kop, F.portrait ? b.w : b.w * 0.75, F.portrait ? 420 : 300);
    const dt = drawHead(ctx, head, b.x, y, t, C.wit);
    y += head.height + 48;
    const at = 0.3 + dt;
    if (sfx) sfx('pop', at);
    const p = spring(t - at);
    const phase = (((t - at) % BEAT) + BEAT) % BEAT;
    const beat = 1 + 0.05 * Math.exp(-phase / 0.1);
    const size = F.portrait ? 64 : 56;
    const label = (str(s.knop, 40) || 'Doe de stickwijzer') + ' →';
    if (p > 0) {
      const pb = pill(ctx, label, b.x, y, size, p * (t > at + 0.5 ? beat : 1));
      // A ball bounces next to the button, once per beat.
      if (t > at + 0.3) {
        const bounce = Math.abs(Math.sin(((t - at) / BEAT) * Math.PI));
        const r = size * 0.36;
        const bx = b.x + pb.w + size * 0.7;
        const by = y + pb.h - r - bounce * size * 1.1;
        ctx.fillStyle = C.wit; ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2); ctx.fill();
        ctx.lineWidth = r * 0.28; ctx.strokeStyle = C.bal; ctx.stroke();
      }
      y += pb.h + 44;
    } else y += size * 1.5 + 44;
    const tekst = str(s.tekst, 200) || 'Gratis, zonder account, op jouwhockeystick.nl';
    const sub = fitText(ctx, tekst, 400, FB, F.portrait ? b.w : b.w * 0.7, 200, F.portrait ? 48 : 40, 30, 1.3);
    drawLines(ctx, sub, b.x, y, t - at - 0.3, C.nl);
    y += sub.height + (F.portrait ? 56 : 40);
    // Follow call: one concrete promise, after the button (the link to the site stays the main action).
    const volg = str(s.volg, 60) || 'Volg voor meer stick-tips';
    const vt = t - at - 0.6;
    if (sfx) sfx('pop', at + 0.6);
    const vp = spring(vt);
    if (vp > 0) {
      const vs = F.portrait ? 42 : 34;
      ctx.save(); ctx.font = `600 ${vs}px ${FB}`;
      const label = '+ ' + volg;
      const vw = ctx.measureText(label).width + vs * 1.3, vh = vs * 1.7;
      ctx.translate(b.x, y + vh / 2); ctx.scale(vp, vp);
      ctx.lineWidth = 4; ctx.strokeStyle = C.wit; ctx.beginPath(); ctx.roundRect(0, -vh / 2, vw, vh, vh / 2); ctx.stroke();
      ctx.fillStyle = C.wit; ctx.textBaseline = 'middle'; ctx.fillText(label, vs * 0.65, vs * 0.05);
      ctx.restore(); ctx.textBaseline = 'top';
    }
    return true;
  }

  /* ---------- bow figure: the same drawing as BowProfileFigure on /kennis/low-bow-vs-mid-bow ---------- */
  // Copied from src/content/bowProfiles.ts in the site repo. Editorial, schematic: the deepest point is a
  // relative position (0 = hook end, 1 = grip end), every profile at the same depth (the FIH maximum).
  const BOW = {
    ultrabow: { label: 'Standaard', peak: 0.55, tekst: 'De rustigste vorm: de kromming loopt geleidelijk over de stick.' },
    midbow: { label: 'Mid bow', peak: 0.45, tekst: 'Het diepste punt ligt ongeveer halverwege.' },
    probow: { label: 'Pro bow / dynabow', peak: 0.35, tekst: 'Tussen mid bow en low bow in.' },
    lowbow: { label: 'Low bow', peak: 0.25, tekst: 'Het diepste punt ligt lager, dichter bij de krul.' },
    extreme_lowbow: { label: 'Extreme low bow', peak: 0.17, tekst: 'Nog lager dan een low bow. Iets voor specialisten.' },
  };
  const MAX_BOW_MM = 25;
  function bowDepthAt(t, peak) {
    if (t <= 0 || t >= 1) return 0;
    const a = 4 * peak, b = 4 * (1 - peak);
    const f = (x) => Math.pow(x, a) * Math.pow(1 - x, b);
    return f(t) / f(peak);
  }
  /** The profiles a bow scene steps through, in order; unknown ids are skipped. Default: mid bow, then low bow. */
  function bowSteps(s) {
    const list = (Array.isArray(s.stappen) ? s.stappen : []).slice(0, 4)
      .filter((st) => st && typeof st === 'object' && Object.prototype.hasOwnProperty.call(BOW, st.profiel))
      .map((st) => ({ profiel: st.profiel, tekst: str(st.tekst, 200) || BOW[st.profiel].tekst }));
    return list.length ? list : [{ profiel: 'midbow', tekst: BOW.midbow.tekst }, { profiel: 'lowbow', tekst: BOW.lowbow.tekst }];
  }

  function sceneBow(ctx, F, s, t, isFirst, dur, sfx) {
    backdrop(ctx, F, t, false);
    const b = box(F);
    const steps = bowSteps(s);
    // On a phone the drawing may run into the right margin: the app buttons sit lower down.
    const figW = F.portrait ? b.w + 90 : Math.min(b.w, 1000);
    const u = figW / 560; // site drawing units (grip at 40, hook at 520, curl to ~582) → pixels
    const DEPTH = F.portrait ? 120 : 80; // the site draws 46; deeper here so the bend reads in a video
    const fs = F.portrait ? 36 : 28;
    const pillSize = F.portrait ? 58 : 44;
    const head = headBlock(ctx, F, s.kop, F.portrait ? b.w : b.w * 0.8, F.portrait ? 300 : 150);
    const textW = F.portrait ? b.w : b.w * 0.7;
    const textH = F.portrait ? 240 : 110;
    const noteH = F.portrait ? 60 : 44;
    const figH = fs * 1.4 + (DEPTH + 56) * u + fs * 1.4;
    const blockH = head.height + 46 + figH + 30 + pillSize * 1.5 + 22 + textH + noteH;
    let y = centerY(b, blockH);
    const dt = drawHead(ctx, head, b.x, y, t, C.inkt);
    y += head.height + 46;

    // Timing: the drawing appears, then each profile holds for its share of the scene.
    const appear = ease((t - 0.2 - dt) / 0.5);
    const first = 0.35 + dt;
    const n = steps.length;
    const stepDur = Math.max(1.2, (dur - first - 0.4) / n);
    const k = clamp(Math.floor((t - first) / stepDur), 0, n - 1);
    const local = t - first - k * stepDur;
    if (sfx) steps.forEach((_, i) => sfx('pop', first + i * stepDur));
    const from = BOW[steps[Math.max(0, k - 1)].profiel].peak, to = BOW[steps[k].profiel].peak;
    const peak = from + (to - from) * (k === 0 ? 1 : ease(local / 0.7));

    const fx = b.x + (F.portrait ? 0 : (b.w - figW) / 2);
    const X = (x) => fx + (x - 30) * u;
    const limit = y + fs * 1.4;
    const base = limit + DEPTH * u;
    const curve = (p) => {
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) {
        const tt = i / 60;
        const px = X(520 - tt * 480), py = base - bowDepthAt(tt, p) * DEPTH * u;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    };
    ctx.save();
    ctx.globalAlpha = appear;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // The other profiles, faint, for comparison.
    ctx.strokeStyle = '#D5DEEA'; ctx.lineWidth = 3 * u;
    for (const o of Object.values(BOW)) curve(o.peak);
    // Straight reference line and the FIH depth limit.
    ctx.setLineDash([6 * u, 6 * u]); ctx.strokeStyle = C.grijs; ctx.lineWidth = Math.max(2, u);
    ctx.beginPath(); ctx.moveTo(X(40), base); ctx.lineTo(X(520), base); ctx.stroke();
    ctx.setLineDash([9 * u, 6 * u]); ctx.strokeStyle = C.bal; ctx.lineWidth = Math.max(2, 1.4 * u);
    ctx.beginPath(); ctx.moveTo(X(40), limit); ctx.lineTo(X(520), limit); ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = `600 ${fs}px ${FB}`; ctx.fillStyle = C.grijs; ctx.textBaseline = 'bottom';
    ctx.fillText(`Grens: max. ${MAX_BOW_MM} mm kromming (FIH)`, X(40), limit - 8);
    // The stick: shaft and hook.
    ctx.strokeStyle = C.veld; ctx.lineWidth = 8 * u;
    curve(peak);
    ctx.beginPath();
    ctx.moveTo(X(520), base);
    ctx.bezierCurveTo(X(566), base, X(582), base + 34 * u, X(556), base + 46 * u);
    ctx.bezierCurveTo(X(540), base + 53 * u, X(526), base + 44 * u, X(532), base + 32 * u);
    ctx.stroke();
    // Deepest point, following the curve.
    const dx = X(520 - peak * 480);
    ctx.strokeStyle = C.bal; ctx.lineWidth = Math.max(3, 2.2 * u);
    ctx.beginPath(); ctx.moveTo(dx, base); ctx.lineTo(dx, limit); ctx.stroke();
    ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(dx, limit, 7 * u, 0, Math.PI * 2); ctx.fill();
    ctx.textBaseline = 'top'; ctx.textAlign = 'center'; ctx.fillStyle = C.inkt; ctx.font = `700 ${fs}px ${FB}`;
    ctx.fillText('Diepste punt', dx, base + 10);
    ctx.textAlign = 'left'; ctx.fillStyle = C.grijs; ctx.font = `500 ${fs}px ${FB}`;
    ctx.fillText('← greep', X(40), base + 10 + fs * 1.3);
    ctx.textAlign = 'right';
    ctx.fillText('krul →', X(520), base + 10 + fs * 1.3);
    ctx.textAlign = 'left';
    ctx.restore();

    // The profile name pops in, then its text.
    let ty = Math.max(base + 56 * u, base + 10 + fs * 2.6) + 30;
    const pop = spring(local / 0.9);
    let bodyH = 0;
    if (t >= first) {
      const pb = pill(ctx, BOW[steps[k].profiel].label, b.x, ty, pillSize, Math.max(0.01, pop));
      const body = fitText(ctx, steps[k].tekst, 400, FB, textW, textH, F.portrait ? 52 : 42, 30, 1.3);
      drawLines(ctx, body, b.x, ty + pb.h + 22, local - 0.35, C.inkt);
      bodyH = body.height;
    }
    // Small print under the text: it is a schematic, not a measurement.
    const note = str(s.voetnoot, 160) || 'Schematisch, niet op schaal.';
    const noteY = ty + pillSize * 1.5 + 22 + Math.max(bodyH, F.portrait ? 140 : 54) + 24;
    ctx.globalAlpha = appear; ctx.font = `400 ${F.portrait ? 30 : 24}px ${FB}`; ctx.fillStyle = C.grijs; ctx.textBaseline = 'top';
    ctx.fillText(note, b.x, Math.min(noteY, b.y + b.h - 30));
    ctx.globalAlpha = 1;
    return false;
  }

  const SCENES = { opening: sceneOpening, tekst: sceneTekst, lijst: sceneLijst, tabel: sceneTabel, slot: sceneSlot, bow: sceneBow, item: sceneItem };

  /** Draws the frame at time t (seconds). sfx(name, atSceneTime) collects sound cues when given. */
  function drawFrame(ctx, video, fmt, tl, t, sfx) {
    const F = FORMATS[fmt];
    ctx.save();
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    const sc = tl.scenes.find((x) => t >= x.start && t < x.start + x.dur) || tl.scenes[tl.scenes.length - 1];
    let dark = false;
    if (!sc) { backdrop(ctx, F, t, true); ctx.restore(); return; }
    const local = t - sc.start;
    const fn = SCENES[sc.s.soort] || sceneTekst;
    dark = fn(ctx, F, sc.s, local, sc.i === 0, sc.dur, sfx ? (n, at) => sfx(n, sc.start + at) : null);
    // Brand line: at the top on portrait (the bottom is covered by the app), bottom-left on landscape.
    if (F.portrait) siteName(ctx, F.pad, 70, 34, dark);
    else siteName(ctx, F.pad, F.H - 105, 30, dark);
    // Progress bar.
    ctx.fillStyle = C.bal; ctx.fillRect(0, 0, F.W * clamp(t / tl.total, 0, 1), 10);
    // A brand panel sweeps across every cut.
    const i = sc.i;
    let px = null;
    if (i > 0 && local < WIPE) px = -1.3 * ease(local / WIPE);
    else if (i < tl.scenes.length - 1 && local > sc.dur - WIPE) px = 1.3 * (1 - ease((local - (sc.dur - WIPE)) / WIPE));
    if (px !== null) {
      ctx.save();
      ctx.translate(px * F.W, 0);
      ctx.transform(1, 0, -0.25, 1, 0, 0);
      const x0 = -F.W * 0.25, w = F.W * 1.6;
      ctx.fillStyle = C.bal; ctx.fillRect(x0, 0, w * 0.09, F.H);
      ctx.fillStyle = C.veld; ctx.fillRect(x0 + w * 0.09, 0, w * 0.82, F.H);
      ctx.fillStyle = C.bal; ctx.fillRect(x0 + w * 0.91, 0, w * 0.09 + F.H, F.H);
      ctx.restore();
    }
    ctx.restore();
  }

  /** Sound cues for the whole video: a whoosh at every cut, pops from the scenes. */
  function cues(video, fmt, tl) {
    const list = [];
    tl.scenes.forEach((sc, i) => { if (i < tl.scenes.length - 1) list.push({ name: 'whoosh', at: sc.start + sc.dur - WIPE - 0.1 }); });
    const F = FORMATS[fmt];
    const c = document.createElement('canvas'); c.width = 8; c.height = 8;
    const ctx = c.getContext('2d');
    const seen = new Set();
    // Run each scene's layout once with a cue collector (drawn off-screen, then thrown away).
    for (const sc of tl.scenes) {
      const fn = SCENES[sc.s.soort] || sceneTekst;
      ctx.save(); ctx.scale(8 / F.W, 8 / F.H);
      fn(ctx, F, sc.s, 0, sc.i === 0, sc.dur, (n, at) => { const k = n + ':' + Math.round((sc.start + at) * 100); if (!seen.has(k)) { seen.add(k); list.push({ name: n, at: sc.start + at }); } });
      ctx.restore();
    }
    return list.filter((q) => q.at >= 0 && q.at < tl.total);
  }

  /* ---------- thumbnail ---------- */
  function thumbnail(canvas, video) {
    const W = 1280, H = 720;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const first = scenesOf(video)[0] || {};
    const th = video && typeof video.thumbnail === 'object' && video.thumbnail ? video.thumbnail : {};
    ctx.fillStyle = C.veld; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(W * 0.92, H * 1.05, 520, 0, Math.PI * 2); ctx.stroke();
    // Big stick on the right.
    ctx.save(); ctx.translate(W - 430, 60); ctx.scale(5.6, 5.6); ctx.translate(58, 55); ctx.rotate(8 * Math.PI / 180); ctx.translate(-58, -55);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = C.wit; ctx.lineWidth = 12; ctx.stroke(STICK);
    ctx.strokeStyle = C.veld; ctx.lineWidth = 2.6; ctx.stroke(GRIP);
    ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(58, 15, 8.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const kop = (str(th.kop, 60) || str(first.kop, 60)).replace(/\*/g, '');
    ctx.textBaseline = 'top'; ctx.fillStyle = C.wit;
    const b = fitText(ctx, kop, 800, FD, 820, 380, 104, 60, 1.02);
    ctx.font = b.font;
    b.lines.forEach((l, li) => l.forEach((wd, wi) => {
      ctx.fillStyle = li === b.lines.length - 1 && wi === l.length - 1 ? C.bal : C.wit;
      ctx.fillText(wd.w, 70 + wd.x, 70 + li * b.size * b.lh);
    }));
    let y = 70 + b.height + 30;
    const label = str(th.pill, 40);
    if (label) { y += pill(ctx, label, 70, y, 50).h + 30; }
    siteName(ctx, 70, H - 110, 32, true);
  }

  /** Vertical thumbnail for a Short (1080 x 1920). YouTube shows Shorts in a 9:16 frame, so everything is centred. */
  function thumbnailShort(canvas, video) {
    const W = 1080, H = 1920;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const all = scenesOf(video);
    const first = all[0] || {};
    const th = video && typeof video.thumbnail === 'object' && video.thumbnail ? video.thumbnail : {};
    ctx.fillStyle = C.veld; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(W * 0.5, H * 1.1, 900, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([40, 40]); ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(W * 0.5, H * 1.1, 1150, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // The question, centred; the last word orange.
    const kop = (str(th.kop, 60) || str(first.kop, 60)).replace(/\*/g, '');
    ctx.textBaseline = 'top';
    const b = fitText(ctx, kop, 800, FD, W - 180, 600, 176, 90, 1.02);
    ctx.font = b.font;
    let y = 400;
    b.lines.forEach((l, li) => {
      const last = l[l.length - 1];
      const x0 = (W - (last ? last.x + last.width : 0)) / 2;
      l.forEach((wd, wi) => {
        ctx.fillStyle = li === b.lines.length - 1 && wi === l.length - 1 ? C.bal : C.wit;
        ctx.fillText(wd.w, x0 + wd.x, y + li * b.size * b.lh);
      });
    });
    y += b.height + 56;
    const label = str(th.pill, 40);
    if (label) y += pill(ctx, label, W / 2, y, 66, 1, 'center').h;
    y += 120;
    // The picture: the bow drawing when the video has one, otherwise our stick.
    const bowScene = all.find((s) => s.soort === 'bow');
    if (bowScene) {
      const steps = bowSteps(bowScene);
      const peak = BOW[steps[steps.length - 1].profiel].peak;
      const u = 880 / 560, X = (x) => 80 + (x - 30) * u, D = 120;
      const limit = y, base = y + D * u;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.setLineDash([9 * u, 6 * u]); ctx.strokeStyle = C.bal; ctx.lineWidth = 2 * u;
      ctx.beginPath(); ctx.moveTo(X(40), limit); ctx.lineTo(X(520), limit); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = C.wit; ctx.lineWidth = 10 * u;
      ctx.beginPath();
      for (let i = 0; i <= 60; i++) { const tt = i / 60; const px = X(520 - tt * 480), py = base - bowDepthAt(tt, peak) * D * u; if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); }
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X(520), base);
      ctx.bezierCurveTo(X(566), base, X(582), base + 34 * u, X(556), base + 46 * u);
      ctx.bezierCurveTo(X(540), base + 53 * u, X(526), base + 44 * u, X(532), base + 32 * u);
      ctx.stroke();
      const dx = X(520 - peak * 480);
      ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(dx, limit, 11 * u, 0, Math.PI * 2); ctx.fill();
    } else {
      logo(ctx, W / 2 - 300, y - 40, 600, C.veld);
    }
    // Site name, centred near the bottom (above where the app puts its buttons).
    ctx.font = `800 46px ${FD}`;
    const nameW = 46 * 1.95 + ctx.measureText('jouwhockeystick.nl').width;
    siteName(ctx, (W - nameW) / 2, H - 330, 46, true);
  }

  /* ---------- audio ---------- */
  const SOUNDS = { music: 'muziek.mp3', whoosh: 'sfx-whoosh.mp3', pop: 'sfx-pop.mp3' };
  const VOLUME = { music: 0.7, whoosh: 0.22, pop: 0.35 };
  let rawSounds = null;
  async function loadRaw() {
    if (!rawSounds) {
      rawSounds = (async () => {
        const out = {};
        for (const [k, file] of Object.entries(SOUNDS)) {
          try { const r = await fetch(file); if (r.ok) out[k] = await r.arrayBuffer(); } catch (e) { /* play without this sound */ }
        }
        return out;
      })();
    }
    return rawSounds;
  }
  async function decode(ac) {
    const raw = await loadRaw();
    const out = {};
    for (const [k, buf] of Object.entries(raw)) {
      try { out[k] = await ac.decodeAudioData(buf.slice(0)); } catch (e) { /* skip */ }
    }
    return out;
  }
  function schedule(ac, buffers, out, video, fmt, tl, t0) {
    const nodes = [];
    if (buffers.music) {
      const src = ac.createBufferSource(); src.buffer = buffers.music;
      const g = ac.createGain();
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(VOLUME.music, t0 + 0.2);
      g.gain.setValueAtTime(VOLUME.music, t0 + Math.max(0.3, tl.total - 1.3));
      g.gain.linearRampToValueAtTime(0, t0 + tl.total);
      src.connect(g).connect(out); src.start(t0); src.stop(t0 + tl.total + 0.05);
      nodes.push(src);
    }
    const VOL = VOLUME;
    for (const q of cues(video, fmt, tl)) {
      const buf = buffers[q.name]; if (!buf) continue;
      const src = ac.createBufferSource(); src.buffer = buf;
      const g = ac.createGain(); g.gain.value = VOL[q.name] || 0.3;
      src.connect(g).connect(out); src.start(t0 + q.at);
      nodes.push(src);
    }
    return () => nodes.forEach((n) => { try { n.stop(); } catch (e) { /* already stopped */ } });
  }

  /* ---------- playback and recording ---------- */
  function setupCanvas(canvas, fmt) {
    const F = FORMATS[fmt];
    canvas.width = F.W; canvas.height = F.H;
    return canvas.getContext('2d');
  }
  function still(canvas, video, fmt, t) {
    const ctx = setupCanvas(canvas, fmt);
    const tl = timeline(video, fmt);
    drawFrame(ctx, video, fmt, tl, t == null ? Math.min(1.6, tl.total) : t);
    return tl;
  }
  /** Plays the video on the canvas with sound. Returns stop(). */
  async function play(canvas, video, fmt, onEnd) {
    const ctx = setupCanvas(canvas, fmt);
    const tl = timeline(video, fmt);
    const ac = new AudioContext();
    try { await ac.resume(); } catch (e) { /* silent */ }
    const buffers = await decode(ac);
    const t0 = ac.currentTime + 0.1;
    const stopAudio = schedule(ac, buffers, ac.destination, video, fmt, tl, t0);
    let alive = true;
    const stop = () => { if (!alive) return; alive = false; stopAudio(); ac.close().catch(() => {}); };
    const tick = () => {
      if (!alive) return;
      const t = Math.max(0, ac.currentTime - t0);
      drawFrame(ctx, video, fmt, tl, Math.min(t, tl.total - 0.001));
      if (t >= tl.total) { stop(); onEnd && onEnd(); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return stop;
  }
  function pickMime() {
    if (typeof MediaRecorder === 'undefined') return null;
    const list = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.4d002a,mp4a.40.2', 'video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    return list.find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || null;
  }
  /** Records the video in real time with MediaRecorder. Resolves {blob, ext, mime, h264}. */
  async function recordRealtime(video, fmt, onProgress, mime) {
    const canvas = document.createElement('canvas');
    const ctx = setupCanvas(canvas, fmt);
    const tl = timeline(video, fmt);
    const ac = new AudioContext();
    try { await ac.resume(); } catch (e) { /* continue */ }
    const buffers = await decode(ac);
    const dest = ac.createMediaStreamDestination();
    drawFrame(ctx, video, fmt, tl, 0);
    const stream = new MediaStream([...canvas.captureStream(FPS).getVideoTracks(), ...dest.stream.getAudioTracks()]);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: fmt === 'short' ? 10_000_000 : 12_000_000, audioBitsPerSecond: 160_000 });
    const chunks = [];
    rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
    const done = new Promise((r) => { rec.onstop = r; });
    rec.start(500);
    const t0 = ac.currentTime + 0.15;
    const stopAudio = schedule(ac, buffers, dest, video, fmt, tl, t0);
    await new Promise((resolve) => {
      const tick = () => {
        const t = Math.max(0, ac.currentTime - t0);
        drawFrame(ctx, video, fmt, tl, Math.min(t, tl.total - 0.001));
        if (onProgress) onProgress(Math.min(1, t / tl.total));
        if (t >= tl.total + 0.15) { resolve(); return; }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    rec.stop();
    await done;
    stopAudio();
    ac.close().catch(() => {});
    stream.getTracks().forEach((tr) => tr.stop());
    const type = mime.split(';')[0];
    return { blob: new Blob(chunks, { type }), ext: type === 'video/mp4' ? 'mp4' : 'webm', mime: type, h264: /avc1/.test(mime) };
  }

  /* ---------- MP4 (H.264) without MediaRecorder: WebCodecs plus a small MP4 writer ----------
     Browsers whose MediaRecorder only makes WebM (Firefox, the Claude desktop app, some
     Chromium builds) can often still encode H.264 frame by frame with WebCodecs. */
  const AVC_CODECS = ['avc1.640028', 'avc1.4d0028', 'avc1.4d002a', 'avc1.640032'];
  const SAMPLE_RATE = 48000;
  async function pickVideoEncoder(fmt) {
    if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') return null;
    const F = FORMATS[fmt];
    for (const codec of AVC_CODECS) {
      const cfg = { codec, width: F.W, height: F.H, bitrate: fmt === 'short' ? 10_000_000 : 12_000_000, framerate: FPS, avc: { format: 'avc' } };
      try { if ((await VideoEncoder.isConfigSupported(cfg)).supported) return cfg; } catch (e) { /* try the next profile */ }
    }
    return null;
  }
  async function pickAudioEncoder() {
    if (typeof AudioEncoder === 'undefined' || typeof AudioData === 'undefined') return null;
    for (const codec of ['mp4a.40.2', 'opus']) {
      const cfg = { codec, sampleRate: SAMPLE_RATE, numberOfChannels: 2, bitrate: 160_000 };
      try { if ((await AudioEncoder.isConfigSupported(cfg)).supported) return cfg; } catch (e) { /* try the next codec */ }
    }
    return null;
  }
  const toBytes = (d) => (d instanceof ArrayBuffer ? new Uint8Array(d.slice(0)) : new Uint8Array(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength)));
  const later = () => new Promise((r) => setTimeout(r, 0));

  /** Draws every frame and encodes it (faster than real time), mixes the sound offline, writes an MP4. */
  async function recordWebCodecs(video, fmt, onProgress, vcfg) {
    const F = FORMATS[fmt];
    const tl = timeline(video, fmt);
    const frames = Math.max(1, Math.round(tl.total * FPS));
    let failure = null;

    // Sound: the same mix as playback, rendered offline.
    let audio = null;
    const acfg = await pickAudioEncoder();
    if (acfg && typeof OfflineAudioContext !== 'undefined') {
      const oac = new OfflineAudioContext(2, Math.ceil((frames / FPS) * SAMPLE_RATE), SAMPLE_RATE);
      const buffers = await decode(oac);
      schedule(oac, buffers, oac.destination, video, fmt, tl, 0);
      const rendered = await oac.startRendering();
      const samples = [];
      let desc = null;
      const ae = new AudioEncoder({
        output: (chunk, meta) => {
          const data = new Uint8Array(chunk.byteLength); chunk.copyTo(data);
          samples.push({ data, ts: chunk.timestamp, dur: chunk.duration });
          if (!desc && meta && meta.decoderConfig && meta.decoderConfig.description) desc = toBytes(meta.decoderConfig.description);
        },
        error: (e) => { failure = e; },
      });
      ae.configure(acfg);
      const N = 4800;
      const L = rendered.getChannelData(0), R = rendered.getChannelData(1);
      for (let off = 0; off < rendered.length; off += N) {
        const n = Math.min(N, rendered.length - off);
        const data = new Float32Array(n * 2);
        data.set(L.subarray(off, off + n), 0); data.set(R.subarray(off, off + n), n);
        const ad = new AudioData({ format: 'f32-planar', sampleRate: SAMPLE_RATE, numberOfFrames: n, numberOfChannels: 2, timestamp: Math.round((off * 1e6) / SAMPLE_RATE), data });
        ae.encode(ad); ad.close();
      }
      await ae.flush(); ae.close();
      if (failure) throw failure;
      audio = { codec: acfg.codec === 'opus' ? 'opus' : 'aac', samples, desc, sampleRate: SAMPLE_RATE, channels: 2 };
    }

    // Picture: frame by frame.
    const canvas = document.createElement('canvas');
    const ctx = setupCanvas(canvas, fmt);
    const vs = [];
    let vdesc = null;
    const ve = new VideoEncoder({
      output: (chunk, meta) => {
        const data = new Uint8Array(chunk.byteLength); chunk.copyTo(data);
        vs.push({ data, key: chunk.type === 'key', ts: chunk.timestamp });
        if (!vdesc && meta && meta.decoderConfig && meta.decoderConfig.description) vdesc = toBytes(meta.decoderConfig.description);
      },
      error: (e) => { failure = e; },
    });
    ve.configure(vcfg);
    for (let i = 0; i < frames; i++) {
      if (failure) throw failure;
      drawFrame(ctx, video, fmt, tl, Math.min(i / FPS, tl.total - 0.001));
      const vf = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
      ve.encode(vf, { keyFrame: i % (FPS * 2) === 0 });
      vf.close();
      while (ve.encodeQueueSize > 6 && !failure) await new Promise((r) => setTimeout(r, 4));
      if (i % 6 === 0) { if (onProgress) onProgress(i / frames); await later(); }
    }
    await ve.flush(); ve.close();
    if (failure) throw failure;
    if (!vdesc || !vs.length) throw Object.assign(new Error('De encoder gaf geen H.264-gegevens.'), { code: 'no_avc' });
    vs.sort((a, b) => a.ts - b.ts);
    if (onProgress) onProgress(1);
    const bytes = writeMp4({ width: F.W, height: F.H, fps: FPS, samples: vs, desc: vdesc }, audio);
    return { blob: new Blob([bytes], { type: 'video/mp4' }), ext: 'mp4', mime: 'video/mp4', h264: true, sound: audio ? audio.codec : null };
  }

  /* A minimal ISO-BMFF writer: one H.264 track and optionally one AAC or Opus track,
     moov before mdat (fast start), one chunk per track. */
  function writeMp4(v, a) {
    const enc = new TextEncoder();
    const cat = (parts) => {
      const list = parts.flat(Infinity).filter(Boolean);
      const out = new Uint8Array(list.reduce((n, p) => n + p.length, 0));
      let o = 0; for (const p of list) { out.set(p, o); o += p.length; }
      return out;
    };
    const u8 = (x) => Uint8Array.of(x & 255);
    const u16 = (x) => Uint8Array.of((x >>> 8) & 255, x & 255);
    const u24 = (x) => Uint8Array.of((x >>> 16) & 255, (x >>> 8) & 255, x & 255);
    const u32 = (x) => Uint8Array.of((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255);
    const zeros = (n) => new Uint8Array(n);
    const box = (type, ...parts) => { const body = cat(parts); return cat([u32(body.length + 8), enc.encode(type), body]); };
    const full = (type, version, flags, ...parts) => box(type, u8(version), u24(flags), ...parts);
    const MATRIX = [0x10000, 0, 0, 0, 0x10000, 0, 0, 0, 0x40000000].map(u32);
    const MOVIE_TS = 1000;
    const desc = (tag, body) => cat([u8(tag), u8(body.length), body]); // bodies here stay under 128 bytes

    // Per-track sample tables.
    const vts = v.fps * 1000; // timescale; every frame lasts 1000 ticks
    const tracks = [{
      id: 1, kind: 'vide', timescale: vts,
      sizes: v.samples.map((s) => s.data.length),
      durs: v.samples.map(() => 1000),
      keys: v.samples.map((s, i) => (s.key ? i + 1 : 0)).filter(Boolean),
      data: v.samples.map((s) => s.data),
      entry: box('avc1', zeros(6), u16(1), u16(0), u16(0), zeros(12), u16(v.width), u16(v.height),
        u32(0x00480000), u32(0x00480000), u32(0), u16(1), zeros(32), u16(0x0018), u16(0xffff),
        box('avcC', v.desc), box('pasp', u32(1), u32(1))),
    }];
    if (a && a.samples.length) {
      const sr = a.sampleRate;
      const frameLen = a.codec === 'aac' ? 1024 : 960;
      const durs = a.samples.map((s, i) => {
        const next = a.samples[i + 1];
        const us = next ? next.ts - s.ts : s.dur;
        return Math.max(1, Math.round(((us || (frameLen * 1e6) / sr) * sr) / 1e6));
      });
      let codecBox;
      if (a.codec === 'aac') {
        const asc = a.desc && a.desc.length ? a.desc : Uint8Array.of(0x11, 0x90); // AAC-LC, 48 kHz, stereo
        codecBox = full('esds', 0, 0, desc(0x03, cat([u16(0), u8(0),
          desc(0x04, cat([u8(0x40), u8(0x15), u24(0), u32(160000), u32(160000), desc(0x05, asc)])),
          desc(0x06, u8(0x02))])));
      } else {
        let preSkip = 312;
        if (a.desc && a.desc.length >= 12 && new TextDecoder().decode(a.desc.subarray(0, 8)) === 'OpusHead') preSkip = a.desc[10] | (a.desc[11] << 8);
        codecBox = box('dOps', u8(0), u8(a.channels), u16(preSkip), u32(sr), u16(0), u8(0));
      }
      tracks.push({
        id: 2, kind: 'soun', timescale: sr,
        sizes: a.samples.map((s) => s.data.length), durs, keys: null, data: a.samples.map((s) => s.data),
        entry: box(a.codec === 'aac' ? 'mp4a' : 'Opus', zeros(6), u16(1), zeros(8), u16(a.channels), u16(16), u16(0), u16(0), u32(sr * 65536 >>> 0), codecBox),
      });
    }
    for (const t of tracks) {
      t.duration = t.durs.reduce((n, d) => n + d, 0);
      t.movieDuration = Math.round((t.duration * MOVIE_TS) / t.timescale);
      t.bytes = t.sizes.reduce((n, d) => n + d, 0);
    }
    const stts = (durs) => {
      const runs = [];
      for (const d of durs) { const last = runs[runs.length - 1]; if (last && last[1] === d) last[0]++; else runs.push([1, d]); }
      return full('stts', 0, 0, u32(runs.length), runs.map(([n, d]) => [u32(n), u32(d)]));
    };
    const trak = (t, offset) => box('trak',
      full('tkhd', 0, 3, u32(0), u32(0), u32(t.id), u32(0), u32(t.movieDuration), zeros(8), u16(0), u16(0),
        u16(t.kind === 'soun' ? 0x0100 : 0), u16(0), MATRIX,
        u32(t.kind === 'vide' ? v.width * 65536 : 0), u32(t.kind === 'vide' ? v.height * 65536 : 0)),
      box('mdia',
        full('mdhd', 0, 0, u32(0), u32(0), u32(t.timescale), u32(t.duration), u16(0x55c4), u16(0)),
        full('hdlr', 0, 0, u32(0), enc.encode(t.kind), zeros(12), enc.encode(t.kind === 'vide' ? 'VideoHandler' : 'SoundHandler'), u8(0)),
        box('minf',
          t.kind === 'vide' ? full('vmhd', 0, 1, zeros(8)) : full('smhd', 0, 0, u16(0), u16(0)),
          box('dinf', full('dref', 0, 0, u32(1), full('url ', 0, 1))),
          box('stbl',
            full('stsd', 0, 0, u32(1), t.entry),
            stts(t.durs),
            t.keys ? full('stss', 0, 0, u32(t.keys.length), t.keys.map(u32)) : null,
            full('stsc', 0, 0, u32(1), u32(1), u32(t.sizes.length), u32(1)),
            full('stsz', 0, 0, u32(0), u32(t.sizes.length), t.sizes.map(u32)),
            full('stco', 0, 0, u32(1), u32(offset))))));
    const ftyp = box('ftyp', enc.encode('isom'), u32(0x200), enc.encode('isomiso2avc1mp41'));
    const moov = (offsets) => box('moov',
      full('mvhd', 0, 0, u32(0), u32(0), u32(MOVIE_TS), u32(Math.max(...tracks.map((t) => t.movieDuration))),
        u32(0x10000), u16(0x0100), zeros(10), MATRIX, zeros(24), u32(tracks.length + 1)),
      tracks.map((t, i) => trak(t, offsets[i])));
    const size = moov(tracks.map(() => 0)).length; // the offsets do not change the size
    const mdatStart = ftyp.length + size + 8;
    const offsets = []; let o = mdatStart;
    for (const t of tracks) { offsets.push(o); o += t.bytes; }
    const mdatBody = tracks.reduce((n, t) => n + t.bytes, 0);
    return cat([ftyp, moov(offsets), u32(mdatBody + 8), enc.encode('mdat'), tracks.map((t) => t.data)]);
  }

  /** True when this browser can make a video file at all (MP4 or, as a last resort, WebM). */
  function canRecord() { return !!pickMime() || typeof VideoEncoder !== 'undefined'; }

  /**
   * Makes the video file. Prefers H.264-MP4 (what Instagram, TikTok and YouTube accept):
   * MediaRecorder when it can record H.264, else WebCodecs; WebM only when neither works.
   * Resolves {blob, ext, mime, h264}.
   */
  async function record(video, fmt, onProgress) {
    const mime = pickMime();
    if (mime && /avc1/.test(mime)) return recordRealtime(video, fmt, onProgress, mime);
    const vcfg = await pickVideoEncoder(fmt);
    if (vcfg) {
      try { return await recordWebCodecs(video, fmt, onProgress, vcfg); }
      catch (e) { if (!mime) throw e; /* fall back to the recorder below */ }
    }
    if (!mime) throw Object.assign(new Error('Deze browser kan geen video opnemen.'), { code: 'no_recorder' });
    return recordRealtime(video, fmt, onProgress, mime);
  }

  const fontsReady = (async () => {
    try {
      await Promise.race([
        Promise.all([`800 80px ${FD}`, `400 40px ${FB}`, `600 40px ${FB}`].map((f) => document.fonts.load(f))),
        new Promise((r) => setTimeout(r, 4000)),
      ]);
    } catch (e) { /* fallback faces */ }
  })();

  const canH264 = () => /avc1/.test(pickMime() || '') || typeof VideoEncoder !== 'undefined';
  // cues, SOUNDS and VOLUME are used by video/studio/render.mjs to mix the same sound in ffmpeg.
  return { FORMATS, FPS, canH264, timeline, drawFrame, cues, SOUNDS, VOLUME, still, play, record, canRecord, writeMp4, thumbnail, thumbnailShort, pickMime, fontsReady, loadRaw, duration: (v, fmt) => timeline(v, fmt).total };
})();
