/*
	============- Converter.js -============
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

module.exports.toAbsoluteInt = function(float = 0.0) {
	return Math.floor(float * 32.0);
}

module.exports.to360Fraction = function(float = 0.0) {
	if (float < 0) {
		return Math.abs(Math.max(Math.floor((map(float, 0, -360, 360, 0) / 360) * 256) - 1, 0));	
	} else if (float > 0) {
		return Math.max(Math.floor((float / 360) * 256) - 1, 0);
	}
	//return Math.max(Math.floor((float / 360) * 256), 0) - 1;
}

const colourTable = {
	"dark_red": "\u00A74",
	"red": "\u00A7c",
	"gold": "\u00A76",
	"yellow": "\u00A7e",
	"dark_green": "\u00A72",
	"green": "\u00A7a",
	"aqua": "\u00A7b",
	"dark_aqua": "\u00A73",
	"dark_blue": "\u00A71",
	"blue": "\u00A79",
	"light_purple": "\u00A7d",
	"dark_purple": "\u00A75",
	"white": "\u00A7f",
	"gray": "\u00A77",
	"dark_gray": "\u00A78",
	"black": "\u00A70",
};

module.exports.jsonTextToText = function(json = "") {
	const parsedJson = JSON.parse(json);

	let outText = "";

	if (Object.keys(parsedJson).includes("extra")) {
		for (let t of parsedJson.extra) {
			if (Object.keys(t).includes("color")) outText += `${colourTable[t.color]}${t.text}`;
			else outText += t.text;
		}
	}

	outText += parsedJson.text;

	return outText;
}

module.exports.blockidConveter = function(block) {
	switch (block.name) {
		case "grass_block":
			return [2, 0, block.light];

		case "andesite":
		case "granite":
		case "diorite":
		case "stone":
			return [1, 0, block.light];

		case "podzol":
		case "coarse_dirt":
			return [3, 0, block.light];

		case "coal_ore":
			return [16, 0, block.light];

		case "iron_ore":
			return [15, 0, block.light];

		case "gold_ore":
			return [14, 0, block.light];
		
		case "lapis_ore":
			return [21, 0, block.light];		

		case "diamond_ore":
			return [56, 0, block.light];

		case "portal":
			return [90, 0, block.light];

		case "end_rod":
		case "glowstone":
			return [89, 0, block.light];

		case "water":
			return [9, 0, block.light];

		case "sand":
			return [12, 0, block.light];

		case "oak_logs":
		case "birch_logs":
		case "spruce_logs":
		case "jungle_logs":
		case "acacia_logs":
		case "dark_oak_logs":
		case "oak_log":
		case "birch_log":
		case "spruce_log":
		case "jungle_log":
		case "acacia_log":
		case "dark_oak_log":
			return [17, 0, block.light];

		case "oak_leaves":
		case "birch_leaves":
		case "spruce_leaves":
		case "acacia_leaves":
		case "dark_oak_leaves":
		case "jungle_leaves":
			return [18, 0, block.light];

		case "cobblestone":
			return [4, 0, block.light];

		case "smooth_stone":
			return [1, 0, block.light];

		case "campfire":
			return [51, 0, block.light];

		case "dirt":
			return [3, 0, block.light];

		case "oak_fence":
		case "birch_fence":
		case "spruce_fence":
		case "jungle_fence":
		case "acacia_fence":
		case "dark_oak_fence":
			return [85, 0, block.light];

		case "lantern":
			return [89, 0, block.light];

		case "grass":
			return [31, 1, block.light];

		case "barrier":
			return [20, 0, block.light];

		case "torch":
			return [50, 0, block.light];

		default:
			return [0, 0, block.light];
	}
}

function map(input, inputMin, inputMax, outputMin, outputMax) {
	const newv = (input - inputMin) / (inputMax - inputMin) * (outputMax - outputMin) + outputMin;

	if (outputMin < outputMax) return constrain(newv, outputMin, outputMax);
	else return constrain(newv, outputMax, outputMin);
}

function constrain(input, low, high) {
	return Math.max(Math.min(input, high), low);
}