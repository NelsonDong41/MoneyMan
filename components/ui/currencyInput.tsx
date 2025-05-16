import * as React from "react";
import { Input } from "@/components/ui/input";

function formatCurrency(value: string | number) {
  if (value === "" || value === null || value === undefined) return "";
  const [int, dec] = value.toString().split(".");
  const intWithCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec !== undefined ? `${intWithCommas}.${dec}` : intWithCommas;
}

function unformatCurrency(value: string) {
  return value.replace(/[^0-9.]/g, "");
}

export default function CurrencyInput({ value, onChange, ...props }: any) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = React.useState(formatCurrency(value));

  React.useEffect(() => {
    setDisplayValue(formatCurrency(value));
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const input = e.target;
    const rawValue = input.value;
    const selectionStart = input.selectionStart || 0;

    const unformatted = unformatCurrency(rawValue);

    const parts = unformatted.split(".");
    let val = unformatted;
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    if (parts[1]?.length > 2) {
      val = parts[0] + "." + parts[1].slice(0, 2);
    }

    const formatted = formatCurrency(val);

    let digitsBeforeCaret = 0;
    for (let i = 0; i < selectionStart; i++) {
      if (/\d/.test(rawValue[i])) digitsBeforeCaret++;
    }

    let newCaretPos = 0,
      digitCount = 0;
    while (digitCount < digitsBeforeCaret && newCaretPos < formatted.length) {
      if (/\d/.test(formatted[newCaretPos])) digitCount++;
      newCaretPos++;
    }

    setDisplayValue(formatted);
    onChange(val);

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.setSelectionRange(newCaretPos, newCaretPos);
      }
    }, 0);
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    let val = unformatCurrency(e.target.value);
    if (val === "") {
      setDisplayValue("");
      onChange("");
      return;
    }
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const formatted = num.toFixed(2);
      setDisplayValue(formatCurrency(formatted));
      onChange(formatted);
    } else {
      setDisplayValue("");
      onChange("");
    }
  };

  return (
    <Input
      {...props}
      ref={inputRef}
      inputMode="decimal"
      pattern="^\d{1,3}(,\d{3})*(\.\d{0,2})?$"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="0.00"
      autoComplete="off"
    />
  );
}
