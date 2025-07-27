import { useState } from "react";
import styles from './dropdown.module.scss';

export default function SidebarItem({ title, color, children }: {
  title: string;
  color: string;
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.item}>
      <div
        className={styles["hint-list"]}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={styles.icon}  style={{ backgroundColor: color}}></span>
        <span className={styles.title}>{title}</span>
        <span className={styles.arrow}>{isOpen ? '▾' : '▸'}</span>
      </div>
      {isOpen && <div className={styles.dropdown}>{children}</div>}
    </div>
  );
}