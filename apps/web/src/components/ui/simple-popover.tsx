"use client";

import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface SimplePopoverContextType {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	triggerRef: React.RefObject<HTMLButtonElement>;
}

const SimplePopoverContext = createContext<SimplePopoverContextType | null>(null);

function useSimplePopover() {
	const context = useContext(SimplePopoverContext);
	if (!context) {
		throw new Error("SimplePopover components must be used within SimplePopover");
	}
	return context;
}

interface SimplePopoverProps {
	children: React.ReactNode;
	className?: string;
}

export function SimplePopover({ children, className }: SimplePopoverProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	return (
		<SimplePopoverContext.Provider value={{ isOpen, setIsOpen, triggerRef: triggerRef as React.RefObject<HTMLButtonElement> }}>
			<div ref={containerRef} className={cn("relative", className)}>
				{children}
			</div>
		</SimplePopoverContext.Provider>
	);
}

interface SimplePopoverTriggerProps {
	children: React.ReactNode;
	className?: string;
	asChild?: boolean;
}

export function SimplePopoverTrigger({ children, className }: SimplePopoverTriggerProps) {
	const { isOpen, setIsOpen, triggerRef } = useSimplePopover();

	return (
		<button
			ref={triggerRef}
			type="button"
			onClick={() => setIsOpen(!isOpen)}
			className={className}
		>
			{children}
		</button>
	);
}

interface SimplePopoverContentProps {
	children: React.ReactNode;
	className?: string;
	align?: "start" | "center" | "end";
}

export function SimplePopoverContent({ children, className, align = "end" }: SimplePopoverContentProps) {
	const { isOpen } = useSimplePopover();

	if (!isOpen) return null;

	const alignmentClasses = {
		start: "left-0",
		center: "left-1/2 -translate-x-1/2",
		end: "right-0",
	};

	return (
		<div
			className={cn(
				"absolute z-100 mt-1 rounded-xl border border-white/10 bg-[#1a1a1a] shadow-xl",
				alignmentClasses[align],
				className
			)}
		>
			{children}
		</div>
	);
}
