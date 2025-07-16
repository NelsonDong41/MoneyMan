"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
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
import DeleteButton from "./deleteButton";
import { Database } from "@/utils/supabase/types";
import { FormTransaction } from "@/utils/schemas/transactionFormSchema";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import {
  ColumnKeys,
  TransactionWithCategory,
  Type,
} from "@/utils/supabase/supabase";
import useTableStates from "@/hooks/useTableStates";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useTransactions } from "@/context/TransactionsContext";

export type TransactionInsert =
  Database["public"]["Tables"]["transaction"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transaction"]["Update"];

export type SheetAction = {
  upsertRow: (values: FormTransaction) => void;
  deleteRows: (ids: number[], user_Id?: string) => void;
};

interface DataTableProps<TValue> {
  columns: (
    loadingRows: Set<number>,
    sheetActions: SheetAction,
    isMobile: boolean
  ) => ColumnDef<TransactionWithCategory, TValue>[];
  transactionFilters?: { date?: string; type?: Type };
}

const defaultHiddenColumns: ColumnKeys[] = ["subtotal", "tip", "tax"];
const mobileHiddenColumns: ColumnKeys[] = defaultHiddenColumns.concat([
  "category",
  "created_at",
  "merchant",
  "status",
  "notes",
]);
const defaultColumnOrder = [
  "select",
  "date",
  "description",
  "subtotal",
  "tax",
  "tip",
  "amount",
  "type",
  "merchant",
  "category",
  "status",
  "notes",
];

export function DataTable<TValue>({
  columns,
  transactionFilters,
}: DataTableProps<TValue>) {
  const { displayedTransactions } = useTransactions();
  const isMobile = useIsMobile();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(
      Object.fromEntries(defaultHiddenColumns.map((key) => [key, false]))
    );
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnOrder, setColumnOrder] =
    React.useState<string[]>(defaultColumnOrder);

  const filteredTransactions = React.useMemo(() => {
    return displayedTransactions.filter((t) => {
      if (!transactionFilters) return true;
      const typeFilter =
        !transactionFilters.type || transactionFilters.type === t.type;
      const dateFilter =
        !transactionFilters.date || transactionFilters.date === t.date;
      return typeFilter && dateFilter;
    });
  }, [displayedTransactions, transactionFilters]);

  React.useEffect(() => {
    const hiddenColumns = isMobile ? mobileHiddenColumns : defaultHiddenColumns;

    setColumnVisibility(
      Object.fromEntries(hiddenColumns.map((key) => [key, false]))
    );
  }, [isMobile]);

  const {
    loadingRows,
    activeSheetData,
    setActiveSheetData,
    isSheetOpen,
    setIsSheetOpen,
    upsertRow,
    deleteRows,
    handleTableCellClick,
  } = useTableStates();

  const sheetActions = React.useMemo(
    () => ({ upsertRow, deleteRows }),
    [upsertRow, deleteRows]
  );

  const memoizedColumns = React.useMemo(
    () => columns(loadingRows, sheetActions, isMobile),
    [loadingRows, sheetActions, isMobile]
  );

  const table = useReactTable({
    data: filteredTransactions,
    columns: memoizedColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnOrder,
    },
  });

  return (
    <div className="p-1 overflow-x-auto">
      <div className="flex justify-between items-center py-4 gap-4">
        <Input
          placeholder="Filter Transactions..."
          value={
            (table.getColumn("description")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("description")?.setFilterValue(event.target.value)
          }
          className="max-w-sm rounded-lg"
        />
        <div className="flex gap-4">
          <DataTableViewOptions table={table} />
          {table.getIsSomeRowsSelected() || table.getIsAllRowsSelected() ? (
            <DeleteButton table={table} sheetActions={sheetActions} />
          ) : (
            <Button
              variant="secondary"
              onClick={() => {
                if (transactionFilters) setActiveSheetData(transactionFilters);
                setIsSheetOpen((prev) => !prev);
              }}
              size="sm"
            >
              <PlusCircle />
              Add
            </Button>
          )}
        </div>
      </div>
      <div className="rounded-md border bg-popover/80 backdrop-blur-3xl border-white/25 shadow-lg overflow-x-auto w-full h-full">
        <Table>
          <TableHeader className="hidden sm:table-header-group">
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
                      className="py-3"
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
        isNewSheet={!activeSheetData?.id}
        sheetOpen={isSheetOpen}
        setSheetOpen={setIsSheetOpen}
        activeSheetData={activeSheetData}
        setActiveSheetData={setActiveSheetData}
        sheetActions={sheetActions}
      />
    </div>
  );
}
