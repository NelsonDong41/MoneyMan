import { Button } from "@/components/ui/button";
import { Receipt } from "@/utils/supabase/supabase";
import { Trash } from "lucide-react";
import { SheetAction, SheetContext } from "./data-table";
import TableSheet from "./tableSheet";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import DeleteAlert from "./deleteAlert";

type DeleteButtonProps = {
  sheetContext: SheetContext;
  sheetActions: SheetAction;
};

export default function DeleteButton({ sheetContext, sheetActions }: DeleteButtonProps) {
  const selectedRows = sheetContext.table.getSelectedRowModel().rows;
  const selectedRowIds = selectedRows.map(row => row.original.id);
  console.log("Selected Row IDs:", selectedRowIds);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  return (
    <DeleteAlert showTrigger={true} open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen} action={() => sheetActions.deleteRows(selectedRowIds, sheetContext.user)} />
  );
}
