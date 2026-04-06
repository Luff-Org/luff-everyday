"use client";

import { useEffect, useRef, useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { clsx } from "clsx";
import { RotateCcw } from "lucide-react";
import { LINE_HEIGHT_PX } from "@/lib/constants";

import { Tooltip } from "@/components/ui/Tooltip";

export default function TypingArea() {
  const {
    status,
    timeLeft,
    originalWords,
    typedWords,
    currentWordIndex,
    currentWordInput,
    inputChar,
    deleteChar,
    inputSpace,
    reset,
  } = useTypingStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard Event Listener
  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "BUTTON") {
        if (e.key === "Enter" || e.key === " ") return;
      }
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        reset();
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Backspace") {
        e.preventDefault();
        deleteChar();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        inputSpace();
      } else if (e.key.length === 1) {
        e.preventDefault();
        inputChar(e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputChar, deleteChar, inputSpace, reset, mounted]);

  // Smooth Caret logic
  useEffect(() => {
    if (!mounted) return;
    const activeMarker = document.getElementById("caret-marker");
    if (activeMarker && caretRef.current && containerRef.current) {
      const container = containerRef.current;
      const cRect = container.getBoundingClientRect();
      const mRect = activeMarker.getBoundingClientRect();

      const x = mRect.left - cRect.left + container.scrollLeft;
      const y = mRect.top - cRect.top + container.scrollTop;

      caretRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [currentWordIndex, currentWordInput, typedWords, originalWords, mounted]);

  // Scrolling logic
  useEffect(() => {
    if (!mounted) return;
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const topPos = activeWordRef.current.offsetTop;
      if (topPos > LINE_HEIGHT_PX) {
        container.scrollTo({
          top: topPos - LINE_HEIGHT_PX,
          behavior: "smooth",
        });
      } else {
        container.scrollTo({ top: 0, behavior: "auto" });
      }
    }
  }, [currentWordIndex, mounted]);

  if (!mounted) {
    return <div className="w-full h-[20rem] animate-pulse bg-background/20 rounded-2xl" />;
  }

  return (
    <div className="w-full flex flex-col items-start gap-4">
      {/* Live Timer */}
      <div className="text-3xl font-bold text-primary tracking-wider transition-opacity duration-300 min-h-[40px]">
        {status === "typing" ? `${timeLeft}s` : ""}
      </div>

      <div
        className="relative w-full text-3xl font-normal tracking-wide h-[14rem] overflow-hidden cursor-text"
        ref={containerRef}
        style={{ lineHeight: "3.5rem" }}
        onClick={() => {
          const input = document.getElementById("hidden-mobile-input");
          if (input) input.focus();
        }}
      >
        <input
          id="hidden-mobile-input"
          type="text"
          className="absolute top-0 left-0 opacity-0 w-0 h-0 p-0 m-0 border-none outline-none z-[-1]"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          data-gramm="false"
          // We clear the value on every change so it doesn't build up a long string.
          // The global keydown listener handles the actual characters.
          onChange={(e) => {
            const val = e.target.value;
            if (val) {
              const char = val.slice(-1);
              if (char === " ") inputSpace();
              else inputChar(char);
              e.target.value = "";
            }
          }}
        />

        {/* Mobile/Tablet Keyboard Prompt */}
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center lg:hidden z-40 pointer-events-none">
            <div className="bg-background/80 backdrop-blur-sm border border-primary/30 text-primary px-6 py-3 rounded-full text-lg font-bold shadow-lg animate-pulse">
              Tap to open keyboard
            </div>
          </div>
        )}

        <div
          ref={caretRef}
          className={clsx(
            "absolute top-[0.1em] w-[3px] h-[1.3em] bg-primary rounded-full transition-all duration-100 ease-out z-50",
            status === "idle" && "animate-[blink_1s_step-end_infinite]",
          )}
        />

        <div className="flex flex-wrap gap-x-3 transition-transform duration-300">
          {originalWords.map((word, wordIdx) => {
            const isActive = wordIdx === currentWordIndex;
            const isTyped = wordIdx < currentWordIndex;

            let typedWord = "";
            if (isTyped) typedWord = typedWords[wordIdx];
            else if (isActive) typedWord = currentWordInput;

            const chars = word.split("");
            const extraChars = typedWord.slice(word.length).split("");

            return (
              <div
                key={wordIdx}
                className={clsx(
                  "relative flex",
                  isTyped && typedWord !== word && "border-b-2 border-error",
                )}
                ref={isActive ? activeWordRef : null}
              >
                {chars.map((char, charIdx) => {
                  let charStateClass = "text-sub-text";
                  if (charIdx < typedWord.length) {
                    charStateClass =
                      typedWord[charIdx] === char
                        ? "text-correct"
                        : "text-error";
                  }

                  return (
                    <span
                      key={charIdx}
                      className={clsx(
                        "transition-colors relative",
                        charStateClass,
                      )}
                    >
                      {isActive && typedWord.length === 0 && charIdx === 0 && (
                        <span
                          id="caret-marker"
                          className="absolute left-0 -ml-[1.5px] top-0 h-full w-[1px]"
                        />
                      )}
                      {char}
                      {isActive && charIdx === typedWord.length - 1 && (
                        <span
                          id="caret-marker"
                          className="absolute right-0 -mr-[1.5px] top-0 h-full w-[1px]"
                        />
                      )}
                    </span>
                  );
                })}

                {extraChars.map((extChar, extIdx) => (
                  <span
                    key={`ext-${extIdx}`}
                    className="text-error opacity-70 relative"
                  >
                    {extChar}
                    {isActive && extIdx === extraChars.length - 1 && (
                      <span
                        id="caret-marker"
                        className="absolute right-0 -mr-[1.5px] top-0 h-full w-[1px]"
                      />
                    )}
                  </span>
                ))}

                {isActive &&
                  typedWord.length === chars.length &&
                  extraChars.length === 0 && (
                    <span
                      id="caret-marker"
                      className="absolute right-0 -mr-[1.5px] top-0 h-full w-[1px]"
                    />
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Restart Controls */}
      <div className="w-full flex flex-col items-center mt-12 gap-4 text-sm text-sub-text font-mono opacity-80 select-none">
        <Tooltip content="Restart Test" position="top">
          <button
            onClick={reset}
            className="hover:text-foreground transition p-4 rounded-full hover:bg-background/50 outline-none focus:bg-background/80 focus:text-foreground"
            tabIndex={1}
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </Tooltip>

        <div className="flex flex-col items-center gap-2 mt-2 opacity-70">
          <div className="flex items-center gap-2">
            <kbd className="bg-card-bg px-2 py-0.5 rounded text-xs">shift</kbd>
            <span>+</span>
            <kbd className="bg-card-bg px-2 py-0.5 rounded text-xs">enter</kbd>
            <span className="ml-2">- restart test</span>
          </div>
        </div>
      </div>
    </div>
  );
}
