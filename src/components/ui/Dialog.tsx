"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface DialogDescriptionProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface DialogContentProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export interface DialogFooterProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  const { currentTheme } = useTheme();
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!closeOnEscape || !open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  // body 스크롤 방지
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  // 포커스 관리
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          maxWidth: "400px",
          width: "90vw",
        };
      case "md":
        return {
          maxWidth: "500px",
          width: "90vw",
        };
      case "lg":
        return {
          maxWidth: "700px",
          width: "90vw",
        };
      case "xl":
        return {
          maxWidth: "900px",
          width: "95vw",
        };
      default:
        return {
          maxWidth: "500px",
          width: "90vw",
        };
    }
  };

  const overlayStyles: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: currentTheme.spacing["4"],
    zIndex: 50,
    animation: "fadeIn 0.2s ease-out",
  };

  const dialogStyles: React.CSSProperties = {
    backgroundColor: currentTheme.colors.background.secondary,
    borderRadius: currentTheme.borderRadius.lg,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: currentTheme.colors.border.default,
    boxShadow: currentTheme.shadows.lg,
    ...getSizeStyles(),
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    animation: "slideIn 0.2s ease-out",
    outline: "none",
  };

  const headerStyles: React.CSSProperties = {
    padding: currentTheme.spacing["6"],
    paddingBottom:
      title && description
        ? currentTheme.spacing["4"]
        : currentTheme.spacing["6"],
    borderBottomWidth: "1px",
    borderBottomStyle: "solid",
    borderBottomColor: currentTheme.colors.border.default,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: currentTheme.spacing["4"],
  };

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize.xl,
    fontWeight: currentTheme.typography.fontWeight.semibold,
    color: currentTheme.colors.text.primary,
    margin: 0,
    lineHeight: "1.4",
  };

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize.sm,
    color: currentTheme.colors.text.secondary,
    margin: 0,
    marginTop: currentTheme.spacing["2"],
    lineHeight: "1.5",
  };

  const closeButtonStyles: React.CSSProperties = {
    backgroundColor: "transparent",
    borderWidth: "0",
    color: currentTheme.colors.text.secondary,
    cursor: "pointer",
    padding: currentTheme.spacing["1"],
    borderRadius: currentTheme.borderRadius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    flexShrink: 0,
    transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
  };

  const contentStyles: React.CSSProperties = {
    flex: 1,
    overflow: "auto",
    padding: currentTheme.spacing["6"],
    paddingTop:
      title || description
        ? currentTheme.spacing["4"]
        : currentTheme.spacing["6"],
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>

      <div style={overlayStyles} onClick={handleOverlayClick}>
        <div
          ref={dialogRef}
          style={dialogStyles}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "dialog-title" : undefined}
          aria-describedby={description ? "dialog-description" : undefined}
          tabIndex={-1}
        >
          {(title || description || showCloseButton) && (
            <div style={headerStyles}>
              <div style={{ flex: 1 }}>
                {title && (
                  <h2 id="dialog-title" style={titleStyles}>
                    {title}
                  </h2>
                )}
                {description && (
                  <p id="dialog-description" style={descriptionStyles}>
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  style={closeButtonStyles}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.backgroundColor =
                      currentTheme.colors.background.surface;
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.backgroundColor =
                      "transparent";
                  }}
                  aria-label="닫기"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div style={contentStyles}>{children}</div>
        </div>
      </div>
    </>
  );
};

// 서브 컴포넌트들
export const DialogHeader: React.FC<DialogHeaderProps> = ({
  children,
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();

  const headerStyles: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: currentTheme.spacing["1.5"],
    ...style,
  };

  return (
    <div style={headerStyles} {...props}>
      {children}
    </div>
  );
};

export const DialogTitle: React.FC<DialogTitleProps> = ({
  children,
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();

  const titleStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize.lg,
    fontWeight: currentTheme.typography.fontWeight.semibold,
    color: currentTheme.colors.text.primary,
    lineHeight: "1.4",
    margin: 0,
    ...style,
  };

  return (
    <h3 style={titleStyles} {...props}>
      {children}
    </h3>
  );
};

export const DialogDescription: React.FC<DialogDescriptionProps> = ({
  children,
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();

  const descriptionStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize.sm,
    color: currentTheme.colors.text.secondary,
    lineHeight: "1.5",
    margin: 0,
    ...style,
  };

  return (
    <p style={descriptionStyles} {...props}>
      {children}
    </p>
  );
};

export const DialogContent: React.FC<DialogContentProps> = ({
  children,
  style,
  ...props
}) => {
  const contentStyles: React.CSSProperties = {
    ...style,
  };

  return (
    <div style={contentStyles} {...props}>
      {children}
    </div>
  );
};

export const DialogFooter: React.FC<DialogFooterProps> = ({
  children,
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();

  const footerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: currentTheme.spacing["3"],
    paddingTop: currentTheme.spacing["4"],
    marginTop: currentTheme.spacing["4"],
    borderTopWidth: "1px",
    borderTopStyle: "solid",
    borderTopColor: currentTheme.colors.border.default,
    ...style,
  };

  return (
    <div style={footerStyles} {...props}>
      {children}
    </div>
  );
};

export default Dialog;
