"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCategoryMap } from "@/context/CategoryMapContext";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import CategorySpendLimitSlider from "@/components/charts/PieChart/CategorySpendLimitSlider/CategorySpendLimitSlider";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function SpendingLimitPopover() {
  const { categoryMap } = useCategoryMap();
  const types = Array.from(categoryMap.keys());

  const [searchValue, setSearchValue] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Spending Limits</Button>
      </DialogTrigger>
      <DialogContent className="max-w-full sm:max-w-[50vw] w-full max-h-full sm:max-h-[70vh] flex flex-col p-6">
        <div className="sticky top-0 z-10 flex justify-between pr-10">
          <div>
            <DialogTitle>Spending Limits</DialogTitle>
            <DialogDescription>
              Update the spending limits for categories
            </DialogDescription>
          </div>
          <Input
            type="search"
            placeholder="Search for category..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="max-w-64"
          ></Input>
        </div>
        <Tabs
          defaultValue={types[0]}
          className="w-full h-full overflow-y-scroll overflow-x-hidden"
        >
          <div className="sticky w-full py-3 -top-1 bg-background z-10 border-b">
            <TabsList>
              {types.map((type) => {
                return (
                  <TabsTrigger key={`${type}-tab-trigger`} value={type}>
                    {type}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
          {types.map((type) => (
            <TabsContent key={`${type}-tab`} value={type}>
              <div className="pt-5 flex flex-col gap-8 h-full ">
                {categoryMap
                  .get(type)
                  ?.filter((category) =>
                    category
                      .toLowerCase()
                      .includes(searchValue.trim().toLowerCase())
                  )
                  .sort()
                  .map((category) => (
                    <div key={`${category}-slider`} className="border-b ">
                      <CategorySpendLimitSlider category={category} />
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
