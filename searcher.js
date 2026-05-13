const WORD_LIST_URL =
  "https://raw.githubusercontent.com/katamorphism/searcherism/refs/heads/main/CSW24.txt";

let wordSet = null;

async function loadWordList() {
  const res = await fetch(WORD_LIST_URL);
  if (!res.ok) throw new Error(`Failed to fetch word list: ${res.status}`);
  const text = await res.text();
  wordSet = new Set(text.split(/\r?\n/).map(w => w.trim().toUpperCase()).filter(Boolean));
}

// Check if word can be made from available letters + blanks.
// Simple: for each letter in word, consume it from a copy of available counts,
// or spend a blank if not available.
function canMake(letters, blanks, word) {
  const avail = {};
  for (const c of letters) avail[c] = (avail[c] || 0) + 1;
  let blanksLeft = blanks;
  for (const c of word) {
    if (avail[c] > 0) {
      avail[c]--;
    } else if (blanksLeft > 0) {
      blanksLeft--;
    } else {
      return false;
    }
  }
  return true;
}

function search(query) {
  if (!wordSet) throw new Error("Word list not loaded yet.");

  const upper = query.toUpperCase();
  const blanks = upper.split("").filter(c => c === "?").length;
  const letters = upper.split("").filter(c => c !== "?");
  const maxLen = upper.length;

  const byLength = new Map();

  for (const word of wordSet) {
    if (word.length < 2 || word.length > maxLen) continue;
    if (canMake(letters, blanks, word)) {
      if (!byLength.has(word.length)) byLength.set(word.length, []);
      byLength.get(word.length).push(word);
    }
  }

  for (const [, words] of byLength) words.sort();
  return new Map([...byLength.entries()].sort((a, b) => b[0] - a[0]));
}

export { loadWordList, search };
