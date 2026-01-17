export interface EventGraphicPreset {
	id: string;
	name: string;
	background: string;
	textPattern: string;
	textColor: string;
	category: "minimal" | "vibrant" | "elegant" | "playful";
}

export const eventGraphicsPresets: EventGraphicPreset[] = [
	{
		id: "pink-gradient",
		name: "Pink Gradient",
		background:
			"linear-gradient(135deg, #ff6b9d 0%, #ffa07a 50%, #ff8c69 100%)",
		textPattern: "YOU ARE INVITED",
		textColor: "rgba(255, 255, 255, 0.15)",
		category: "vibrant",
	},
	{
		id: "ocean-blue",
		name: "Ocean Blue",
		background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
		textPattern: "JOIN US",
		textColor: "rgba(255, 255, 255, 0.12)",
		category: "elegant",
	},
	{
		id: "sunset-orange",
		name: "Sunset Orange",
		background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
		textPattern: "SAVE THE DATE",
		textColor: "rgba(255, 255, 255, 0.12)",
		category: "vibrant",
	},
	{
		id: "forest-green",
		name: "Forest Green",
		background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
		textPattern: "YOU ARE INVITED",
		textColor: "rgba(255, 255, 255, 0.12)",
		category: "elegant",
	},
	{
		id: "midnight-purple",
		name: "Midnight Purple",
		background:
			"linear-gradient(135deg, #3a1c71 0%, #d76d77 50%, #ffaf7b 100%)",
		textPattern: "EXCLUSIVE EVENT",
		textColor: "rgba(255, 255, 255, 0.1)",
		category: "elegant",
	},
	{
		id: "golden-hour",
		name: "Golden Hour",
		background: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
		textPattern: "CELEBRATE",
		textColor: "rgba(255, 255, 255, 0.15)",
		category: "playful",
	},
	{
		id: "neon-glow",
		name: "Neon Glow",
		background: "linear-gradient(135deg, #00f5d4 0%, #7b2cbf 100%)",
		textPattern: "LET'S GO",
		textColor: "rgba(255, 255, 255, 0.12)",
		category: "vibrant",
	},
	{
		id: "monochrome",
		name: "Monochrome",
		background: "linear-gradient(135deg, #434343 0%, #000000 100%)",
		textPattern: "EVENT",
		textColor: "rgba(255, 255, 255, 0.08)",
		category: "minimal",
	},
	{
		id: "rose-gold",
		name: "Rose Gold",
		background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
		textPattern: "WELCOME",
		textColor: "rgba(0, 0, 0, 0.08)",
		category: "elegant",
	},
	{
		id: "arctic",
		name: "Arctic",
		background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
		textPattern: "JOIN US",
		textColor: "rgba(0, 0, 0, 0.06)",
		category: "minimal",
	},
	{
		id: "volcano",
		name: "Volcano",
		background: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
		textPattern: "HOT EVENT",
		textColor: "rgba(255, 255, 255, 0.12)",
		category: "vibrant",
	},
	{
		id: "galaxy",
		name: "Galaxy",
		background:
			"linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
		textPattern: "EXPLORE",
		textColor: "rgba(255, 255, 255, 0.08)",
		category: "elegant",
	},
	{
		id: "mint-fresh",
		name: "Mint Fresh",
		background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
		textPattern: "FRESH START",
		textColor: "rgba(0, 0, 0, 0.08)",
		category: "playful",
	},
	{
		id: "lavender-dream",
		name: "Lavender Dream",
		background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
		textPattern: "DREAM BIG",
		textColor: "rgba(255, 255, 255, 0.12)",
		category: "playful",
	},
];

export function getPresetById(id: string): EventGraphicPreset | undefined {
	return eventGraphicsPresets.find((preset) => preset.id === id);
}

export function getPresetsByCategory(
	category: EventGraphicPreset["category"],
): EventGraphicPreset[] {
	return eventGraphicsPresets.filter((preset) => preset.category === category);
}
