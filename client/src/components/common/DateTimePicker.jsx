import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";

/**
 * Custom DateTimePicker Component
 * Renders an interactive popover with a calendar grid on the left and a 00:00-23:00 time selector column on the right.
 */
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hourStr = String(i).padStart(2, "0");
  const period = i >= 12 ? "PM" : "AM";
  const displayHour = i % 12 === 0 ? 12 : i % 12;
  return {
    value: `${hourStr}:00`,
    label: `${hourStr}:00 (${displayHour}:00 ${period})`,
    shortLabel: `${hourStr}:00`,
  };
});

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DateTimePicker({
  value = "",
  onChange,
  min = "",
  defaultTime = "10:00",
  placeholder = "Select date & time",
  hasError = false,
  disabled = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const timeListRef = useRef(null);

  // Parse current value
  let selectedDateObj = null;
  let selectedDateStr = ""; // "YYYY-MM-DD"
  let selectedTimeStr = ""; // "HH:mm"

  if (value) {
    const parts = value.split("T");
    selectedDateStr = parts[0] || "";
    selectedTimeStr = parts[1] ? parts[1].slice(0, 5) : "";
    if (selectedDateStr) {
      selectedDateObj = new Date(`${selectedDateStr}T${selectedTimeStr || defaultTime || "00:00"}`);
    }
  }

  // Calendar View Month/Year State
  const initialViewDate = selectedDateObj && !Number.isNaN(selectedDateObj.getTime())
    ? selectedDateObj
    : new Date();
  
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active time into view when popover opens
  useEffect(() => {
    if (isOpen && timeListRef.current) {
      const activeEl = timeListRef.current.querySelector("[data-selected='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [isOpen]);

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDate = (dayNum) => {
    const monthStr = String(viewMonth + 1).padStart(2, "0");
    const dayStr = String(dayNum).padStart(2, "0");
    const newDateStr = `${viewYear}-${monthStr}-${dayStr}`;
    const timeToUse = selectedTimeStr || defaultTime || "10:00";
    
    onChange(`${newDateStr}T${timeToUse}`);
  };

  const handleSelectTime = (timeVal) => {
    let dateToUse = selectedDateStr;
    if (!dateToUse) {
      // Default to today if date not selected yet
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      dateToUse = `${year}-${month}-${day}`;
    }

    onChange(`${dateToUse}T${timeVal}`);
  };

  // Generate Days Grid for Calendar
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Min Date handling
  let minDateStr = "";
  if (min) {
    minDateStr = min.split("T")[0];
  }

  // Format value for display input
  let displayString = "";
  if (selectedDateStr) {
    const dObj = new Date(`${selectedDateStr}T${selectedTimeStr || defaultTime}`);
    if (!Number.isNaN(dObj.getTime())) {
      displayString = dObj.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Input Trigger Field */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-sm transition flex items-center justify-between shadow-xs ${
          hasError
            ? "border-red-400 bg-red-50 text-red-900"
            : isOpen
            ? "border-orange-500 bg-white ring-2 ring-orange-500/15"
            : "border-slate-300 bg-slate-50 text-slate-900 hover:border-slate-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="h-4 w-4 shrink-0 text-orange-600" />
          <span className={displayString ? "font-medium text-slate-900" : "text-slate-400"}>
            {displayString || placeholder}
          </span>
        </div>

        {value ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Clock className="h-4 w-4 shrink-0 text-slate-400" />
        )}
      </div>

      {/* Floating Date & Time Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-2 z-50 flex flex-col sm:flex-row rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* LEFT PANEL: Calendar */}
          <div className="p-4 w-72 border-b sm:border-b-0 sm:border-r border-slate-100 flex flex-col">
            {/* Header: Month & Year Selector */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-sm font-bold text-slate-800">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <span key={day} className="text-[11px] font-bold text-slate-400 uppercase">
                  {day}
                </span>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-8 w-8" />
              ))}

              {/* Month Days */}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const monthStr = String(viewMonth + 1).padStart(2, "0");
                const dayStr = String(dayNum).padStart(2, "0");
                const dateStr = `${viewYear}-${monthStr}-${dayStr}`;

                const isSelected = dateStr === selectedDateStr;
                const isDisabled = minDateStr && dateStr < minDateStr;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(dayNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-semibold flex items-center justify-center transition ${
                      isSelected
                        ? "bg-orange-600 text-white shadow-sm font-bold scale-105"
                        : isDisabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    {dayNum}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  setViewYear(today.getFullYear());
                  setViewMonth(today.getMonth());
                  const year = today.getFullYear();
                  const month = String(today.getMonth() + 1).padStart(2, "0");
                  const day = String(today.getDate()).padStart(2, "0");
                  handleSelectDate(parseInt(day, 10));
                }}
                className="text-orange-600 font-bold hover:underline"
              >
                Today
              </button>

              {selectedDateStr && (
                <span className="text-slate-500 text-[11px] font-medium">
                  {selectedDateStr}
                </span>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Scrollable Time Column (00:00 - 23:00) */}
          <div className="w-full sm:w-36 bg-slate-50 flex flex-col border-l border-slate-100">
            <div className="p-3 border-b border-slate-200 bg-slate-100/70 text-center">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
                Time
              </span>
            </div>

            <div
              ref={timeListRef}
              className="max-h-64 overflow-y-auto p-1.5 space-y-1 scrollbar-thin scrollbar-thumb-slate-200"
            >
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTimeStr === slot.value || (!selectedTimeStr && slot.value === defaultTime);

                return (
                  <button
                    key={slot.value}
                    type="button"
                    data-selected={isSelected}
                    onClick={() => handleSelectTime(slot.value)}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center justify-between ${
                      isSelected
                        ? "bg-orange-600 text-white font-bold shadow-xs"
                        : "text-slate-700 hover:bg-slate-200/80"
                    }`}
                  >
                    <span>{slot.value}</span>
                    <span className={`text-[10px] ${isSelected ? "text-orange-100" : "text-slate-400"}`}>
                      {slot.value.startsWith("12") ? "12 PM" : parseInt(slot.value, 10) >= 12 ? `${parseInt(slot.value, 10) - 12 || 12} PM` : `${parseInt(slot.value, 10)} AM`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-2 border-t border-slate-200 bg-white">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
