"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function Accordion({
  ...props
}: React.ComponentProps) {
  return ;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps) {
  return (
    
      svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        
      
    
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps) {
  return (
    
      {children}
    
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };




