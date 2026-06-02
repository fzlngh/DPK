const fs = require("fs");
const path = "d:/DPK/components/beat-bang/BeatBangGame.tsx";
const s = fs.readFileSync(path, "utf8");
const stack = [];
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (ch === "{") stack.push(i);
  else if (ch === "}") stack.pop();
}
console.log("unmatched count:", stack.length);
if (stack.length > 0) {
  const idx = stack[stack.length - 1];
  const start = Math.max(0, idx - 80);
  const end = Math.min(s.length, idx + 80);
  console.log("last unmatched { at", idx);
  console.log("context:\n", s.slice(start, end));
}
