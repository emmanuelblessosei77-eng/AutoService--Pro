"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "./utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function Tooltip({
  ...props
}: React.ComponentProps) {
  return (
    
      
    
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps) {
  return ;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps) {
  return (
    
      
        {children}
        
      
    
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };




