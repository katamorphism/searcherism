// searcher.js — CSW24 anagram unscrambler
// Loads CSW24.txt from GitHub (one word per line)
// Query: letters + '?' for blanks. Returns all valid anagrams.

const WORD_LIST_URL =
  "https://raw.githubusercontent.com/katamorphism/searcherism/refs/heads/main/CSW24.txt";

let wordIndex = null; // Map: sorted-letters-key => [word, word, ...]

async function loadWordList() {
  const res = await fetch(WORD_LIST_URL);
  if (!res.ok) throw new Error(`Failed to fetch word list: ${res.status}`);
  const text = await res.text();

  wordIndex = new Map();

  const words = text.split(/\r?\n/);
  for (const raw of words) {
    const word = raw.trim().toUpperCase();
    if (!word) continue;
    const key = word.split("").sort().join("");
    if (!wordIndex.has(key)) wordIndex.set(key, []);
    wordIndex.get(key).push(word);
  }
}

/**
 * Search for all words that can be made from the given tiles.
 * @param {string} query - Letters with '?' as blanks (wildcards).
 * @returns {string[]} Sorted list of matching words.
 */
function search(query) {
  if (!wordIndex) throw new Error("Word list not loaded yet.");

  const upper = query.toUpperCase();
  const letters = upper.split("");
  const blanks = letters.filter((c) => c === "?").length;
  const fixed = letters.filter((c) => c !== "?").sort();

  const results = new Set();

  // We need to find every word whose letters can be covered by fixed + blanks.
  // Strategy: for each word of same length, check if fixed letters minus word's
  // letters can be satisfied with ≤ blanks wildcards.

  const targetLength = letters.length;

  for (const [, words] of wordIndex) {
    for (const word of words) {
      if (word.length !== targetLength) continue;
      if (canMake(fixed, blanks, word)) {
        results.add(word);
      }
    }
  }

  return Array.from(results).sort();
}

/**
 * Check if a word can be formed from the fixed letters + some number of blanks.
 */
function canMake(fixedSorted, blanks, word) {
  const needed = word.split("").sort();
  let fi = 0;
  let blanksUsed = 0;

  for (let ni = 0; ni < needed.length; ni++) {
    if (fi < fixedSorted.length && fixedSorted[fi] === needed[ni]) {
      fi++;
    } else {
      blanksUsed++;
      if (blanksUsed > blanks) return false;
    }
  }
  return true;
}

export { loadWordList, search };
