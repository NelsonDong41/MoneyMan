import {
  ACCEPTED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "@/utils/schemas/imagesFormSchema";
import { TableSheetForm } from "@/utils/schemas/tableSheetFormSchema";
import { Plus } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ControllerRenderProps } from "react-hook-form";
import { toast } from "sonner";

function DropzoneComponent({
  value,
  onChange,
  ...props
}: ControllerRenderProps<TableSheetForm, "imagesToAdd">) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const filteredAcceptedFiles = acceptedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast.warning(`${file.name} is too large to upload ${file.size}`);
          return false;
        }
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
          toast.warning(`${file.name} is not the right format ${file.type}`);
          return false;
        }
        return true;
      });
      onChange(
        value ? filteredAcceptedFiles.concat(value) : filteredAcceptedFiles
      );
    },
    [value]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      {...props}
      className="h-52 w-44 border-4 border-dotted border-primary-foreground rounded-xl flex items-center p-5 hover:bg-muted-foreground hover:text-primary-foreground"
    >
      <input {...getInputProps()} />
      <div className="flex flex-col justify-center items-center text-center gap-4">
        <Plus />
        <div className="">Drag and drop your images here.</div>
      </div>
    </div>
  );
}

export default DropzoneComponent;
