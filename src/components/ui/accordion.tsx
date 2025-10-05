"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionProps {
  children: React.ReactNode
  type?: "single" | "multiple"
  className?: string
}

const Accordion: React.FC<AccordionProps> = ({ children, type = "single", className }) => {
  return <div className={cn("space-y-2", className)}>{children}</div>
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const AccordionItem: React.FC<AccordionItemProps> = ({ children, className }) => {
  return <div className={cn("border-b", className)}>{children}</div>
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ children, className, onClick }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleClick = () => {
    setIsOpen(!isOpen)
    onClick?.()
  }

  return (
    <div className="flex">
      <button
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline",
          className
        )}
        onClick={handleClick}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    </div>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

const AccordionContent: React.FC<AccordionContentProps> = ({ children, className }) => {
  return (
    <div className={cn("overflow-hidden text-sm transition-all", className)}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }