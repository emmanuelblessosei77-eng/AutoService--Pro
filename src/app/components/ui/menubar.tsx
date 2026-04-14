"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";

import { cn } from "./utils";

function Menubar({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function MenubarMenu({
  ...props
}: React.ComponentProps) {
  return ;
}

function MenubarGroup({
  ...props
}: React.ComponentProps) {
  return ;
}

function MenubarPortal({
  ...props
}: React.ComponentProps) {
  return ;
}

function MenubarRadioGroup({
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function MenubarTrigger({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}: React.ComponentProps) {
  return (
    
      
    
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps) {
  return (
    
      
        
          
        
      
      {children}
    
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps) {
  return (
    
      
        
          
        
      
      {children}
    
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}: React.ComponentProps & {
  inset?: boolean;
}) {
  return (
    
  );
}

function MenubarSeparator({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function MenubarShortcut({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function MenubarSub({
  ...props
}: React.ComponentProps) {
  return ;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps & {
  inset?: boolean;
}) {
  return (
    
      {children}
      
    
  );
}

function MenubarSubContent({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};




