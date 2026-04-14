import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { cn } from "./utils";
import { Button, buttonVariants } from "./button";

function Pagination({ className, ...props }: React.ComponentProps) {
  return (
    
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
  );
}

function PaginationItem({ ...props }: React.ComponentProps) {
  return ;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick, "size"> &
  React.ComponentProps;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  return (
    
  );
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
      
      Previous
    
  );
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
      Next
      
    
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps) {
  return (
    
      
      More pages
    
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};




