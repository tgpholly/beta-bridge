const Block = require("prismarine-block")("1.16.5");

module.exports = function(block) {
	//if (block.name.includes("stripped_dark_oak")) console.log(block);

	//const blockState = Block.fromStateId(block.stateId);

	if (block.name == "vine") {
		//console.log(block);
	}

	switch (block.name) {
		case "air":
			return [0,0];

		case "stone":
			return [1,0];

		case "grass_block":
			return [2,0];

		case "dirt":
			return [3,0];

		case "cobblestone":
			return [4,0];

		case "grass":
			return [31, 1];

		case "fire":
		case "campfire":
			return [51, 0];

		// Slabs
		case "smooth_stone_slab":
		case "stone_slab":
			props = block.getProperties();
			if (props.type == "double") return [43, 0];
			else if (props.type == "bottom") return [44, 0];
			else return [44, 8];

		// Concrete
		case "black_terracotta":
		case "black_concrete":
		case "black_wool":
			return [35,15];

		case "red_terracotta":
		case "red_concrete":
		case "red_wool":
			return [35,14];

		case "green_terracotta":
		case "green_concrete":
		case "green_wool":
			return [35,13];

		case "brown_terracotta":
		case "brown_concrete":
		case "brown_wool":
			return [35,12];

		case "blue_terracotta":
		case "blue_concrete":
		case "blue_wool":
			return [35,11];

		case "purple_terracotta":
		case "purple_concrete":
		case "purple_wool":
			return [35,10];

		case "cyan_terracotta":
		case "cyan_concrete":
		case "cyan_wool":
			return [35,9];

		case "light_gray_terracotta":
		case "light_gray_concrete":
		case "light_gray_wool":
			return [35,8];

		case "gray_terracotta":
		case "gray_concrete":
		case "gray_wool":
			return [35,7];

		case "pink_terracotta":
		case "pink_concrete":
		case "pink_wool":
			return [35,6];

		case "lime_terracotta":
		case "lime_concrete":
		case "lime_wool":
			return [35,5];

		case "yellow_terracotta":
		case "yellow_concrete":
		case "yellow_wool":
			return [35,4];

		case "light_blue_terracotta":
		case "light_blue_concrete":
		case "light_blue_wool":
			return [35,3];

		case "magenta_terracotta":
		case "magenta_concrete":
		case "magenta_wool":
			return [35,2];

		case "orange_terracotta":			
		case "orange_concrete":
		case "orange_wool":
			return [35,1];

		case "white_terracotta":w
		case "white_concrete":
		case "white_wool":
			return [35,0];

		case "water":
			return [9, 0];

		case "lily_pad":
			return [111,0];

		// Piss
		case "smooth_stone":
			return [43, 7];

		case "sandstone_slab":
			return [44, 1];
		
		case "oak_slab":
		case "spruce_slab":
		case "birch_slab":
		case "jungle_slab":
			return [44, 2];

		case "cobblestone_slab":
			return [44, 3];

		case "brick_slab":
			return [44, 4];

		case "stone_brick_slab":
			return [44, 5];

		// Leaves
		case "dark_oak_leaves":
		case "oak_leaves":
			return [18,0];

		case "spruce_leaves":
			return [18,1];

		case "birch_leaves":
			return [18,2];
			
		case "jungle_leaves":
			return [18,3];

		// Logs
		case "oak_log":
		case "acacia_log":
		case "stripped_oak_log":
		case "stripped_acacia_log":
		case "stripped_oak_wood":
		case "stripped_acacia_wood":
			//props = block.getProperties();
			//console.log(props);
			return [17,0];

		case "dark_oak_log":
		case "spruce_log":
		case "stripped_spruce_log":
		case "stripped_spruce_wood":
		case "stripped_dark_oak_log":
		case "stripped_dark_oak_wood":
			return [17,1];

		case "birch_log":
		case "stripped_birch_log":
		case "stripped_birch_wood":
			return [17,2];

		case "jungle_log":
		case "stripped_jungle_log":
		case "stripped_jungle_wood":
			return [17,3];

		// Fence
		case "oak_fence":
		case "birch_fence":
		case "spruce_fence":
		case "jungle_fence":
		case "acacia_fence":
		case "dark_oak_fence":
			return [85,0];

		case "vine":
			props = block.getProperties();
			if (props.north) return [106, 4];
			if (props.west) return [106, 2];
			if (props.east) return [106, 8];
			if (props.south) return [106, 1];
			return [0, 0]; // Catch all else

		// Rails
		case "rail":
			return [66,0];

		case "nether_portal":
			return [90, 0];

		case "lantern":
			return [124,0];

		default:
			return [2,0];
	}
}