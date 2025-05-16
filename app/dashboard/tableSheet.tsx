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
import { Receipt } from "@/utils/supabase/supabase";
import { Row } from "@tanstack/react-table";
import { SheetContext } from "./data-table";
import { useEffect, useState } from "react";
import CurrencyInput from "@/components/ui/currencyInput";

function is_numeric(str: string) {
  return /^\d+$/.test(str);
}

type TableSheetType = {
  sheetOpen: Row<Receipt> | null;
  setSheetOpen: React.Dispatch<React.SetStateAction<Row<Receipt> | null>>;
  sheetContext: SheetContext;
};
export default function TableSheet({
  sheetOpen,
  setSheetOpen,
  sheetContext,
}: TableSheetType) {
  const data = sheetOpen?.original;
  const [receipt, setReceipt] = useState("");
  const [category, setCategory] = useState("");
  const [merchant, setMerchant] = useState("");
  const [date, setDate] = useState("");
  const [subtotal, setSubtotal] = useState("0.0");
  const [tax, setTax] = useState("0.0");
  const [tip, setTip] = useState("0.0");
  const [total, setTotal] = useState("0.0");

  useEffect(() => {
    if (data) {
      setReceipt(data.receipt ?? "");
      setCategory(data.category?.category ?? "");
      setMerchant(data.merchant ?? "");
      setDate(data.date ?? "");
      setSubtotal(String(data.subtotal) ?? "0.0");
      setTax(String(data.tax) ?? "0.0");
      setTip(String(data.tip) ?? "0.0");
      setTotal(String(data.total) ?? "0.0");
    }
  }, [data]);

  return (
    <Sheet open={!!sheetOpen} onOpenChange={() => setSheetOpen(null)}>
      <SheetContent side="right" className="flex flex-col">
        {!!data && (
          <>
            <SheetHeader className="gap-1">
              <SheetTitle>Editor</SheetTitle>
              <SheetDescription>Edit receipt values</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
              <form className="flex flex-col gap-4 p-1">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="receipt">Receipt</Label>
                  <Input
                    id="receipt"
                    value={receipt}
                    onChange={(e) => setReceipt(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input
                    id="merchant"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={category}
                      onValueChange={(e) => setCategory(e)}
                    >
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from(sheetContext.categories).map((category) => (
                          <SelectItem
                            key={category + "-select"}
                            value={category}
                          >
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      className="max-w-fit"
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 border-10 border-red-100">
                  <Label>Pay</Label>
                  <div className="grid grid-cols-3 items-center">
                    <Label htmlFor="subtotal">subtotal</Label>
                    <CurrencyInput
                      id="subtotal"
                      value={parseFloat(subtotal).toFixed(2)}
                      className="col-span-2 text-right"
                      onChange={setSubtotal}
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <Label htmlFor="tax">tax</Label>
                    <CurrencyInput
                      id="tax"
                      value={parseFloat(tax).toFixed(2)}
                      className="col-span-2 text-right"
                      onChange={setTax}
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <Label htmlFor="tip">tip</Label>
                    <CurrencyInput
                      id="tip"
                      value={parseFloat(tip).toFixed(2)}
                      className="col-span-2 text-right"
                      onChange={setTip}
                    />
                  </div>
                  <div className="grid grid-cols-3 items-center">
                    <Label htmlFor="total">total</Label>
                    <CurrencyInput
                      id="total"
                      value={parseFloat(total).toFixed(2)}
                      className="col-span-2 text-right"
                      onChange={setTotal}
                    />
                  </div>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="image">Image</Label>
                  <Input id="image" type="file" />
                </div>
              </form>
            </div>
            <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
              <Button className="w-full">Submit</Button>
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
