const WORD_LIST_URL =
  "https://raw.githubusercontent.com/katamorphism/searcherism/refs/heads/main/CSW24.txt";

let wordSet = null;

async function loadWordList() {
  const res = await fetch(WORD_LIST_URL);
  if (!res.ok) throw new Error(`Failed to fetch word list: ${res.status}`);
  const text = await res.text();
  wordSet = new Set(text.split(/\r?\n/).map(w => w.trim().toUpperCase()).filter(Boolean));
}

function* permutations(arr) {
  if (arr.length <= 1) { yield arr; return; }
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) yield [arr[i], ...perm];
  }
}

function search(query) {
  if (!wordSet) throw new Error("Word list not loaded yet.");

  const letters = query.toUpperCase().split("");
  const maxLen = letters.length;
  const results = new Set();

  // Try every subset of the letters (all sizes from 2 up to maxLen)
  // For each subset, try all permutations and check against wordSet
  const n = letters.length;
  for (let mask = 1; mask < (1 << n); mask++) {
    const subset = [];
    for (let i = 0; i < n; i++) if (mask & (1 << i)) subset.push(letters[i]);
    if (subset.length < 2) continue;

    const seen = new Set();
    for (const perm of permutations(subset)) {
      const word = perm.join("");
      if (seen.has(word)) continue;
      seen.add(word);
      if (wordSet.has(word)) results.add(word);
    }
  }

  const byLength = new Map();
  for (const word of results) {
    if (!byLength.has(word.length)) byLength.set(word.length, []);
    byLength.get(word.length).push(word);
  }
  for (const [, words] of byLength) words.sort();
  return new Map([...byLength.entries()].sort((a, b) => b[0] - a[0]));
}

export { loadWordList, search };
