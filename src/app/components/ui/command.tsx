"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";

function Command({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps & {
  title?: string;
  description?: string;
}) {
  return (
    
      
        {title}
        {description}
      
      
        
          {children}
        
      
    
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
      
      
    
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function CommandEmpty({
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};




