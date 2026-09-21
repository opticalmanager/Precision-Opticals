"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface UseDraggableRowOptions {
  itemSelector?: string;
  defaultCardWidth?: number;
  gap?: number;
}

export function useDraggableRow(options?: UseDraggableRowOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDraggingState, setIsDraggingState] = useState(false);

  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftStartRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Update canScrollLeft / canScrollRight
  const updateScrollState = useCallback(() => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  // Set up resize and scroll listeners
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    const timer = setTimeout(updateScrollState, 200);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      clearTimeout(timer);
      if (dragCleanupRef.current) {
        dragCleanupRef.current();
      }
    };
  }, [updateScrollState]);

  // Scroll by a full row of products smoothly
  const scrollByWholeRow = useCallback((direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;

    // Card width with gap: ~246px on mobile (<640px), ~262px on sm+
    const cardWidthWithGap =
      options?.defaultCardWidth || (window.innerWidth < 640 ? 246 : 262);

    // Calculate how many full cards fit in the visible viewport
    const visibleCards = Math.max(1, Math.floor(el.clientWidth / cardWidthWithGap));
    // Scroll distance is either the width of visible cards or clientWidth - 48
    const scrollDistance = Math.max(visibleCards * cardWidthWithGap, el.clientWidth - 48);

    el.scrollBy({
      left: direction === "left" ? -scrollDistance : scrollDistance,
      behavior: "smooth",
    });
  }, [options?.defaultCardWidth]);

  // Mouse drag-to-scroll handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only primary left button
    if (e.button !== 0) return;

    const el = containerRef.current;
    if (!el) return;

    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftStartRef.current = el.scrollLeft;

    // Disable smooth scrolling temporarily for instant drag response
    el.style.scrollBehavior = "auto";

    const onWindowMouseMove = (moveEvent: MouseEvent) => {
      if (!isDownRef.current || !containerRef.current) return;

      const dx = moveEvent.pageX - startXRef.current;
      if (Math.abs(dx) > 6) {
        if (!isDraggingRef.current) {
          isDraggingRef.current = true;
          setIsDraggingState(true);
        }
      }

      containerRef.current.scrollLeft = scrollLeftStartRef.current - dx;
    };

    const onWindowMouseUp = () => {
      isDownRef.current = false;
      setIsDraggingState(false);

      if (containerRef.current) {
        containerRef.current.style.scrollBehavior = "smooth";
      }

      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      dragCleanupRef.current = null;

      // Keep isDraggingRef.current true briefly so any subsequent click is suppressed
      if (isDraggingRef.current) {
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 120);
      }
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    dragCleanupRef.current = () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, []);

  // Intercept and prevent card clicks when user was dragging
  const handleClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  return {
    containerRef,
    canScrollLeft,
    canScrollRight,
    isDragging: isDraggingState,
    scrollByWholeRow,
    updateScrollState,
    dragHandlers: {
      onMouseDown: handleMouseDown,
      onClickCapture: handleClickCapture,
    },
  };
}
