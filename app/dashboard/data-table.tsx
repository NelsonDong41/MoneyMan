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
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps<TData extends {}, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData extends {}, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
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
  const [sheetOpen, setSheetOpen] = React.useState<Row<TData> | null>(null);

  const table = useReactTable({
    data,
    columns,
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

  const handleTableCellClick = (row: Row<TData>) => {
    setSheetOpen(row);
  }

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter Receipt..."
          value={(table.getColumn("receipt")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("receipt")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DataTableViewOptions table={table} />
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
                    <TableCell key={cell.id} onClick={() => handleTableCellClick(row)}>
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
                  colSpan={columns.length}
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
      <Sheet open={!!sheetOpen} onOpenChange={() => setSheetOpen(null)}>
        <SheetContent side="right" className="flex flex-col">
          {!!sheetOpen && <>
            <SheetHeader className="gap-1">
              <SheetTitle>{sheetOpen.id}</SheetTitle>
              <SheetDescription>
                Showing total visitors for the last 6 months
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
              {/* <form className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <Label htmlFor="header">Header</Label>
                  <Input id="header" defaultValue={sheetOpen.id} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="type">Type</Label>
                    <Select defaultValue={sheetOpen.}>
                      <SelectTrigger id="type" className="w-full">
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Table of Contents">
                          Table of Contents
                        </SelectItem>
                        <SelectItem value="Executive Summary">
                          Executive Summary
                        </SelectItem>
                        <SelectItem value="Technical Approach">
                          Technical Approach
                        </SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Capabilities">Capabilities</SelectItem>
                        <SelectItem value="Focus Documents">
                          Focus Documents
                        </SelectItem>
                        <SelectItem value="Narrative">Narrative</SelectItem>
                        <SelectItem value="Cover Page">Cover Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="status">Status</Label>
                    <Select defaultValue={item.status}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="target">Target</Label>
                    <Input id="target" defaultValue={item.target} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Label htmlFor="limit">Limit</Label>
                    <Input id="limit" defaultValue={item.limit} />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <Label htmlFor="reviewer">Reviewer</Label>
                  <Select defaultValue={item.reviewer}>
                    <SelectTrigger id="reviewer" className="w-full">
                      <SelectValue placeholder="Select a reviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                      <SelectItem value="Jamik Tashpulatov">
                        Jamik Tashpulatov
                      </SelectItem>
                      <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </form> */}
            </div>
            <SheetFooter className="mt-auto flex gap-2 sm:flex-col sm:space-x-0">
              <Button className="w-full">Submit</Button>
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  Done
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
          }
        </SheetContent>
      </Sheet>
    </div>
  );
}
