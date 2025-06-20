import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useEffect } from "react";
import CurrencyInput from "@/components/ui/currencyInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import DeleteAlert from "./deleteAlert";
import {
  FormTransaction,
  transactionFormSchema,
} from "@/utils/schemas/transactionFormSchema";
import { z } from "zod";
import { TransactionWithCategory } from "./page";
import { Title } from "@radix-ui/react-dialog";

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
  amount: 0.0,
  category: "",
  date: "",
  description: "",
  merchant: "",
  notes: "",
  status: "Complete",
  subtotal: 0.0,
  tax: 0.0,
  tip: 0.0,
  type: "Income",
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
        category: activeSheetData.category.category,
        date: formattedDate,
      });
      return;
    }
    reset(defaultFormValues);
  }, [sheetOpen, activeSheetData, reset]);

  return (
    <Sheet
      open={sheetOpen}
      onOpenChange={() => {
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
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor="category">Category</Label>
                      <FormControl>
                        <Select
                          value={field.value.toString()}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id="category" className="w-full">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(sheetContext.categories).map(
                              ([category, _id]) => (
                                <SelectItem
                                  key={category + "-select"}
                                  value={category.toString()}
                                >
                                  {category}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="date">Date</FormLabel>
                      <FormControl>
                        <Input
                          id="date"
                          type="date"
                          className="max-w-fit"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                          <CurrencyInput
                            id="subtotal"
                            className="col-span-2 text-right"
                            {...field}
                          />
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
                          <CurrencyInput
                            id="tax"
                            className="col-span-2 text-right"
                            {...field}
                          />
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
                        <CurrencyInput
                          id="tip"
                          className="col-span-2 text-right"
                          {...field}
                        />
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
                        <CurrencyInput
                          id="amount"
                          className="col-span-2 text-right"
                          {...field}
                        />
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
