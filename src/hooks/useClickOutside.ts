import { useEffect, useRef, RefObject } from 'react';

interface UseClickOutsideOptions {
  enabled?: boolean;
  onOutsideClick: () => void;
}

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  options: UseClickOutsideOptions
): RefObject<T> {
  const { enabled = true, onOutsideClick } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onOutsideClick();
      }
    };

    // 이벤트 캡처링 단계에서 처리하여 더 정확한 감지
    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [enabled, onOutsideClick]);

  return ref;
}
