"use client";

import * as React from "react";
import { parseDate } from "chrono-node";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ControllerRenderProps } from "react-hook-form";
import { formatDate } from "@/utils/utils";

export function NaturalLanguageCalender({
  value,
  onChange,
  ...props
}: ControllerRenderProps & { id: string }) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date | undefined>(value);

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    e.preventDefault();
    const parsedDate = parseDate(e.target.value);
    if (parsedDate) {
      onChange(formatDate(parsedDate));
    } else {
      onChange(undefined);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    onChange(e.target.value);
  };

  return (
    <div className="relative flex gap-2" {...props}>
      <Input
        id="date"
        value={value}
        placeholder="Tomorrow or next week"
        className="bg-background pr-10"
        onChange={handleOnChange}
        onBlur={handleOnBlur}
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
          >
            <CalendarIcon className="size-3.5" />
            <span className="sr-only">Select date</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto overflow-hidden p-0 z-50 pointer-events-auto"
          align="end"
        >
          <Calendar
            mode="single"
            selected={value}
            captionLayout="dropdown"
            month={month}
            onMonthChange={setMonth}
            onSelect={(date) => {
              onChange(formatDate(date));
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
