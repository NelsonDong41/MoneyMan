import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useRef } from "react";

type DeleteAlertProps = {
  action: any;
  open?: boolean;
  onOpenChange?: Dispatch<SetStateAction<boolean>>;
  showTrigger: boolean;
  additionalMessage?: string;
};

export default function DeleteAlert({
  action,
  open,
  showTrigger,
  onOpenChange,
  additionalMessage,
}: DeleteAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <AlertDialogTrigger asChild>
          <Button variant={"destructive"} className="w-full">
            Delete
          </Button>
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this data
            from the servers.
          </AlertDialogDescription>
          <AlertDialogDescription>{additionalMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              action();
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
