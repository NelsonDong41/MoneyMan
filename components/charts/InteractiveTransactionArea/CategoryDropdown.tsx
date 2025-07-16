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
    activeGraphType && categoryMap[activeGraphType]
      ? Object.values(categoryMap[activeGraphType]).flat()
      : [];

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

  const toggleParent = (categoryList: string[], allSelected: boolean) => {
    const prevCategories = activeGraphFilters.categories;
    let newCategories: string[];
    if (allSelected) {
      newCategories = prevCategories.filter(
        (cat) => !categoryList.includes(cat)
      );
    } else {
      const toAdd = categoryList.filter((cat) => !prevCategories.includes(cat));
      newCategories = [...prevCategories, ...toAdd];
    }
    setActiveGraphFilterCategories(newCategories);
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
            Object.entries(categoryMap[activeGraphType]).map(
              ([parent, categoryList]) => {
                const parentAllSelected = categoryList.every((cat) =>
                  activeGraphFilters.categories.includes(cat)
                );
                const parentSomeSelected =
                  !parentAllSelected &&
                  categoryList.some((cat) =>
                    activeGraphFilters.categories.includes(cat)
                  );
                return (
                  <div key={parent + "-List"}>
                    <DropdownMenuCheckboxItem
                      checked={parentAllSelected}
                      className={cn(
                        parentSomeSelected
                          ? "data-[state=checked]:bg-muted"
                          : "",
                        "cursor-pointer"
                      )}
                      onSelect={(e) => {
                        e.preventDefault();
                        toggleParent(categoryList, parentAllSelected);
                      }}
                    >
                      <span className="font-semibold capitalize">{parent}</span>
                    </DropdownMenuCheckboxItem>
                    {categoryList.map((category) => {
                      const isSelected =
                        activeGraphFilters.categories.includes(category);
                      return (
                        <DropdownMenuCheckboxItem
                          key={category}
                          className="capitalize cursor-pointer"
                          checked={isSelected}
                          onSelect={(e) => {
                            e.preventDefault();
                            toggleCategory(category);
                          }}
                        >
                          <span className="pl-4">{category}</span>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </div>
                );
              }
            )
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
