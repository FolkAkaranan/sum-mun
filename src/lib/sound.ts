/** เสียงตอนสุ่ม/จับฉลาก สร้างด้วย WebAudio ล้วนๆ ไม่ต้องพึ่งไฟล์เสียงภายนอก */
export function playDrawSound() {
  if (typeof window === "undefined") return;
  try {
    type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };
    const win = window as WindowWithWebkitAudio;
    const AudioCtx = window.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    // เบราว์เซอร์ไม่รองรับหรือ audio ถูกบล็อก ก็ปล่อยผ่าน
  }
}

export function playRevealSound() {
  if (typeof window === "undefined") return;
  try {
    type WindowWithWebkitAudio = Window & { webkitAudioContext?: typeof AudioContext };
    const win = window as WindowWithWebkitAudio;
    const AudioCtx = window.AudioContext ?? win.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.09);
      osc.stop(ctx.currentTime + i * 0.09 + 0.25);
    });
    setTimeout(() => ctx.close(), 500);
  } catch {
    // ignore
  }
}
