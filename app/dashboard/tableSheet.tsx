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
import { Receipt } from "@/utils/supabase/supabase";
import { Row } from "@tanstack/react-table";
import { SheetContext } from "./data-table";
import { useEffect } from "react";
import CurrencyInput from "@/components/ui/currencyInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import DeleteAlert from "./deleteAlert";

const upsertReceipt = async (receiptData: z.infer<typeof tableSheetSchema>) => {
  console.log("upsert");
  const { data, error } = await createClient()
    .from("Receipt")
    .upsert(receiptData);

  if (error) {
    console.error("Error upserting receipt:", error);
    return null;
  }

  return data;
};

export const tableSheetSchema = z.object({
  id: z.string().min(1, "Id is required"),
  user_id: z.string().min(1, "UserId is required"),
  receipt: z.string().min(1, "Receipt is required"),
  merchant: z.string().min(1, "Merchant is required"),
  category: z.string().min(1, "Category ID must be an int"),
  date: z
    .string()
    .min(1, "Date is required")
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),
  subtotal: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Subtotal must be a number",
  }),
  tax: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Tax must be a number" }),
  tip: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: "Tip must be a number" }),
  total: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Total must be a number",
  }),
  image: z.any().optional(),
});

type TableSheetType = {
  isNewSheet: boolean;
  activeSheetData: Receipt | null;
  setActiveSheetData: any;
  sheetContext: SheetContext;
};
export default function TableSheet({
  isNewSheet,
  activeSheetData,
  setActiveSheetData,
  sheetContext,
}: TableSheetType) {
  const form = useForm<z.infer<typeof tableSheetSchema>>({
    resolver: zodResolver(tableSheetSchema),
    defaultValues: {
      id: "",
      user_id: "",
      receipt: "",
      category: "",
      merchant: "",
      date: "",
      subtotal: "",
      tax: "",
      tip: "",
      total: "",
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (activeSheetData) {
      const categoryId = activeSheetData.category.category
        ? sheetContext.categories[activeSheetData.category.category]
        : null;

      reset({
        id: activeSheetData.id,
        user_id: activeSheetData.user_id,
        receipt: activeSheetData.receipt,
        category: categoryId?.toString() ?? undefined,
        merchant: activeSheetData.merchant,
        date: activeSheetData.date,
        subtotal: activeSheetData.subtotal?.toFixed(2) || "0.00",
        tax: activeSheetData.tax?.toFixed(2) || "0.00",
        tip: activeSheetData.tip?.toFixed(2) || "0.00",
        total: activeSheetData.total.toFixed(2),
      });
    }
  }, [activeSheetData, reset]);

  return (
    <Sheet
      open={!!activeSheetData}
      onOpenChange={() => setActiveSheetData(null)}
    >
      <SheetContent side="right" className="flex flex-col">
        {!!activeSheetData && (
          <>
            <SheetHeader className="gap-1">
              <SheetTitle>Editor</SheetTitle>
              <SheetDescription>Edit receipt values</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(sheetContext.upsertRow)}
                  className="flex flex-col gap-4 p-1"
                >
                  <FormField
                    control={form.control}
                    name="receipt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Receipt</FormLabel>
                        <FormControl>
                          <Input id="receipt" {...field} />
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
                        <FormLabel htmlFor="merchant">Merchant</FormLabel>
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
                              value={field.value ?? ""}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger id="category" className="w-full">
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(sheetContext.categories).map(
                                  ([category, id]) => (
                                    <SelectItem
                                      key={category + "-select"}
                                      value={id.toString()}
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
                    <FormLabel>Pay</FormLabel>
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
                      name="total"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-3 items-center">
                            <FormLabel htmlFor="total">total</FormLabel>
                            <CurrencyInput
                              id="total"
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
                  action={() =>
                    sheetContext.deleteRow(
                      activeSheetData.id,
                      activeSheetData.user_id
                    )
                  }
                />
              )}
              <Button
                className="w-full"
                onClick={form.handleSubmit(sheetContext.upsertRow)}
              >
                {isNewSheet ? "Create" : "Update"}
              </Button>
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  Done
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
