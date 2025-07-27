import styles from './Board.module.scss';
import boardData from './board.json';

interface BoardProps {
    onLetterClick: (letter: string, idx: number) => void;
    onLetterEnter: (letter: string, idx: number) => void;
    onLetterLeave: (idx: number) => void;
    dataState?: "tbd" | "empty" | "selected" | "solved" | "spangram";
}

export default function Board({ onLetterClick, onLetterEnter, onLetterLeave, dataState="empty" }: BoardProps) {
    const board = boardData.board;
    // Ensure 8 rows of 6 columns
    const rows = 8;
    const cols = 6;
    // Fill missing cells with empty strings
    const flat: string[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            flat.push(board[r]?.[c] ?? "");
        }
    }

    return (
        <div className={styles.board}>
            {flat.map((letter, idx) => (
                <button
                    onTouchStart={e => {
                        e.preventDefault();
                        onLetterClick(letter, idx);
                    }}
                    onTouchMove={e => {
                        e.preventDefault();
                        const touch = e.touches[0];
                        const target = document.elementFromPoint(touch.clientX, touch.clientY);
                        if (target && target instanceof HTMLElement && target.id.startsWith('letter-')) {
                            const newIdx = Number(target.id.replace('letter-', ''));
                            // Call onLetterEnter with both newIdx and the previous idx
                            onLetterEnter(flat[newIdx], newIdx);
                        }
                    }}
                    onTouchEnd={() => onLetterLeave(idx)}
                    onMouseDown={() => onLetterClick(letter, idx)}
                    onMouseEnter={e => {
                        if (e.buttons === 1) onLetterEnter(letter, idx);
                    }}
                    onMouseUp={() => onLetterLeave(idx)}
                    type="button"
                    className={`${styles.letter} ${styles.item}`}
                    key={idx}
                    data-state={dataState}
                    id={`letter-${idx}`}
                >
                    {letter}
                </button>
            ))}
        </div>
    );
}