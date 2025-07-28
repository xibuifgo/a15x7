'use client';
import styles from './strands.module.scss';
import { useEffect, useState, useRef } from 'react';
import Board from './components/Board';
import boardStyles from './components/Board.module.scss';
import Image from 'next/image';
import Ayah from '../../../public/ayah_car.jpg';
import Msg from '../../../public/msg.jpg';

const words = [
    "ONION",
    "AZTECCLAY",
    "HERBALTEA",
    "TALLOW",
    "TUMMYTIME"
]

const lineColors: Record<string, string> = {
    selected: "#d8d8c5",
    solved: "#aedfee",      
    spangram: "#f8cd05",   
    empty: "none",       
};

const emojis: {[key: string]: string} = {
    "solved": "🔵",
    "spangram": "🟡",
    "hint": "😡"
}

const hints: {[key: string]: number[]} = {
    "ONION": [0, 1, 6, 7, 13],
    "AZTECCLAY": [12, 18, 19, 20, 21, 24, 25, 26, 27],
    "HERBALTEA": [31, 32, 33, 34, 37, 38, 39, 40, 46],
    "TALLOW": [30, 36, 42, 43, 44, 45],
    "TUMMYTIME": [3, 4, 5, 9, 10, 11, 17, 23, 29]
}

const spangram = "DOCTORAYAH";
const troll = "DUMMY";

const operator = [-7, -6, -5, -1, 0, 1, 5, 6, 7];

export default function StrandsPage() {
    const [guess, setGuess] = useState("");
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [linePoints, setLinePoints] = useState<{ x: number; y: number }[]>([]);
    const [currentLineState, setCurrentLineState] = useState("selected");
    const [solvedPaths, setSolvedPaths] = useState<{ path: number[]; type: string; word: string }[]>([]);
    const lastTouchedIdx = useRef<number | null>(null);

    // CHANGE BEFORE SENDING TO AYAH
    const [isHelp, setIsHelp] = useState(true);
    const [isGameOver, setIsGameOver] = useState(false);

    const boardRef = useRef<HTMLDivElement>(null);
    const [boardRect, setBoardRect] = useState({ left: 0, top: 0, width: 0, height: 0 });

    const [hintsLeft, setHintsLeft] = useState(2);
    const [isHintPressed, setIsHintPressed] = useState(false);
    const [isDumb, setIsDumb] = useState(false);
    const [hintIndices, setHintIndices] = useState<number[]>([]);

    useEffect(() => {
        // Get the center positions of each selected button
        if (boardRef.current){
            const rect = boardRef.current.getBoundingClientRect();
            setBoardRect({
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
            });
        }

        const points = selectedIndices.map(idx => {
            const btn = document.getElementById(`letter-${idx}`);
            if (btn) {
                const rect = btn.getBoundingClientRect();
                // Adjust for scroll and board offset if needed
                return {
                    x: rect.left + rect.width / 2 - boardRect.left,
                    y: rect.top + rect.height / 2 - boardRect.top,
                };
            }
            return null;
        }).filter(Boolean) as { x: number; y: number }[];
        setLinePoints(points);
    }, [selectedIndices]);

    useEffect(() => {
        if (solvedPaths.length === words.length + 1) {
            setTimeout(() => {
                setIsGameOver(true);
            }, 1000);
        }
    }, [solvedPaths, words.length]);

    function checkAdjacent(idx: number, lastid: number) {
        const adjacentCells = operator.map(item => item + lastid);
        if (adjacentCells.includes(idx)) {
            return true
        }
        return false;
    }

    function handleLetterDown(letter: string, idx: number) {
        const word = document.getElementById("word");

        if (word) {
            word.style.color = "";
        }

        setCurrentLineState("selected");

        setIsSelecting(true);
        setGuess(letter);
        setSelectedIndices([idx]);
        lastTouchedIdx.current = idx;

        const button = document.getElementById(`letter-${idx}`);

        if (button) {
            if (button.getAttribute("data-state") === "spangram" || button.getAttribute("data-state") === "solved") {
                setSelectedIndices([]);
                setGuess(" ");
                return;
            }
            button.setAttribute('data-state', 'selected');
        }
    };

    function handleLetterEnter(letter: string, idx: number) {
        const lastid = lastTouchedIdx.current;
        if (!isSelecting || lastid === null) return;

        if (!selectedIndices.includes(idx)) {
            if (checkAdjacent(idx, lastid)) {
                setGuess(prev => prev + letter);
                setSelectedIndices(prev => [...prev, idx]);

                const button = document.getElementById(`letter-${idx}`);

                if (button) {
                    if (button.getAttribute("data-state") === "spangram" || button.getAttribute("data-state") === "solved") {
                        setSelectedIndices((prev => prev.slice(0, -1)));
                        setGuess(prev => prev.slice(0, -1));
                        return;
                    }
                    button.setAttribute('data-state', 'selected');
                }
                lastTouchedIdx.current = idx;
            }
        } else if (checkAdjacent(idx, lastid)) {
            // Only allow unselect if idx is the previous letter in the path
            if (selectedIndices[selectedIndices.length - 2] === idx) {
                // Unselect last letter
                const button = document.getElementById(`letter-${lastid}`);
                if (button) {
                    if (button.getAttribute("data-state") === "spangram" || button.getAttribute("data-state") === "solved") {
                        setSelectedIndices((prev => prev.slice(0, -1)));
                        setGuess(prev => prev.slice(0, -1));
                        return;
                    }
                    button.setAttribute("data-state", "empty")
                };
                setGuess(prev => prev.slice(0, -1));
                setSelectedIndices(prev => prev.slice(0, -1));
                lastTouchedIdx.current = idx;
            }
        }
    }

    function handleLetterLeave(idx: number) {
        const word = document.getElementById("word");

        if (words.includes(guess)) {
            handleStateChange("solved");
            setSolvedPaths(prev => [...prev, {path: selectedIndices, type: "solved", word: guess}]);
            setSelectedIndices([]); // This clears the current selection, but solvedPaths keeps the old one

            if (word) {
                word.style.color = lineColors["solved"];
            }

            console.log(solvedPaths);
            console.log(solvedPaths.length);

            if (isHintPressed) {
                const hint = hints[guess];

                for (const idx of hint) {
                    const btn = document.getElementById(`letter-${idx}`);

                    if (btn) {
                        btn.classList.remove(boardStyles["hint"]);
                    }
                }
            }

        } else if (guess === spangram) {
            console.log("spangram found")
            handleStateChange("spangram");
            setSolvedPaths(prev => [...prev, {path: selectedIndices, type: "spangram", word: guess}]);
            setSelectedIndices([]);

            if (word) {
                word.style.color = lineColors["spangram"];

                setTimeout(() => {
                    word.innerHTML = "Spangram found!";
                }, 600);
            }

        } else if (guess === troll) {
            setGuess("OMG!");

            setTimeout(() => {
                setIsDumb(true);
                handleStateChange("empty");
                setSelectedIndices([]);
            })
        } else {

            if (word) {
                word.classList.add(styles["invalidshake"]);
                word.addEventListener("animationend", function handler() {
                    word.classList.remove(styles["invalidshake"]);
                    word.removeEventListener("animationend", handler);
                })

                setTimeout(() => {
                    word.innerHTML = "Not in word list";
                }, 500)

                setTimeout(() => {
                    setGuess(" ");
                }, 1000)
            }

            handleStateChange("empty");
            setSelectedIndices([]);
        }

    };

    function handleStateChange(state: string) {
        setCurrentLineState(state);

        for (const index of selectedIndices) {
            const button = document.getElementById(`letter-${index}`);

            if (button) {
                button.setAttribute("data-state", state);
                if (state === "solved") {
                    button.classList.add(boardStyles["animPulse"]);
                    button.addEventListener("animationend", function handler() {
                        button.classList.remove(boardStyles["animPulse"]);
                        button.removeEventListener("animationend", handler);
                    });
                }
            }
        }
    }

    function handleHint() {
        setIsHintPressed(true);

        if (hintsLeft === 1) {
            const btn = document.getElementById("hint-btn");

            if (btn) {
                btn.style.backgroundColor = "white";
                btn.style.color = "black";
            };

        }

        const hint = chooseHint();
        console.log("Hint chosen: ", hint);

        for (const idx of hint) {
            const btn = document.getElementById(`letter-${idx}`);

            if (btn) {
                btn.classList.add(boardStyles["hint"]);
            }
        }

        if (hintsLeft > 0) {
            setHintsLeft(prev => prev - 1);
        }

        setHintIndices(prev => [...prev, solvedPaths.length])
    }

    function chooseHint() {
        const wordsLeft = words.filter(word => !solvedPaths.some(path => path.word === word));
        console.log(wordsLeft)
        return hints[wordsLeft[Math.floor(Math.random() * (wordsLeft.length + 1))]];
    }

    function genMsg() {
        const msg = ['Strands #Ayah\n"We have a witch in the family!"'];
        let tmp = [];

        // Count how many hints were used before any word was solved
        const preHints = hintIndices.filter(idx => idx === 0).length;
        let hintIdx = preHints;

        // Add all pre-hint emojis at the start
        if (preHints > 0) {
            tmp.push(emojis["hint"].repeat(preHints));
        }

        for (let i = 0; i < solvedPaths.length; i++) {
            const path = solvedPaths[i];
            tmp.push(emojis[path.type]);

            // Add a hint emoji if a hint was used after this word
            if (hintIndices[hintIdx] === i + 1) {
                tmp.push(emojis["hint"]);
                hintIdx++;
            }

            if (tmp.length === 4) {
                console.log(tmp);
                msg.push(tmp.join(""));
                tmp = [];
            }

            if (i === solvedPaths.length - 1) {
                msg.push(tmp.join(""));
            }
        }

        const message = msg.join("\n");
        console.log(message);

        if (navigator.share) {
            navigator.share({
                text: message,
            });
        } else {
            navigator.clipboard.writeText(message);
            const btn = document.getElementById("msg-btn");
            if (btn) {
                btn.style.backgroundColor = "#90ee90";
                btn.style.color = "#013220";
                btn.innerHTML = "Copied!";
            }
        }
    }

    function revealWord() {
        const btn = document.getElementById("reveal");

        if (btn) {
            btn.innerHTML = "not_funion";
        }
    }

    return (
        <div style={{ position: "relative" }}>
            { isHelp && (
                <div className={styles["game-over"]}>
                    <div className={styles["game-over-box"]}>
                        <button
                            className={styles["close-btn"]}
                            onClick={() => setIsHelp(false)}
                            aria-label="Close"
                        >
                            x
                        </button>
                        <h2>Listen Up Ayah </h2>
                        <p>So this is gonna be a bit different, because I know you use SO MANY hints</p>
                        <h3>You only get two HEHE </h3>
                        <p>Also if you get a word that isnt in the category it doesnt count. Other than that its the same game!</p>
                        <h2>Have fun!</h2>
                    </div>
                </div>
            )}
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
                        <h2> Perfect! </h2>
                        <Image
                            src={Msg}
                            alt="You withholding info from me"
                            width={450}
                            height={450}
                        />
                        <p>Thanks for giving me your weird remedies in the winter break {"("}They worked{" )"}</p>
                        <button className={styles["btn-in"]} onClick={genMsg} id="msg-btn">Share Results!</button>
                        <button className={styles["word-btn"]} onClick={revealWord} id="reveal">Reveal Secret Word</button>
                    </div>
                </div>
            )}
            { isDumb && (
                <div className={styles["game-over"]}>
                    <div className={styles["game-over-box"]}>
                        <button
                            className={styles["close-btn"]}
                            onClick={() => setIsDumb(false)}
                            aria-label="Close"
                        >
                            x
                        </button>
                        <h2> Who you calling dummy? </h2>
                        <div className={styles.img}>
                            <Image
                                src={Ayah}
                                alt="You"
                                width={300}
                                height={300}
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.title}>
                <h1 className={styles['game-title']}>Strands </h1>
                <span className={styles.birthday}> July 15, 2025 </span>
            </div>
            <hr className={styles.bar}></hr>
            <div className={styles.toolbar}>
                {/* HELP BUTTON */}
                <div className={styles["toolbar-item"]} onClick={() => setIsHelp(true)}>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="22" viewBox="2 2 28 28" width="22" className={styles["game-icon"]} data-testid="icon-help"><path fill="var(--text)" d="M15 24H17.6667V21.3333H15V24ZM16.3333 2.66666C8.97333 2.66666 3 8.63999 3 16C3 23.36 8.97333 29.3333 16.3333 29.3333C23.6933 29.3333 29.6667 23.36 29.6667 16C29.6667 8.63999 23.6933 2.66666 16.3333 2.66666ZM16.3333 26.6667C10.4533 26.6667 5.66667 21.88 5.66667 16C5.66667 10.12 10.4533 5.33332 16.3333 5.33332C22.2133 5.33332 27 10.12 27 16C27 21.88 22.2133 26.6667 16.3333 26.6667ZM16.3333 7.99999C13.3867 7.99999 11 10.3867 11 13.3333H13.6667C13.6667 11.8667 14.8667 10.6667 16.3333 10.6667C17.8 10.6667 19 11.8667 19 13.3333C19 16 15 15.6667 15 20H17.6667C17.6667 17 21.6667 16.6667 21.6667 13.3333C21.6667 10.3867 19.28 7.99999 16.3333 7.99999Z"></path></svg>
                </div>
            </div>
            <hr className={styles.bar}></hr>
            <div className={styles["game-cont"]}>
                <div className={styles["riddle-cont"]}>
                    <section id="riddle" className = {styles["riddle-box"]}>
                        <h3 className={styles["riddle-title"]}>today&rsquo;s theme</h3>
                        <h1 className={styles.riddle}>&quot;We have a witch in the family!&quot;</h1>
                    </section>
                </div>
                {guess && <p className={styles.word} id="word">{guess}</p>}
                <div
                  ref={boardRef}
                  style={{ position: "relative", display: "inline-block", zIndex: 2 }}
                >
                  <svg
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      pointerEvents: "none",
                      width: boardRect.width,
                      height: boardRect.height,
                      zIndex: 1,
                    }}
                  >
                    {/* Lines for solved paths */}
                    {solvedPaths.map((path, pathIdx) => {
                        const points = path.path.map(idx => {
                            const btn = document.getElementById(`letter-${idx}`);
                            if (btn) {
                              const rect = btn.getBoundingClientRect();
                              return {
                                x: rect.left + rect.width / 2 - boardRect.left,
                                y: rect.top + rect.height / 2 - boardRect.top,
                              };
                            }
                            return null;
                          }).filter(Boolean);

                        return points.length > 1
                          ? points.slice(1).map((pt, i) =>
                              points[i] && pt ? (
                                <line
                                  key={`${pathIdx}-${i}`}
                                  x1={points[i].x}
                                  y1={points[i].y}
                                  x2={pt.x}
                                  y2={pt.y}
                                  stroke={lineColors[path.type]}
                                  strokeWidth={12}
                                  strokeLinecap="round"
                                />
                              ) : null
                            )
                          : null;
                    })}

                    {/* Lines for current selection */}
                    {linePoints.length > 1 &&
                      linePoints.slice(1).map((pt, i) => (
                        <line
                          key={`current-${i}`}
                          x1={linePoints[i].x}
                          y1={linePoints[i].y}
                          x2={pt.x}
                          y2={pt.y}
                          stroke={lineColors[currentLineState]}
                          strokeWidth={12}
                          strokeLinecap="round"
                        />
                      ))}
                  </svg>
                  <Board onLetterClick={handleLetterDown} onLetterEnter={handleLetterEnter} onLetterLeave={handleLetterLeave}/>
                </div>
                <div className={styles["hint-cont"]}>
                    <button className={styles.btn} onClick={handleHint} id="hint-btn" disabled={hintsLeft === 0}>Hint</button>
                    <p style={{ opacity: 1, pointerEvents: "auto" }}><b>{solvedPaths.length}</b> of <b>{words.length + 1}</b> theme words found.</p>
                </div>
            </div>
        </div>
    )
}