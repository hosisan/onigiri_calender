"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

const BottomSheet = DialogPrimitive.Root;

const BottomSheetTrigger = DialogPrimitive.Trigger;

const BottomSheetPortal = ({
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props} />
);
BottomSheetPortal.displayName = "BottomSheetPortal";

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = "BottomSheetOverlay";

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <BottomSheetPortal>
    <BottomSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        // モバイル: フルスクリーンボトムシート
        "fixed inset-x-0 bottom-0 z-50 flex flex-col",
        "h-[100svh] w-full",
        "border-t bg-card shadow-lg",
        "data-[state=open]:[animation:slide-up_0.3s_ease-out] data-[state=closed]:[animation:slide-down_0.2s_ease-in]",
        // デスクトップ: 中央モーダル
        "sm:inset-auto sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%]",
        "sm:h-auto sm:max-w-lg sm:max-h-[85vh] sm:rounded-lg sm:border",
        "sm:data-[state=open]:[animation:none] sm:data-[state=closed]:[animation:none]",
        "sm:data-[state=open]:animate-in sm:data-[state=closed]:animate-out",
        "sm:data-[state=closed]:fade-out-0 sm:data-[state=open]:fade-in-0",
        "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    >
      {/* ドラッグハンドル（装飾的、モバイルのみ） */}
      <div className="mx-auto mt-3 mb-1 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30 sm:hidden" />
      {children}
    </DialogPrimitive.Content>
  </BottomSheetPortal>
));
BottomSheetContent.displayName = "BottomSheetContent";

const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
BottomSheetTitle.displayName = "BottomSheetTitle";

const BottomSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
BottomSheetDescription.displayName = "BottomSheetDescription";

export {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetContent,
  BottomSheetTitle,
  BottomSheetDescription,
};
