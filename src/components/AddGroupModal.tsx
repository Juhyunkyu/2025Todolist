"use client";

import React, { useState, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (groupName: string) => void;
}

const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const { currentTheme } = useTheme();
  const [groupName, setGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!groupName.trim()) return;

      setIsSubmitting(true);
      try {
        await onAdd(groupName.trim());
        setGroupName("");
        onClose();
      } catch (error) {
        console.error("Failed to add group:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [groupName, onAdd, onClose]
  );

  const handleCancel = useCallback(() => {
    setGroupName("");
    onClose();
  }, [onClose]);

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 오버레이 스타일
  const overlayStyles: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: currentTheme.spacing["4"],
  };

  // 모달 스타일
  const modalStyles: React.CSSProperties = {
    backgroundColor: currentTheme.colors.background.primary,
    borderRadius: currentTheme.borderRadius.lg,
    border: `1px solid ${currentTheme.colors.border.default}`,
    boxShadow: currentTheme.shadows.lg,
    padding: currentTheme.spacing["6"],
    maxWidth: "400px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
  };

  // 헤더 스타일
  const headerStyles: React.CSSProperties = {
    marginBottom: currentTheme.spacing["4"],
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize.xl,
    fontWeight: currentTheme.typography.fontWeight.semibold,
    color: currentTheme.colors.text.primary,
    marginBottom: currentTheme.spacing["2"],
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize.sm,
    color: currentTheme.colors.text.secondary,
  };

  // 폼 스타일
  const formStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: currentTheme.spacing["4"],
  };

  // 입력 필드 컨테이너 스타일
  const inputContainerStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: currentTheme.spacing["2"],
  };

  const labelStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize.sm,
    fontWeight: currentTheme.typography.fontWeight.medium,
    color: currentTheme.colors.text.primary,
  };

  // 버튼 그룹 스타일
  const buttonGroupStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["3"],
    justifyContent: "flex-end",
    marginTop: currentTheme.spacing["4"],
  };

  return (
    <div style={overlayStyles} onClick={handleCancel}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>새 그룹 추가</h2>
          <p style={descriptionStyles}>
            그룹 이름을 입력하여 새로운 그룹을 생성하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={formStyles}>
          <div style={inputContainerStyles}>
            <label htmlFor="group-name" style={labelStyles}>
              그룹 이름
            </label>
            <Input
              id="group-name"
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="그룹 이름을 입력하세요"
              required
              autoFocus
              maxLength={50}
            />
          </div>

          <div style={buttonGroupStyles}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!groupName.trim() || isSubmitting}
            >
              {isSubmitting ? "추가 중..." : "추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGroupModal;
