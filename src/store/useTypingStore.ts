import { create } from "zustand";
import {
  generateWords,
  WORD_BATCH_SIZE,
  MAX_EXTRA_CHARS,
  WORD_PREFETCH_THRESHOLD,
  DEFAULT_DURATION,
} from "@/lib/constants";

interface HistoryPoint {
  time: number;
  wpm: number;
  rawWpm: number;
  err: number;
}

interface TypingState {
  status: "idle" | "typing" | "finished";
  originalWords: string[];
  typedWords: string[];
  currentWordIndex: number;
  currentWordInput: string;
  duration: number;
  timeLeft: number;
  startTime: number | null;
  endTime: number | null;
  wpmHistory: HistoryPoint[];
  correctChars: number;
  incorrectChars: number;
  missedChars: number;
  extraChars: number;
  setDuration: (duration: number) => void;
  reset: () => void;
  start: () => void;
  finish: () => void;
  tick: () => void;
  inputChar: (char: string) => void;
  deleteChar: () => void;
  inputSpace: () => void;
}

const generateInitialWords = () =>
  generateWords(WORD_BATCH_SIZE).split(" ");

export const useTypingStore = create<TypingState>((set, get) => ({
  status: "idle",
  originalWords: generateInitialWords(),
  typedWords: [],
  currentWordIndex: 0,
  currentWordInput: "",
  duration: DEFAULT_DURATION,
  timeLeft: DEFAULT_DURATION,
  startTime: null,
  endTime: null,
  wpmHistory: [],
  correctChars: 0,
  incorrectChars: 0,
  missedChars: 0,
  extraChars: 0,

  setDuration: (duration) =>
    set((state) => ({
      ...state,
      duration,
      timeLeft: duration,
      ...(state.status === "idle" ? {} : (get().reset() as any)),
    })),

  reset: () => {
    set({
      status: "idle",
      originalWords: generateInitialWords(),
      typedWords: [],
      currentWordIndex: 0,
      currentWordInput: "",
      timeLeft: get().duration,
      startTime: null,
      endTime: null,
      wpmHistory: [],
      correctChars: 0,
      incorrectChars: 0,
      missedChars: 0,
      extraChars: 0,
    });
  },

  start: () => {
    set({
      status: "typing",
      startTime: Date.now(),
      timeLeft: get().duration,
    });
  },

  finish: () => {
    const state = get();
    let correct = 0;
    let incorrect = 0;
    let extra = 0;
    let missed = 0;

    for (let i = 0; i < state.currentWordIndex; i++) {
      const orig = state.originalWords[i];
      const typed = state.typedWords[i];
      for (let j = 0; j < Math.max(orig.length, typed.length); j++) {
        if (j >= orig.length) extra++;
        else if (j >= typed.length) missed++;
        else if (orig[j] === typed[j]) correct++;
        else incorrect++;
      }
      correct++; // space
    }

    const orig = state.originalWords[state.currentWordIndex] || "";
    const typed = state.currentWordInput;
    for (let j = 0; j < Math.max(orig.length, typed.length); j++) {
      if (j >= orig.length) extra++;
      else if (j >= typed.length) missed++;
      else if (orig[j] === typed[j]) correct++;
      else incorrect++;
    }

    set({
      status: "finished",
      endTime: Date.now(),
      correctChars: correct,
      incorrectChars: incorrect,
      missedChars: missed,
      extraChars: extra,
    });
  },

  tick: () => {
    const { status, startTime, duration, timeLeft, wpmHistory } = get();
    if (status !== "typing" || !startTime) return;

    const newTimeLeft = timeLeft - 1;
    if (newTimeLeft <= 0) {
      get().finish();
      return;
    }

    const state = get();
    let correct = 0;
    let incorrect = 0;

    for (let i = 0; i < state.currentWordIndex; i++) {
      const orig = state.originalWords[i];
      const typed = state.typedWords[i];
      for (
        let j = 0;
        j < Math.max(orig.length, Math.min(typed.length, orig.length));
        j++
      ) {
        if (j < typed.length && orig[j] === typed[j]) correct++;
        else if (j < typed.length) incorrect++;
      }
      correct++; // space between words
    }

    for (let j = 0; j < state.currentWordInput.length; j++) {
      if (j < state.originalWords[state.currentWordIndex].length) {
        if (
          state.originalWords[state.currentWordIndex][j] ===
          state.currentWordInput[j]
        )
          correct++;
        else incorrect++;
      }
    }

    const elapsedMinutes = (duration - newTimeLeft) / 60;
    const wpm =
      elapsedMinutes > 0 ? Math.round(correct / 5 / elapsedMinutes) : 0;
    const rawWpm =
      elapsedMinutes > 0
        ? Math.round((correct + incorrect) / 5 / elapsedMinutes)
        : 0;

    const previousErrors = wpmHistory.reduce((acc, curr) => acc + curr.err, 0);
    const errorsThisTick = incorrect - previousErrors;

    set({
      timeLeft: newTimeLeft,
      wpmHistory: [
        ...wpmHistory,
        {
          time: duration - newTimeLeft,
          wpm,
          rawWpm,
          err: errorsThisTick > 0 ? errorsThisTick : 0,
        },
      ],
    });
  },

  inputChar: (char) => {
    const { status, currentWordInput, originalWords, currentWordIndex } =
      get();
    if (status === "finished") return;
    if (status === "idle") get().start();

    const originalWord = originalWords[currentWordIndex] || "";
    if (currentWordInput.length >= originalWord.length + MAX_EXTRA_CHARS) {
      return;
    }

    set({ currentWordInput: currentWordInput + char });
  },

  deleteChar: () => {
    const { status, currentWordInput, currentWordIndex, typedWords } = get();
    if (status === "finished") return;

    if (currentWordInput.length > 0) {
      set({ currentWordInput: currentWordInput.slice(0, -1) });
    } else if (currentWordIndex > 0) {
      const prevWord = typedWords[currentWordIndex - 1];
      const newTypedWords = [...typedWords];
      newTypedWords.pop();
      set({
        currentWordIndex: currentWordIndex - 1,
        typedWords: newTypedWords,
        currentWordInput: prevWord,
      });
    }
  },

  inputSpace: () => {
    const {
      status,
      currentWordInput,
      currentWordIndex,
      typedWords,
      originalWords,
    } = get();
    if (status === "finished") return;
    if (status === "idle") get().start();
    if (currentWordInput.length === 0) return;

    const newTypedWords = [...typedWords, currentWordInput];

    let newOriginalWords = originalWords;
    if (currentWordIndex >= originalWords.length - WORD_PREFETCH_THRESHOLD) {
      newOriginalWords = [...originalWords, ...generateInitialWords()];
    }

    set({
      typedWords: newTypedWords,
      currentWordIndex: currentWordIndex + 1,
      currentWordInput: "",
      originalWords: newOriginalWords,
    });
  },
}));
