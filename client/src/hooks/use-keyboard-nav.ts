import { useEffect, useCallback } from "react";

type KeyboardShortcut = {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
};

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          event.code.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const metaMatch = shortcut.meta ? event.metaKey : true;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export function KeyboardHint({ keys }: { keys: string[] }) {
  return (
    <div className="flex gap-1">
      {keys.map((key, index) => (
        <kbd
          key={index}
          className="px-2 py-0.5 text-xs bg-muted border rounded font-mono"
        >
          {key}
        </kbd>
      ))}
    </div>
  );
}

export function useArrowNavigation(
  items: unknown[],
  currentIndex: number,
  onSelect: (index: number) => void,
  options: { vertical?: boolean; wrap?: boolean } = { vertical: true, wrap: true }
) {
  const { vertical = true, wrap = true } = options;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      let newIndex = currentIndex;

      if (vertical) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= items.length) {
            newIndex = wrap ? 0 : currentIndex;
          }
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? items.length - 1 : currentIndex;
          }
        }
      }

      if (!vertical) {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          newIndex = currentIndex + 1;
          if (newIndex >= items.length) {
            newIndex = wrap ? 0 : currentIndex;
          }
        } else if (event.key === "ArrowLeft") {
          event.preventDefault();
          newIndex = currentIndex - 1;
          if (newIndex < 0) {
            newIndex = wrap ? items.length - 1 : currentIndex;
          }
        }
      }

      if (newIndex !== currentIndex) {
        onSelect(newIndex);
      }
    },
    [currentIndex, items.length, onSelect, vertical, wrap]
  );

  return handleKeyDown;
}

export function FocusTrap({ children, active = true }: { children: React.ReactNode; active?: boolean }) {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  return <>{children}</>;
}
