'use client';
import { useState, useEffect } from 'react';
import styles from './connect.module.scss';
import wordsData from './words/words.json';
import DropDown from './DropDown';

let mistakesRemaining = 4;
let catsCompleted = 0;

function shuffleArray(arr: string[] = wordsData.words) {
    const words = [...arr]; // Create a copy of the array to avoid mutating the original

    for (let i = words.length - 1; i > 0; i--) {

        // Generate random index
        const j = Math.floor(Math.random() * (i + 1));
                    
        // Swap elements at indices i and j
        const temp = words[i];
        words[i] = words[j];
        words[j] = temp;

    }
    return words;
};

function removeItem(array: string[], itemToRemove: string) {
    const index = array.indexOf(itemToRemove);

    if (index !== -1) {
        array.splice(index, 1);
    }

};

function checkCategories(words: string[]) {
    const categories = wordsData.categories;
    const catTracker = [];

    for (const category of categories) {
        const categoryWords = (wordsData as any)[category];
        
        words.sort();
        categoryWords.sort();

        if (words.every((element, index) => element === categoryWords[index])) {
            return category;
        }

        for (const word of words) {
            if (categoryWords.includes(word)) {
                catTracker.push(category);
            }
        }
        
    }

    for (const category of categories) {
        if (catTracker.filter(cat => cat === category).length === 3) {
            return "one-away";
        }
    }

    return false;

}

function toId(str: string) {
    return str.replace(/[^a-zA-Z0-9_-]/g, "_");
}


export default function Connections() {
    const [words, setWords] = useState<string[]>(wordsData.words);
    const [correctGroups, setCorrectGroups] = useState<{category: string, words: string[]}[]>([]);
    const categoryColors: { [key: string]: string } = {
        "things you've crocheted": "#F9DF6D",
        "what we love about you": "#A0C35A",
        "thanks, ____!": "#B0C4EF",
        "reasons we call you": "#BA81C5"
    };

    const [isGameOver, setIsGameOver] = useState(false);
    const [gameLog, setGameLog] = useState<string[]>([]);
    const [didWin, setDidWin] = useState(false);
    const [isOneAway, setIsOneAway] = useState(false);
    const [isDoneBefore, setIsDoneBefore] = useState(false);
    const [lastSolvedCategory, setLastSolvedCategory] = useState<string | null>(null);
    const [history, setHistory] = useState<{ [key: string]: string[] }>({});

    // Toolbar stuff
    const [isHelp, setIsHelp] = useState(false);
    const [isHint, setIsHint] = useState(false);

    const catEmojis: { [key: string]: string } = {
        "#F9DF6D": "🟨",
        "#A0C35A": "🟩",
        "#B0C4EF": "🟦",
        "#BA81C5": "🟪"
    };

    let clickCount = 0;
    let stopClick = false;
    let clickedWords: string[] = [];

    useEffect(() => {
    setWords(shuffleArray(wordsData.words));
    }, []);

    useEffect(() => {
        if (!lastSolvedCategory) return;
        const catId = toId(lastSolvedCategory);
        const group = document.getElementById(catId);
        if (group) {
            group.classList.add(styles.pulse);
            setTimeout(() => {
                group.classList.remove(styles.pulse);
            }, 400);
        }

        setLastSolvedCategory(null);
    }, [correctGroups, lastSolvedCategory])

    function shuffle() {
        setWords(shuffleArray(words));
        deselect();
    }

    function clicked(key: Number) {
        const id = 'card-' + key;
        const card = document.getElementById(id);
        const submitBtn = document.getElementById("submit-btn");
        
        if (card) {

            const computedStyle = window.getComputedStyle(card);
            const isSelected = computedStyle.backgroundColor === "rgb(90, 89, 78)";

            if (isSelected) {
                card.style.background = "";
                card.style.color = "";
                clickCount--;
                removeItem(clickedWords, id);
            }
            if ( !isSelected && !stopClick ) {
                card.style.background = "#5A594E";
                card.style.color = "#F8F8F8";
                clickCount++;
                clickedWords.push(id);
            }

            if (clickCount === 4) {
                stopClick = true;
                if (submitBtn) {
                    submitBtn.style.background = "#121212";
                    submitBtn.style.color = "#F8F8F8";
                }
            }
            else {
                stopClick = false;
                if (submitBtn) {
                    submitBtn.style.background = "";
                    submitBtn.style.color = "";
                }
            }

        }
    }

    function deselect() {
    
        for (const i in clickedWords) {
            const card = document.getElementById(clickedWords[i]);
            if (card) {
                card.style.background = "";
                card.style.color = "";
            }
        }

        clickCount = 0;
        clickedWords = [];
        stopClick = false;

        const submitBtn = document.getElementById("submit-btn");

        if (submitBtn) {
            submitBtn.style.background = "";
            submitBtn.style.color = "";
        }
    }

    function updateBoard(cat: string[]) {
        const newWords = words.filter(word => !cat.includes(word));
        setWords(newWords);
    }

    function findCategory(word: string) {
        const cats = wordsData.categories;

        for (const category of cats) {
            const categoryWords = (wordsData as any)[category];
            if (categoryWords.includes(word)) {
                return category;
            }
        }
        return "none";
    }

    function createLog(words: string[], category: string = "none") {
        let newEntries: string[] = [];

        if (category === "none") {
            for (const word of words) {
                const cat = findCategory(word);
                newEntries.push(categoryColors[cat] || "#eee");
            }
        } else {
            const color = categoryColors[category] || "#eee";
            for (let i = 0; i < 4; i++) {
                newEntries.push(color);
            }
        }

        setGameLog(prevLog => [...prevLog, ...newEntries]);
    }

    function solveBoard() {
        const catsLeft = wordsData.categories.filter(cat => !correctGroups.some(group => group.category === cat));

        function solveNext(index: number) {
            if (index >= catsLeft.length) {
                return;
            }

            const category = catsLeft[index];
            const categoryWords = (wordsData as any)[category];

            setCorrectGroups(prev => [...prev, {category, words: categoryWords}]);
            setLastSolvedCategory(category);

            setWords(prevWords => prevWords.filter(word => !categoryWords.includes(word)));

            setTimeout(() => {
                solveNext(index + 1);
            }, 800);
        }

        solveNext(0);
    }

    function doneBefore(words: string[]) {
        for (const guesses in history) {
            if (history[guesses].every(word => words.includes(word))) {
                return true;
            }
        }
        return false;
    }

    function submit() {
        const words: string[] = [];

        if (clickedWords.length !== 4) {
            return;
        }

        for (const i in clickedWords) {
            const word = document.getElementById(clickedWords[i]);

            if (word) {
                words.push(word.innerHTML);
            }

        }

        setHistory(prev => ({
        ...prev,
        [`round-${Object.keys(prev).length}`]: words
        }));

        console.log("History:", history);
        console.log("Clicked Words:", clickedWords);

        const matchedCategory = checkCategories(words);
        if (matchedCategory && matchedCategory !== "one-away") {

            for (let i = 0; i < 4; i++) {
                const card = document.getElementById(clickedWords[i]);
                setTimeout(() => {
                    if (card) {
                        card.classList.add(styles.solvedBounce);
                        setTimeout(() => {
                            card.classList.remove(styles.solvedBounce);
                        }, 400)
                    }
                }, i * 120);
            };

            setTimeout(() => {

                updateBoard(words);

                setCorrectGroups(prev => [...prev, { category: matchedCategory, words }]);
                setLastSolvedCategory(matchedCategory);

                catsCompleted++;
                createLog(words, matchedCategory);

                if (catsCompleted === 4) {
                    setIsGameOver(true);
                    setDidWin(true);
                }

                deselect();
            }, 4 * 120 + 400);

        } else {
            mistakesRemaining--;
            const bubble = document.getElementById("bubble-" + mistakesRemaining);

            if (matchedCategory === "one-away") {
                setIsOneAway(true);
                setTimeout(() => {
                    setIsOneAway(false);
                }, 1500);
            }

            if (doneBefore(words)) {
                mistakesRemaining++;
                setIsDoneBefore(true);
                setTimeout(() => {
                    setIsDoneBefore(false);
                }, 1500);
                deselect();
                return;
            }

            if (bubble) {
                bubble.style.backgroundColor = "#ffffff";

                for (const i in clickedWords) {
                    const card = document.getElementById(clickedWords[i]);
                    if (card) {
                        card.classList.add(styles.mistakeShake);
                        setTimeout(() => {
                            card.classList.remove(styles.mistakeShake);
                        }, 400);
                    }
                }

                createLog(words);
                deselect();

                if (mistakesRemaining === 0) {
                    // alert("Game Over!");
                    solveBoard();
                    setIsGameOver(true);
                }
            }
        }

    }

    function toEmoji() {
        let msg = ["Connections", "Puzzle #Ayah"];
        let row = [];

        for (let i = 0; i < gameLog.length; i++) {
            const color = gameLog[i];
            if (catEmojis[color]) {
                row.push(catEmojis[color]);
            }

            if (i % 4 === 3) {
                msg.push(row.join(""))
                row = []
            }
        }

        console.log("Game Log:", gameLog);
        console.log("Message: ", msg.join("\n"))

        // Copy the text to clipboard
        navigator.clipboard.writeText(msg.join("\n"));

        const clip = document.getElementById('clipboard');

        if (clip) {
            clip.style.backgroundColor = "#90ee90"
            clip.style.color = "#013220"
            clip.innerHTML = "Copied!"
        }

    }

    function revealWord() {
        const btn = document.getElementById("reveal");

        if (btn) {
            btn.innerHTML = "enigma";
        }
    }

    return (
        <div>
            {isGameOver && (
                <div className={styles["game-over"]}>
                    <div className={styles["game-over-box"]}>
                        <button
                            className={styles["close-btn"]}
                            onClick={() => setIsGameOver(false)}
                            aria-label="Close"
                        >
                            x
                        </button>
                        <h2>{didWin ? "Perfect!" : "Game Over!"}</h2>
                        <h3>Connections #Ayah</h3>
                        <div className={styles["log-grid"]}>
                            {gameLog.map((log, index) => (
                                <span key={index} className={styles.block} style={{backgroundColor: log}}></span>
                            ))}
                        </div>
                        <button className={styles.btn} onClick={toEmoji} id='clipboard'>Share Your Results</button>
                        <button className={styles["word-btn"]} onClick={revealWord} id='reveal'>Reveal Secret Word</button>
                    </div>
                </div>
            )}
            <div className={styles.title}>
                <h1 className={styles['game-title']}>Connections </h1>
                <span className={styles.birthday}> July 15, 2025 </span>
            </div>
            <hr className={styles.bar}></hr>
            {isHelp && (
                <div className={styles["game-over"]} onClick={() => setIsHelp(false)}>
                    <div className={styles["game-over-box"]}>
                        <span>Girl we both know you know how to play</span>
                        {/* Maybe include section of our chat with connections // show her getting it wrong and say maybe not */}
                    </div>
                </div>
            )}
            {isHint && (
                <div className={styles["game-over"]}>
                    <div className={styles["game-over-box"]}>
                        <button
                            className={styles["close-btn"]}
                            onClick={() => setIsHint(false)}
                            aria-label="Close"
                        >
                            x
                        </button>
                        <h2>Hints</h2>
                        <div className={styles["dd-cont"]}>
                            <DropDown
                                title="Straightforward"
                                color="#F9DF6D"
                            >
                                <div className={styles.idk}>Considering all the grandma activities you do, I&apos;m surprised you didn&apos;t figure this one out yet</div>
                            </DropDown>
                            <DropDown 
                                title="Easy"
                                color="#A0C35A"
                            >
                                <div className={styles.idk}>I&apos;m sure you&apos;ve heard these words a lot</div>
                            </DropDown>
                            <DropDown
                                title="Hard"
                                color="#B0C4EF"
                            >
                                <div className={styles.idk}>My response to this category would be you&apos;re welcome</div>
                            </DropDown>
                            <DropDown 
                                title="Tricky"
                                color="#BA81C5"
                            >
                                <div className={styles.idk}> Our bad </div>
                            </DropDown>
                        
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.toolbar}>
                {/* HINT BUTTON */}
                <div className={styles["toolbar-item"]} onClick={() => setIsHint(true)}>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="21" viewBox="0 0 24 24" width="21" className={styles["game-icon"]} data-testid="icon-forum"><path fill="var(--text)" d="M15.4538 15.0078C17.2881 13.8544 18.5 11.818 18.5 9.5C18.5 5.91015 15.5899 3 12 3C8.41015 3 5.5 5.91015 5.5 9.5C5.5 11.818 6.71194 13.8544 8.54624 15.0078C9.37338 15.5279 10 16.4687 10 17.6014V20H14V17.6014C14 16.4687 14.6266 15.5279 15.4538 15.0078ZM16.5184 16.7009C16.206 16.8974 16 17.2323 16 17.6014V20C16 21.1046 15.1046 22 14 22H10C8.89543 22 8 21.1046 8 20V17.6014C8 17.2323 7.79404 16.8974 7.48163 16.7009C5.08971 15.1969 3.5 12.5341 3.5 9.5C3.5 4.80558 7.30558 1 12 1C16.6944 1 20.5 4.80558 20.5 9.5C20.5 12.5341 18.9103 15.1969 16.5184 16.7009ZM8 17H16V21C16 22.1046 15.1046 23 14 23H10C8.89543 23 8 22.1046 8 21V17Z"></path></svg>
                </div>
                {/* HELP BUTTON */}
                <div className={styles["toolbar-item"]} onClick={() => setIsHelp(true)}>
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" height="22" viewBox="2 2 28 28" width="22" className={styles["game-icon"]} data-testid="icon-help"><path fill="var(--text)" d="M15 24H17.6667V21.3333H15V24ZM16.3333 2.66666C8.97333 2.66666 3 8.63999 3 16C3 23.36 8.97333 29.3333 16.3333 29.3333C23.6933 29.3333 29.6667 23.36 29.6667 16C29.6667 8.63999 23.6933 2.66666 16.3333 2.66666ZM16.3333 26.6667C10.4533 26.6667 5.66667 21.88 5.66667 16C5.66667 10.12 10.4533 5.33332 16.3333 5.33332C22.2133 5.33332 27 10.12 27 16C27 21.88 22.2133 26.6667 16.3333 26.6667ZM16.3333 7.99999C13.3867 7.99999 11 10.3867 11 13.3333H13.6667C13.6667 11.8667 14.8667 10.6667 16.3333 10.6667C17.8 10.6667 19 11.8667 19 13.3333C19 16 15 15.6667 15 20H17.6667C17.6667 17 21.6667 16.6667 21.6667 13.3333C21.6667 10.3867 19.28 7.99999 16.3333 7.99999Z"></path></svg>
                </div>
            </div>
            <hr className={styles.bar}></hr>
            {isDoneBefore && (
                <div className={styles["alert"]}>
                    <span className={styles["alert-text"]}>Ayah you&apos;ve done this before!</span>
                </div>
            )}
            {isOneAway && (
                <div className={styles["alert"]}>
                    <span className={styles["alert-text"]}>One away...</span>
                </div> 
            )}
            <div className={styles.game}>
                <span className={styles["game-text"]}>Create groups of four!</span>

                <div className={styles["correct-groups"]}>
                    {correctGroups.map((group, index) => (
                        <div key={index} id={`${toId(group.category)}`} className={styles["correct-group"]} style={{ background: categoryColors[group.category] || "#eee" }}>
                            <div className={styles["category-title"]}>{group.category}</div>
                            <div className={styles["correct-words"]}>
                                {group.words.map((word, wordIndex) => (
                                    <span key={wordIndex} className={styles["correct-word"]}>{word}, </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles["card-cont"]}>
                    {words?.map((word, index) => (
                        <div key={index} id={'card-' + index}  onClick={() => clicked(index)} className={styles.card}>{word}</div>
                    ))}
                </div>
                <div className={styles["mistake-bar"]}>
                    <span className={styles["game-text"]} >Mistakes Remaining: </span>
                    <div className={styles.bubble} id="bubble-0"></div>
                    <div className={styles.bubble} id="bubble-1"></div>
                    <div className={styles.bubble} id="bubble-2"></div>
                    <div className={styles.bubble} id="bubble-3"></div>
                </div>
                <div className={styles["button-cont"]}>
                    <button className={styles.btn} onClick={shuffle}>Shuffle</button>
                    <button className={styles.btn} onClick={deselect}>Deselect All</button>
                    <button className={styles.btn} id='submit-btn' onClick={submit}>Submit</button>
                </div>
            </div>
        </div>
    )
}

