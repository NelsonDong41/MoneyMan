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
import { TableData } from "./page";
import DeleteButton from "./deleteButton";
import { Database } from "@/utils/supabase/types";
import { FormTransaction } from "@/utils/schemas/transactionFormSchema";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import useTableStates from "@/hooks/useTableStates";

export type TransactionInsert =
  Database["public"]["Tables"]["Transaction"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["Transaction"]["Update"];

export type SheetContext = {
  categories: { [x in string]: number };
  user: string;
  table: ReactTable<TransactionWithCategory>;
};
export type SheetAction = {
  upsertRow: (values: FormTransaction) => void;
  deleteRows: (ids: number[], user_Id?: string) => void;
};

interface DataTableProps<TValue> {
  columns: (
    loadingRows: Set<number>,
    sheetActions: SheetAction
  ) => ColumnDef<TransactionWithCategory, TValue>[];
  data: TableData;
}

const hiddenColumns = ["subtotal", "tip", "tax"];

export function DataTable<TValue>({ columns, data }: DataTableProps<TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      Object.fromEntries(hiddenColumns.map((key) => [key, false]))
    );
  const [rowSelection, setRowSelection] = React.useState({});

  const {
    tableData,
    loadingRows,
    activeSheetData,
    setActiveSheetData,
    isSheetOpen,
    setIsSheetOpen,
    upsertRow,
    deleteRows,
    handleTableCellClick,
  } = useTableStates(data);

  const sheetActions = {
    upsertRow,
    deleteRows,
  };

  const memoizedColumns = React.useMemo(
    () => columns(loadingRows, sheetActions),
    [loadingRows, sheetActions]
  );

  const table = useReactTable({
    data: tableData,
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
    user: data.user.id,
    table,
  };

  return (
    <div>
      <div className="grid grid-cols-[7fr_1fr_1fr] items-center py-4 gap-4">
        <Input
          placeholder="Filter Transactions..."
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
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
          <Button
            variant="secondary"
            onClick={() => setIsSheetOpen((prev) => !prev)}
            size="sm"
          >
            <PlusCircle />
            Add
          </Button>
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
        sheetContext={sheetContext}
        isNewSheet={!activeSheetData}
        sheetOpen={isSheetOpen}
        setSheetOpen={setIsSheetOpen}
        activeSheetData={activeSheetData}
        setActiveSheetData={setActiveSheetData}
        sheetActions={{ upsertRow, deleteRows }}
      />
    </div>
  );
}
