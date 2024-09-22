// src/components/Dialog/useDialog.tsx
import { useContext, useEffect, useState } from "react";
import { v4 as uuidV4 } from "uuid";
import {
  dialogContext,
  dialogStateContext,
} from "@/components/Dialog/DialogProvider";
import {
  GenericDialog,
  GenericDialogParams,
} from "@/components/Dialog/GeneralDialog";

export function useDialog() {
  const [uuid] = useState(uuidV4());
  const { createDialog, removeDialog } = useContext(dialogContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

  const open = (props: GenericDialogParams) => {
    setIsOpen(true);
    createDialog(uuid, {
      Component: GenericDialog,
      props,
      isOpenInternal: true,
      setIsOpen,
      isCollapsibleOpenInternal: false,
      setIsCollapsibleOpen,
    });
  };

  const openAsPromise = async (props: GenericDialogParams) => {
    setIsOpen(true);
    return new Promise((resolve, reject) => {
      createDialog(uuid, {
        Component: GenericDialog,
        props,
        resolve,
        reject,
        isOpenInternal: true,
        setIsOpen,
        isCollapsibleOpenInternal: false,
        setIsCollapsibleOpen,
      });
    });
  };

  useEffect(() => {
    return () => {
      removeDialog(uuid);
    };
  }, []);

  return { open, openAsPromise, isOpen, isCollapsibleOpen };
}

export function useDialogState() {
  return useContext(dialogStateContext);
}
