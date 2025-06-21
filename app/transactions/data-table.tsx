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
import { TableData, TransactionWithCategory } from "./page";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DeleteButton from "./deleteButton";
import { Database } from "@/utils/supabase/types";
import { FormTransaction } from "@/utils/schemas/transactionFormSchema";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

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
  const [tableData, setTableData] = React.useState<TransactionWithCategory[]>(data.transaction);
  const [loadingRows, setLoadingRows] = React.useState<Set<number>>(new Set());
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
  const [activeSheetData, setActiveSheetData] =
    React.useState<TransactionWithCategory | null>(null);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const upsertRow = async (values: FormTransaction) => {
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        return new Set(prev).add(activeSheetData.id);
      }
      return prev;
    });

    const transactionInsert: TransactionInsert = {
      ...values,
      id: values.id || undefined,
      date: new Date(values.date).toISOString(),
      userId: data.user.id,
      updated_at: new Date().toISOString(),
      amount: parseFloat(values.amount.replace(",", "")),
      subtotal: values.subtotal ? parseFloat(values.subtotal.replace(",", "")) : undefined,
      tip: values.tip ? parseFloat(values.tip.replace(",", "")) : undefined,
      tax: values.tax ? parseFloat(values.tax.replace(",", "")) : undefined,
    };

    const { data: insertedData, error } = await createClient()
      .from("Transaction")
      .upsert(transactionInsert)
      .select();

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }
    setActiveSheetData(null);
    setIsSheetOpen(false);
    setTableData((prev) => {
      const insertedDataWithNestedCategory = { ...insertedData[0], category: { category: insertedData[0].category } };
      if (values.id) {
        return prev.map((transaction) =>
          transaction.id === values.id ? insertedDataWithNestedCategory : transaction
        );
      }
      return [...prev, insertedDataWithNestedCategory];
    });
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        const newSet = new Set(prev);
        newSet.delete(activeSheetData.id);
        return newSet;
      }
      return prev;
    });
  };

  const deleteRows = async (ids: number[]) => {
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        return new Set(prev).add(activeSheetData.id);
      }
      return prev;
    });
    const { error } = await createClient()
      .from("Transaction")
      .delete()
      .match({ userId: data.user.id })
      .in("id", ids);

    if (error) {
      console.error("Error upserting transaction:", error);
      return null;
    }

    setActiveSheetData(null);
    setTableData((prev) => prev.filter(
      (transaction) => !ids.includes(transaction.id)
    ));
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

  const handleTableCellClick = (row: Row<TransactionWithCategory>) => {
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
        isNewSheet={!activeSheetData}
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
