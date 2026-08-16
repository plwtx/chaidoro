type TickCallback = (seconds: number) => void;
type CompleteCallback = () => void;

class TimerBridge {
  private worker: Worker | null = null;
  private tickCallbacks: Set<TickCallback> = new Set();
  private completeCallbacks: Set<CompleteCallback> = new Set();

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(new URL("./timerWorker.ts", import.meta.url), {
        type: "module",
      });
      this.worker.onmessage = (e: MessageEvent) => {
        const msg = e.data;
        if (msg.type === "tick") {
          this.tickCallbacks.forEach((cb) => cb(msg.payload.seconds));
        } else if (msg.type === "complete") {
          this.completeCallbacks.forEach((cb) => cb());
        }
      };
    }
    return this.worker;
  }

  start(mode: "countup" | "countdown", initialSeconds: number) {
    this.ensureWorker().postMessage({
      type: "start",
      payload: { mode, initialSeconds },
    });
  }

  pause() {
    this.worker?.postMessage({ type: "pause" });
  }

  resume() {
    this.worker?.postMessage({ type: "resume" });
  }

  reset() {
    this.worker?.postMessage({ type: "reset" });
  }

  hasWorker(): boolean {
    return this.worker !== null;
  }

  setSpeed(speed: number) {
    this.ensureWorker().postMessage({
      type: "set-speed",
      payload: { speed },
    });
  }

  onTick(cb: TickCallback): () => void {
    this.tickCallbacks.add(cb);
    return () => this.tickCallbacks.delete(cb);
  }

  onComplete(cb: CompleteCallback): () => void {
    this.completeCallbacks.add(cb);
    return () => this.completeCallbacks.delete(cb);
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
  }
}

export const timerBridge = new TimerBridge();
