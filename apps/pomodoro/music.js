/* 番茄讀書會：房間背景音樂（瀏覽器即時合成，不用下載音檔）
   爵士：走路貝斯 + 七和弦鋼琴 + 刷鼓；輕音樂：溫柔的和弦鋪底 + 鈴聲旋律；白噪音：柔和的棕色噪音 */
(function () {
  var ctx = null, master = null, verb = null, cur = "", timer = null, nextT = 0, step = 0, vol = 0.6, noiseSrc = null, nodes = [];

  function ensure() {
    if (ctx) return ctx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // 簡單殘響
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

  function loop() {
    while (nextT < ctx.currentTime + 0.4) {
      var d = cur === "jazz" ? jazzBeat(nextT, step) : lightBeat(nextT, step);
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
    if (ctx.state === "suspended") ctx.resume();
    if (kind === cur) return true;
    stopAll(); cur = kind;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(0, t); master.gain.linearRampToValueAtTime(vol, t + 1.2);
    if (kind === "noise") startNoise();
    else { nextT = t + 0.1; step = 0; loop(); timer = setInterval(loop, 100); }
    return true;
  }
  function stop() {
    cur = "";
    if (!ctx) return;
    var t = ctx.currentTime;
    master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + 0.5);
    setTimeout(function () { if (!cur) stopAll(); }, 600);
  }
  function setVolume(v) {
    vol = Math.max(0, Math.min(1, v));
    if (ctx && cur) master.gain.setTargetAtTime(vol, ctx.currentTime, 0.1);
  }

  window.KaidaMusic = { play: play, stop: stop, setVolume: setVolume, current: function () { return cur; } };
})();
