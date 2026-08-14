const fs = require('fs');

const existing = JSON.parse(fs.readFileSync('core/src/main/resources/modules/bug-hunt.json', 'utf8'));
const bh1 = JSON.parse(fs.readFileSync('bug-hunt-exercises.json', 'utf8'));

let bh2 = [];
try { bh2 = JSON.parse(fs.readFileSync('core/src/main/resources/modules/bug-hunt-batch2.json', 'utf8')); } catch(e) { console.log('No bh2 file'); }

let bh3 = [];
try {
  const raw = fs.readFileSync('C:/Users/santi/.local/share/opencode/tool-output/tool_fee82f9e40013uZsTQLhm2PkE0', 'utf8');
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start >= 0 && end >= 0) {
    bh3 = JSON.parse(raw.substring(start, end + 1));
  }
} catch(e) { console.log('Error reading bh3:', e.message); }

let bh5 = [];
try {
  const raw = fs.readFileSync('C:/Users/santi/.local/share/opencode/tool-output/tool_fee9964e80012h6Q4XcjScSrCz', 'utf8');
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start >= 0 && end >= 0) {
    bh5 = JSON.parse(raw.substring(start, end + 1));
  }
} catch(e) { console.log('Error reading bh5:', e.message); }

console.log('Existing:', existing.quiz.questions.length);
console.log('BH1:', bh1.length);
console.log('BH2:', bh2.length);
console.log('BH3:', bh3.length);
console.log('BH5:', bh5.length);

const allQuestions = [...existing.quiz.questions, ...bh1, ...bh2, ...bh3, ...bh5];
const renumbered = allQuestions.map((q, i) => ({...q, id: 'bh-q' + (i + 1)}));
existing.quiz.questions = renumbered;

fs.writeFileSync('core/src/main/resources/modules/bug-hunt.json', JSON.stringify(existing, null, 2));
console.log('BugHunt: ' + renumbered.length + ' questions written');
