import React, {useRef} from "react";
import styles from "./ScrollableSection.module.css";

function ScrollableSection({ title, items }) {
    const scrollRef = useRef();

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 220;
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className={styles.scrollSection}>
            <h1>{title}</h1>
            <div className={styles.scrollWrapper}>
                <button className={styles.scrollButton} onClick={() => scroll("left")}>&lt;</button>
                <div className={styles.scrollContainer} ref={scrollRef}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.playlistCard}>{item}</div>
                    ))}
                </div>
                <button className={styles.scrollButton} onClick={() => scroll("right")}>&gt;</button>
            </div>
        </div>
    );
}

export default ScrollableSection;