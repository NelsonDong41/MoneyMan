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
  const totalRowCount = sheetContext.table.getFilteredRowModel().rows.length;
  const selectedRows = sheetContext.table.getFilteredSelectedRowModel().rows;
  const selectedRowIds = selectedRows.map((row) => row.original.id);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  return (
    <DeleteAlert
      showTrigger={true}
      open={deleteAlertOpen}
      onOpenChange={setDeleteAlertOpen}
      action={() => {
        sheetActions.deleteRows(selectedRowIds, sheetContext.user);
        setDeleteAlertOpen(false);
      }}
      additionalMessage={`${selectedRows.length} of ${totalRowCount} transactions`}
    />
  );
}
