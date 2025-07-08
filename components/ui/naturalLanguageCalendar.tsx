"use client";

import * as React from "react";
import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateDash, formatDateHuman } from "@/utils/utils";
function parseLocalDateString(str: string) {
  // str must be in format "YYYY-MM-DD"
  const [year, month, day] = str.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  // Note: months are 0-based in JS Date
  return new Date(year, month - 1, day);
}
export function NaturalLanguageCalendar({
  value,
  onChange,
}: {
  value: string; // always a string
  onChange: (dateString: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value);

  // Keep inputValue in sync with value prop unless editing
  React.useEffect(() => {
    if (!editing) setInputValue(value);
  }, [value, editing]);

  // Helper: parse value string to Date (or undefined)
  const getDateFromValue = (val: string): Date | undefined => {
    if (!val) return undefined;
    return parseLocalDateString(val); // GOOD: parses as local date
  };
  // Format for display (when not editing)
  const displayValue = (() => {
    const parsed = getDateFromValue(value);
    return parsed ? formatDateHuman(parsed) : "";
  })();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // On blur, try to parse natural language, fallback to empty string if invalid
  const handleInputBlur = () => {
    const parsed = parseDate(inputValue);
    if (parsed) {
      onChange(formatDateDash(parsed));
      setInputValue(formatDateHuman(parsed) || ""); // show formatted
    } else {
      onChange("");
      setInputValue("");
    }
    setEditing(false);
  };

  // Handle calendar selection
  const handleCalendarSelect = (date?: Date) => {
    if (date) {
      onChange(formatDateDash(date));
      setInputValue(formatDateHuman(date) || "");
    } else {
      onChange("");
      setInputValue("");
    }
    setOpen(false);
    setEditing(false);
  };

  return (
    <div className="relative flex gap-2">
      <Input
        id="date"
        value={editing ? inputValue : displayValue}
        placeholder="Tomorrow or next week"
        className="bg-background pr-10"
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={() => setEditing(true)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="ghost"
            className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            tabIndex={-1}
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0 pointer-events-auto"
          align="end"
        >
          <Calendar
            mode="single"
            selected={getDateFromValue(value)}
            captionLayout="dropdown"
            month={getDateFromValue(value)}
            onMonthChange={() => {}}
            onSelect={handleCalendarSelect}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
