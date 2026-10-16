/* 番茄讀書會：房間背景音樂（瀏覽器即時合成，不用下載音檔）
   爵士：走路貝斯 + 七和弦鋼琴 + 刷鼓；輕音樂：溫柔的和弦鋪底 + 鈴聲旋律；白噪音：柔和的棕色噪音；柴火：隨機的劈啪聲；
   雨聲：細密的雨 + 偶爾滴在窗台的水滴；Lo-fi：慢板的悶鋼琴 + 鼓 + 黑膠雜訊；森林：鳥叫 */
(function () {
  var ctx = null, master = null, verb = null, cur = "", timer = null, nextT = 0, step = 0, vol = 0.6, noiseSrc = null, nodes = [];

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    verb = ctx.createConvolver();
    var len = ctx.sampleRate * 2.4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = buf.getChannelData(c); for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    verb.buffer = buf;
    var wet = ctx.createGain(); wet.gain.value = 0.28; verb.connect(wet); wet.connect(master);
    return ctx;
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function out(g, rev) { g.connect(master); if (rev) g.connect(verb); }

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

  function startNoise() {
    var len = ctx.sampleRate * 4, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = buf.getChannelData(c), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
    }
    noiseSrc = ctx.createBufferSource(); noiseSrc.buffer = buf; noiseSrc.loop = true;
    var f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 900;
    var g = ctx.createGain(); g.gain.value = 0.9;
    // 慢慢起伏，像遠方的海浪
    var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.08; lg.gain.value = 0.25; lfo.connect(lg); lg.connect(g.gain); lfo.start();
    noiseSrc.connect(f); f.connect(g); g.connect(master); noiseSrc.start();
    nodes = [lfo];
  }

  /* 柴火：隨機的劈啪聲，偶爾木頭裂開的大聲一點 */
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
    src.connect(f); f.connect(g); g.connect(master); src.start(0, Math.random() * 3);
    nodes.push(src);
    if (lfoRate) { var lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = lfoRate; lg.gain.value = lfoDepth; lfo.connect(lg); lg.connect(g.gain); lfo.start(); nodes.push(lfo); }
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

  function loop() {
    while (nextT < ctx.currentTime + 0.4) {
      var d = cur === "jazz" ? jazzBeat(nextT, step) : cur === "fire" ? fireBeat(nextT) : cur === "rain" ? rainBeat(nextT) :
        cur === "lofi" ? lofiBeat(nextT, step) : cur === "forest" ? forestBeat(nextT) : lightBeat(nextT, step);
      nextT += d; step++;
    }
  }

  function stopAll() {
    clearInterval(timer); timer = null;
    if (noiseSrc) { try { noiseSrc.stop(); } catch (e) {} noiseSrc = null; }
    nodes.forEach(function (n) { try { n.stop(); } catch (e) {} }); nodes = [];
  }

  function play(kind) {
    if (!kind) { stop(); return true; }
    if (!ensure()) return false;
    if (ctx.state !== "running") { try { ctx.resume(); } catch (e) {} }
    if (kind === cur) { unlock(); return true; }
    stopAll(); cur = kind;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(0, t); master.gain.linearRampToValueAtTime(vol, t + 1.2);
    if (kind === "noise") startNoise();
    else { if (kind === "rain") startRain(); nextT = t + 0.1; step = 0; loop(); timer = setInterval(loop, 100); }
    unlock();
    return true;
  }
  function stop() {
    cur = "";
    if (silent && !silent.paused) silent.pause();
    if (!ctx) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 0.5);
    setTimeout(function () { if (!cur) stopAll(); }, 600);
  }
  function setVolume(v) {
    vol = Math.max(0, Math.min(1, v));
    if (ctx && cur) master.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
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
      if (cur && silent.paused) { var pr = silent.play(); if (pr && pr.catch) pr.catch(function () {}); }
      if (!cur && !silent.paused) silent.pause();
    } catch (e) {}
  }

  window.KaidaMusic = { unlock: unlock, play: play, stop: stop, setVolume: setVolume, current: function () { return cur; } };
})();
