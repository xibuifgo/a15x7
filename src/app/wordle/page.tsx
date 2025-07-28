'use client';
import { useState, useEffect } from "react";
import Tile from './components/Tile';
import styles from './wordle.module.scss';

let log: string[] = [];
let msg = "";

export default function Wordle() {
    const [isGameOver, setIsGameOver] = useState(false);
    const [isGameWon, setIsGameWon] = useState(false);
    const [board, setBoard] = useState(
        Array(6).fill(null).map(() =>
          Array(5).fill({ letter: "", color: undefined, animation: undefined })
        )
      );
    const [ activeRow, setActiveRow ] = useState(0);
    const [ activeCol, setActiveCol ] = useState(0);
    const word = "HORNS";
    const keyboard = [
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
        ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
        ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
    ];
    const colors = {
        "A": "absent",
        "P": "present",
        "C": "correct"
    }
    const emojis = {
        "A": "⬜",
        "P": "🟨", 
        "C": "🟩"  
    }

    function colorLogic(guess: string, word: string): ("A" | "P" | "C")[] {
        // guess and word are both 5-letter strings
        let outcomes: ("A" | "P" | "C")[] = Array(5).fill("A"); // Default to absent
        let wordArr = word.split("");
        let guessArr = guess.split("");

        // First pass: check for correct (green)
        for (let i = 0; i < 5; i++) {
            if (guessArr[i] === wordArr[i]) {
                outcomes[i] = "C"; // Correct
                wordArr[i] = ""; // Remove matched letter
            }
        }

        // Second pass: check for present (yellow)
        for (let i = 0; i < 5; i++) {
            if (outcomes[i] === "C") continue;
            const idx = wordArr.indexOf(guessArr[i]);
            if (idx !== -1 && guessArr[i] !== word.split("")[i]) {
                outcomes[i] = "P"; // Present
                wordArr[idx] = ""; // Remove matched letter
            }
        }

        return outcomes;
    }

    function handleColorChange(outcome: ("A" | "P" | "C")[], row: number) {
      outcome.forEach((result, i) => {
        // Step 1: Flip out
        setTimeout(() => {
          setBoard(prev => {
            const newBoard = prev.map((r, rowIdx) =>
              r.map((cell, colIdx) => {
                if (rowIdx === row && colIdx === i) {
                  return {
                    ...cell,
                    animation: "flip-out",
                  };
                }
                return cell;
              })
            );
            return newBoard;
          });

          // Step 2: After flip-out, set color and flip-in
          setTimeout(() => {
            setBoard(prev => {
              const newBoard = prev.map((r, rowIdx) =>
                r.map((cell, colIdx) => {
                  if (rowIdx === row && colIdx === i) {
                    return {
                      ...cell,
                      color: colors[result],
                      animation: "flip-in",
                    };
                  }
                  return cell;
                })
              );
              return newBoard;
            });

            // Step 3: Clear animation after flip-in
            setTimeout(() => {
              setBoard(prev => {
                const newBoard = prev.map((r, rowIdx) =>
                  r.map((cell, colIdx) => {
                    if (rowIdx === row && colIdx === i) {
                      return {
                        ...cell,
                        animation: undefined,
                      };
                    }
                    return cell;
                  })
                );
                return newBoard;
              });
            }, 500); // flip-in duration
          }, 250); // flip-out duration
        }, i * 120); // stagger each tile
      });
    }

    function handleKeyChange(guess: string, outcome: ("A" | "P" | "C" )[]) {
        for ( let i = 0; i < 5; i++ ) {
            const id = "key-" + guess[i];
            const key = document.getElementById(id);
            
            if (key) {
                if ( outcome[i] === "C" ) {
                    key.setAttribute("data-state", "correct");
                } 
                else if ( outcome[i] === "P" ) {
                    key.setAttribute("data-state", "present");
                } else {
                    key.setAttribute("data-state", "absent");
                }
            }
        }
    }

    function genLog(outcomes: ("A" | "P" | "C")[], isGameWon = false) {
        let out_emojis = [];

        for ( const letter of outcomes ) {
            out_emojis.push(emojis[letter]);
        }

        log.push(out_emojis.join(""));
        console.log(log);

        if (activeRow === 5 || isGameWon ) {
            msg = "Wordle #Ayah " + (activeRow + 1) + "/6\n" + log.join("\n");
            console.log(msg);
        }
    }

    function sendMsg() {
        navigator.clipboard.writeText(msg);

        const clip = document.getElementById("clipboard");

        if (clip) {
            clip.style.backgroundColor = "#90ee90";
            clip.style.color = "#013220";
            clip.innerHTML = "Copied to Clipboard!"
        }
    }

    function revealWord() {
        const btn = document.getElementById("reveal");

        if (btn) {
            btn.innerHTML = "bull";
        }
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (activeRow >= board.length) return;

            const key = e.key;

            if (key === "Backspace") {
                if (activeCol > 0 && !isGameOver) {
                    setBoard(prev => {
                        const newBoard = prev.map((row, rowIdx) =>
                            row.map((cell, colIdx) => {
                                if (rowIdx === activeRow && colIdx === activeCol - 1) {
                                    return { ...cell, letter: "" };
                                }
                                return cell;
                            })
                        );
                        return newBoard;
                    });
                    setActiveCol(prev => prev - 1);
                }
            } else if (/^[a-zA-Z]$/.test(key) && activeCol < 5) {
                setBoard(prev => {
                    const newBoard = prev.map((row, rowIdx) =>
                        row.map((cell, colIdx) => {
                            if (rowIdx === activeRow && colIdx === activeCol) {
                                return { ...cell, letter: key.toUpperCase(), dataState: "tbd" };
                            }
                            return cell;
                        })
                    );
                    return newBoard;
                });

                const keyBtn = document.getElementById(`key-${key.toUpperCase()}`);
                if (keyBtn && keyBtn.getAttribute("data-state") === "inactive") {
                    keyBtn.setAttribute("data-state", "active");
                }

                setActiveCol(prev => prev + 1);

            } else if (key === "Enter") {
                if (activeCol === 5){
                    const guess = board[activeRow].map(cell => cell.letter).join("");
                    if (guess === word) {
                        let outcomes: ("A" | "P" | "C")[] = Array(5).fill("C");
                        handleColorChange(outcomes, activeRow);
                        setTimeout(() => {
                            handleKeyChange(guess, outcomes);
                        }, 1000)
                        setIsGameWon(true);
                        genLog(outcomes, true);
                        setTimeout(() => {
                            setIsGameOver(true);
                        }, 1000);
                    } else {
                        let outcomes = colorLogic(guess, word);
                        handleColorChange(outcomes, activeRow);
                        setTimeout(() => {
                            handleKeyChange(guess, outcomes);
                        }, 1000)

                        if ( activeRow != 5){
                            genLog(outcomes);
                            setActiveRow(prev => prev + 1);
                            setActiveCol(0);
                        } else {
                            genLog(outcomes, true);
                            setTimeout(() => {
                                setIsGameOver(true);
                                console.log("Message: ", msg);
                            }, 1000);
                        }
                    }
                }
                return;
            }
        }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeRow, activeCol, board]);

    function handleKey(key: string) {
        if (activeRow >= board.length) return;

        if (key === "BACK") {
            if (activeCol > 0) {
                setBoard(prev => {
                    const newBoard = prev.map((row, rowIdx) =>
                        row.map((cell, colIdx) => {
                            if (rowIdx === activeRow && colIdx === activeCol - 1) {
                                return { ...cell, letter: "" };
                            }
                            return cell;
                        })
                    );
                    return newBoard;
                })
                setActiveCol(prev => prev - 1);
            }
        } else if (/^[a-zA-Z]$/.test(key) && activeCol < 5) {
            setBoard(prev => {
                const newBoard = prev.map((row, rowIdx) => 
                    row.map((cell, colIdx) => {
                        if (rowIdx === activeRow && colIdx === activeCol) {
                            return { ...cell, letter: key.toUpperCase(), dataState: "tbd" };
                        }
                        return cell;
                    })
                );
                return newBoard;
            });

            const keyBtn = document.getElementById(`key-${key.toUpperCase()}`);
            if (keyBtn && keyBtn.getAttribute("data-state") === "inactive") {
                keyBtn.setAttribute("data-state", "active");
            }

            setActiveCol(prev => prev + 1);
        } else if (key === "ENTER") {
            if (activeCol === 5){
                const guess = board[activeRow].map(cell => cell.letter).join("");
                if (guess === word) {
                    let outcomes: ("A" | "P" | "C")[] = Array(5).fill("C");
                    setIsGameWon(true);
                    genLog(outcomes, true);
                    handleColorChange(outcomes, activeRow);
                    setTimeout(() => {
                        handleKeyChange(guess, outcomes);
                    }, 1000)
                } else {
                    let outcomes = colorLogic(guess, word);
                    genLog(outcomes);
                    handleColorChange(outcomes, activeRow);
                    setTimeout(() => {
                        handleKeyChange(guess, outcomes);
                    }, 1000)
                    setActiveRow(prev => prev + 1);
                    setActiveCol(0);
                }
            }
            return 
        }
    }

    return (
        <div>
            { isGameOver && (
                <div className={styles["game-over"]}>
                    <div className={styles["game-over-box"]}>
                        <button
                            className={styles["close-btn"]}
                            onClick={() => setIsGameOver(false)}
                            aria-label="Close"
                        >
                            x
                        </button>
                        <h2 className={styles["game-over-title"]}>{isGameWon ? "Perfect!" : "Game Over!"}</h2>
                        {!isGameWon && <h3>The word was: {word}!</h3>}
                        <div className={styles.explain}>
                            From one of my favorite voice messages:
                            <p className={styles.quote}>&quot;You need to grab the bull by the horns&quot;</p>
                            Now you know why I asked for it on the sisters group, I wanted to put it here
                        </div>
                        <button className={styles.btn} onClick={sendMsg} id='clipboard'>Share Your Results</button>
                        <button className={styles["word-btn"]} onClick={revealWord} id='reveal'>Reveal Secret Word</button>
                    </div>
                </div>
            )}
            <div className={styles.board}>
                {board.map((row, rowIdx) =>
                  row.map((cell, colIdx) => (
                    <Tile
                      key={`${rowIdx}-${colIdx}`}
                      letter={cell.letter}
                      rowIdx={rowIdx}
                      colIdx={colIdx}
                      color={cell.color}
                      animation={cell.animation}
                    />
                  ))
                )}
            </div>
            <div className={styles.keyboard}>
                {keyboard.map((row, rowIdx) => (
                    <div className={styles['keyboard-row']} key={rowIdx}>
                        {row.map((key) => (
                            <button 
                            className={`${styles.key} ${key.length > 1 ? styles["long-key"] : ""}`} 
                            key={key} 
                            onClick={() => handleKey(key)}
                            id={`key-${key.toUpperCase()}`}>
                                {key}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}