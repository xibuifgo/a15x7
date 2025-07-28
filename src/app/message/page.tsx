'use client';
import React, { useState } from 'react';
import styles from './msg.module.scss';

const blue1 = '#BCD4E6';
const blue2 = '#A1CAF1';
const blue3 = '#6CA0DC';

const answers = {
    word1: "enigma",
    word2: "bull",
    word3: "not_funion"
}

export default function Message() {
    const [isNotSolved, setIsNotSolved] = useState(true);
    const [inputs, setInputs] = useState({ word1: "", word2: "", word3: "" });
    const puzzles = [
        { label: "Puzzle 1", color: blue1, id: "top", input_name: "word1", link: "/connections"},
        { label: "Puzzle 2", color: blue2, id: "middle", input_name: "word2", link: "/wordle" },
        { label: "Puzzle 3", color: blue3, id: "bottom", input_name:  "word3", link: "/strands" },
    ];

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setInputs({ ...inputs, [e.target.name]: e.target.value });
    }

    function handleSubmit(e: { preventDefault: () => void; }) {
        e.preventDefault();
        // Check each input against the answer
        const allCorrect = Object.entries(answers).every(
          ([key, value]) => inputs[key as keyof typeof inputs].trim().toLowerCase() === value.toLowerCase()
        );
        if (allCorrect) {
            setIsNotSolved(false);
        } else {
            alert("One or more answers are incorrect!");
        }
    }

    return (
        <div>
            {isNotSolved && (
                <form className={styles["pass-div"]}>
                    <h1>Enter Password</h1>
                    <div className={styles["three-div"]} style={{backgroundColor: blue1}}>
                        {puzzles.map((p, i) => (
                            <div 
                            key={p.id}
                            className={`${styles["word-div"]} ${p.id === "middle" ? styles["middle"] : ""}`}
                            id = {p.id}
                            style={{backgroundColor: p.color}}
                        >
                            <h2>{p.label}</h2>
                            <button 
                            type="button"
                            className={styles["go-btn"]}
                            onClick={() => {
                                window.open(p.link, "_blank");
                                console.log(`Navigating to ${p.link}`);
                            }}
                            >
                                Go!
                            </button>
                            <input
                              className={styles.input}
                              name={p.input_name}
                              id={p.input_name}
                              value={inputs[p.input_name as keyof typeof inputs]} 
                              onChange={handleChange}
                            />
                        </div>
                        ))}
                    </div>
                    <button className={styles.btn} type="submit" onClick={handleSubmit}>Submit</button>
                </form>
            )}
            {!isNotSolved && (
                <div className={styles["pass-div"]}>
                    <div className={styles.note + " " + styles.scrollable}>
                        <p>Dear Ayah,</p>
                        <p>Happy birthday!!! I am sorry this took so long but since we weren&apos;t there for your birthday I wanted to make something extra special so you know I&apos;m always with you in spirit.</p>
                        <p>The NYT games has been a big part of our relationship. Whether we&apos;re both in the same country or on different continents I always woke up knowing I&apos;d get a message of your wordle attempt. Thank you for giving me that kind of consistency and thank you for allowing me to share these games with you. </p>
                        <p>Beyond that thank you for being such a good sister. From listening to me be indecisive for the tenth time in a day, to just checking on me you have no idea how much a message from you means. Thats why both strands and wordle mentioned something from whatsapp. It was to show you how much they mean to me and to show you that our relationship is still as strong and meaningful {'('}to me at least{')'} even when we're not together in person. I hope the effort I put into this shows just how much you mean to me. In my eyes you deserve a billion times more than this but for now I hope this will do. I also hope you enjoyed them :{')'}</p>
                        <p>Aside from that, you&apos;re the glue to this family, and the one we go to for advice (as shown in the connections). You embody the title of big sister and though not easy, you do it almost perfectly. I hope you&apos;re aware of how much the family loves you because there really is no one like you. From your wacky remedies (strands) to your hilarious sayings (wordle) just know we appreciate everything about you.</p>
                        <p>I love and miss you so much.</p>
                        <p className={styles.name}><b>Nour</b></p>
                    </div>
                </div>
            )}
        </div>
    )
}