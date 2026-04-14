import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps & {
  viewport?: boolean;
}) {
  return (
    
      {children}
      {viewport && }
    
  );
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1",
);

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ComponentProps) {
  return (
    
      {children}{" "}
      
    
  );
}

function NavigationMenuContent({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function NavigationMenuViewport({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
      
    
  );
}

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
      
    
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};




