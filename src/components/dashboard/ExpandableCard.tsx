import { useState, useEffect, ReactNode } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { createPortal } from "react-dom";

interface ExpandableCardProps {
  children: ReactNode;
  className?: string;
}

export function ExpandableCard({ children, className = "" }: ExpandableCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle ESC key to close expanded view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      window.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when expanded
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  const expandButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(true);
      }}
      className="absolute top-2 left-2 z-20 p-1.5 rounded-md bg-background/80 hover:bg-background border border-border/50 shadow-sm transition-all duration-200 hover:scale-110"
      title="Expandir"
    >
      <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );

  const minimizeButton = (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsExpanded(false);
      }}
      className="absolute top-4 left-4 z-50 p-2 rounded-md bg-background hover:bg-muted border border-border shadow-md transition-all duration-200 hover:scale-110"
      title="Minimizar (ESC)"
    >
      <Minimize2 className="w-5 h-5 text-foreground" />
    </button>
  );

  const expandedOverlay = isExpanded
    ? createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsExpanded(false)}
        >
        <div
          className="relative w-full h-full max-w-[95vw] max-h-[95vh] animate-scale-in flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {minimizeButton}
          <div 
            className="h-[56%] w-[56%] [&>*]:h-full [&>*]:w-full"
            style={{ transform: 'scale(1.75)', transformOrigin: 'center center' }}
          >
            {children}
          </div>
        </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className={`relative h-full overflow-hidden ${className}`}>
        {expandButton}
        {children}
      </div>
      {expandedOverlay}
    </>
  );
}
