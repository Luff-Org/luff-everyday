// Pure typing-test metric math. No React / store dependencies so it is unit-testable.

export interface FinalCharStats {
  correct: number;
  incorrect: number;
  extra: number;
  missed: number;
}

export interface LiveCharTally {
  correct: number;
  incorrect: number;
}

export interface Wpm {
  wpm: number;
  rawWpm: number;
}

/**
 * Final character tally across all completed words plus the in-progress word.
 * Counts a correct character for each inter-word space, and attributes
 * over-typed characters to `extra` and under-typed to `missed`.
 */
export function computeFinalStats(
  originalWords: string[],
  typedWords: string[],
  currentWordIndex: number,
  currentWordInput: string,
): FinalCharStats {
  let correct = 0;
  let incorrect = 0;
  let extra = 0;
  let missed = 0;

  for (let i = 0; i < currentWordIndex; i++) {
    const orig = originalWords[i];
    const typed = typedWords[i];
    for (let j = 0; j < Math.max(orig.length, typed.length); j++) {
      if (j >= orig.length) extra++;
      else if (j >= typed.length) missed++;
      else if (orig[j] === typed[j]) correct++;
      else incorrect++;
    }
    correct++; // space
  }

  const orig = originalWords[currentWordIndex] || "";
  const typed = currentWordInput;
  for (let j = 0; j < Math.max(orig.length, typed.length); j++) {
    if (j >= orig.length) extra++;
    else if (j >= typed.length) missed++;
    else if (orig[j] === typed[j]) correct++;
    else incorrect++;
  }

  return { correct, incorrect, extra, missed };
}

/**
 * Live correct/incorrect tally used on every timer tick. Only counts characters
 * actually typed (capped at each word's length); ignores extra/missed.
 */
export function computeLiveTally(
  originalWords: string[],
  typedWords: string[],
  currentWordIndex: number,
  currentWordInput: string,
): LiveCharTally {
  let correct = 0;
  let incorrect = 0;

  for (let i = 0; i < currentWordIndex; i++) {
    const orig = originalWords[i];
    const typed = typedWords[i];
    for (let j = 0; j < Math.max(orig.length, Math.min(typed.length, orig.length)); j++) {
      if (j < typed.length && orig[j] === typed[j]) correct++;
      else if (j < typed.length) incorrect++;
    }
    correct++; // space between words
  }

  const activeWord = originalWords[currentWordIndex] || "";
  for (let j = 0; j < currentWordInput.length; j++) {
    if (j < activeWord.length) {
      if (activeWord[j] === currentWordInput[j]) correct++;
      else incorrect++;
    }
  }

  return { correct, incorrect };
}

/** Standard 5-chars-per-word WPM. Returns 0 when no time has elapsed. */
export function computeWpm(
  correct: number,
  incorrect: number,
  elapsedMinutes: number,
): Wpm {
  if (elapsedMinutes <= 0) return { wpm: 0, rawWpm: 0 };
  return {
    wpm: Math.round(correct / 5 / elapsedMinutes),
    rawWpm: Math.round((correct + incorrect) / 5 / elapsedMinutes),
  };
}
