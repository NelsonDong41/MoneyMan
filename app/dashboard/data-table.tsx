"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as ReactTable,
} from "@tanstack/react-table";

import {
  DataTablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/ui/dataTableViewOptions";
import TableSheet from "./tableSheet";
import { CategoryEnum } from "@/utils/supabase/supabase";
import { TableData } from "./page";
import AddButton from "./addButton";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DeleteButton from "./deleteButton";
import { Transaction } from "@/utils/schemas/transactionSchema";

export type SheetContext = {
  categories: { [x in CategoryEnum]: number };
  user: string;
  table: ReactTable<Transaction>;
};
export type SheetAction = {
  upsertRow: (values: Transaction) => void;
  deleteRows: (ids: string[], user_Id?: string) => void;
};

interface DataTableProps<TValue> {
  columns: (
    loadingRows: Set<string>,
    sheetActions: SheetAction
  ) => ColumnDef<Transaction, TValue>[];
  data: TableData;
}

export function DataTable<TValue>({ columns, data }: DataTableProps<TValue>) {
  const router = useRouter();
  const [loadingRows, setLoadingRows] = React.useState<Set<string>>(new Set());
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      subtotal: false,
      tip: false,
      tax: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});
  const [activeSheetData, setActiveSheetData] = React.useState<Transaction | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const upsertRow = async (values: Transaction) => {
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        return new Set(prev).add(activeSheetData.id);
      }
      return prev;
    });

    const { error } = await createClient().from("Transaction").upsert(values);

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }

    setActiveSheetData(null);
    router.refresh();
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        const newSet = new Set(prev);
        newSet.delete(activeSheetData.id);
        return newSet;
      }
      return prev;
    });
  };

  const deleteRows = async (ids: string[]) => {
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        return new Set(prev).add(activeSheetData.id);
      }
      return prev;
    });
    const { error } = await createClient()
      .from("Transaction")
      .delete()
      .match({ userId: data.user!.id })
      .in("id", ids);

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }

    setActiveSheetData(null);
    router.refresh();
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        const newSet = new Set(prev);
        newSet.delete(activeSheetData.id);
        return newSet;
      }
      return prev;
    });
    table.resetRowSelection();
  };

  const handleTableCellClick = (row: Row<Transaction>) => {
    setActiveSheetData(row.original);
    setIsSheetOpen(true);
  };

  const sheetActions = {
    upsertRow,
    deleteRows,
  };

  const memoizedColumns = React.useMemo(
    () => columns(loadingRows, sheetActions),
    [loadingRows, sheetActions]
  );

  const table = useReactTable({
    data: data.transaction,
    columns: memoizedColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const sheetContext: SheetContext = {
    categories: Object.fromEntries(
      data.category.map((c) => [c.category, c.id])
    ) as SheetContext["categories"],
    user: data.user!.id,
    table,
  };

  return (
    <div>
      <div className="grid grid-cols-[7fr_1fr_1fr] items-center py-4 gap-4">
        <Input
          placeholder="Filter Transactions..."
          value={(table.getColumn("transaction")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("transaction")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
        {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
          <DeleteButton
            sheetContext={sheetContext}
            sheetActions={sheetActions}
          />
        ) : (
          <AddButton sheetContext={sheetContext} sheetActions={sheetActions} />
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={() => handleTableCellClick(row)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={memoizedColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
      <TableSheet
        isNewSheet={false}
        sheetOpen={isSheetOpen}
        setSheetOpen={setIsSheetOpen}
        activeSheetData={activeSheetData}
        setActiveSheetData={setActiveSheetData}
        sheetContext={sheetContext}
        sheetActions={sheetActions}
      />
    </div>
  );
}
