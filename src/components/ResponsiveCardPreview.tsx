"use client";

import { useEffect, useRef, useState } from "react";
import { CARD_HEIGHT, CARD_WIDTH, WishCard } from "./WishCard";

interface ResponsiveCardPreviewProps {
  name: string;
  wish: string;
}

export function ResponsiveCardPreview({ name, wish }: ResponsiveCardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function updateScale() {
      if (!container) return;
      const availableWidth = container.offsetWidth;
      setScale(Math.min(1, availableWidth / CARD_WIDTH));
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="mx-auto w-full max-w-[540px]">
      <div
        className="overflow-hidden rounded-sm shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
        style={{ width: CARD_WIDTH * scale, height: CARD_HEIGHT * scale }}
      >
        <div style={{ width: CARD_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <WishCard name={name} wish={wish} />
        </div>
      </div>
    </div>
  );
}
