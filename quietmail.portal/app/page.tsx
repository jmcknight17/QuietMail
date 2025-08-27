import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <a href="http://localhost:5022/auth/google">
        <button>Login with Google</button>
      </a>
    </div>
  );
}
