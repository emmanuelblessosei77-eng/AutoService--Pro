"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Sheet({ ...props }: React.ComponentProps) {
  return ;
}

function SheetTrigger({
  ...props
}: React.ComponentProps) {
  return ;
}

function SheetClose({
  ...props
}: React.ComponentProps) {
  return ;
}

function SheetPortal({
  ...props
}: React.ComponentProps) {
  return ;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    
      
      
        {children}
        
          
          Close
        
      
    
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps) {
  return (
    
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps) {
  return (
    
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};




