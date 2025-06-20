import { SheetAction, SheetContext } from "./data-table";
import React from "react";
import DeleteAlert from "./deleteAlert";

type DeleteButtonProps = {
  sheetContext: SheetContext;
  sheetActions: SheetAction;
};

export default function DeleteButton({
  sheetContext,
  sheetActions,
}: DeleteButtonProps) {
  const selectedRows = sheetContext.table.getSelectedRowModel().rows;
  const selectedRowIds = selectedRows.map((row) => row.original.id);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  return (
    <DeleteAlert
      showTrigger={true}
      open={deleteAlertOpen}
      onOpenChange={setDeleteAlertOpen}
      action={() => sheetActions.deleteRows(selectedRowIds, sheetContext.user)}
    />
  );
}
