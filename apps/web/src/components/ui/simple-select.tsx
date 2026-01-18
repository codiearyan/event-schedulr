"use client";

import { ChevronDownIcon } from "lucide-react";
import React, { useState, useRef, useEffect, createContext, useContext } from "react";
import { cn } from "@/lib/utils";

interface SimpleSelectProps {
	value: string;
	onValueChange: (value: string) => void;
	children: React.ReactNode;
	className?: string;
}

interface SimpleSelectTriggerProps {
	children: React.ReactNode;
	className?: string;
}

interface SimpleSelectContentProps {
	children: React.ReactNode;
	className?: string;
}

interface SimpleSelectItemProps {
	value: string;
	children: React.ReactNode;
	className?: string;
}

interface SimpleSelectContextType {
	value: string;
	onValueChange: (value: string) => void;
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
}

const SimpleSelectContext = createContext<SimpleSelectContextType | null>(null);

function useSimpleSelect() {
	const context = useContext(SimpleSelectContext);
	if (!context) {
		throw new Error("SimpleSelect components must be used within SimpleSelect");
	}
	return context;
}

export function SimpleSelect({ value, onValueChange, children, className }: SimpleSelectProps) {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

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
		<SimpleSelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
			<div ref={containerRef} className={cn("relative", className)}>
				{children}
			</div>
		</SimpleSelectContext.Provider>
	);
}

export function SimpleSelectTrigger({ children, className }: SimpleSelectTriggerProps) {
	const { isOpen, setIsOpen } = useSimpleSelect();

	return (
		<button
			type="button"
			onClick={() => setIsOpen(!isOpen)}
			className={cn(
				"flex h-9 w-auto items-center justify-between gap-2 rounded-lg border border-white/10 bg-[rgba(37,37,37,0.4)] px-3 py-2 text-sm text-white transition-colors hover:border-white/20 focus:border-white/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
				className
			)}
		>
			{children}
			<ChevronDownIcon className={cn("h-4 w-4 text-white/60 transition-transform shrink-0", isOpen && "rotate-180")} />
		</button>
	);
}

export function SimpleSelectValue() {
	const { value } = useSimpleSelect();
	return <span>{value}</span>;
}

export function SimpleSelectContent({ children, className }: SimpleSelectContentProps) {
	const { isOpen } = useSimpleSelect();

	if (!isOpen) return null;

	return (
		<div
			className={cn(
				"absolute z-100 mt-1 max-h-60 w-auto min-w-[140px] rounded-lg border border-white/10 bg-[#1a1a1a] py-1 shadow-xl",
				className
			)}
			style={{
				position: "absolute",
				overflowY: "auto",
				scrollbarWidth: "thin",
				scrollbarColor: "rgba(255,255,255,0.3) transparent"
			}}
		>
			{children}
		</div>
	);
}

export function SimpleSelectItem({ value, children, className }: SimpleSelectItemProps) {
	const { value: selectedValue, onValueChange, setIsOpen } = useSimpleSelect();
	const isSelected = selectedValue === value;

	return (
		<button
			type="button"
			onClick={() => {
				onValueChange(value);
				setIsOpen(false);
			}}
			className={cn(
				"flex w-full cursor-pointer items-center px-3 py-2 text-sm text-white transition-colors hover:bg-white/10",
				isSelected && "bg-white/5 font-medium",
				className
			)}
		>
			{children}
		</button>
	);
}

// For compatibility with existing code
export const SimpleSelectRoot = SimpleSelect;
