import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { SheetAction, SheetContext } from "./data-table";
import TableSheet from "./tableSheet";
import React from "react";

type AddButtonProps = {
  sheetContext: SheetContext;
  sheetActions: SheetAction;
};


export default function AddButton({
  sheetContext,
  sheetActions,
}: AddButtonProps) {
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
        sheetOpen={sheetOpen}
        setSheetOpen={setSheetOpen}
        activeSheetData={null}
        setActiveSheetData={() => {
          setSheetOpen(false);
        }}
        sheetContext={sheetContext}
        sheetActions={sheetActions}
      />
    </>
  );
}
