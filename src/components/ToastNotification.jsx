import { useEffect, useRef } from "react";
import "./ToastNotification.css";

export default function ToastNotification({ type = "success", message, onClose }) {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(onClose, 3000);
    return () => clearTimeout(timerRef.current);
  }, [onClose]);

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">{type === "success" ? "✓" : "!"}</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close notification">×</button>
    </div>
  );
}
