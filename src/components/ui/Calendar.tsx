import React, { useState, useMemo, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui";

interface CalendarProps {
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  onClose?: () => void;
  className?: string;
}

// 상수 정의
const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const CALENDAR_GRID_SIZE = 42; // 6주 x 7일

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
  className = "",
}) => {
  const { currentTheme } = useTheme();

  // 날짜를 YYYY-MM-DD 형식으로 변환하는 함수 (시간대 문제 해결)
  const formatDateToYYYYMMDD = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const [currentDate, setCurrentDate] = useState(() => {
    if (selectedDate) {
      return new Date(selectedDate);
    }
    return new Date();
  });

  // 현재 월의 첫 번째 날과 마지막 날 계산
  const { firstDayOfMonth, lastDayOfMonth } = useMemo(() => {
    const first = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const last = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    return { firstDayOfMonth: first, lastDayOfMonth: last };
  }, [currentDate]);

  // 달력에 표시할 모든 날짜 계산
  const calendarDays = useMemo(() => {
    const days = [];

    // 이전 달의 마지막 날들
    const firstDayWeekday = firstDayOfMonth.getDay();
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const prevDate = new Date(firstDayOfMonth);
      prevDate.setDate(prevDate.getDate() - (i + 1));
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    // 현재 달의 모든 날들
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")}` === selectedDate
        : false;

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    // 다음 달의 첫 번째 날들 (6주 완성)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(lastDayOfMonth);
      nextDate.setDate(nextDate.getDate() + i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
      });
    }

    return days;
  }, [
    currentDate,
    firstDayOfMonth,
    lastDayOfMonth,
    selectedDate,
    formatDateToYYYYMMDD,
  ]);

  // 한국 공휴일 목록 (2025년 기준)
  const getHolidays = useCallback((year: number, month: number): number[] => {
    const holidays: { [key: string]: number[] } = {
      "1": [1], // 신정
      "2": [], // 없음
      "3": [1], // 삼일절
      "4": [], // 없음
      "5": [5], // 어린이날
      "6": [6], // 현충일
      "7": [], // 없음
      "8": [15], // 광복절
      "9": [], // 없음
      "10": [3, 9], // 개천절, 한글날
      "11": [], // 없음
      "12": [25], // 크리스마스
    };

    return holidays[month.toString()] || [];
  }, []);

  // 월 이동 함수들
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }, [currentDate]);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }, [currentDate]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    if (onDateSelect) {
      onDateSelect(formatDateToYYYYMMDD(today));
    }
  }, [onDateSelect, formatDateToYYYYMMDD]);

  // 날짜 선택 핸들러
  const handleDateClick = useCallback(
    (date: Date) => {
      if (onDateSelect) {
        onDateSelect(formatDateToYYYYMMDD(date));
      }
    },
    [onDateSelect, formatDateToYYYYMMDD]
  );

  // 스타일 정의
  const containerStyles: React.CSSProperties = useMemo(() => {
    const isDarkMode = currentTheme.colors.background.primary === "#000000";
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return {
      backgroundColor: currentTheme.colors.background.primary,
      borderRadius: currentTheme.borderRadius.xl,
      boxShadow: currentTheme.shadows.xl,
      padding: isMobile ? currentTheme.spacing["6"] : currentTheme.spacing["8"],
      minWidth: isMobile ? "320px" : "380px",
      maxWidth: "480px",
      width: "100%",
      maxHeight: "90vh",
      border: `2px solid ${
        isDarkMode
          ? currentTheme.colors.border.accent
          : currentTheme.colors.border.default
      }`,
      // 다크모드에서 더 잘 보이도록 추가 그림자와 테두리
      ...(isDarkMode && {
        boxShadow: `${currentTheme.shadows.xl}, 0 0 0 2px ${currentTheme.colors.border.accent}`,
      }),
    };
  }, [currentTheme]);

  const headerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: currentTheme.spacing["6"],
      paddingBottom: currentTheme.spacing["4"],
      borderBottom: `1px solid ${currentTheme.colors.border.default}`,
      position: "relative",
    }),
    [currentTheme]
  );

  const monthYearStyles: React.CSSProperties = useMemo(
    () => ({
      fontSize: currentTheme.typography.fontSize.xl,
      fontWeight: currentTheme.typography.fontWeight.semibold,
      color: currentTheme.colors.text.primary,
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
    }),
    [currentTheme]
  );

  const navigationStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["2"],
      width: "100%",
      justifyContent: "space-between",
    }),
    [currentTheme]
  );

  const weekDaysContainerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: currentTheme.spacing["1"],
      marginBottom: currentTheme.spacing["4"],
    }),
    [currentTheme]
  );

  const weekDayStyles: React.CSSProperties = useMemo(
    () => ({
      textAlign: "center",
      fontSize: currentTheme.typography.fontSize.sm,
      fontWeight: currentTheme.typography.fontWeight.medium,
      color: currentTheme.colors.text.secondary,
      padding: currentTheme.spacing["2"],
    }),
    [currentTheme]
  );

  const daysContainerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: currentTheme.spacing["2"],
      justifyContent: "center",
      alignItems: "center",
    }),
    [currentTheme]
  );

  const dayButtonStyles = useCallback(
    (day: {
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }): React.CSSProperties => {
      let color = currentTheme.colors.text.primary;
      let backgroundColor = "transparent";
      let opacity = 1;

      if (!day.isCurrentMonth) {
        color = currentTheme.colors.text.tertiary;
        opacity = 0.4; // 이전/다음 달 날짜를 더 투명하게
      } else {
        // 요일별 색상 및 공휴일 처리
        const dayOfWeek = day.date.getDay();
        const currentMonth = day.date.getMonth() + 1;
        const currentDay = day.date.getDate();
        const holidays = getHolidays(day.date.getFullYear(), currentMonth);

        if (holidays.includes(currentDay)) {
          // 공휴일은 빨간색
          color = currentTheme.colors.status.error;
        } else if (dayOfWeek === 0) {
          // 일요일은 빨간색
          color = currentTheme.colors.status.error;
        } else if (dayOfWeek === 6) {
          // 토요일은 파란색
          color = currentTheme.colors.status.info;
        }
      }

      if (day.isSelected) {
        backgroundColor = currentTheme.colors.primary.brand;
        color = currentTheme.colors.text.inverse;
        opacity = 1; // 선택된 날짜는 완전 불투명
      } else if (day.isToday) {
        backgroundColor = currentTheme.colors.background.tertiary;
        color = currentTheme.colors.primary.brand;
      }

      return {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: day.isToday
          ? `2px solid ${currentTheme.colors.primary.brand}`
          : "2px solid transparent",
        background: "none",
        cursor: day.isCurrentMonth ? "pointer" : "default",
        fontSize: currentTheme.typography.fontSize.base,
        fontWeight: currentTheme.typography.fontWeight.medium,
        transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
        color,
        backgroundColor,
        opacity,
        transform: "scale(1)",
      };
    },
    [currentTheme, getHolidays]
  );

  const footerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      justifyContent: "center",
      marginTop: currentTheme.spacing["4"],
      paddingTop: currentTheme.spacing["4"],
      borderTop: `1px solid ${currentTheme.colors.border.default}`,
    }),
    [currentTheme]
  );

  return (
    <div style={containerStyles} className={className}>
      {/* 헤더 */}
      <div style={headerStyles}>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          style={{ padding: currentTheme.spacing["2"] }}
        >
          ‹
        </Button>
        <div style={monthYearStyles}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          style={{ padding: currentTheme.spacing["2"] }}
        >
          ›
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div style={weekDaysContainerStyles}>
        {WEEK_DAYS.map((day: string, index: number) => (
          <div
            key={day}
            style={{
              ...weekDayStyles,
              color:
                index === 0
                  ? currentTheme.colors.status.error // 일요일 빨간색
                  : index === 6
                  ? currentTheme.colors.status.info // 토요일 파란색
                  : currentTheme.colors.text.secondary, // 나머지 회색
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={daysContainerStyles}>
        {calendarDays.map((day, index) => (
          <button
            key={index}
            style={dayButtonStyles(day)}
            onClick={() => handleDateClick(day.date)}
            disabled={!day.isCurrentMonth}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>

      {/* 푸터 */}
      <div style={footerStyles}>
        <Button variant="secondary" size="sm" onClick={goToToday}>
          오늘
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ marginLeft: currentTheme.spacing["2"] }}
          >
            닫기
          </Button>
        )}
      </div>
    </div>
  );
};

export default Calendar;
