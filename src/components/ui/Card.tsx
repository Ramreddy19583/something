import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hover = false,
  children,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all",
          hover && "hover:border-indigo-200 hover:shadow-md",
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
