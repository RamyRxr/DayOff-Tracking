import { useCallback } from "react";
import { format, isSameDay } from "date-fns";
import { toLocalDateString } from "../utils/localDate";

export function useDayOffCalendarCell({
    isDark,
    existingDates = new Set(),
    startDate = null,
    endDate = null,
    blockExistingDates = false,
    onDayClick,
    onDayOffClick,
}) {
    return useCallback(
        (
            day,
            index,
            {
                cellSizeClass = "w-9 h-9",
                textSizeClass = "text-[13px]",
            } = {},
        ) => {
            const dayStr = toLocalDateString(day);
            const isWeekend = day.getDay() === 5 || day.getDay() === 6;
            const isExisting = existingDates.has(dayStr);
            const isStart =
                startDate && day.toDateString() === startDate.toDateString();
            const isEnd = endDate && day.toDateString() === endDate.toDateString();
            const isInRange = startDate && endDate && day > startDate && day < endDate;
            const isToday = isSameDay(day, new Date());

            const isBlockedExisting = isExisting && blockExistingDates;
            const isClickableExisting = isExisting && !blockExistingDates;

            let cellStyle = {};
            let textClass = `${cellSizeClass} flex items-center justify-center transition-all duration-150 rounded-lg ${textSizeClass}`;

            if (isBlockedExisting || isClickableExisting) {
                cellStyle.background =
                    "linear-gradient(145deg, rgba(255,59,48,0.12), rgba(192,57,43,0.08))";
                cellStyle.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.1)";
                textClass += isBlockedExisting
                    ? " text-[#C0392B] font-semibold cursor-not-allowed"
                    : " text-[#C0392B] font-semibold cursor-pointer";
            } else if (isStart || isEnd) {
                cellStyle.background = isDark
                    ? "linear-gradient(145deg, #639DFF, #4A7FCC)"
                    : "linear-gradient(145deg, #007AFF, #0055D4)";
                cellStyle.boxShadow = isDark
                    ? "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(99,157,255,0.4)"
                    : "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(0,122,255,0.35)";
                textClass += " text-white font-bold";
            } else if (isInRange) {
                cellStyle.background = isDark
                    ? "linear-gradient(145deg, rgba(99,157,255,0.15), rgba(99,157,255,0.08))"
                    : "linear-gradient(145deg, rgba(0,122,255,0.1), rgba(0,122,255,0.06))";
                cellStyle.boxShadow = isDark
                    ? "inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(99,157,255,0.2)"
                    : "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 0 0 1px rgba(0,122,255,0.15)";
                textClass += isDark
                    ? " text-[#639DFF] font-medium"
                    : " text-[#0055D4] font-medium";
            } else if (isWeekend) {
                cellStyle.background = isDark ? "rgba(99,157,255,0.03)" : "#F2F2F7";
                cellStyle.boxShadow = isDark
                    ? "inset 0 1px 2px rgba(0,0,0,0.2)"
                    : "inset 0 1px 2px rgba(0,0,0,0.04)";
                textClass += isDark
                    ? " text-[#4A6A8A] cursor-not-allowed"
                    : " text-[#C7C7CC] cursor-not-allowed";
            } else if (isToday && !isStart && !isEnd) {
                cellStyle.background = isDark
                    ? "linear-gradient(145deg, rgba(99,157,255,0.12), rgba(99,157,255,0.06))"
                    : "linear-gradient(145deg, rgba(0,122,255,0.08), rgba(0,122,255,0.04))";
                cellStyle.boxShadow = isDark
                    ? "0 0 0 1.5px #639DFF, inset 0 1px 0 rgba(255,255,255,0.06)"
                    : "0 0 0 1.5px #007AFF, inset 0 1px 0 rgba(255,255,255,0.9)";
                textClass += isDark
                    ? " text-[#639DFF] font-semibold"
                    : " text-[#007AFF] font-semibold";
            } else {
                cellStyle.background = isDark
                    ? "rgba(99,157,255,0.05)"
                    : "rgba(255,255,255,0.8)";
                cellStyle.boxShadow = isDark
                    ? "inset 0 1px 1px rgba(255,255,255,0.04), 0 0 0 1px rgba(99,157,255,0.08)"
                    : "inset 0 1px 1px rgba(255,255,255,0.9), 0 0 0 1px rgba(0,0,0,0.04)";
                textClass += isDark
                    ? " text-[#7A9CC4] hover:bg-white/[0.06]"
                    : " text-[#374151] hover:bg-[#F2F2F7]";
            }

            const handleClick = (e) => {
                if (isClickableExisting && onDayOffClick) {
                    onDayOffClick(day, e);
                    return;
                }
                if (!isWeekend && !isBlockedExisting && onDayClick) {
                    onDayClick(day, e);
                }
            };

            return (
                <button
                    key={index}
                    onClick={handleClick}
                    disabled={isWeekend || isBlockedExisting}
                    className={textClass}
                    style={cellStyle}
                >
                    {format(day, "d")}
                </button>
            );
        },
        [
            isDark,
            existingDates,
            startDate,
            endDate,
            blockExistingDates,
            onDayClick,
            onDayOffClick,
        ],
    );
}
