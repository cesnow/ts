// src/components/Dialog/DialogProvider.tsx
import {
  createContext,
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  useMemo,
  useState,
} from "react";

export const dialogContext = createContext<DialogContext>(null!);
export const dialogStateContext = createContext<DialogState>(null!);

export type DialogContext = {
  dialogs: Record<string, Dialog>;
  createDialog: (uuid: string, data: DialogInput) => void;
  removeDialog: (uuid: string) => void;
  depth: number;
};

export type Dialog<TParams = any> = {
  Component: FC<TParams>;
  props: TParams;
  isOpenInternal: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  close: () => void;
  toggleCollapsible: (value: boolean) => void;
  uuid: string;
  isCollapsibleOpenInternal: boolean;
  setIsCollapsibleOpen: Dispatch<SetStateAction<boolean>>;
  resolve?: (value: any) => void;
  reject?: (value: any) => void;
};

export type DialogInput = Omit<Dialog, "close" | "uuid" | "toggleCollapsible">;

export type DialogState = Omit<Dialog<never>, "props" | "Component"> & {
  depth: number;
};

export function DialogProvider({
  depth = 0,
  children,
}: {
  depth?: number;
  children: ReactNode;
}) {
  const [dialogs, setDialogs] = useState<Record<string, Dialog>>({});

  const value = useMemo(
    () => ({
      depth,
      dialogs,
      createDialog: (uuid: string, data: DialogInput) => {
        setDialogs({
          ...dialogs,
          [uuid]: {
            ...data,
            uuid,
            toggleCollapsible: (collapsibleValue: boolean) => {
              data.setIsCollapsibleOpen(collapsibleValue);
              setDialogs((value) => ({
                ...value,
                [uuid]: {
                  ...value[uuid],
                  isOpenInternal: true,
                  isCollapsibleOpenInternal: collapsibleValue,
                },
              }));
            },
            close: () => {
              data.setIsOpen(false);
              data.setIsCollapsibleOpen(false);
              setDialogs((value) => ({
                ...value,
                [uuid]: {
                  ...value[uuid],
                  isOpenInternal: false,
                  isCollapsibleOpenInternal: false,
                },
              }));
            },
          },
        });
      },
      removeDialog: (uuid: string) => {
        const newDialogs = { ...dialogs };
        delete newDialogs[uuid];
        setDialogs(newDialogs);
      },
    }),
    [dialogs, depth],
  );

  return (
    <dialogContext.Provider value={value}>
      {children}
      {Object.entries(dialogs).map(([uuid, { Component, props, ...rest }]) => {
        return (
          <dialogStateContext.Provider value={{ ...rest, depth }} key={uuid}>
            <Component {...props} />
          </dialogStateContext.Provider>
        );
      })}
    </dialogContext.Provider>
  );
}
