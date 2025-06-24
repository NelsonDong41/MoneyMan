import * as React from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";

type ComboboxFormFieldProps = {
  control: any;
  name: string;
  label: string;
  options: string[];
};

export function ComboboxFormField({
  control,
  name,
  label,
  options,
}: ComboboxFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const [open, setOpen] = React.useState(false);

        return (
          <FormItem className="flex flex-col w-full">
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {field.value || `Select ${label}...`}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 z-50 border border-accent rounded-lg pointer-events-auto">
                <Command>
                  <CommandInput
                    placeholder={`Search ${label}...`}
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No {label.toLowerCase()} found.</CommandEmpty>
                    <CommandGroup>
                      {options.map((option) => (
                        <CommandItem
                          value={option}
                          key={option}
                          onSelect={() => {
                            field.onChange(option);
                            setOpen(false);
                          }}
                        >
                          {option}
                          <Check
                            className={cn(
                              "ml-auto",
                              option === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
