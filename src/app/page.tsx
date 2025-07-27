// import Image from "next/image";
'use client';
import styles from './components/home.module.scss';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome Ayah!</h1>
      <h2>Your birthday paragraph is right behind this button...</h2>
      <button
        className={styles.btn}
        onClick={() => {
          window.location.href = '/message';
        }}
      >
        Message
      </button>
    </div>
  );
}
