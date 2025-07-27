import styles from './Tile.module.scss';

type TileProps = {
    letter?: string;
    rowIdx: number;
    colIdx: number;
    color?: "correct" | "present" | "absent";
    animation?: string;
    dataState?: "tbd" | "empty";
};

export default function Tile({ letter = "", rowIdx, colIdx, color, animation, dataState="empty" }: TileProps) {
    return (
        <div
            className={`${styles.tile} ${color ? styles[color] : ""} ${animation ? styles[animation] : ""}`}
            id={`tile-${rowIdx}${colIdx}`}
            data-animation={animation}
            data-state={dataState}
        >
            {letter}
        </div>
    );
}