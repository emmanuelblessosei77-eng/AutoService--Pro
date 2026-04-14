"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { cn } from "./utils";
import { Label } from "./label";

const Form = FormProvider;

type FormFieldContextValue = FieldPath,
> = {
  name: TName;
};

const FormFieldContext = React.createContext(
  {} as FormFieldContextValue,
);

const FormField =  = FieldPath,
>({
  ...props
}: ControllerProps) => {
  return (
    
      
    
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within ");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext(
  {} as FormItemContextValue,
);

function FormItem({ className, ...props }: React.ComponentProps) {
  const id = React.useId();

  return (
    
      
    
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps) {
  const { error, formItemId } = useFormField();

  return (
    
  );
}

function FormControl({ ...props }: React.ComponentProps) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    
  );
}

function FormDescription({ className, ...props }: React.ComponentProps) {
  const { formDescriptionId } = useFormField();

  return (
    
  );
}

function FormMessage({ className, ...props }: React.ComponentProps) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;

  if (!body) {
    return null;
  }

  return (
    
      {body}
    
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
};




