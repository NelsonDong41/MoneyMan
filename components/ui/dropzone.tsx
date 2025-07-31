import { FormTransaction } from "@/utils/schemas/transactionFormSchema";
import { Plus } from "lucide-react";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ControllerRenderProps } from "react-hook-form";

function DropzoneComponent({
  value,
  onChange,
  ...props
}: ControllerRenderProps<FormTransaction, "images">) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onChange(value ? acceptedFiles.concat(value) : acceptedFiles);
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
