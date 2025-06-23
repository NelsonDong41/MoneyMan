import * as React from "react";
import { Input } from "@/components/ui/input";
import { ControllerRenderProps } from "react-hook-form";

function formatCurrency(value: string | number) {
  if (value === "" || value === null || value === undefined) return "";
  const [int, dec] = Number(value).toFixed(2).split(".");
  const intWithCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${intWithCommas}.${dec.slice(0, 2) ?? "00"}`;
}

function unformatCurrency(value: string) {
  return value.replace(/[^0-9.]/g, "");
}

export default function CurrencyInput({
  value,
  onChange,
  ...props
}: ControllerRenderProps & { id: string }) {
  const [focused, setFocused] = React.useState(false);
  const [displayedValue, setDisplayedValue] = React.useState(
    formatCurrency(value)
  );

  const handleOnBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    e.preventDefault();
    const formattedCurrency = formatCurrency(e.target.value);
    setDisplayedValue(formattedCurrency);
    setFocused(false);
  };

  const handleOnFocus = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    e.preventDefault();
    if (e.target.value) {
      onChange(unformatCurrency(e.target.value));
    }
    setFocused(true);
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (/^[0-9]*\.?[0-9]*$/.test(e.target.value)) {
      onChange(e.target.value);
    }
  };

  return (
    <Input
      className="col-span-2 text-right"
      inputMode="decimal"
      placeholder="0.00"
      autoComplete="off"
      {...props}
      value={focused ? value : displayedValue}
      onChange={handleOnChange}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
    />
  );
}
