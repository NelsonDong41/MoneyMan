import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SheetAction } from "./data-table";
import { useEffect, useMemo, useState } from "react";
import CurrencyInput from "@/components/ui/currencyInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import DeleteAlert from "./deleteAlert";
import { transactionFormSchema } from "@/utils/schemas/transactionFormSchema";
import { Title } from "@radix-ui/react-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  STATUS_OPTIONS,
  TransactionWithCategory,
  TYPE_OPTIONS,
} from "@/utils/supabase/supabase";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@radix-ui/react-popover";
import { ChevronsUpDown, Check, ChevronsRight } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { NaturalLanguageCalendar } from "@/components/ui/naturalLanguageCalendar";
import { useCategoryMap } from "@/context/CategoryMapContext";
import DropzoneComponent from "../ui/dropzone";
import { Label } from "../ui/label";
import ImageGallery from "../ui/ImageGallery";
import { useUser } from "@/context/UserContext";
import { buildSupabaseFolderPath } from "@/utils/utils";
import {
  TableSheetForm,
  tableSheetFormSchema,
} from "@/utils/schemas/tableSheetFormSchema";
import {
  FileObject,
  ImagesErrorResponse,
  ImagesGetResponse,
} from "@/app/api/images/[transactionId]/route";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

type TableSheetProps = {
  isNewSheet: boolean;
  sheetOpen: boolean;
  setSheetOpen: (value: React.SetStateAction<boolean>) => void;
  activeSheetData: Partial<TransactionWithCategory> | null;
  setActiveSheetData: (
    value: React.SetStateAction<Partial<TransactionWithCategory> | null>
  ) => void;
  sheetActions: SheetAction;
};

const defaultFormValues: TableSheetForm = {
  amount: "0.00",
  category: "",
  date: "",
  description: "",
  merchant: "",
  notes: "",
  status: "Complete",
  type: "Expense",
  imagesToAdd: [],
  imagesToDelete: [],
};

export default function TableSheet({
  isNewSheet,
  sheetOpen,
  setSheetOpen,
  activeSheetData,
  setActiveSheetData,
  sheetActions,
}: TableSheetProps) {
  const { user } = useUser();

  if (!user) {
    throw new Error("User Should Exist when using Table Sheet");
  }

  const form = useForm<TableSheetForm>({
    resolver: zodResolver(tableSheetFormSchema),
    defaultValues: defaultFormValues,
  });

  const { reset } = form;
  const formClientImages = form.watch("imagesToAdd");
  const formServerImagesToDelete = form.watch("imagesToDelete");

  const { categoryMap } = useCategoryMap();
  const isMobile = useIsMobile();
  const { loading, allImages, setClientImages, setServerImages } =
    useTransactionImages(activeSheetData?.id, formClientImages);

  useEffect(() => {
    if (!sheetOpen) return;

    if (activeSheetData) {
      reset({
        ...activeSheetData,
        id: activeSheetData.id,
        category: activeSheetData.category?.name,
        date: activeSheetData.date,
        amount: activeSheetData.amount?.toFixed(2),
        subtotal: activeSheetData.subtotal?.toFixed(2),
        tax: activeSheetData.tax?.toFixed(2),
        tip: activeSheetData.tip?.toFixed(2),
        notes: activeSheetData.notes,
      });
      return;
    }
    reset(defaultFormValues);
  }, [sheetOpen, activeSheetData, reset]);

  const handleDeleteImage = async (image: AnyImage) => {
    if (!activeSheetData || !activeSheetData.id) {
      toast.error(
        `Attempting to delete image when transaction is not being updated `,
        { description: `Image Name: ${image.name}` }
      );
      return;
    }

    const { isServer } = image;
    if (isServer) {
      form.setValue(
        "imagesToDelete",
        [image.name].concat(formServerImagesToDelete ?? [])
      );
      setServerImages((prev) =>
        prev.filter((saveImage) => saveImage !== image)
      );
      return;
    }

    setClientImages((prev) => prev.filter((saveImage) => saveImage !== image));
  };

  return (
    <Sheet
      open={sheetOpen}
      onOpenChange={() => {
        setActiveSheetData(null);
        setSheetOpen(false);
      }}
    >
      <SheetContent
        side={isMobile ? "full" : "right"}
        className="flex flex-col"
      >
        <SheetHeader className="gap-1">
          <SheetTitle>Editor</SheetTitle>
          <SheetDescription>Edit Transaction values</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto py-4 text-sm">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(sheetActions.upsertRow)}
              className="flex flex-col gap-4 p-1"
            >
              <FormField
                control={form.control}
                name="id"
                render={() => <></>}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input id="description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="merchant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant</FormLabel>
                    <FormControl>
                      <Input id="merchant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-5">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => {
                    const [open, setOpen] = useState(false);
                    return (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel>Status</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? STATUS_OPTIONS.find(
                                      (status) => status === field.value
                                    )
                                  : "Select status"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 z-50 border border-accent rounded-lg">
                            <Command>
                              <CommandInput
                                placeholder="Search status..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No status found.</CommandEmpty>
                                <CommandGroup>
                                  {STATUS_OPTIONS.map((status) => (
                                    <CommandItem
                                      value={status}
                                      key={status}
                                      onSelect={() => {
                                        form.setValue("status", status);
                                        setOpen(false);
                                      }}
                                    >
                                      {status}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          status === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => {
                    const [open, setOpen] = useState(false);
                    return (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel>Type</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? TYPE_OPTIONS.find(
                                      (type) => type === field.value
                                    )
                                  : "Select Type"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 z-50 border border-accent rounded-lg">
                            <Command>
                              <CommandInput
                                placeholder="Search Type..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>No type found.</CommandEmpty>
                                <CommandGroup>
                                  {TYPE_OPTIONS.map((type) => (
                                    <CommandItem
                                      value={type}
                                      key={type}
                                      onSelect={() => {
                                        form.setValue("type", type);
                                        setOpen(false);
                                      }}
                                    >
                                      {type}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          type === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => {
                  const [open, setOpen] = useState(false);
                  return (
                    <FormItem className="flex flex-col w-full">
                      <FormLabel>Category</FormLabel>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                              onClick={() => setOpen((prev) => !prev)}
                            >
                              {field.value || "Select category"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0 z-50 border border-accent rounded-lg">
                          <Command>
                            <CommandInput
                              placeholder="Search category..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No category found.</CommandEmpty>
                              <CommandGroup>
                                {categoryMap[form.getValues("type")].map(
                                  (category, i) => (
                                    <CommandItem
                                      value={`${category}-select`}
                                      key={category}
                                      onSelect={() => {
                                        form.setValue("category", category);
                                        setOpen(false);
                                      }}
                                      className={i === 0 ? "font-bold" : ""}
                                    >
                                      {i !== 0 && <span className="px-1.5" />}
                                      {category}
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          category === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  )
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="date">Date</FormLabel>
                    <FormControl>
                      <NaturalLanguageCalendar {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 border-10 border-red-100">
                <Title>Pay</Title>
                <FormField
                  control={form.control}
                  name="subtotal"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-3 items-center">
                        <FormLabel htmlFor="subtotal">subtotal</FormLabel>
                        <FormControl>
                          <CurrencyInput id="subtotal" {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="grid grid-cols-3 items-center">
                          <FormLabel htmlFor="tax">tax</FormLabel>
                          <CurrencyInput id="tax" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tip"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-3 items-center">
                        <FormLabel htmlFor="tip">tip</FormLabel>
                        <CurrencyInput id="tip" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-3 items-center">
                        <FormLabel htmlFor="amount">Amount</FormLabel>
                        <CurrencyInput id="amount" {...field} />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="max-w-full overflow-x-auto flex">
                <div>
                  <Label>Images</Label>
                  <div className="flex flex-nowrap overflow-x-auto space-x-4 p-2 py-5">
                    <FormField
                      control={form.control}
                      name="imagesToAdd"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <DropzoneComponent {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="imagesToDelete"
                      render={() => <></>}
                    />
                    <ImageGallery
                      loading={loading}
                      images={allImages}
                      handleDelete={handleDeleteImage}
                    />
                  </div>
                </div>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes for the transaction"
                          className="resize-y w-full"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>
        <SheetFooter className="mt-auto flex gap-4 sm:flex-col sm:space-x-0">
          {!isNewSheet && (
            <DeleteAlert
              showTrigger={true}
              action={() => {
                if (activeSheetData) {
                  sheetActions.deleteRows(
                    [activeSheetData.id!],
                    activeSheetData.user_id
                  );
                }
              }}
            />
          )}
          <Button
            className="w-full"
            onClick={form.handleSubmit(sheetActions.upsertRow)}
            disabled={!form.formState.isDirty}
          >
            {isNewSheet ? "Create" : "Update"}
          </Button>
          <SheetClose asChild>
            <Button variant="outline" className="w-full">
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export type ClientImage = {
  url: string;
  type: string;
  file: File;
  isServer?: false;
  name: string;
};
export type ServerImage = {
  url: string;
  type: string;
  id: string; // e.g. Supabase file key or database image id
  isServer: true;
  name: string;
};

export type AnyImage = ClientImage | ServerImage;

function useTransactionImages(
  transactionId: number | undefined,
  formClientImages?: File[]
) {
  const { user } = useUser();
  const [serverImages, setServerImages] = useState<ServerImage[]>([]);
  const [clientImages, setClientImages] = useState<ClientImage[]>([]);
  const [allImages, setAllImages] = useState<AnyImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  if (!user) {
    throw new Error("User should exist when using useTransactionImages");
  }

  useEffect(() => {
    let newImages: AnyImage[] = [];
    newImages = newImages.concat(clientImages);
    newImages = newImages.concat(serverImages);

    setAllImages(newImages);
  }, [serverImages, clientImages, setAllImages]);

  //converts the client uploaded Files into ClientImage objects
  useEffect(() => {
    let active = true;

    async function generateClientImages() {
      const urls: ClientImage[] = [];

      if (!formClientImages || formClientImages.length === 0) {
        setClientImages([]);
        return;
      }

      for (const file of formClientImages) {
        const arrayBuffer = await file.arrayBuffer();
        const blob = new Blob([new Uint8Array(arrayBuffer)], {
          type: file.type,
        });
        const url = URL.createObjectURL(blob);
        urls.push({
          url,
          type: file.type,
          file,
          isServer: false,
          name: file.name,
        });
      }

      if (active) {
        setClientImages(urls);
      }
    }

    generateClientImages();

    return () => {
      active = false;
      clientImages.forEach(({ url }) => URL.revokeObjectURL(url));
      setClientImages([]);
    };
  }, [formClientImages]);

  useEffect(() => {
    if (!transactionId) return;
    const getServerImagesForTransaction = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/images/${transactionId}`, {
          method: "GET",
        });

        if (!response.ok) {
          const { error } = (await response.json()) as ImagesErrorResponse;
          console.error("Error updating category spend limit:", error);
          return null;
        }
        const { data } = (await response.json()) as ImagesGetResponse;

        const serverImages = data.map((fileObj) =>
          convertFileObjectToServerImage(fileObj, user, transactionId)
        );
        setServerImages(serverImages);

        setLoading(false);
        return data;
      } catch (err) {
        setLoading(false);
        console.error("Unexpected error:", err);
        return null;
      }
    };

    getServerImagesForTransaction();
  }, [transactionId, user]);

  return {
    loading,
    clientImages,
    serverImages,
    allImages,
    setClientImages,
    setServerImages,
  };
}

export const convertFileObjectToServerImage = (
  fileObj: FileObject,
  user: User,
  transactionId: number
): ServerImage => {
  const supabase = createClient();
  const rootFilePath = buildSupabaseFolderPath(user, transactionId);
  const { data } = supabase.storage
    .from("images")
    .getPublicUrl(`${rootFilePath}/${fileObj.name}`);

  return {
    url: data.publicUrl,
    type: fileObj.metadata["mimetype"],
    id: fileObj.id,
    name: fileObj.name,
    isServer: true,
  };
};
