export interface RunEvent {
  type: "output" | "line" | "error" | "done";
  text?: string;
  line?: number;
}

export interface LabSimulation {
  lines: { line: number; delay: number }[];
  output: { text: string; afterLine: number }[];
}

const SIMULATIONS: Record<string, LabSimulation> = {
  "lab-concurrency-counter": {
    lines: [
      { line: 2, delay: 200 },
      { line: 5, delay: 200 },
      { line: 6, delay: 100 },
      { line: 7, delay: 100 },
      { line: 8, delay: 100 },
      { line: 12, delay: 200 },
      { line: 13, delay: 100 },
      { line: 14, delay: 100 },
      { line: 15, delay: 100 },
      { line: 19, delay: 300 },
      { line: 7, delay: 50 },
      { line: 13, delay: 50 },
      { line: 7, delay: 50 },
      { line: 14, delay: 50 },
      { line: 8, delay: 50 },
      { line: 15, delay: 50 },
      { line: 20, delay: 300 },
      { line: 21, delay: 300 },
      { line: 23, delay: 200 },
      { line: 24, delay: 200 },
    ],
    output: [
      { text: "> Thread t1 created", afterLine: 5 },
      { text: "> Thread t2 created", afterLine: 12 },
      { text: "> t1.start()", afterLine: 19 },
      { text: "> t2.start()", afterLine: 20 },
      { text: "> t1.join()", afterLine: 21 },
      { text: "> t2.join()", afterLine: 22 },
      { text: "Valor esperado: 2000", afterLine: 23 },
      { text: "Valor real: 1847", afterLine: 24 },
    ],
  },
  "lab-bubble-sort": {
    lines: [
      { line: 3, delay: 200 },
      { line: 4, delay: 100 },
      { line: 6, delay: 200 },
      { line: 7, delay: 150 },
      { line: 9, delay: 100 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 13, delay: 100 },
      { line: 14, delay: 100 },
      { line: 18, delay: 100 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 20, delay: 150 },
      { line: 6, delay: 200 },
      { line: 7, delay: 150 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 20, delay: 150 },
      { line: 6, delay: 200 },
      { line: 7, delay: 150 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 20, delay: 150 },
      { line: 6, delay: 200 },
      { line: 7, delay: 150 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 20, delay: 150 },
      { line: 6, delay: 200 },
      { line: 7, delay: 150 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 12, delay: 100 },
      { line: 19, delay: 100 },
      { line: 20, delay: 150 },
      { line: 23, delay: 200 },
    ],
    output: [
      { text: "Pasada 1:", afterLine: 7 },
      { text: "  Swap: 64 <-> 34", afterLine: 14 },
      { text: "  Swap: 64 <-> 25", afterLine: 14 },
      { text: "  Swap: 64 <-> 22", afterLine: 14 },
      { text: "  Swap: 64 <-> 12", afterLine: 14 },
      { text: "  Swap: 64 <-> 11", afterLine: 14 },
      { text: "  Swap: 90 <-> 64", afterLine: 14 },
      { text: "  Resultado: [34, 25, 12, 22, 11, 64, 90]", afterLine: 20 },
      { text: "Pasada 2:", afterLine: 7 },
      { text: "  Swap: 34 <-> 25", afterLine: 12 },
      { text: "  Swap: 34 <-> 22", afterLine: 12 },
      { text: "  Swap: 34 <-> 12", afterLine: 12 },
      { text: "  Swap: 34 <-> 11", afterLine: 12 },
      { text: "  Resultado: [25, 12, 22, 11, 34, 64, 90]", afterLine: 20 },
      { text: "Pasada 3:", afterLine: 7 },
      { text: "  Swap: 25 <-> 12", afterLine: 12 },
      { text: "  Swap: 25 <-> 22", afterLine: 12 },
      { text: "  Swap: 25 <-> 11", afterLine: 12 },
      { text: "  Resultado: [12, 22, 11, 25, 34, 64, 90]", afterLine: 20 },
      { text: "Pasada 4:", afterLine: 7 },
      { text: "  Swap: 22 <-> 12", afterLine: 12 },
      { text: "  Swap: 22 <-> 11", afterLine: 12 },
      { text: "  Resultado: [12, 11, 22, 25, 34, 64, 90]", afterLine: 20 },
      { text: "Pasada 5:", afterLine: 7 },
      { text: "  Swap: 12 <-> 11", afterLine: 12 },
      { text: "  Resultado: [11, 12, 22, 25, 34, 64, 90]", afterLine: 20 },
      { text: "Array final: [11, 12, 22, 25, 34, 64, 90]", afterLine: 23 },
    ],
  },
  "lab-sync-vs-nosync": {
    lines: [
      { line: 2, delay: 200 },
      { line: 3, delay: 200 },
      { line: 6, delay: 200 },
      { line: 8, delay: 150 },
      { line: 9, delay: 100 },
      { line: 10, delay: 100 },
      { line: 11, delay: 100 },
      { line: 14, delay: 150 },
      { line: 15, delay: 100 },
      { line: 16, delay: 100 },
      { line: 17, delay: 100 },
      { line: 20, delay: 300 },
      { line: 21, delay: 300 },
      { line: 22, delay: 300 },
      { line: 24, delay: 200 },
      { line: 26, delay: 200 },
      { line: 28, delay: 200 },
      { line: 30, delay: 150 },
      { line: 31, delay: 100 },
      { line: 32, delay: 100 },
      { line: 33, delay: 100 },
      { line: 36, delay: 150 },
      { line: 37, delay: 100 },
      { line: 38, delay: 100 },
      { line: 39, delay: 100 },
      { line: 42, delay: 300 },
      { line: 43, delay: 300 },
      { line: 44, delay: 300 },
      { line: 46, delay: 200 },
    ],
    output: [
      { text: "> Thread t1 created", afterLine: 8 },
      { text: "> Thread t2 created", afterLine: 14 },
      { text: "> t1.start()", afterLine: 20 },
      { text: "> t2.start()", afterLine: 21 },
      { text: "> t1.join()", afterLine: 22 },
      { text: "> t2.join()", afterLine: 23 },
      { text: "Sin sync: 1847", afterLine: 24 },
      { text: "> Thread t3 created", afterLine: 30 },
      { text: "> Thread t4 created", afterLine: 36 },
      { text: "> t3.start()", afterLine: 42 },
      { text: "> t4.start()", afterLine: 43 },
      { text: "> t3.join()", afterLine: 44 },
      { text: "> t4.join()", afterLine: 45 },
      { text: "Con sync: 2000", afterLine: 46 },
    ],
  },
};

class JavaRunner {
  private output: string[] = [];
  private running = false;
  private paused = false;
  private speed = 50;
  private simIndex = 0;
  private outputIndex = 0;
  private onEvent: (e: RunEvent) => void = () => {};

  setOnEvent(fn: (e: RunEvent) => void) {
    this.onEvent = fn;
  }

  setSpeed(s: number) {
    this.speed = s;
  }

  stop() {
    this.running = false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  async run(exerciseId: string): Promise<string[]> {
    this.output = [];
    this.running = true;
    this.paused = false;

    const sim = SIMULATIONS[exerciseId];
    if (!sim) {
      this.onEvent({ type: "error", text: "Ejercicio no encontrado" });
      return this.output;
    }

    this.simIndex = 0;
    this.outputIndex = 0;

    for (let i = 0; i < sim.lines.length && this.running; i++) {
      while (this.paused && this.running) {
        await this.delay(50);
      }
      if (!this.running) break;

      this.simIndex = i;
      const step = sim.lines[i];
      this.onEvent({ type: "line", line: step.line });

      while (this.outputIndex < sim.output.length && sim.output[this.outputIndex].afterLine <= step.line) {
        this.output.push(sim.output[this.outputIndex].text);
        this.onEvent({ type: "output", text: this.output.join("\n") });
        this.outputIndex++;
      }

      await this.delay(step.delay * (110 - this.speed) / 50);
    }

    while (this.outputIndex < sim.output.length) {
      this.output.push(sim.output[this.outputIndex].text);
      this.onEvent({ type: "output", text: this.output.join("\n") });
      this.outputIndex++;
    }

    this.onEvent({ type: "done" });
    return this.output;
  }

  stepOnce(exerciseId: string): boolean {
    const sim = SIMULATIONS[exerciseId];
    if (!sim || this.simIndex >= sim.lines.length) return false;

    const step = sim.lines[this.simIndex];
    this.onEvent({ type: "line", line: step.line });

    while (this.outputIndex < sim.output.length && sim.output[this.outputIndex].afterLine <= step.line) {
      this.output.push(sim.output[this.outputIndex].text);
      this.onEvent({ type: "output", text: this.output.join("\n") });
      this.outputIndex++;
    }

    this.simIndex++;
    return this.simIndex < sim.lines.length;
  }

  reset() {
    this.output = [];
    this.simIndex = 0;
    this.outputIndex = 0;
    this.running = false;
    this.paused = false;
    this.onEvent({ type: "output", text: "" });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

let runner: JavaRunner | null = null;

export function createRunner(): JavaRunner {
  if (!runner) {
    runner = new JavaRunner();
  }
  return runner;
}

export type { JavaRunner };
