"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent as OriginalDialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";

interface ScrollableDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  withScroll?: boolean;
  contentPosition?: "center" | "top";
}

const ScrollableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  ScrollableDialogContentProps
>(({ className, withScroll = true, contentPosition = "center", children, ...props }, ref) => {
  const positionClass = contentPosition === "center" 
    ? "fixed z-50 mx-auto inset-x-0 top-[50%] translate-y-[-50%]" 
    : "relative z-50 mx-auto mt-4";
  
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          positionClass,
          "w-full max-w-3xl bg-background shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg md:w-full",
          className
        )}
        style={{
          maxHeight: contentPosition === "center" ? "90vh" : "80vh",
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4" />
          <span className="sr-only">閉じる</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
ScrollableDialogContent.displayName = "ScrollableDialogContent";

const DialogContentHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 pt-6 pb-2", className)}
    {...props}
  />
);
DialogContentHeader.displayName = "DialogContentHeader";

const DialogContentBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 overflow-y-auto", className)}
    style={{
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "auto",
    }}
    {...props}
  />
);
DialogContentBody.displayName = "DialogContentBody";

const DialogContentFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 py-4 mt-auto", className)}
    {...props}
  />
);
DialogContentFooter.displayName = "DialogContentFooter";

export {
  Dialog,
  ScrollableDialogContent,
  DialogContentHeader,
  DialogContentBody,
  DialogContentFooter,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
}; 