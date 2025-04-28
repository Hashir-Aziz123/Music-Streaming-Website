import { useEffect, useState } from "react";
import styles from "./MusicNotes.module.css";

const notes = ["🎵", "🎶", "🎼"];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function MusicNotes() {
    const [floatingNotes, setFloatingNotes] = useState([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const note = {
                id: Date.now(),
                left: getRandomInt(0, 100),
                delay: Math.random() * 0.5,
                icon: notes[getRandomInt(0, notes.length)],
                color: ["pink", "cyan", "red"][getRandomInt(0, 3)],
            };
            setFloatingNotes((prev) => [...prev.slice(-10), note]); // keep max 10 notes
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.floatingNotesWrapper}>
            {floatingNotes.map((note) => (
                <span
                    key={note.id}
                    className={`${styles.note} ${styles[note.color]}`}
                    style={{ left: `${note.left}%`, animationDelay: `${note.delay}s` }}
                >
                    {note.icon}
                </span>
            ))}
        </div>
    );
}

export default MusicNotes;
