"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
import TableSheet, { tableSheetSchema } from "./tableSheet";
import { CategoryEnum, Receipt } from "@/utils/supabase/supabase";
import { TableData } from "./page";
import AddButton from "./addButton";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

interface DataTableProps<TValue> {
  columns: (
    loadingRows: Set<string>,
    sheetContext: SheetContext
  ) => ColumnDef<Receipt, TValue>[];
  data: TableData;
}

export type SheetContext = {
  categories: { [x in CategoryEnum]: number };
  user?: string;
  upsertRow: (values: z.infer<typeof tableSheetSchema>) => void;
  deleteRow: (id: string, user_Id?: string) => void;
};

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
  const [activeSheetData, setActiveSheetData] = React.useState<Receipt | null>(
    null
  );

  const upsertRow = async (values: z.infer<typeof tableSheetSchema>) => {
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        return new Set(prev).add(activeSheetData.id);
      }
      return prev;
    });
    const { data, error } = await createClient().from("Receipt").upsert(values);
    if (error) {
      console.error("Error upserting receipt:", error);
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

  const deleteRow = async (id: string) => {
    setLoadingRows((prev) => {
      if (activeSheetData?.id) {
        return new Set(prev).add(activeSheetData.id);
      }
      return prev;
    });
    const { data: deleteData, error } = await createClient()
      .from("Receipt")
      .delete()
      .match({ id, user_id: data.user?.id });

    if (error) {
      console.error("Error upserting receipt:", error);
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

  const sheetContext: SheetContext = {
    categories: Object.fromEntries(
      data.category.map((c) => [c.category, c.id])
    ) as SheetContext["categories"],
    user: data.user?.id,
    upsertRow,
    deleteRow,
  };

  const handleTableCellClick = (row: Row<Receipt>) => {
    setActiveSheetData(row.original);
  };

  const memoizedColumns = React.useMemo(
    () => columns(loadingRows, sheetContext),
    [loadingRows, sheetContext]
  );

  const table = useReactTable({
    data: data.receipt,
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

  return (
    <div>
      <div className="grid grid-cols-[7fr_1fr_1fr] items-center py-4 gap-4">
        <Input
          placeholder="Filter Receipts..."
          value={(table.getColumn("receipt")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("receipt")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
        <AddButton sheetContext={sheetContext} />
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
        activeSheetData={activeSheetData}
        setActiveSheetData={setActiveSheetData}
        sheetContext={sheetContext}
      />
    </div>
  );
}
