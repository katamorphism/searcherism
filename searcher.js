const WORD_LIST_URL =
  "https://raw.githubusercontent.com/katamorphism/searcherism/refs/heads/main/CSW24.txt";

let allWords = null; // flat array of uppercase words

async function loadWordList() {
  const res = await fetch(WORD_LIST_URL);
  if (!res.ok) throw new Error(`Failed to fetch word list: ${res.status}`);
  const text = await res.text();

  allWords = [];
  for (const raw of text.split(/\r?\n/)) {
    const word = raw.trim().toUpperCase();
    if (word) allWords.push(word);
  }
}

/**
 * Check if a word can be formed from the available letters + blanks.
 * Both fixedSorted and wordLetters should be pre-sorted arrays.
 */
function canMake(fixedSorted, blanks, wordLetters) {
  let fi = 0;
  let blanksUsed = 0;
  for (let ni = 0; ni < wordLetters.length; ni++) {
    if (fi < fixedSorted.length && fixedSorted[fi] === wordLetters[ni]) {
      fi++;
    } else {
      blanksUsed++;
      if (blanksUsed > blanks) return false;
    }
  }
  return true;
}

/**
 * Find all valid CSW24 words that can be made from any subset of the query tiles.
 * @param {string} query - Letters with '?' as blanks.
 * @returns {Map<number, string[]>} Map of length => sorted words, keys descending.
 */
function search(query) {
  if (!allWords) throw new Error("Word list not loaded yet.");

  const upper = query.toUpperCase();
  const letters = upper.split("");
  const blanks = letters.filter((c) => c === "?").length;
  const fixed = letters.filter((c) => c !== "?").sort();
  const maxLen = letters.length;

  // Group results by length
  const byLength = new Map();

  for (const word of allWords) {
    if (word.length > maxLen || word.length < 2) continue;
    const wordLetters = word.split("").sort();
    if (canMake(fixed, blanks, wordLetters)) {
      if (!byLength.has(word.length)) byLength.set(word.length, []);
      byLength.get(word.length).push(word);
    }
  }

  // Sort each group alphabetically
  for (const [, words] of byLength) words.sort();

  // Return as a Map with keys sorted descending (longest first)
  const sorted = new Map(
    [...byLength.entries()].sort((a, b) => b[0] - a[0])
  );

  return sorted;
}

export { loadWordList, search };
