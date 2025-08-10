import React, { useState, useMemo, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui";

interface CalendarProps {
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  onClose?: () => void;
  className?: string;
  showHolidays?: boolean; // 공휴일 표시 여부
  locale?: "ko" | "en"; // 지역 설정
}

// 상수 정의
const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"] as const;
const DAYS_IN_WEEK = 7;
const WEEKS_IN_MONTH = 6;
const CALENDAR_GRID_SIZE = DAYS_IN_WEEK * WEEKS_IN_MONTH; // 42
const DAY_BUTTON_SIZE = 42;
const MOBILE_BREAKPOINT = 768;
const MOBILE_MIN_WIDTH = 320;
const DESKTOP_MIN_WIDTH = 380;
const MAX_WIDTH = 480;
const MAX_HEIGHT_VH = 90;

// 날짜를 YYYY-MM-DD 형식으로 변환하는 유틸리티 함수
const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// 윤년 확인 함수
const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

// 한국 공휴일 계산 함수 (동적 계산)
const getKoreanHolidays = (year: number, month: number): number[] => {
  const holidays: number[] = [];

  // 양력 고정 공휴일
  const fixedHolidays: { [key: string]: number[] } = {
    "1": [1], // 신정
    "3": [1], // 삼일절
    "5": [5], // 어린이날
    "6": [6], // 현충일
    "8": [15], // 광복절
    "10": [3, 9], // 개천절, 한글날
    "12": [25], // 크리스마스
  };

  // 고정 공휴일 추가
  const monthHolidays = fixedHolidays[month.toString()] || [];
  holidays.push(...monthHolidays);

  // 대체공휴일 계산 (어린이날이 주말인 경우)
  if (month === 5 && year >= 2014) {
    const childrensDay = new Date(year, 4, 5); // 5월 5일 (0-based month)
    const dayOfWeek = childrensDay.getDay();

    // 어린이날이 일요일이면 월요일, 토요일이면 월요일이 대체공휴일
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const substituteDay = dayOfWeek === 0 ? 6 : 7; // 다음 월요일
      holidays.push(substituteDay);
    }
  }

  // 광복절 대체공휴일 (2021년부터)
  if (month === 8 && year >= 2021) {
    const liberationDay = new Date(year, 7, 15); // 8월 15일
    const dayOfWeek = liberationDay.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const substituteDay = dayOfWeek === 0 ? 16 : 17; // 다음 월요일
      holidays.push(substituteDay);
    }
  }

  // 개천절 대체공휴일 (2022년부터)
  if (month === 10 && year >= 2022) {
    const foundationDay = new Date(year, 9, 3); // 10월 3일
    const dayOfWeek = foundationDay.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const substituteDay = dayOfWeek === 0 ? 4 : 5; // 다음 월요일
      holidays.push(substituteDay);
    }
  }

  // 한글날 대체공휴일 (2013년부터)
  if (month === 10 && year >= 2013) {
    const hangulDay = new Date(year, 9, 9); // 10월 9일
    const dayOfWeek = hangulDay.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const substituteDay = dayOfWeek === 0 ? 10 : 11; // 다음 월요일
      holidays.push(substituteDay);
    }
  }

  return [...new Set(holidays)]; // 중복 제거
};

// 날짜 객체 타입 정의
interface DayData {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isHoliday?: boolean;
}

const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect,
  onClose,
  className = "",
  showHolidays = true,
  locale = "ko",
}) => {
  const { currentTheme } = useTheme();

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
    const days: DayData[] = [];

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
        isHoliday: false,
      });
    }

    // 현재 달의 모든 날들
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const holidays = showHolidays
      ? getKoreanHolidays(currentYear, currentMonth)
      : [];

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        i
      );
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = selectedDate
        ? formatDateToYYYYMMDD(date) === selectedDate
        : false;
      const isHoliday = holidays.includes(i);

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isHoliday,
      });
    }

    // 다음 달의 첫 번째 날들 (6주 완성)
    const remainingDays = CALENDAR_GRID_SIZE - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(lastDayOfMonth);
      nextDate.setDate(nextDate.getDate() + i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isHoliday: false,
      });
    }

    return days;
  }, [
    currentDate,
    firstDayOfMonth,
    lastDayOfMonth,
    selectedDate,
    showHolidays,
  ]);

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
  }, [onDateSelect]);

  // 날짜 선택 핸들러
  const handleDateClick = useCallback(
    (date: Date) => {
      if (onDateSelect) {
        onDateSelect(formatDateToYYYYMMDD(date));
      }
    },
    [onDateSelect]
  );

  // 스타일 정의
  const containerStyles: React.CSSProperties = useMemo(() => {
    const isDarkMode = currentTheme.colors.background.primary === "#000000";
    const isMobile =
      typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT;

    return {
      backgroundColor: currentTheme.colors.background.primary,
      borderRadius: currentTheme.borderRadius.xl,
      boxShadow: currentTheme.shadows.xl,
      padding: isMobile ? currentTheme.spacing["6"] : currentTheme.spacing["8"],
      minWidth: isMobile ? `${MOBILE_MIN_WIDTH}px` : `${DESKTOP_MIN_WIDTH}px`,
      maxWidth: `${MAX_WIDTH}px`,
      width: "100%",
      maxHeight: `${MAX_HEIGHT_VH}vh`,
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

  const weekDaysContainerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${DAYS_IN_WEEK}, 1fr)`,
      gap: currentTheme.spacing["2"],
      marginBottom: currentTheme.spacing["4"],
      width: "100%",
      placeItems: "center",
    }),
    [currentTheme]
  );

  const weekDayStyles: React.CSSProperties = useMemo(
    () => ({
      textAlign: "center",
      fontSize: currentTheme.typography.fontSize.sm,
      fontWeight: currentTheme.typography.fontWeight.medium,
      color: currentTheme.colors.text.secondary,
      height: `${DAY_BUTTON_SIZE}px`,
      width: `${DAY_BUTTON_SIZE}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0",
      boxSizing: "border-box",
    }),
    [currentTheme]
  );

  const daysContainerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${DAYS_IN_WEEK}, 1fr)`,
      gap: currentTheme.spacing["2"],
      width: "100%",
      placeItems: "center",
    }),
    [currentTheme]
  );

  // 날짜 버튼 스타일 계산 함수
  const getDayButtonStyles = useCallback(
    (day: DayData): React.CSSProperties => {
      const { date, isCurrentMonth, isToday, isSelected, isHoliday } = day;

      // 기본 스타일
      let color = currentTheme.colors.text.primary;
      let backgroundColor = "transparent";
      let opacity = 1;

      // 이전/다음 달 날짜 처리
      if (!isCurrentMonth) {
        color = currentTheme.colors.text.tertiary;
        opacity = 0.4;
      } else {
        // 요일별 색상 및 공휴일 처리
        const dayOfWeek = date.getDay();

        if (isHoliday || dayOfWeek === 0) {
          // 공휴일 또는 일요일은 빨간색
          color = currentTheme.colors.status.error;
        } else if (dayOfWeek === 6) {
          // 토요일은 파란색
          color = currentTheme.colors.status.info;
        }
      }

      // 선택된 날짜 또는 오늘 처리
      if (isSelected) {
        backgroundColor = currentTheme.colors.primary.brand;
        color = currentTheme.colors.text.inverse;
        opacity = 1;
      } else if (isToday) {
        backgroundColor = currentTheme.colors.background.tertiary;
        color = currentTheme.colors.primary.brand;
      }

      return {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: `${DAY_BUTTON_SIZE}px`,
        height: `${DAY_BUTTON_SIZE}px`,
        borderRadius: "50%",
        border: isToday
          ? `2px solid ${currentTheme.colors.primary.brand}`
          : "2px solid transparent",
        background: "none",
        cursor: isCurrentMonth ? "pointer" : "default",
        fontSize: currentTheme.typography.fontSize.base,
        fontWeight: currentTheme.typography.fontWeight.medium,
        transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
        color,
        backgroundColor,
        opacity,
        transform: "scale(1)",
        margin: "0",
        padding: "0",
        boxSizing: "border-box",
      };
    },
    [currentTheme]
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
          size="lg"
          onClick={goToPreviousMonth}
          style={{
            padding: currentTheme.spacing["3"],
            fontSize: currentTheme.typography.fontSize.xl,
            fontWeight: currentTheme.typography.fontWeight.bold,
            minWidth: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ‹
        </Button>
        <div style={monthYearStyles}>
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={goToNextMonth}
          style={{
            padding: currentTheme.spacing["3"],
            fontSize: currentTheme.typography.fontSize.xl,
            fontWeight: currentTheme.typography.fontWeight.bold,
            minWidth: "48px",
            height: "48px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
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
            style={getDayButtonStyles(day)}
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
