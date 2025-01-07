import { useTheme } from "../contexts/ThemeContext";
import styles from "../styles/ThemeToggle.module.css";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      [{theme === "light" ? "☀️" : "🌙"}]
    </button>
  );
}
