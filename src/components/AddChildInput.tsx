import React, { useRef, useState, useCallback, useEffect } from "react";
import { Input, Button } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useClickOutside } from "@/hooks/useClickOutside";

interface AddChildInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  level?: number;
}

const AddChildInput: React.FC<AddChildInputProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = "하위 항목 제목을 입력하세요...",
  level = 0,
}) => {
  const { currentTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 감지를 위한 커스텀 훅 사용
  const containerRef = useClickOutside<HTMLDivElement>({
    onOutsideClick: onCancel,
  });

  // 화면 크기 감지
  const [screenWidth, setScreenWidth] = useState(1200);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // 반응형 상태 계산
  const isMobile = screenWidth < 400;

  // 동적 여백 계산
  const getDynamicSpacing = (baseSpacing: string) => {
    if (screenWidth >= 1200) return baseSpacing;
    if (screenWidth >= 768) return `calc(${baseSpacing} * 0.8)`;
    if (screenWidth >= 400) return `calc(${baseSpacing} * 0.6)`;
    return `calc(${baseSpacing} * 0.4)`;
  };

  const containerStyles: React.CSSProperties = {
    display: "flex",
    gap: isMobile
      ? getDynamicSpacing(currentTheme.spacing["1"])
      : getDynamicSpacing(currentTheme.spacing["2"]),
    alignItems: "center",
    paddingTop: isMobile
      ? getDynamicSpacing(currentTheme.spacing["1"])
      : getDynamicSpacing(currentTheme.spacing["2"]),
    paddingBottom: isMobile
      ? getDynamicSpacing(currentTheme.spacing["1"])
      : getDynamicSpacing(currentTheme.spacing["2"]),
    paddingRight: isMobile
      ? getDynamicSpacing(currentTheme.spacing["1"])
      : getDynamicSpacing(currentTheme.spacing["2"]),
    paddingLeft:
      level > 0
        ? isMobile
          ? getDynamicSpacing(currentTheme.spacing["2"])
          : getDynamicSpacing(currentTheme.spacing["3"])
        : 0, // 할일 목록과 동일한 들여쓰기 적용
    backgroundColor: currentTheme.colors.background.secondary,
    borderRadius: currentTheme.borderRadius.md,
    marginTop: getDynamicSpacing(currentTheme.spacing["1"]),
    marginLeft: isMobile ? `${(level + 1) * 8}px` : `${(level + 1) * 16}px`, // 할일 목록과 동일한 들여쓰기
  };

  return (
    <div ref={containerRef} style={containerStyles}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={useCallback(
          (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
          [onChange]
        )}
        onKeyDown={useCallback(
          (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") onSave();
            if (e.key === "Escape") onCancel();
          },
          [onSave, onCancel]
        )}
        style={{ flex: 1 }}
        autoFocus
        aria-label="하위 항목 제목 입력"
      />
      <Button
        variant="primary"
        size="sm"
        onClick={useCallback(() => {
          if (value.trim() !== "") {
            onSave();
          }
        }, [value, onSave])}
        disabled={value.trim() === ""}
      >
        추가
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={useCallback(() => onCancel(), [onCancel])}
      >
        취소
      </Button>
    </div>
  );
};

export default AddChildInput;
