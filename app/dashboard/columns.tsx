"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Loader2, MoreHorizontal } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/ui/table";
import { Receipt } from "@/utils/supabase/supabase";
import { SheetAction } from "./data-table";
import DeleteAlert from "./deleteAlert";
import { useState } from "react";

export const columns = (
  loadingRows: Set<string>,
  sheetActions: SheetAction
): ColumnDef<Receipt>[] => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => {
        const isLoading = loadingRows.has(row.id);
        return (
          <div className="flex items-center justify-center w-fit h-fit">
            {isLoading ? (
              <Loader2 className="animate-spin w-4 h-4 text-muted-foreground" />
            ) : (
              <Checkbox
                className="w-4 h-4 text-muted-foreground"
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                onClick={(e) => e.stopPropagation()}
                aria-label="Select row"
              />
            )}
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
    },
    {
      accessorKey: "receipt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Receipt" />
      ),
    },
    {
      accessorKey: "merchant",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Merchant" />
      ),
    },
    {
      id: "category",
      accessorKey: "category.category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
    },
    {
      accessorKey: "subtotal",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Subtotal"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("subtotal"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "tax",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Tax"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("tax"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "tip",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Tip"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("tip"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Total"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total"));
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const receipt = row.original;
        const [deleteOpen, setDeleteOpen] = useState(false);

        return (
          <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    navigator.clipboard.writeText(JSON.stringify(receipt))
                  }
                >
                  Copy Receipt info
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View Receipt Image</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteOpen((prev) => !prev)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DeleteAlert
              showTrigger={false}
              onOpenChange={setDeleteOpen}
              open={deleteOpen}
              action={() => sheetActions.deleteRows([receipt.id], receipt.user_id)}
            />
          </div>
        );
      },
    },
  ];
