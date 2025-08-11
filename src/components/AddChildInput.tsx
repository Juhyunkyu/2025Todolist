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
        : 0,
    backgroundColor: currentTheme.colors.background.secondary,
    borderRadius: currentTheme.borderRadius.md,
    marginTop: getDynamicSpacing(currentTheme.spacing["1"]),
    marginLeft: isMobile
      ? `${Math.min(level * 3, 12)}px`
      : `${Math.min(level * 6, 24)}px`, // 더 보수적인 최대값
    maxWidth: "100%", // 컨테이너를 넘지 않도록 제한
    boxSizing: "border-box", // 패딩과 마진을 포함한 너비 계산
  };

  return (
    <div ref={containerRef} style={containerStyles}>
      <Input
        ref={inputRef}
        placeholder={isMobile ? "하위 항목..." : placeholder}
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
        style={{
          flex: 1,
          fontSize: isMobile ? "14px" : undefined,
          minWidth: 0, // flex 아이템이 부모를 넘지 않도록
          maxWidth: isMobile ? "75%" : "85%", // 입력창 최대 너비 증가
        }}
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
        style={{
          flexShrink: 0, // 버튼 크기 고정
          minWidth: isMobile ? "auto" : undefined,
          fontSize: isMobile ? "11px" : undefined,
          padding: isMobile ? "3px 6px" : undefined,
          whiteSpace: "nowrap", // 텍스트 줄바꿈 방지
        }}
      >
        추가
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={useCallback(() => onCancel(), [onCancel])}
        style={{
          flexShrink: 0, // 버튼 크기 고정
          minWidth: isMobile ? "auto" : undefined,
          fontSize: isMobile ? "11px" : undefined,
          padding: isMobile ? "3px 6px" : undefined,
          whiteSpace: "nowrap", // 텍스트 줄바꿈 방지
        }}
      >
        취소
      </Button>
    </div>
  );
};

export default AddChildInput;
