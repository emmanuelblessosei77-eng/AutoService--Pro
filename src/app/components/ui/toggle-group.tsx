"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext
>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps &
  VariantProps) {
  return (
    
      
        {children}
      
    
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps &
  VariantProps) {
  const context = React.useContext(ToggleGroupContext);

  return (
    
      {children}
    
  );
}

export { ToggleGroup, ToggleGroupItem };




