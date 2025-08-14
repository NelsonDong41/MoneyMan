import * as React from "react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { useCategoryMap } from "@/context/CategoryMapContext";
import { chartOptionToType } from "./InteractiveTransactionAreaChart";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { cn } from "@/lib/utils";
import ClickSpark from "../../ui/clickSpark";
import { useTransactions } from "@/context/TransactionsContext";

export function CategoryDropdown() {
  const { categoryMap } = useCategoryMap();
  const { activeGraphFilters, setActiveGraphFilterCategories } =
    useTransactions();
  const activeGraphType = chartOptionToType(activeGraphFilters.type);

  const allCategories =
    (activeGraphType && categoryMap.get(activeGraphType)) || [];

  const allSelected =
    allCategories.length > 0 &&
    allCategories.every((cat) => activeGraphFilters.categories.includes(cat));
  const someSelected =
    !allSelected &&
    allCategories.some((cat) => activeGraphFilters.categories.includes(cat));

  const toggleCategory = (category: string) => {
    const prevCategories = activeGraphFilters.categories;
    const newCateories = prevCategories.includes(category)
      ? prevCategories.filter((c) => c !== category)
      : [...prevCategories, category];
    setActiveGraphFilterCategories(newCateories);
  };
  const toggleAll = () => {
    setActiveGraphFilterCategories(allSelected ? [] : allCategories);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 lg:flex ">
          <Settings2 />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        <DropdownMenuLabel>Toggle categories</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ClickSpark>
          {allCategories.length > 0 && (
            <DropdownMenuCheckboxItem
              checked={allSelected}
              className={cn(
                someSelected ? "data-[state=checked]:bg-muted" : "",
                "cursor-pointer"
              )}
              onSelect={(e) => {
                e.preventDefault();
                toggleAll();
              }}
            >
              <span className="font-semibold">Select All</span>
            </DropdownMenuCheckboxItem>
          )}
          <DropdownMenuSeparator />
          {activeGraphType && allCategories.length ? (
            allCategories.map((category) => {
              const isSelected =
                activeGraphFilters.categories.includes(category);
              return (
                <div key={category + "-List"}>
                  <DropdownMenuCheckboxItem
                    key={category}
                    className="capitalize cursor-pointer"
                    checked={isSelected}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleCategory(category);
                    }}
                  >
                    <span className="py-1">{category}</span>
                  </DropdownMenuCheckboxItem>
                </div>
              );
            })
          ) : (
            <div className="text-muted-foreground px-2 py-1">
              No categories available
            </div>
          )}{" "}
        </ClickSpark>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
