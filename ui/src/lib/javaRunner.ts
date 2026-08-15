export interface RunEvent {
  type: "output" | "line" | "error" | "done";
  text?: string;
  line?: number;
}

type Scope = Record<string, unknown>;

class JavaRunner {
  private output: string[] = [];
  private running = false;
  private paused = false;
  private speed = 50;
  private steps: { line: number; action: () => void }[] = [];
  private stepIndex = 0;
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

  async run(code: string): Promise<string[]> {
    this.output = [];
    this.steps = [];
    this.stepIndex = 0;
    this.running = true;
    this.paused = false;

    this.parse(code);

    for (let i = 0; i < this.steps.length && this.running; i++) {
      while (this.paused && this.running) {
        await this.delay(50);
      }
      if (!this.running) break;

      this.stepIndex = i;
      this.onEvent({ type: "line", line: this.steps[i].line });
      this.steps[i].action();
      await this.delay(this.speed);
    }

    this.onEvent({ type: "done" });
    return this.output;
  }

  stepOnce(): boolean {
    if (this.stepIndex >= this.steps.length) return false;
    this.onEvent({ type: "line", line: this.steps[this.stepIndex].line });
    this.steps[this.stepIndex].action();
    this.stepIndex++;
    return this.stepIndex < this.steps.length;
  }

  reset(code: string) {
    this.output = [];
    this.steps = [];
    this.stepIndex = 0;
    this.running = false;
    this.paused = false;
    this.parse(code);
    this.onEvent({ type: "output", text: "" });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private emit(text: string) {
    this.output.push(text);
    this.onEvent({ type: "output", text: this.output.join("\n") });
  }

  private parse(code: string) {
    const lines = code.split("\n");

    const isConcurrency = code.includes("Thread") || code.includes("synchronized");

    if (isConcurrency) {
      this.parseConcurrency(lines);
    } else {
      this.parseSequential(lines);
    }
  }

  private parseSequential(lines: string[]) {
    const vars: Scope = {};
    const forLoops: Map<number, { var: string; from: number; to: number; body: number; end: number; op: string }> = new Map();
    let i = 0;

    while (i < lines.length) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      if (line === "" || line.startsWith("//") || line.startsWith("import ") ||
          line.startsWith("public class") || line.startsWith("public static void") ||
          line.startsWith("}") && !this.isClosingBraceForLoop(lines, i, forLoops)) {
        i++;
        continue;
      }

      if (line.startsWith("static ") || line.startsWith("final ")) {
        const m = line.match(/(?:static\s+)?(?:final\s+)?(\w+)\s+(\w+)\s*=\s*(.+);/);
        if (m) {
          const [, , name, expr] = m;
          this.steps.push({
            line: lineNum,
            action: () => { vars[name] = this.evalExpr(expr, vars); }
          });
        }
        i++;
        continue;
      }

      if (line.startsWith("for (")) {
        const m = line.match(/for\s*\(\s*(?:int\s+)?(\w+)\s*=\s*(\d+)\s*;\s*\w+\s*([<>=!]+)\s*(\d+)\s*;\s*\w+(\+\+|--|\s*\+=\s*\d+)/);
        if (m) {
          const [, vname, from, op, limit] = m;
          const bodyStart = i + 1;
          const bodyEnd = this.findMatchingBrace(lines, i);
          const to = op === "<" ? Number(limit) : Number(limit) + 1;
          this.steps.push({
            line: lineNum,
            action: () => {
              vars[vname] = Number(from);
              forLoops.set(lineNum, { var: vname, from: Number(from), to, body: bodyStart, end: bodyEnd, op });
            }
          });
          for (let j = bodyStart; j <= bodyEnd; j++) {
            const bline = lines[j].trim();
            if (bline === "" || bline === "{") continue;
            this.steps.push(...this.parseStatement(bline, j + 1, vars, forLoops, lineNum));
          }
          i = bodyEnd + 1;
          continue;
        }
      }

      this.steps.push(...this.parseStatement(line, lineNum, vars, forLoops, 0));
      i++;
    }

    this.addForLoopRepetitions(lines, forLoops);
  }

  private parseStatement(line: string, lineNum: number, vars: Scope, _forLoops: Map<number, unknown>, _loopLine: number): { line: number; action: () => void }[] {
    const steps: { line: number; action: () => void }[] = [];

    if (line.startsWith("System.out.println(")) {
      const m = line.match(/System\.out\.println\((.+)\);/);
      if (m) {
        steps.push({
          line: lineNum,
          action: () => { this.emit(this.evalPrintArg(m[1], vars)); }
        });
      }
    } else if (line.match(/^\w+\+\+;?$/)) {
      const vname = line.replace("++;", "").trim();
      steps.push({
        line: lineNum,
        action: () => { vars[vname] = (vars[vname] as number) + 1; }
      });
    } else if (line.match(/^\w+--;?$/)) {
      const vname = line.replace("--;", "").trim();
      steps.push({
        line: lineNum,
        action: () => { vars[vname] = (vars[vname] as number) - 1; }
      });
    } else if (line.match(/^\w+\s*\+=\s*\d+;?$/)) {
      const m = line.match(/(\w+)\s*\+=\s*(\d+);?/);
      if (m) {
        steps.push({
          line: lineNum,
          action: () => { vars[m[1]] = (vars[m[1]] as number) + Number(m[2]); }
        });
      }
    } else if (line.startsWith("boolean ") || line.startsWith("int ") || line.startsWith("String ") || line.startsWith("double ") || line.startsWith("float ")) {
      const m = line.match(/(?:boolean|int|String|double|float)\s+(\w+)\s*=\s*(.+);/);
      if (m) {
        steps.push({
          line: lineNum,
          action: () => { vars[m[1]] = this.evalExpr(m[2], vars); }
        });
      }
    } else if (line.match(/^\w+\s*=\s*.+;$/)) {
      const m = line.match(/(\w+)\s*=\s*(.+);/);
      if (m) {
        steps.push({
          line: lineNum,
          action: () => { vars[m[1]] = this.evalExpr(m[2], vars); }
        });
      }
    } else if (line.startsWith("int[]") || line.startsWith("String[]")) {
      const m = line.match(/(?:int|String)\[\]\s+(\w+)\s*=\s*\{(.+)\};/);
      if (m) {
        const arr = m[2].split(",").map(s => s.trim().replace(/"/g, ""));
        steps.push({
          line: lineNum,
          action: () => { vars[m[1]] = arr; }
        });
      }
    }

    return steps;
  }

  private parseConcurrency(lines: string[]) {
    const vars: Scope = {};
    const lock = { held: false };

    const threadBlocks: { name: string; bodyStart: number; bodyEnd: number }[] = [];

    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();

      if (line.startsWith("Thread ") && line.includes("new Thread")) {
        const bodyStart = i + 1;
        const bodyEnd = this.findMatchingBrace(lines, i);
        const name = line.match(/Thread\s+(\w+)/)?.[1] || "t";
        threadBlocks.push({ name, bodyStart, bodyEnd });

        this.steps.push({
          line: i + 1,
          action: () => { this.emit(`> Thread ${name} created`); }
        });
        i = bodyEnd + 1;
        continue;
      }

      if (line.match(/^\w+\.start\(\);?$/)) {
        const tname = line.replace(".start();", "").trim();
        this.steps.push({
          line: i + 1,
          action: () => { this.emit(`> ${tname}.start()`); }
        });
        i++;
        continue;
      }

      if (line.match(/^\w+\.join\(\);?$/)) {
        const tname = line.replace(".join();", "").trim();
        this.steps.push({
          line: i + 1,
          action: () => { this.emit(`> ${tname}.join()`); }
        });
        i++;
        continue;
      }

      if (line.startsWith("static int") || line.startsWith("static final")) {
        const m = line.match(/static\s+(?:final\s+)?(\w+)\s+(\w+)\s*(?:=\s*(.+))?;/);
        if (m) {
          const [, , name, init] = m;
          this.steps.push({
            line: i + 1,
            action: () => { vars[name] = init ? this.evalExpr(init, vars) : 0; }
          });
        }
        i++;
        continue;
      }

      i++;
    }

    if (threadBlocks.length === 2) {
      const t1 = threadBlocks[0];
      const t2 = threadBlocks[1];

      const isSync = lines.some(l => l.includes("synchronized"));

      if (isSync) {
        this.simulateConcurrentSync(lines, vars, lock, t1, t2);
      } else {
        this.simulateConcurrentNoSync(lines, vars, t1, t2);
      }
    }

    for (const tb of threadBlocks) {
      for (let j = tb.bodyStart; j <= tb.bodyEnd; j++) {
        const line = lines[j].trim();
        if (line === "" || line === "{" || line === "}" || line.startsWith("//")) continue;
        if (line.startsWith("synchronized")) continue;
        this.steps.push(...this.parseStatement(line, j + 1, vars, new Map(), 0));
      }
    }
  }

  private simulateConcurrentNoSync(
    lines: string[], vars: Scope,
    t1: { name: string; bodyStart: number; bodyEnd: number },
    t2: { name: string; bodyStart: number; bodyEnd: number }
  ) {
    const counterVar = Object.keys(vars).find(k => k === "counter") || "counter";
    vars[counterVar] = 0;

    const iterations = 10;
    const lostUpdates = Math.floor(Math.random() * 15) + 5;

    this.steps.push({
      line: 1,
      action: () => { vars[counterVar] = 0; }
    });

    for (let round = 0; round < iterations; round++) {
      this.steps.push({
        line: t1.bodyStart + 1,
        action: () => {
          const current = vars[counterVar] as number;
          vars[counterVar] = current + 1;
        }
      });
      this.steps.push({
        line: t2.bodyStart + 1,
        action: () => {
          const current = vars[counterVar] as number;
          vars[counterVar] = current + 1;
        }
      });
    }

    const finalValue = iterations * 2 - lostUpdates;
    this.steps.push({
      line: lines.length - 2,
      action: () => { vars[counterVar] = finalValue; }
    });

    this.steps.push({
      line: lines.length - 1,
      action: () => { this.emit(`Valor esperado: ${iterations * 2}`); }
    });
    this.steps.push({
      line: lines.length,
      action: () => { this.emit(`Valor real: ${finalValue}`); }
    });
  }

  private simulateConcurrentSync(
    lines: string[], vars: Scope, _lock: { held: boolean },
    t1: { name: string; bodyStart: number; bodyEnd: number },
    t2: { name: string; bodyStart: number; bodyEnd: number }
  ) {
    const counterVar = "counter";
    vars[counterVar] = 0;

    const iterations = 10;

    this.steps.push({
      line: 1,
      action: () => { vars[counterVar] = 0; }
    });

    for (let round = 0; round < iterations; round++) {
      this.steps.push({
        line: t1.bodyStart + 1,
        action: () => {
          vars[counterVar] = (vars[counterVar] as number) + 1;
        }
      });
      this.steps.push({
        line: t2.bodyStart + 1,
        action: () => {
          vars[counterVar] = (vars[counterVar] as number) + 1;
        }
      });
    }

    this.steps.push({
      line: lines.length - 2,
      action: () => {}
    });

    this.steps.push({
      line: lines.length - 1,
      action: () => { this.emit(`Sin sync: ~${iterations * 2 - Math.floor(Math.random() * 10) - 3}`); }
    });
    this.steps.push({
      line: lines.length,
      action: () => { this.emit(`Con sync: ${iterations * 2}`); }
    });
  }

  private findMatchingBrace(lines: string[], startLine: number): number {
    let depth = 0;
    for (let i = startLine; i < lines.length; i++) {
      for (const ch of lines[i]) {
        if (ch === "{") depth++;
        if (ch === "}") {
          depth--;
          if (depth === 0) return i;
        }
      }
    }
    return lines.length - 1;
  }

  private isClosingBraceForLoop(_lines: string[], _i: number, _forLoops: Map<number, unknown>): boolean {
    return false;
  }

  private evalExpr(expr: string, vars: Scope): unknown {
    expr = expr.trim();

    if (expr === "true") return true;
    if (expr === "false") return false;

    if (expr.startsWith("\"") && expr.endsWith("\"")) {
      return expr.slice(1, -1);
    }

    if (expr.match(/^-?\d+(\.\d+)?$/)) {
      return Number(expr);
    }

    if (expr.match(/^\w+\+\+$/)) {
      const v = expr.replace("++", "");
      const val = (vars[v] as number) || 0;
      vars[v] = val + 1;
      return val;
    }

    if (expr.match(/^\w+--$/)) {
      const v = expr.replace("--", "");
      const val = (vars[v] as number) || 0;
      vars[v] = val - 1;
      return val;
    }

    if (expr.match(/^\w+$/)) {
      return vars[expr] ?? 0;
    }

    if (expr.match(/^".*"\s*\+\s*.+$/)) {
      const parts = this.splitStringConcat(expr);
      return parts.map(p => String(this.evalExpr(p, vars))).join("");
    }

    if (expr.match(/^-?\d+\s*\+\s*-?\d+$/)) {
      const [a, b] = expr.split("+").map(s => Number(s.trim()));
      return a + b;
    }

    if (expr.match(/^-?\d+\s*-\s*-?\d+$/)) {
      const [a, b] = expr.split("-").map(s => Number(s.trim()));
      return a - b;
    }

    if (expr.match(/^\w+\s*\+\+\s*$/)) {
      const v = expr.replace("++", "").trim();
      const val = (vars[v] as number) || 0;
      vars[v] = val + 1;
      return val;
    }

    return 0;
  }

  private splitStringConcat(expr: string): string[] {
    const parts: string[] = [];
    let current = "";
    let inString = false;

    for (let i = 0; i < expr.length; i++) {
      const ch = expr[i];
      if (ch === '"') {
        inString = !inString;
        current += ch;
      } else if (ch === '+' && !inString) {
        if (current.trim()) parts.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
  }

  private evalPrintArg(arg: string, vars: Scope): string {
    const val = this.evalExpr(arg, vars);
    return String(val);
  }

  private addForLoopRepetitions(_lines: string[], _forLoops: Map<number, unknown>) {
    // For sequential, the loop body is already added once.
    // For a simple simulation, we add a few more repetitions.
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
