export class SoundEngine {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playClick() {
        if (!this.enabled || !this.ctx) {
            this.init();
            return;
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playMove() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Pop sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playWin() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }

        const now = this.ctx.currentTime;

        // Major chord arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();

            osc.connect(gain);
            gain.connect(this.ctx!.destination);

            osc.type = 'sine';
            osc.frequency.value = freq;

            const start = now + i * 0.1;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.1, start + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 1);

            osc.start(start);
            osc.stop(start + 1.2);
        });
    }

    playHint() {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        // Mystical shimmer
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playRipple(count: number) {
        if (!this.enabled || !this.ctx) {
            this.init();
            if (!this.ctx) return;
        }

        const now = this.ctx.currentTime;
        // Cap count to avoid explosion of sounds
        const noteCount = Math.min(count, 20);
        const duration = 0.05; // Short blip

        // Pentatonic C Major scale frequencies
        const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];

        for (let i = 0; i < noteCount; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            // Randomize slightly for organic feel
            const freq = scale[Math.floor(Math.random() * scale.length)];
            osc.frequency.value = freq;
            osc.type = 'sine';

            // Stagger start times to match wave visual (approx 50-80ms per tile)
            const startTime = now + (i * 0.08); // 80ms delay between average wavefronts

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.05, startTime + 0.02);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.1);
        }
    }
}
