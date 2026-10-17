/* 番茄讀書會：房間背景音樂（瀏覽器即時合成，不用下載音檔）
   爵士：走路貝斯 + 七和弦鋼琴 + 刷鼓；輕音樂：溫柔的和弦鋪底 + 鈴聲旋律；風吹聲：錄好的風聲循環（sounds/wind.mp3）；柴火：隨機的劈啪聲；
   雨聲：細密的雨 + 偶爾滴在窗台的水滴；Lo-fi：慢板的悶鋼琴 + 鼓 + 黑膠雜訊；森林：鳥叫；
   鋼琴：慢板的分解和弦獨奏；海浪：一波波的浪潮 + 偶爾的海鷗 */
(function () {
  // 兩個聲道：music（一般音樂）和 amb（風吹聲等環境音），可以同時播、各自調音量
  var ctx = null, L = null, layers = {
    music: { name: "music", master: null, verb: null, cur: "", timer: null, nextT: 0, step: 0, vol: 0.3, noiseSrc: null, nodes: [] },
    amb: { name: "amb", master: null, verb: null, cur: "", timer: null, nextT: 0, step: 0, vol: 0.3, noiseSrc: null, nodes: [] }
  };
  L = layers.music;

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    var len = ctx.sampleRate * 2.4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    Object.keys(layers).forEach(function (k) {
      var y = layers[k];
      y.master = ctx.createGain(); y.master.gain.value = 0; y.master.connect(ctx.destination);
      y.verb = ctx.createConvolver(); y.verb.buffer = buf;
      var wet = ctx.createGain(); wet.gain.value = 0.28; y.verb.connect(wet); wet.connect(y.master);
    });
    return ctx;
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function out(g, rev) { g.connect(L.master); if (rev) g.connect(L.verb); }

  function tone(type, midi, t, dur, gain, opt) {
    opt = opt || {};
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = hz(midi);
    if (opt.detune) o.detune.value = opt.detune;
    var a = opt.attack || 0.005;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var last = g;
    if (opt.lp) { var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = opt.lp; g.connect(f); last = f; }
    o.connect(g); out(last, opt.rev);
    o.start(t); o.stop(t + dur + 0.05);
  }
  var noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    var len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noiseBuf.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function hat(t, gain, dur) {
    var s = ctx.createBufferSource(); s.buffer = noise();
    var f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 6500;
    var g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); out(g, false); s.start(t, Math.random()); s.stop(t + dur + 0.02);
  }
  function piano(midi, t, dur, gain) {
    tone("triangle", midi, t, dur, gain, { rev: true, lp: 2400 });
    tone("sine", midi + 12, t, dur * 0.6, gain * 0.25, { rev: true });
  }

  /* 爵士：Dm7 G7 Cmaj7 A7 / Em7 A7 Dm7 G7，搖擺節奏 */
  var JZ = [[50, [53, 57, 60, 64]], [43, [53, 59, 62, 65]], [48, [52, 55, 59, 62]], [45, [55, 61, 64, 67]],
            [52, [55, 59, 62, 66]], [45, [55, 61, 64, 67]], [50, [53, 57, 60, 64]], [43, [53, 59, 62, 65]]];
  function jazzBeat(t, beat) {
    var spb = 60 / 112, bar = Math.floor(beat / 4) % JZ.length, b = beat % 4, ch = JZ[bar];
    var root = ch[0], tones = [root].concat(ch[1].slice(1));
    // 走路貝斯
    var nb = JZ[(bar + 1) % JZ.length][0], bn;
    if (b === 0) bn = root; else if (b === 3) bn = nb + (Math.random() < 0.5 ? 1 : -1); else bn = tones[1 + Math.floor(Math.random() * 3)];
    while (bn > 50) bn -= 12; while (bn < 33) bn += 12;
    tone("triangle", bn, t, spb * 0.9, 0.32, { lp: 700 });
    // 鼓：ride 在每拍，搖擺的後半拍
    hat(t, b % 2 ? 0.07 : 0.05, 0.12);
    if (Math.random() < 0.7) hat(t + spb * 2 / 3, 0.035, 0.08);
    // 鋼琴伴奏
    if ((b === 1 && Math.random() < 0.6) || (b === 3 && Math.random() < 0.5) || (b === 0 && beat % 8 === 0)) {
      var off = Math.random() < 0.5 ? spb * 2 / 3 : 0;
      ch[1].forEach(function (m, i) { piano(m, t + off + i * 0.008, 0.6, 0.055); });
    }
    // 偶爾來一點旋律
    if (Math.random() < 0.28) piano(ch[1][Math.floor(Math.random() * 4)] + 12, t + (Math.random() < 0.5 ? spb * 2 / 3 : 0), 0.45, 0.06);
    return spb;
  }

  /* 輕音樂：Fmaj7 Em7 Dm7 Cmaj7，慢慢鋪底加鈴聲 */
  var LF = [[41, [57, 60, 64, 65]], [40, [55, 59, 62, 64]], [38, [53, 57, 60, 62]], [36, [52, 55, 59, 60]]];
  var PENTA = [72, 74, 76, 79, 81, 84];
  function lightBeat(t, beat) {
    var spb = 60 / 68, bar = Math.floor(beat / 4) % LF.length, b = beat % 4, ch = LF[bar];
    if (b === 0) {
      tone("sine", ch[0], t, spb * 4.2, 0.22, { attack: 0.4, rev: true });
      ch[1].forEach(function (m, i) { tone("triangle", m, t + i * 0.12, spb * 4, 0.035, { attack: 0.6, rev: true, lp: 1500, detune: (i - 1.5) * 4 }); });
    }
    if (Math.random() < 0.55) tone("sine", PENTA[Math.floor(Math.random() * PENTA.length)], t + (Math.random() < 0.4 ? spb / 2 : 0), 1.6, 0.07, { rev: true });
    if (b === 2 && Math.random() < 0.5) piano(ch[1][Math.floor(Math.random() * 4)], t, 1.4, 0.05);
    return spb;
  }

  function crackle(t, big) {
    var s = ctx.createBufferSource(); s.buffer = noise();
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = big ? 900 + Math.random() * 900 : 1800 + Math.random() * 3500; f.Q.value = big ? 0.8 : 1.5;
    var g = ctx.createGain(), dur = big ? 0.05 + Math.random() * 0.08 : 0.004 + Math.random() * 0.02, a = big ? 0.5 : 0.08 + Math.random() * 0.25;
    g.gain.setValueAtTime(a, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    var pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    s.connect(f); f.connect(g);
    if (pan) { pan.pan.value = Math.random() * 1.2 - 0.6; g.connect(pan); out(pan, big); } else out(g, big);
    s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02);
  }
  function fireBeat(t) {
    // 一小段時間內丟幾個劈啪聲，有時一串連著響
    var spb = 0.25, n = Math.random() < 0.25 ? 0 : 1 + Math.floor(Math.random() * 3);
    if (Math.random() < 0.08) n += 4;
    for (var i = 0; i < n; i++) crackle(t + Math.random() * spb, false);
    if (Math.random() < 0.03) crackle(t + Math.random() * spb, true);
    return spb;
  }

  // 一層會循環的噪音底：type 是濾波器種類，k 越小聲音越低沉
  function bed(k, type, freq, q, gain, lfoRate, lfoDepth) {
    var len = ctx.sampleRate * 4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = k >= 1 ? w : (last + k * w) / (1 + k); d[i] = k >= 1 ? w * 0.5 : last * 3; }
    }
    var src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    var f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 0.7;
    var g = ctx.createGain(); g.gain.value = gain;
    src.connect(f); f.connect(g); g.connect(L.master); src.start(0, Math.random() * 3);
    L.nodes.push(src);
    if (lfoRate) { var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = lfoRate; lg.gain.value = lfoDepth; lfo.connect(lg); lg.connect(g.gain); lfo.start(); L.nodes.push(lfo); }
  }
  function sweep(f0, f1, t, dur, gain, pan) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(gain, t + Math.min(0.01, dur / 3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    if (ctx.createStereoPanner) { var pn = ctx.createStereoPanner(); pn.pan.value = pan || 0; g.connect(pn); out(pn, true); } else out(g, true);
    o.start(t); o.stop(t + dur + 0.02);
  }

  /* 雨聲 */
  function startRain() {
    bed(1, "bandpass", 2600, 0.5, 0.22, 0.07, 0.05);   // 細雨
    bed(0.02, "lowpass", 500, 0.7, 0.5, 0.05, 0.12);    // 遠處的雨勢
  }
  function rainBeat(t) {
    var spb = 0.2, n = Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++) { var f = 1800 + Math.random() * 2600; sweep(f, f * 0.55, t + Math.random() * spb, 0.03 + Math.random() * 0.03, 0.03 + Math.random() * 0.05, Math.random() * 1.6 - 0.8); }
    return spb;
  }

  /* Lo-fi：Ebmaj7 Cm7 Fm7 Bb7，75 BPM，鼓有點晃 */
  var LO = [[39, [55, 58, 62, 63]], [36, [51, 55, 58, 62]], [41, [56, 60, 63, 65]], [34, [53, 56, 58, 62]]];
  function kick(t) { var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.18); g.gain.setValueAtTime(0.45, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(g); out(g, false); o.start(t); o.stop(t + 0.32); }
  function snare(t) {
    var s = ctx.createBufferSource(); s.buffer = noise();
    var f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 0.6;
    var g = ctx.createGain(); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    s.connect(f); f.connect(g); out(g, true); s.start(t, Math.random()); s.stop(t + 0.2);
  }
  function lofiBeat(t, beat) {
    var spb = 60 / 75 / 2, bar = Math.floor(beat / 8) % LO.length, b = beat % 8, ch = LO[bar];
    var sw = b % 2 ? spb * 0.12 : 0; t += sw;   // 搖晃的後半拍
    if (b === 0 || b === 5) kick(t);
    if (b === 2 || b === 6) snare(t);
    hat(t, b % 2 ? 0.018 : 0.03, 0.05);
    if (b === 0) {
      tone("sine", ch[0], t, spb * 7, 0.26, { lp: 300 });
      ch[1].forEach(function (m, i) { tone("triangle", m, t + i * 0.03, spb * 5, 0.045, { rev: true, lp: 900, detune: -8 + i * 5, attack: 0.02 }); });
    }
    if ((b === 3 || b === 7) && Math.random() < 0.55) tone("triangle", ch[1][Math.floor(Math.random() * 4)] + 12, t, spb * 2, 0.05, { rev: true, lp: 1300 });
    if (Math.random() < 0.5) { var s = ctx.createBufferSource(); s.buffer = noise(); var g = ctx.createGain(); g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.004); s.connect(g); out(g, false); s.start(t + Math.random() * spb, Math.random()); s.stop(t + spb); }
    return spb;
  }

  /* 森林 */
  function bird(t, pan) {
    var kind = Math.floor(Math.random() * 3), base = 2600 + Math.random() * 1600, v = 0.35;
    if (kind === 0) for (var i = 0; i < 2 + Math.floor(Math.random() * 3); i++) sweep(base, base * 1.35, t + i * 0.11, 0.07, 0.05 * v, pan);            // 啾啾啾
    else if (kind === 1) { sweep(base * 0.8, base * 1.2, t, 0.18, 0.05 * v, pan); sweep(base * 1.25, base * 0.75, t + 0.2, 0.25, 0.045 * v, pan); }       // 長鳴
    else for (var j = 0; j < 6; j++) sweep(base * 1.1, base * 0.9, t + j * 0.045, 0.04, 0.035 * v, pan);                                          // 顫音
  }
  function forestBeat(t) {
    var spb = 0.5;
    if (Math.random() < 0.14) bird(t + Math.random() * spb, Math.random() * 1.6 - 0.8);
    return spb;
  }

  /* 鋼琴：Cmaj7 Am7 Fmaj7 G6，慢慢的分解和弦 + 右手旋律 */
  var PN = [[36, [48, 55, 60, 64, 67, 71]], [33, [45, 52, 57, 60, 64, 67]], [29, [41, 48, 53, 57, 60, 64]], [31, [43, 50, 55, 59, 62, 64]]];
  function pianoBeat(t, beat) {
    var spb = 60 / 72 / 2, bar = Math.floor(beat / 8) % PN.length, b = beat % 8, ch = PN[bar];
    if (b === 0) piano(ch[0], t, spb * 9, 0.09);
    piano(ch[1][[0, 1, 2, 3, 4, 3, 2, 1][b]], t + Math.random() * 0.015, spb * 3.5, 0.045);
    if ((b === 0 || b === 3 || b === 6) && Math.random() < 0.6) piano(ch[1][3 + Math.floor(Math.random() * 3)] + 12, t, spb * 4, 0.06);
    return spb;
  }

  /* 波沙諾瓦：Am7 D7 Gmaj7 Cmaj7 / F#m7b5 B7 Em7 E7，尼龍吉他切分 + 沙鈴 */
  var BS = [[45, [55, 60, 64, 67]], [38, [54, 57, 60, 64]], [43, [54, 59, 62, 66]], [36, [55, 59, 62, 64]],
            [42, [52, 57, 60, 64]], [35, [51, 57, 59, 63]], [40, [50, 55, 59, 62]], [40, [50, 56, 59, 62]]];
  var BS_COMP = [[1, 0, 0, 1, 0, 0, 1, 0], [0, 0, 1, 0, 0, 1, 0, 0]];
  function nylon(midi, t, dur, gain) { tone("triangle", midi, t, dur, gain, { rev: true, lp: 1800 }); tone("sine", midi, t, dur * 0.4, gain * 0.5, { rev: false }); }
  function bossaBeat(t, beat) {
    var spb = 60 / 132 / 2, bar = Math.floor(beat / 8) % BS.length, b = beat % 8, ch = BS[bar];
    // 貝斯：根音、五度來回
    if (b === 0 || b === 4) tone("triangle", ch[0], t, spb * 2.6, 0.26, { lp: 600 });
    if (b === 3 || b === 7) tone("triangle", ch[0] + 7, t, spb * 1.4, 0.18, { lp: 600 });
    // 吉他和弦切分
    if (BS_COMP[Math.floor(beat / 8) % 2][b]) ch[1].forEach(function (m, i) { nylon(m, t + i * 0.012, spb * 1.6, 0.04); });
    // 沙鈴
    hat(t, b % 2 ? 0.035 : 0.022, 0.06);
    // 偶爾一句旋律
    if (b === 5 && Math.random() < 0.35) piano(ch[1][1 + Math.floor(Math.random() * 3)] + 12, t, spb * 3, 0.05);
    return spb;
  }

  /* 音樂盒：C G Am F，高音小鈴分解和弦，慢慢轉 */
  var MB = [[48, [72, 76, 79, 84, 79, 76]], [43, [71, 74, 79, 83, 79, 74]], [45, [72, 76, 81, 84, 81, 76]], [41, [72, 77, 81, 84, 81, 77]]];
  function musicboxBeat(t, beat) {
    var spb = 60 / 84 / 2, bar = Math.floor(beat / 6) % MB.length, b = beat % 6, ch = MB[bar];
    var m = ch[1][b];
    tone("sine", m, t, 1.4, 0.07, { rev: true });
    tone("sine", m + 24, t, 0.25, 0.012, { rev: true, detune: 6 });   // 金屬片的泛音
    if (b === 0) tone("sine", ch[0] + 24, t, spb * 6, 0.05, { rev: true });
    if (b === 3 && Math.random() < 0.4) tone("sine", ch[1][3] + 12, t + spb / 2, 0.9, 0.035, { rev: true });
    return spb;
  }

  /* 民謠吉他：G Em C D，指彈 Travis 撥法，拇指交替低音 */
  var FG = [[43, 50, [59, 62, 67]], [40, 47, [55, 59, 64]], [36, 43, [55, 60, 64]], [38, 45, [54, 57, 62]]];
  function folkBeat(t, beat) {
    var spb = 60 / 88 / 2, bar = Math.floor(beat / 8) % FG.length, b = beat % 8, ch = FG[bar], sw = b % 2 ? 0.02 : 0;
    if (b % 2 === 0) nylon(b % 4 === 0 ? ch[0] : ch[1], t, spb * 3, 0.07);
    else nylon(ch[2][[0, 1, 2, 1][(b - 1) / 2]], t + sw, spb * 2.5, 0.045);
    if (b === 0 && Math.random() < 0.5) nylon(ch[2][2] + 12, t + spb * 0.5, spb * 4, 0.03);
    return spb;
  }

  /* 和風：古箏撥弦，都節音階（ミ ファ ラ シ ド），慢慢彈，偶爾一個低音 */
  var KOTO = [64, 65, 69, 71, 72, 76, 77, 81];
  var KO_PAT = [[0, 2, 4, 5], [7, 5, 4, 2], [3, 4, 2, 1], [0, 1, 2, -1], [4, 6, 7, 5], [4, 3, 2, 0], [2, 3, 1, 0], [0, -1, -1, -1]];
  function koto(midi, t, gain) {
    tone("triangle", midi, t, 1.6, gain, { rev: true, lp: 2600 });
    tone("sine", midi + 12, t, 0.35, gain * 0.35, { rev: true });
    tone("sawtooth", midi, t, 0.06, gain * 0.25, { lp: 3500 });   // 指甲撥到弦的那一下
  }
  function kotoBeat(t, beat) {
    var spb = 60 / 66 / 2, ph = Math.floor(beat / 4) % KO_PAT.length, n = KO_PAT[ph][beat % 4];
    if (n >= 0) koto(KOTO[n], t + (Math.random() - 0.5) * 0.03, 0.06);
    if (beat % 16 === 0) { koto(40, t, 0.07); koto(52, t + 0.02, 0.04); }
    if (beat % 8 === 6 && Math.random() < 0.35) { koto(KOTO[n >= 0 ? n : 0] + 12, t + spb * 0.5, 0.03); }
    return spb;
  }

  /* 太空電子：Am F C G，柔軟的合成器長音鋪底，上面一串閃閃的琶音 */
  var SY = [[45, [57, 60, 64, 69]], [41, [57, 60, 65, 69]], [48, [55, 60, 64, 67]], [43, [55, 59, 62, 67]]];
  function synthBeat(t, beat) {
    var spb = 60 / 100 / 2, bar = Math.floor(beat / 16) % SY.length, b = beat % 16, ch = SY[bar];
    if (b === 0) {
      tone("sine", ch[0], t, spb * 16, 0.07, { attack: 0.3 });
      ch[1].forEach(function (m, i) { tone("sawtooth", m, t, spb * 16, 0.012, { attack: 1.5, lp: 900, rev: true, detune: (i % 2 ? 7 : -7) }); });
    }
    var arp = ch[1][[0, 1, 2, 3, 2, 1, 2, 3][b % 8]] + 12;
    tone("square", arp, t, spb * 0.9, 0.012, { lp: 2200, rev: true });
    tone("sine", arp + 12, t, spb * 1.5, 0.01, { rev: true });
    if (b % 4 === 2 && Math.random() < 0.3) tone("sine", arp + 24, t, 0.6, 0.012, { rev: true, detune: 10 });
    return spb;
  }

  /* 咖啡廳：錄音素材（Moodist 的 cafe，CC0／Pixabay 授權），剪成 60 秒、頭尾交叉淡化可無縫循環 */
  function cafeBeat() { return 0.5; }

  /* 錄音素材：夏夜蟲鳴（使用者提供的 30 秒循環）、咖啡廳。頭尾各裁一點，接縫比較不會喀一聲 */
  var samples = {}, SAMPLE_GAIN = { night: 1.4, cafe: 3, noise: 5 };
  function startSample(url) {
    var y = L, kind = y.cur;
    function go(buf) {
      if (y.cur !== kind) return;
      var src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      src.loopStart = 0.05; src.loopEnd = Math.max(0.1, buf.duration - 0.05);
      var g = ctx.createGain(); g.gain.value = SAMPLE_GAIN[kind] || 1;
      src.connect(g); g.connect(y.master); src.start(0, 0.05);
      y.nodes.push(src);
    }
    if (samples[url]) { go(samples[url]); return; }
    fetch(url).then(function (r) { return r.arrayBuffer(); })
      .then(function (ab) { return new Promise(function (ok, no) { ctx.decodeAudioData(ab, ok, no); }); })
      .then(function (buf) { samples[url] = buf; go(buf); })
      .catch(function () {});
  }
  function nightBeat() { return 0.5; }

  /* 海浪 */
  function startWaves() {
    bed(0.02, "lowpass", 700, 0.7, 0.35, 0.09, 0.28);   // 一波波湧上來的浪
    bed(1, "bandpass", 3500, 0.4, 0.06, 0.09, 0.05);     // 退潮時的細沙聲
  }
  function wavesBeat(t) {
    var spb = 0.5;
    if (Math.random() < 0.03) { var b = 1500 + Math.random() * 500, p = Math.random() * 1.4 - 0.7; sweep(b, b * 0.7, t, 0.32, 0.02, p); sweep(b * 1.05, b * 0.75, t + 0.4, 0.28, 0.016, p); }   // 海鷗
    return spb;
  }

  function loop() {
    while (L.nextT < ctx.currentTime + 0.4) {
      var cur = L.cur, nextT = L.nextT, step = L.step;
      var d = cur === "jazz" ? jazzBeat(nextT, step) : cur === "fire" ? fireBeat(nextT) : cur === "rain" ? rainBeat(nextT) :
        cur === "lofi" ? lofiBeat(nextT, step) : cur === "forest" ? forestBeat(nextT) :
        cur === "piano" ? pianoBeat(nextT, step) : cur === "waves" ? wavesBeat(nextT) :
        cur === "bossa" ? bossaBeat(nextT, step) : cur === "musicbox" ? musicboxBeat(nextT, step) :
        cur === "folk" ? folkBeat(nextT, step) : cur === "koto" ? kotoBeat(nextT, step) : cur === "synth" ? synthBeat(nextT, step) : cur === "cafe" ? cafeBeat() : cur === "night" ? nightBeat() : lightBeat(nextT, step);
      L.nextT += d; L.step++;
    }
  }

  function stopAll(y) {
    clearInterval(y.timer); y.timer = null;
    if (y.noiseSrc) { try { y.noiseSrc.stop(); } catch (e) {} y.noiseSrc = null; }
    y.nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); y.nodes = [];
  }
  var AMB = { noise: 1, fire: 1, rain: 1, forest: 1, waves: 1, cafe: 1, night: 1 };
  function layerOf(kind, layer) { return layers[layer || (AMB[kind] ? "amb" : "music")] || layers.music; }

  function play(kind, layer) {
    var y = layerOf(kind, layer);
    if (!kind) { stop(y.name); return true; }
    if (!ensure()) return false;
    if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} }
    if (kind === y.cur) { unlock(); return true; }
    stopAll(y); y.cur = kind; L = y;
    var t = ctx.currentTime;
    y.master.gain.cancelScheduledValues(t); y.master.gain.setValueAtTime(0, t); y.master.gain.linearRampToValueAtTime(y.vol, t + 1.2);
    if (kind === "noise") startSample("sounds/wind.mp3");  // 原本的白噪音，現在是風吹聲
    else {
      if (kind === "rain") startRain(); if (kind === "waves") startWaves(); if (kind === "cafe") startSample("sounds/cafe.mp3"); if (kind === "night") startSample("sounds/night.mp3");
      y.nextT = t + 0.1; y.step = 0; loop();
      y.timer = setInterval(function () { L = y; loop(); }, 100);
    }
    unlock();
    return true;
  }
  function stop(layer) {
    var list = layer ? [layers[layer]] : [layers.music, layers.amb];
    list.forEach(function (y) {
      if (!y) return;
      y.cur = "";
      if (!ctx || !y.master) return;
      var t = ctx.currentTime;
      y.master.gain.cancelScheduledValues(t); y.master.gain.setValueAtTime(y.master.gain.value, t); y.master.gain.linearRampToValueAtTime(0, t + 0.5);
      setTimeout(function () { if (!y.cur) stopAll(y); }, 600);
    });
    if (silent && !silent.paused && !anyOn()) silent.pause();
  }
  function anyOn() { return !!(layers.music.cur || layers.amb.cur); }
  function setVolume(v, layer) {
    var y = layers[layer || "music"] || layers.music;
    y.vol = Math.max(0, Math.min(1, v));
    if (ctx && y.cur && y.master) y.master.gain.setTargetAtTime(y.vol, ctx.currentTime, 0.1);
  }

  // 手機（尤其 iPhone）：要在使用者點擊時解鎖，並放一段無聲的 <audio>，
  // 不然靜音開關打開時 Web Audio 不會出聲，非同步建立的 AudioContext 也會一直停在 suspended
  var silent = null;
  function silentUrl() {
    var n = 4410, b = new ArrayBuffer(44 + n * 2), v = new DataView(b);
    function w(o, str) { for (var i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); }
    w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); w(8, "WAVE"); w(12, "fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, 44100, true); v.setUint32(28, 88200, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data"); v.setUint32(40, n * 2, true);
    return URL.createObjectURL(new Blob([b], { type: "audio/wav" }));
  }
  function unlock() {
    try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
    if (!ensure()) return;
    if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} }
    try {
      if (!silent) { silent = new Audio(silentUrl()); silent.loop = true; silent.setAttribute("playsinline", ""); silent.volume = 0.01; }
      if (anyOn() && silent.paused) { var pr = silent.play(); if (pr && pr.catch) pr.catch(function () {}); }
      if (!anyOn() && !silent.paused) silent.pause();
    } catch (e) {}
  }

  window.KaidaMusic = { unlock: unlock, play: play, stop: stop, setVolume: setVolume, current: function (layer) { return (layers[layer || "music"] || layers.music).cur; } };
})();
