import * as React from "react";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";
import { CategoryMap, useCategoryMap } from "@/context/CategoryMapContext";
import {
  ChartOptions,
  chartOptionToType,
} from "./InteractiveTransactionAreaChart";
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

type CategoryDropdownProps = {
  activeGraph: ChartOptions;
  setActiveGraph: React.Dispatch<React.SetStateAction<ChartOptions>>;
};

export function CategoryDropdown({
  activeGraph,
  setActiveGraph,
}: CategoryDropdownProps) {
  const { categoryMap } = useCategoryMap();
  const activeGraphType = chartOptionToType(activeGraph.type);

  const allCategories =
    activeGraphType && categoryMap[activeGraphType]
      ? Object.values(categoryMap[activeGraphType]).flat()
      : [];

  const allSelected =
    allCategories.length > 0 &&
    allCategories.every((cat) => activeGraph.categories.includes(cat));
  const someSelected =
    !allSelected &&
    allCategories.some((cat) => activeGraph.categories.includes(cat));

  const toggleCategory = (category: string) => {
    setActiveGraph((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const toggleParent = (categoryList: string[], allSelected: boolean) => {
    setActiveGraph((prev) => {
      let newCategories: string[];
      if (allSelected) {
        newCategories = prev.categories.filter(
          (cat) => !categoryList.includes(cat)
        );
      } else {
        const toAdd = categoryList.filter(
          (cat) => !prev.categories.includes(cat)
        );
        newCategories = [...prev.categories, ...toAdd];
      }
      return { ...prev, categories: newCategories };
    });
  };

  const toggleAll = () => {
    setActiveGraph((prev) => ({
      ...prev,
      categories: allSelected ? [] : allCategories,
    }));
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
                  activeGraph.categories.includes(cat)
                );
                const parentSomeSelected =
                  !parentAllSelected &&
                  categoryList.some((cat) =>
                    activeGraph.categories.includes(cat)
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
                        activeGraph.categories.includes(category);
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
