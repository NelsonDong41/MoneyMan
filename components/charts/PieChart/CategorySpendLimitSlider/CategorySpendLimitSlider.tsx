import { Button } from "@/components/ui/button";
import ElasticSlider from "@/components/ui/ElasticSlider/ElasticSlider";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategorySpendLimit } from "@/context/CategorySpendLimitContext";
import {
  CategorySpendLimitForm,
  categorySpendLimitFormSchema,
  TIME_FRAME_OPTIONS,
} from "@/utils/schemas/categorySpendLimitFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

export default function CategorySpendLimitSlider({
  category,
}: {
  category: string;
}) {
  const { categorySpendLimits, updateCategorySpendLimit } =
    useCategorySpendLimit();

  const defaultFormValues: CategorySpendLimitForm = useMemo(
    () =>
      categorySpendLimits[category] ?? {
        category,
        limit: 0.0,
        time_frame: "Monthly",
      },
    [categorySpendLimits, category]
  );

  const form = useForm<CategorySpendLimitForm>({
    resolver: zodResolver(categorySpendLimitFormSchema),
    values: defaultFormValues,
  });

  const [initialFormValue, setInitialFormValue] = useState(form.getValues());

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const updatedSpendLimit = (await updateCategorySpendLimit(
      form.getValues()
    )) as CategorySpendLimitForm;
    setInitialFormValue(updatedSpendLimit);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 p-1 justify-center"
        onSubmit={handleFormSubmit}
      >
        <div className="flex flex-row justify-center items-center gap-5">
          <FormField control={form.control} name="id" render={() => <></>} />
          <FormField
            control={form.control}
            name="time_frame"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-col  w-24">
                  <Select
                    {...field}
                    value={field.value}
                    onValueChange={(e) => field.onChange(e)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Time Frame" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_FRAME_OPTIONS.map((timeFrame) => (
                        <SelectItem
                          key={`${timeFrame}-select`}
                          value={timeFrame}
                        >
                          {timeFrame}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="limit"
            render={({ field }) => {
              return (
                <FormItem>
                  <div className="w-full text-center flex items-center justify-center gap-5">
                    <FormLabel className=" text-1xl">
                      {category} Spending Limit:
                    </FormLabel>
                    <FormControl className="w-24">
                      <Input
                        {...field}
                        value={parseFloat(field.value.toFixed(2))}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value || "0"))
                        }
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button
            disabled={
              JSON.stringify(initialFormValue) ===
              JSON.stringify(form.getValues())
            }
          >
            Submit
          </Button>
        </div>
        <FormField
          control={form.control}
          name="limit"
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <ElasticSlider {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </form>
    </Form>
  );
}
