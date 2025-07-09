import { SheetAction } from "./data-table";
import React from "react";
import DeleteAlert from "./deleteAlert";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { Table } from "@tanstack/react-table";
import { useUser } from "@/context/UserContext";

type DeleteButtonProps = {
  table: Table<TransactionWithCategory>;
  sheetActions: SheetAction;
};

export default function DeleteButton({
  table,
  sheetActions,
}: DeleteButtonProps) {
  const totalRowCount = table.getFilteredRowModel().rows.length;
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedRowIds = selectedRows.map((row) => row.original.id);
  const [deleteAlertOpen, setDeleteAlertOpen] = React.useState(false);
  return (
    <DeleteAlert
      showTrigger={true}
      open={deleteAlertOpen}
      onOpenChange={setDeleteAlertOpen}
      action={() => {
        sheetActions.deleteRows(selectedRowIds);
        table.setRowSelection({});
        setDeleteAlertOpen(false);
      }}
      additionalMessage={`${selectedRows.length} of ${totalRowCount} transactions`}
    />
  );
}
