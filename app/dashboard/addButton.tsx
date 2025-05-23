import { Button } from "@/components/ui/button";
import { Receipt } from "@/utils/supabase/supabase";
import { PlusCircle } from "lucide-react";
import { SheetContext } from "./data-table";
import TableSheet from "./tableSheet";
import React from "react";
import { v4 as uuidv4 } from "uuid";

type AddButton = {
  sheetContext: SheetContext;
};

export default function AddButton({ sheetContext }: AddButton) {
  const defaultRow: Receipt = {
    id: uuidv4(),
    user_id: sheetContext.user,
    created_at: "",
    merchant: "",
    receipt: "",
    total: 0,
    category: {
      category: null,
    },
  };
  const [sheetOpen, setSheetOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setSheetOpen((prev) => !prev)}
        size="sm"
      >
        <PlusCircle />
        Add
      </Button>
      <TableSheet
        isNewSheet={true}
        activeSheetData={sheetOpen ? defaultRow : null}
        setActiveSheetData={() => {
          console.log("HERE");
          setSheetOpen(false);
        }}
        sheetContext={sheetContext}
      />
    </>
  );
}
