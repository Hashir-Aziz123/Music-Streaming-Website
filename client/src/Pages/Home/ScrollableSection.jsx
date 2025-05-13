import React, {useRef} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
            <h2>{title}</h2>
            <div className={styles.scrollWrapper}>
                <button className={styles.scrollButton} onClick={() => scroll("left")} aria-label="Scroll left">
                    <ChevronLeft size={28} />
                </button>
                <div className={styles.scrollContainer} ref={scrollRef}>
                    {items.map((item, index) => {
                        // Add inScrollSection prop to PlaylistCard components
                        const enhancedItem = React.cloneElement(item, { inScrollSection: true });
                        return (
                            <div key={index} className={styles.playlistCard}>{enhancedItem}</div>
                        );
                    })}
                </div>
                <button className={styles.scrollButton} onClick={() => scroll("right")} aria-label="Scroll right">
                    <ChevronRight size={28} />
                </button>
            </div>
        </div>
    );
}

export default ScrollableSection;