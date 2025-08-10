import React, { useEffect, useRef } from "react";
import { Input, Button } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface AddChildInputProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
  level: number;
}

const AddChildInput: React.FC<AddChildInputProps> = ({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = "하위 항목 제목을 입력하세요...",
  level,
}) => {
  const { currentTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  // 외부 클릭 감지하여 추가 모드 취소
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    // 약간의 지연을 두어 현재 클릭 이벤트가 처리된 후 외부 클릭 감지
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onCancel]);

  const containerStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    alignItems: "center",
    padding: currentTheme.spacing["2"],
    paddingLeft: `${level * 16 + 44}px`, // 상위 항목과 동일한 들여쓰기
    backgroundColor: currentTheme.colors.background.secondary,
    borderRadius: currentTheme.borderRadius.md,
    marginTop: currentTheme.spacing["1"],
  };

  return (
    <div style={containerStyles}>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        style={{ flex: 1 }}
        autoFocus
        aria-label="하위 항목 제목 입력"
      />
      <Button variant="primary" size="sm" onClick={onSave}>
        추가
      </Button>
      <Button variant="secondary" size="sm" onClick={onCancel}>
        취소
      </Button>
    </div>
  );
};

export default AddChildInput;
