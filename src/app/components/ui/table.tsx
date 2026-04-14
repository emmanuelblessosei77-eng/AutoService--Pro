"use client";

import * as React from "react";

import { cn } from "./utils";

const Table = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      
        
      
    );
  }
);

Table.displayName = "Table";

const TableHeader = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      
    );
  }
);

TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      
    );
  }
);

TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      tr]:last:border-b-0",
          className,
        )}
        {...props}
      />
    );
  }
);

TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      
    );
  }
);

TableRow.displayName = "TableRow";

const TableHead = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      [role=checkbox]]:translate-y-[2px]",
          className,
        )}
        {...props}
      />
    );
  }
);

TableHead.displayName = "TableHead";

const TableCell = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      [role=checkbox]]:translate-y-[2px]",
          className,
        )}
        {...props}
      />
    );
  }
);

TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef>(
  ({ className, ...props }, ref) => {
    return (
      
    );
  }
);

TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};



