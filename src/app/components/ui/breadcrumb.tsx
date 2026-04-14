import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "./utils";

function Breadcrumb({ ...props }: React.ComponentProps) {
  return ;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps) {
  return (
    
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps) {
  return (
    
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}: React.ComponentProps & {
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "a";

  return (
    
  );
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps) {
  return (
    
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps) {
  return (
    svg]:size-3.5", className)}
      {...props}
    >
      {children ?? }
    
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
      
      More
    
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};




