"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  CircleArrowDown,
  CircleCheck,
  CircleDashed,
  CircleDollarSign,
  CircleMinus,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
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
import { SheetAction } from "./data-table";
import DeleteAlert from "./deleteAlert";
import { ReactElement, useState } from "react";
import { copyObjectToClipboard } from "@/utils/utils";
import { Badge } from "@/components/ui/badge";
import { TransactionWithCategory } from "@/utils/supabase/supabase";
import { useIsMobile } from "@/hooks/useIsMobile";

export const columns = (
  loadingRows: Set<number>,
  sheetActions: SheetAction
): ColumnDef<TransactionWithCategory>[] => [
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
      const isLoading = loadingRows.has(row.original.id);
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
    cell: ({ row }) => {
      const isMobile = useIsMobile();

      const date = new Date(row.getValue("date"));
      const formatted = new Intl.DateTimeFormat("en-US", {
        year: isMobile ? undefined : "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      }).format(date);

      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="description" />
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
    id: "type",
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = String(row.getValue("type"));
      let cell: ReactElement;
      if (type === "Expense") {
        cell = (
          <Badge variant={"outline"} className="capitalize w-full">
            <CircleArrowDown className="h-4 w-4 mr-1 text-red-500" />
            {type}
          </Badge>
        );
      } else {
        cell = (
          <Badge variant={"outline"} className="capitalize w-full">
            <CircleDollarSign className="h-4 w-4 mr-1 text-green-500" />
            {type}
          </Badge>
        );
      }
      return cell;
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = String(row.getValue("status"));
      let cell: ReactElement;

      if (status === "Pending") {
        cell = (
          <Badge variant={"default"} className="capitalize w-full">
            <CircleDashed className="h-4 w-4 mr-1 " />
            {status}
          </Badge>
        );
      } else if (status === "Complete") {
        cell = (
          <Badge variant={"outline"} className="capitalize w-full">
            <CircleCheck className="h-4 w-4 mr-1 text-green-500" />
            {status}
          </Badge>
        );
      } else {
        cell = (
          <Badge variant={"destructive"} className="capitalize w-full">
            <CircleMinus className="h-4 w-4 mr-1" />
            {status}
          </Badge>
        );
      }

      return cell;
    },
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

      return (
        <div className="text-right font-medium">{amount ? formatted : ""}</div>
      );
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

      <div className="text-right font-medium">{amount ? formatted : ""}</div>;
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

      <div className="text-right font-medium">{amount ? formatted : ""}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title="Amount"
        className="justify-end"
      />
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "notes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="notes" />
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const transaction = row.original;
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
                onClick={() => copyObjectToClipboard(transaction)}
              >
                Copy Transaction info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View Transaction Image</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen((prev) => !prev)}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DeleteAlert
            showTrigger={false}
            onOpenChange={setDeleteOpen}
            open={deleteOpen}
            action={() =>
              sheetActions.deleteRows([transaction.id], transaction.userId)
            }
          />
        </div>
      );
    },
  },
];
