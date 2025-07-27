'use client';
import Image from "next/image";
import Logo from "../../../public/elephant.png";
import styles from "../layout.module.scss";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return (
    <header className={styles.header}>
      <Image src={Logo} alt="AYT Games Logo" width={50} height={50} />
      <h1>| Games</h1>
    </header>
  );
}