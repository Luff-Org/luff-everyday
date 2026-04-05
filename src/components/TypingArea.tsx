"use client";

import { useEffect, useRef } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export default function TypingArea() {
  const { 
    status, timeLeft, duration, originalWords, typedWords, currentWordIndex, currentWordInput,
    inputChar, deleteChar, inputSpace, reset
  } = useTypingStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore functional keys except Backspace and space
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Backspace") {
        e.preventDefault();
        deleteChar();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        inputSpace();
      } else if (e.key.length === 1) { // Normal character
        e.preventDefault();
        inputChar(e.key);
      } else if (e.key === "Escape") {
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputChar, deleteChar, inputSpace, reset]);

  // Smooth Caret logic
  useEffect(() => {
    const activeMarker = document.getElementById("caret-marker");
    if (activeMarker && caretRef.current && containerRef.current) {
      const container = containerRef.current;
      const cRect = container.getBoundingClientRect();
      const mRect = activeMarker.getBoundingClientRect();
      
      const x = mRect.left - cRect.left + container.scrollLeft;
      const y = mRect.top - cRect.top + container.scrollTop;

      caretRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [currentWordIndex, currentWordInput, typedWords, originalWords]);

  // Scrolling logic - scroll active word into view safely
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
        const container = containerRef.current;
        const activeWord = activeWordRef.current;
        
        const topPos = activeWord.offsetTop;
        if (topPos > 64) {
           container.scrollTo({ top: topPos - 64, behavior: 'smooth' });
        } else {
           container.scrollTo({ top: 0, behavior: 'auto' });
        }
    }
  }, [currentWordIndex]);

  return (
    <div className="w-full flex flex-col items-start gap-4">
      {/* Live Timer directly over words */}
      <div className="text-3xl font-bold text-primary tracking-wider transition-opacity duration-300 min-h-[40px]">
        {status === "typing" ? `${timeLeft}s` : ""}
      </div>

      <div 
        className="relative w-full text-4xl font-medium tracking-wider h-[16rem] overflow-hidden" 
        ref={containerRef}
        style={{ lineHeight: '4rem' }}
      >
        <div 
           ref={caretRef} 
           className={clsx(
              "absolute top-[0.1em] w-[3px] h-[1.3em] bg-primary rounded-full transition-all duration-100 ease-out z-50",
              status === "idle" && "animate-[blink_1s_step-end_infinite]"
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
                  className={clsx("relative flex", isTyped && typedWord !== word && "border-b-2 border-error")}
                  ref={isActive ? activeWordRef : null}
              >
                {/* Original Characters + Input validation */}
                {chars.map((char, charIdx) => {
                  let charStateClass = "text-sub-text";
                  if (charIdx < typedWord.length) {
                    const typedChar = typedWord[charIdx];
                    charStateClass = typedChar === char ? "text-correct" : "text-error";
                  }

                  return (
                    <span key={charIdx} className={clsx("transition-colors relative", charStateClass)}>
                      {isActive && typedWord.length === 0 && charIdx === 0 && <span id="caret-marker" className="absolute left-0 -ml-[1.5px] top-0 h-full w-[1px]" />}
                      {char}
                      {isActive && charIdx === typedWord.length - 1 && <span id="caret-marker" className="absolute right-0 -mr-[1.5px] top-0 h-full w-[1px]" />}
                    </span>
                  );
                })}
                
                {/* Extra typed characters */}
                {extraChars.map((extChar, extIdx) => (
                  <span key={`ext-${extIdx}`} className="text-error opacity-70 relative">
                    {extChar}
                    {isActive && extIdx === extraChars.length - 1 && <span id="caret-marker" className="absolute right-0 -mr-[1.5px] top-0 h-full w-[1px]" />}
                  </span>
                ))}

                {/* Trailing space marker if perfectly typed */}
                {isActive && typedWord.length === chars.length && extraChars.length === 0 && <span id="caret-marker" className="absolute right-0 -mr-[1.5px] top-0 h-full w-[1px]" />}
              </div>
            );
          })}
        </div>

        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity font-sans text-xl text-sub-text bg-transparent">
            Type any key to start...
          </div>
        )}
      </div>
    </div>
  );
}
