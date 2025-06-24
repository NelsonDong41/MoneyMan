import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SheetAction, SheetContext } from "./data-table";
import { useEffect, useState } from "react";
import CurrencyInput from "@/components/ui/currencyInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import DeleteAlert from "./deleteAlert";
import {
  FormTransaction,
  transactionFormSchema,
} from "@/utils/schemas/transactionFormSchema";
import { Title } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import { NaturalLanguageCalender } from "@/components/ui/naturalLanguageCalender";
import {
  STATUS_OPTIONS,
  TransactionWithCategory,
  TYPE_OPTIONS,
} from "@/utils/supabase/supabase";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { ChevronsUpDown, Check } from "lucide-react";

type TableSheetProps = {
  isNewSheet: boolean;
  sheetOpen: boolean;
  setSheetOpen: (value: React.SetStateAction<boolean>) => void;
  activeSheetData: TransactionWithCategory | null;
  setActiveSheetData: (
    value: React.SetStateAction<TransactionWithCategory | null>
  ) => void;
  sheetContext: SheetContext;
  sheetActions: SheetAction;
};

const defaultFormValues: FormTransaction = {
  amount: "0.00",
  category: "",
  date: "",
  description: "",
  merchant: "",
  notes: "",
  status: "Complete",
  type: "Expense",
};

export default function TableSheet({
  isNewSheet,
  sheetOpen,
  setSheetOpen,
  activeSheetData,
  setActiveSheetData,
  sheetContext,
  sheetActions,
}: TableSheetProps) {
  const form = useForm<FormTransaction>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: defaultFormValues,
  });

  const { reset } = form;

  useEffect(() => {
    if (!sheetOpen) return;

    if (activeSheetData) {
      let date = new Date(activeSheetData.date);
      const offset = date.getTimezoneOffset();
      date = new Date(date.getTime() - offset * 60 * 1000);
      const formattedDate = date.toISOString().split("T")[0];

      reset({
        ...activeSheetData,
        id: activeSheetData.id,
        category: activeSheetData.category.category,
        date: formattedDate,
        amount: activeSheetData.amount.toFixed(2),
        subtotal: activeSheetData.subtotal?.toFixed(2),
        tax: activeSheetData.tax?.toFixed(2),
        tip: activeSheetData.tip?.toFixed(2),
        notes: activeSheetData.notes,
      });
      return;
    }
    reset(defaultFormValues);
  }, [sheetOpen, activeSheetData, reset]);

  return (
    <Sheet
      open={sheetOpen}
      onOpenChange={() => {
        if (form.formState.isDirty) {
          if (!window.confirm("You have unsaved changes. Close anyway?"))
            return;
        }
        setActiveSheetData(null);
        setSheetOpen(false);
      }}
    >
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader className="gap-1">
          <SheetTitle>Editor</SheetTitle>
          <SheetDescription>Edit Transaction values</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(sheetActions.upsertRow)}
              className="flex flex-col gap-4 p-1"
            >
              <FormField
                control={form.control}
                name="id"
                render={() => <></>}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input id="description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="merchant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant</FormLabel>
                    <FormControl>
                      <Input id="merchant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => {
                    const [open, setOpen] = useState(false);
                    return (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel>Status</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? STATUS_OPTIONS.find(
                                      (status) => status === field.value
                                    )
                                  : "Select status"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 z-50 border border-accent rounded-lg">
                            <Command>
                              <CommandInput
                                placeholder="Search category..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {STATUS_OPTIONS.map((status) => (
                                    <CommandItem
                                      value={status}
                                      key={status}
                                      onSelect={() => {
                                        form.setValue("status", status);
                                        setOpen(false);
                                      }}
                                    >
                                      {status}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          status === field.value
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
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => {
                    const [open, setOpen] = useState(false);
                    return (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel>Type</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? TYPE_OPTIONS.find(
                                      (type) => type === field.value
                                    )
                                  : "Select Type"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 z-50 border border-accent rounded-lg">
                            <Command>
                              <CommandInput
                                placeholder="Search Type..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No category found.</CommandEmpty>
                                <CommandGroup>
                                  {TYPE_OPTIONS.map((type) => (
                                    <CommandItem
                                      value={type}
                                      key={type}
                                      onSelect={() => {
                                        form.setValue("type", type);
                                        setOpen(false);
                                      }}
                                    >
                                      {type}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          type === field.value
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
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => {
                  const [open, setOpen] = useState(false);
                  return (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Category</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              onClick={() => setOpen((prev) => !prev)}
                            >
                              {field.value
                                ? sheetContext.categories.find(
                                    ({ category }) => category === field.value
                                  )?.category
                                : "Select category"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 z-50 border border-accent rounded-lg">
                          <Command>
                            <CommandInput
                              placeholder="Search category..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {sheetContext.categories.map(({ category }) => (
                                  <CommandItem
                                    value={category}
                                    key={category}
                                    onSelect={() => {
                                      form.setValue("category", category);
                                      setOpen(false);
                                    }}
                                  >
                                    {category}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        category === field.value
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
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="date">Date</FormLabel>
                    <FormControl>
                      <NaturalLanguageCalender id="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 border-10 border-red-100">
                <Title>Pay</Title>
                <FormField
                  control={form.control}
                  name="subtotal"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-3 items-center">
                        <FormLabel htmlFor="subtotal">subtotal</FormLabel>
                        <FormControl>
                          <CurrencyInput id="subtotal" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-3 items-center">
                          <FormLabel htmlFor="tax">tax</FormLabel>
                          <CurrencyInput id="tax" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tip"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-3 items-center">
                        <FormLabel htmlFor="tip">tip</FormLabel>
                        <CurrencyInput id="tip" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-3 items-center">
                        <FormLabel htmlFor="amount">Amount</FormLabel>
                        <CurrencyInput id="amount" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image">Image</Label>
                <Input id="image" type="file" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes for the transaction"
                          className="resize-y w-full"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <SheetFooter className="mt-auto flex gap-4 sm:flex-col sm:space-x-0">
          {!isNewSheet && (
            <DeleteAlert
              showTrigger={true}
              action={() => {
                if (activeSheetData) {
                  sheetActions.deleteRows(
                    [activeSheetData.id],
                    activeSheetData.userId
                  );
                }
              }}
            />
          )}
          <Button
            className="w-full"
            onClick={form.handleSubmit(sheetActions.upsertRow)}
            disabled={!form.formState.isDirty}
          >
            {isNewSheet ? "Create" : "Update"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
