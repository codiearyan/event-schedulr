"use client";

import { api } from "@event-schedulr/backend/convex/_generated/api";
import { useMutation } from "convex/react";
import { Camera, ChevronDown, Shuffle } from "lucide-react";
import { useRef, useState } from "react";

import {
	type EventGraphicPreset,
	eventGraphicsPresets,
	getPresetById,
} from "@/lib/event-graphics";
import { PresetGraphicRenderer } from "./PresetGraphicRenderer";

export interface EventImageValue {
	type: "uploaded" | "preset";
	value: string;
}

interface EventImagePickerProps {
	value: EventImageValue | null;
	onChange: (value: EventImageValue) => void;
	uploadedPreviewUrl: string | null;
	onUploadPreviewChange: (url: string | null) => void;
}

export function EventImagePicker({
	value,
	onChange,
	uploadedPreviewUrl,
	onUploadPreviewChange,
}: EventImagePickerProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [showPresetDropdown, setShowPresetDropdown] = useState(false);
	const generateUploadUrl = useMutation(api.files.generateUploadUrl);

	const currentPreset =
		value?.type === "preset" ? getPresetById(value.value) : null;

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const previewUrl = URL.createObjectURL(file);
			onUploadPreviewChange(previewUrl);

			const uploadUrl = await generateUploadUrl();
			const response = await fetch(uploadUrl, {
				method: "POST",
				headers: { "Content-Type": file.type },
				body: file,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			const { storageId } = await response.json();
			onChange({ type: "uploaded", value: storageId });
		} catch (error) {
			console.error("Upload error:", error);
			onUploadPreviewChange(null);
		} finally {
			setIsUploading(false);
		}
	};

	const handleRandomPreset = () => {
		const randomIndex = Math.floor(Math.random() * eventGraphicsPresets.length);
		const preset = eventGraphicsPresets[randomIndex];
		onChange({ type: "preset", value: preset.id });
		onUploadPreviewChange(null);
	};

	const handlePresetSelect = (preset: EventGraphicPreset) => {
		onChange({ type: "preset", value: preset.id });
		onUploadPreviewChange(null);
		setShowPresetDropdown(false);
	};

	const renderPreview = () => {
		if (value?.type === "uploaded" && uploadedPreviewUrl) {
			return (
				<img
					src={uploadedPreviewUrl}
					alt="Event preview"
					className="h-full w-full object-cover"
				/>
			);
		}

		if (currentPreset) {
			return (
				<PresetGraphicRenderer
					preset={currentPreset}
					className="h-full w-full"
				/>
			);
		}

		const defaultPreset = eventGraphicsPresets[0];
		return (
			<PresetGraphicRenderer preset={defaultPreset} className="h-full w-full" />
		);
	};

	return (
		<div className="flex flex-col gap-3">
			<div className="relative aspect-square w-full overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)]">
				{renderPreview()}

				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={isUploading}
					className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-black/60 px-3 py-2 text-sm text-white backdrop-blur-sm transition-colors hover:bg-black/80"
				>
					<Camera className="h-4 w-4" />
					{isUploading ? "Uploading..." : "Upload"}
				</button>

				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					className="hidden"
				/>
			</div>

			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<button
						type="button"
						onClick={() => setShowPresetDropdown(!showPresetDropdown)}
						className="flex w-full items-center justify-between rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] px-3 py-2 text-sm text-white transition-colors hover:bg-[rgba(90,90,90,0.2)]"
					>
						<span>
							Theme: {currentPreset?.name || eventGraphicsPresets[0].name}
						</span>
						<ChevronDown className="h-4 w-4" />
					</button>

					{showPresetDropdown && (
						<div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-64 overflow-hidden overflow-y-auto rounded-lg border border-[rgba(255,255,255,0.1)] bg-[#1a1a1a] shadow-xl">
							{eventGraphicsPresets.map((preset) => (
								<button
									key={preset.id}
									type="button"
									onClick={() => handlePresetSelect(preset)}
									className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-white/10"
								>
									<div
										className="h-8 w-8 flex-shrink-0 rounded-md"
										style={{ background: preset.background }}
									/>
									<span className="text-sm text-white">{preset.name}</span>
								</button>
							))}
						</div>
					)}
				</div>

				<button
					type="button"
					onClick={handleRandomPreset}
					className="rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(90,90,90,0.12)] p-2 text-white transition-colors hover:bg-[rgba(90,90,90,0.2)]"
					title="Random theme"
				>
					<Shuffle className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
