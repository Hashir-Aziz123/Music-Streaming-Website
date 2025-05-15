import React, {useRef} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./ScrollableSection.module.css";

function ScrollableSection({ title, items, layoutMode = "scroll" }) {
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

    if (layoutMode === "grid") {
        return (
            <div className={styles.scrollSection}>
                <h2>{title}</h2>
                <div className={styles.gridContainer}>
                    {items}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.scrollSection}>
            <h2>{title}</h2>
            <div className={styles.scrollWrapper}>
                <button className={styles.scrollButton} onClick={() => scroll("left")} aria-label="Scroll left">
                    <ChevronLeft size={28} />
                </button>
                <div className={styles.scrollContainer} ref={scrollRef}>
                    {items.map((item, index) => (
                        <div key={index} className={styles.scrollItem}>
                            {React.cloneElement(item, { inScrollSection: true })}
                        </div>
                    ))}
                </div>
                <button className={styles.scrollButton} onClick={() => scroll("right")} aria-label="Scroll right">
                    <ChevronRight size={28} />
                </button>
            </div>
        </div>
    );
}

export default ScrollableSection;