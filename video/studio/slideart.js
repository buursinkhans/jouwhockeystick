/*
 * SlideArt: the slide renderer of the Social-studio (Instagram posts, 1080 x 1350),
 * moved here unchanged from the studio page on 2026-11-10 (docs/marketing/bouwplan-2.0.md).
 * The studio and the workflow social-render.yml load this same file, so a post looks
 * the same in the studio and in Metricool. Browser code: needs a canvas and document.fonts.
 */
/* Draws Instagram slides (1080 x 1350) in the jouwhockeystick.nl house style. */
window.SlideArt = (() => {
  const W = 1080, H = 1350, PAD = 96;
  // Square crop (1080 x 1080) trims 135 px top and bottom: keep everything inside that band.
  const TOP = 175, BOT = 175;
  const C = { veld: '#1846A3', inkt: '#0D1B2E', bal: '#FF8A1F', krijt: '#EEF3FA', grijs: '#5B6B7F', nl: '#C9D6F0', wit: '#FFFFFF', rand: '#D5DEEA' };
  const FD = '"Bricolage Grotesque", "Segoe UI", sans-serif';
  const FB = '"Instrument Sans", "Segoe UI", sans-serif';
  const STICK = new Path2D('M58 32 L58 67 C58 82 50 88 40 85');
  const GRIP = new Path2D('M50 40 L66 38 M50 48 L66 46');

  const str = (v, max = 400) => (typeof v === 'string' ? v : v == null ? '' : String(v)).slice(0, max);

  function wrap(ctx, text, maxW) {
    const out = [];
    for (const para of str(text, 2000).split('\n')) {
      const words = para.split(/\s+/).filter(Boolean);
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width <= maxW || !line) line = test;
        else { out.push(line); line = w; }
      }
      out.push(line);
    }
    return out;
  }
  // Largest size (stepping down) at which text fits the box; at the floor, lines are cut with an ellipsis.
  function fit(ctx, text, weight, family, maxW, maxH, maxSize, minSize, lh) {
    for (let size = maxSize; size >= minSize; size -= 2) {
      ctx.font = `${weight} ${size}px ${family}`;
      const lines = wrap(ctx, text, maxW);
      if (lines.length * size * lh <= maxH) return { size, lines, height: lines.length * size * lh };
    }
    ctx.font = `${weight} ${minSize}px ${family}`;
    const max = Math.max(1, Math.floor(maxH / (minSize * lh)));
    const lines = wrap(ctx, text, maxW).slice(0, max);
    if (lines.length) lines[lines.length - 1] = lines[lines.length - 1].replace(/\s*\S*$/, '') + '…';
    return { size: minSize, lines, height: lines.length * minSize * lh };
  }
  function draw(ctx, block, x, y, lh, align = 'left') {
    ctx.textAlign = align;
    block.lines.forEach((l, i) => ctx.fillText(l, x, y + i * block.size * lh));
    ctx.textAlign = 'left';
  }
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
  function badge(ctx, x, y, s) { // the app icon: a veldblauw square with the stick
    ctx.fillStyle = C.veld; ctx.beginPath(); ctx.roundRect(x, y, s, s, s * 0.22); ctx.fill();
    logo(ctx, x, y, s, C.veld);
  }
  function footer(ctx, dark, idx, total) {
    const y = H - BOT - 56;
    if (dark) logo(ctx, PAD - 18, y - 6, 72, dark === 'veld' ? C.veld : C.inkt);
    else badge(ctx, PAD, y, 56);
    ctx.fillStyle = dark ? C.wit : C.inkt;
    ctx.font = `600 34px ${FB}`; ctx.textBaseline = 'middle';
    ctx.fillText('jouwhockeystick.nl', PAD + 76, y + 28);
    if (total > 1) {
      ctx.textAlign = 'right'; ctx.fillStyle = dark ? C.nl : C.grijs; ctx.font = `500 30px ${FB}`;
      ctx.fillText(idx === 0 ? 'Swipe →' : `${idx + 1}/${total}`, W - PAD, y + 28);
      ctx.textAlign = 'left';
    }
    ctx.textBaseline = 'top';
  }
  function heading(ctx, text, color, maxH, maxSize = 84) {
    ctx.fillStyle = color;
    const b = fit(ctx, text, 800, FD, W - 2 * PAD, maxH, maxSize, 48, 1.08);
    draw(ctx, b, PAD, TOP, 1.08);
    return TOP + b.height;
  }
  const bottom = H - BOT - 96;

  function opening(ctx, s, idx, total) {
    ctx.fillStyle = C.veld; ctx.fillRect(0, 0, W, H);
    // Pitch lines: the shooting circle and the dashed 5-metre line, faint.
    ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(W / 2, H + 80, 560, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.setLineDash([28, 26]); ctx.beginPath(); ctx.arc(W / 2, H + 80, 760, Math.PI, 2 * Math.PI); ctx.stroke(); ctx.setLineDash([]);
    ctx.textBaseline = 'top';
    let y = 250;
    const kicker = str(s.boven, 60);
    if (kicker) {
      ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(PAD + 14, y + 20, 14, 0, Math.PI * 2); ctx.fill();
      ctx.font = `600 34px ${FB}`; ctx.fillStyle = C.nl;
      ctx.fillText(kicker.toUpperCase().split('').join(String.fromCharCode(8202)), PAD + 46, y + 2);
      y += 90;
    }
    ctx.fillStyle = C.wit;
    const b = fit(ctx, str(s.kop, 140), 800, FD, W - 2 * PAD, 600, 124, 64, 1.04);
    draw(ctx, b, PAD, y, 1.04);
    y += b.height + 44;
    if (str(s.tekst)) {
      ctx.fillStyle = C.nl;
      const t = fit(ctx, str(s.tekst, 240), 400, FB, W - 2 * PAD - 60, bottom - 80 - y, 46, 32, 1.3);
      draw(ctx, t, PAD, y, 1.3);
    }
    footer(ctx, 'veld', idx, total);
  }
  function tekst(ctx, s, idx, total) {
    ctx.fillStyle = C.krijt; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top';
    const y = heading(ctx, str(s.kop, 120), C.veld, 320) + 48;
    ctx.fillStyle = C.inkt;
    const t = fit(ctx, str(s.tekst, 600), 400, FB, W - 2 * PAD, bottom - y, 52, 32, 1.38);
    draw(ctx, t, PAD, y, 1.38);
    footer(ctx, null, idx, total);
  }
  function lijst(ctx, s, idx, total) {
    ctx.fillStyle = C.krijt; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top';
    const top = heading(ctx, str(s.kop, 120), C.veld, 300) + 56;
    const items = (Array.isArray(s.punten) ? s.punten : []).slice(0, 6).map((p) => str(p, 200));
    const textW = W - 2 * PAD - 64;
    for (let size = 50; size >= 30; size -= 2) {
      ctx.font = `400 ${size}px ${FB}`;
      const blocks = items.map((p) => wrap(ctx, p, textW));
      const gap = size * 0.7;
      const h = blocks.reduce((a, l) => a + l.length * size * 1.3, 0) + gap * (blocks.length - 1);
      if (h <= bottom - top || size === 30) {
        let y = top;
        blocks.forEach((lines) => {
          ctx.fillStyle = C.bal; ctx.beginPath(); ctx.arc(PAD + 14, y + size * 0.62, Math.max(10, size * 0.24), 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = C.inkt;
          lines.forEach((l, i) => ctx.fillText(l, PAD + 64, y + i * size * 1.3));
          y += lines.length * size * 1.3 + gap;
        });
        break;
      }
    }
    footer(ctx, null, idx, total);
  }
  function tabel(ctx, s, idx, total) {
    ctx.fillStyle = C.krijt; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top';
    let y = heading(ctx, str(s.kop, 100), C.veld, 220, 76) + 40;
    const head = (Array.isArray(s.kolommen) ? s.kolommen : []).slice(0, 2).map((v) => str(v, 40));
    const rows = (Array.isArray(s.rijen) ? s.rijen : []).slice(0, 12).map((r) => (Array.isArray(r) ? r : []).slice(0, 2).map((v) => str(v, 40)));
    const note = str(s.voetnoot, 160);
    const avail = bottom - y - (note ? 70 : 0);
    const rowH = Math.min(84, Math.floor(avail / (rows.length + 1)));
    const fs = Math.round(rowH * 0.44);
    const x0 = PAD, x1 = W - PAD;
    ctx.textBaseline = 'middle';
    ctx.fillStyle = C.veld; ctx.beginPath(); ctx.roundRect(x0, y, x1 - x0, rowH, 14); ctx.fill();
    ctx.fillStyle = C.wit; ctx.font = `600 ${fs}px ${FB}`;
    ctx.fillText(head[0] || '', x0 + 32, y + rowH / 2);
    ctx.textAlign = 'right'; ctx.fillText(head[1] || '', x1 - 32, y + rowH / 2); ctx.textAlign = 'left';
    y += rowH;
    rows.forEach((r, i) => {
      if (i % 2 === 0) { ctx.fillStyle = C.wit; ctx.fillRect(x0, y, x1 - x0, rowH); }
      ctx.fillStyle = C.inkt; ctx.font = `400 ${fs}px ${FB}`;
      ctx.fillText(r[0] || '', x0 + 32, y + rowH / 2);
      ctx.font = `800 ${fs}px ${FD}`; ctx.fillStyle = C.veld; ctx.textAlign = 'right';
      ctx.fillText(r[1] || '', x1 - 32, y + rowH / 2); ctx.textAlign = 'left';
      y += rowH;
    });
    ctx.textBaseline = 'top';
    if (note) {
      ctx.fillStyle = C.grijs;
      const n = fit(ctx, note, 400, FB, x1 - x0, 80, 28, 22, 1.3);
      draw(ctx, n, x0, y + 24, 1.3);
    }
    footer(ctx, null, idx, total);
  }
  function slot(ctx, s, idx, total) {
    ctx.fillStyle = C.inkt; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'top';
    logo(ctx, W / 2 - 130, TOP, 260, C.inkt);
    let y = TOP + 300;
    ctx.fillStyle = C.wit;
    const k = fit(ctx, str(s.kop, 100), 800, FD, W - 2 * PAD, 200, 84, 48, 1.06);
    draw(ctx, k, W / 2, y, 1.06, 'center'); y += k.height + 36;
    if (str(s.tekst)) {
      ctx.fillStyle = C.nl;
      const t = fit(ctx, str(s.tekst, 240), 400, FB, W - 2 * PAD - 40, 200, 44, 30, 1.32);
      draw(ctx, t, W / 2, y, 1.32, 'center'); y += t.height + 56;
    }
    const label = str(s.knop, 40) || 'Doe de stickwijzer';
    ctx.font = `800 46px ${FD}`;
    const bw = Math.min(W - 2 * PAD, ctx.measureText(label).width + 120);
    ctx.fillStyle = C.bal; ctx.beginPath(); ctx.roundRect(W / 2 - bw / 2, y, bw, 112, 56); ctx.fill();
    ctx.fillStyle = C.inkt; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, W / 2, y + 58);
    ctx.fillStyle = C.wit; ctx.font = `600 40px ${FB}`;
    ctx.fillText('jouwhockeystick.nl', W / 2, y + 112 + 80);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    if (total > 1) { ctx.fillStyle = C.nl; ctx.font = `500 30px ${FB}`; ctx.textAlign = 'right'; ctx.fillText(`${idx + 1}/${total}`, W - PAD, H - BOT - 40); ctx.textAlign = 'left'; }
  }
  const KINDS = { opening, tekst, lijst, tabel, slot };

  function render(canvas, slide, idx, total) {
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const s = slide && typeof slide === 'object' ? slide : {};
    (KINDS[s.soort] || tekst)(ctx, s, idx, total);
  }
  const fontsReady = (async () => {
    try {
      await Promise.race([
        Promise.all([`800 80px ${FD}`, `400 40px ${FB}`, `500 40px ${FB}`, `600 40px ${FB}`].map((f) => document.fonts.load(f))),
        new Promise((r) => setTimeout(r, 4000)),
      ]);
    } catch (e) { /* draw with the fallback faces */ }
  })();
  return { render, fontsReady, W, H };
})();
