// src/components/Dialog/GeneralDialog.tsx
import { useDialogState } from "@/components/Dialog/useDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type GenericDialogParams = {};

export function GenericDialog({}: GenericDialogParams) {
  const {
    close,
    isOpenInternal,
    isCollapsibleOpenInternal,
    toggleCollapsible,
  } = useDialogState();

  return (
    <Dialog open={isOpenInternal} modal={false}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            <Button onClick={close}>x</Button>
            <Collapsible
              open={isCollapsibleOpenInternal}
              onOpenChange={toggleCollapsible}
              className="w-[350px] space-y-2"
            >
              <CollapsibleTrigger>
                Can I use this in my project?
              </CollapsibleTrigger>
              <CollapsibleContent>
                Yes. Free to use for personal and commercial projects. No
                attribution required.
              </CollapsibleContent>
            </Collapsible>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
