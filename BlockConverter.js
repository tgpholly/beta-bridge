const Block = require("prismarine-block")("1.16.5");

module.exports = function(block) {
	switch (block.name) {
		case "air":
			return [0,0];

		case "stone":
			return [1,0];

		case "grass_block":
			return [2,0];

		case "dirt":
		case "coarse_dirt":
			return [3,0];

		case "gravel":
		case "dead_horn_corral_block":
		case "dead_horn_coral_block":
			return [13, 0];

		case "coal_ore":
			return [16, 0];

		case "iron_ore":
			return [15 , 0];

		case "gold_ore":
			return [14, 0];

		case "diamond_ore":
			return [56, 0];

		case "cobblestone":
			return [4,0];

		case "grass":
		case "tall_grass":
			return [31, 1];
		
		case "sugar_cane":
			return [83, 0];
		
		case "poppy":
		case "azure_bluet":
		case "red_tulip":
		case "orange_tulip":
		case "cornflower":
		case "flower_pot":
		case "rose_bush":
			return [38, 0];

		case "dandelion":
		case "blue_orchid":
		case "allium":
		case "pink_tulip":
		case "lily_of_the_valley":
			return [37, 0];

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

		case "white_terracotta":
		case "white_concrete":
		case "white_wool":
			return [35,0];

		case "water":
			props = block.getProperties();
			return [9, props.level];

		case "tall_seagrass":
		case "fire_coral_fan":
		case "seagrass":
		case "kelp":
			return [9, 0];

		case "lily_pad":
			return [111,0];

		// Piss
		case "smooth_stone":
			return [43, 7];

		case "sandstone_slab":
			props = block.getProperties();
			if (props.type == "double") return [43, 1];
			else if (props.type == "bottom") return [44, 1];
			else return [44, 9];
		
		case "oak_slab":
		case "spruce_slab":
		case "birch_slab":
		case "jungle_slab":
			props = block.getProperties();
			if (props.type == "double") return [43, 2];
			else if (props.type == "bottom") return [44, 2];
			else return [44, 10];

		case "iron_bars":
			return [101, 0];

		case "crafting_table":
			return [58, 0];

		case "oak_sign":
		case "spruce_sign":
		case "birch_sign":
		case "jungle_sign":
		case "dark_oak_sign":
		case "acacia_sign":
		case "crimson_sign":
		case "warped_sign":
			props = block.getProperties();
			return [63, props.rotation];

		case "oak_wall_sign":
		case "spruce_wall_sign":
		case "birch_wall_sign":
		case "jungle_wall_sign":
		case "dark_oak_wall_sign":
		case "acacia_wall_sign":
		case "warped_wall_sign":
		case "crimson_wall_sign":
			props = block.getProperties();
			switch (props.facing) {
				case "north":
					return [68, 2];
				case "south":
					return [68, 3];
				case "west":
					return [68, 4];
				case "east":
					return [68, 5];
			}

		case "spruce_trapdoor":
			props = block.getProperties();
			if (props.open) {
				switch (props.facing) {
					case "north":
						return [96, 4];
					case "south":
						return [96, 5];
					case "west":
						return [96, 6];
					case "east":
						return [96, 7];
				}
			} else {
				switch (props.facing) {
					case "north":
						return [96, 0];
					case "south":
						return [96, 1];
					case "west":
						return [96, 2];
					case "east":
						return [96, 3];
				}
			}
	
		case "glowstone":
		case "sea_lantern":
		case "end_rod":
			return [89, 0];

		case "cobblestone_slab":
		case "smooth_quartz_slab":
		case "andesite_slab":
		case "granite_slab":
		case "diorite_slab":
		case "polished_andesite_slab":
		case "polished_granite_slab":
		case "polished_diorite_slab":
			props = block.getProperties();
			if (props.type == "double") return [43, 3];
			else if (props.type == "bottom") return [44, 3];
			else return [44, 11];

		case "brick_slab":
			props = block.getProperties();
			if (props.type == "double") return [43, 4];
			else if (props.type == "bottom") return [44, 4];
			else return [44, 12];

		case "stone_brick_slab":
		case "mossy_stone_brick_slab":
		case "cracked_stone_brick_slab":
			props = block.getProperties();
			if (props.type == "double") return [43, 5];
			else if (props.type == "bottom") return [44, 5];
			else return [44, 13];

		// Leaves
		case "dark_oak_leaves":
		case "acacia_leaves":
		case "oak_leaves":
			return [18,0];

		case "spruce_leaves":
			return [18,1];

		case "birch_leaves":
			return [18,2];
			
		case "jungle_leaves":
			return [18,3];

		case "glass":
		case "barrier":
			return [20, 0];

		case "stone_bricks":
			return [98, 0];

		case "mossy_stone_bricks":
			return [98, 1];

		case "cracked_stone_bricks":
			return [98, 2];

		case "chiseled_stone_bricks":
			return [98, 3];

		// Logs
		case "oak_log":
		case "acacia_log":
		case "oak_wood":
		case "acacia_wood":
		case "stripped_oak_log":
		case "stripped_acacia_log":
		case "stripped_oak_wood":
		case "stripped_acacia_wood":
			return [17,0];

		case "dark_oak_log":
		case "spruce_log":
		case "dark_oak_wood":
		case "spruce_wood":
		case "stripped_spruce_log":
		case "stripped_spruce_wood":
		case "stripped_dark_oak_log":
		case "stripped_dark_oak_wood":
			return [17,1];

		case "birch_log":
		case "birch_wood":
		case "stripped_birch_log":
		case "stripped_birch_wood":
			return [17,2];

		case "jungle_log":
		case "jungle_wood":
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

		case "stone_button":
			props = block.getProperties();
			if (props.face == "floor" || props.fade == "ceiling") return [0, 0];
			else return [2,0];

		case "snow":
			return [78, 0];

		case "glass_pane":
			return [102, 0];

		case "torch":
			return [50, 0];

		case "snow_block":
		case "smooth_quartz":
		case "chiseled_quartz_block":
		case "quartz_block":
		case "quartz_pillar":
			return [80, 0];

		case "oak_stairs":
		case "birch_stairs":
		case "spruce_stairs":
		case "acacia_stairs":
		case "dark_oak_stairs":
		case "jungle_stairs":
			props = block.getProperties();
			if (props.shape == "straight" || props.shape.includes("outer_")) {
				switch (props.facing) {
					case "north":
						return [53, 3];
					case "south":
						return [53, 2];
					case "west":
						return [53, 1];
					case "east":
						return [53, 0];

					default:
						return [2, 0];
				}
			} else return [2, 0];

		case "cobblestone_stairs":
		case "quartz_stairs":
		case "smooth_quartz_stairs":
		case "polished_andesite_stairs":
		case "polished_diorite_stairs":
		case "polished_granite_stairs":
		case "andesite_stairs":
		case "diorite_stairs":
		case "granite_stairs":
			props = block.getProperties();
			if (props.shape == "straight" || props.shape.includes("outer_")) {
				switch (props.facing) {
					case "north":
						return [67, 3];
					case "south":
						return [67, 2];
					case "west":
						return [67, 1];
					case "east":
						return [67, 0];

					default:
						return [2, 0];
				}
			} else return [2, 0];

		case "smooth_quartz_stairs":
			props = block.getProperties();
			if (props.shape == "straight" || props.shape.includes("outer_")) {
				switch (props.facing) {
					case "north":
						return [109, 3];
					case "south":
						return [109, 2];
					case "west":
						return [109, 1];
					case "east":
						return [109, 0];

					default:
						return [2, 0];
				}
			} else return [2, 0];

		default:
			if (block.getProperties != null) {
				props = block.getProperties();
				if (props.waterlogged) return [9, 0];
				else return [2,0];
			} else return [2,0];
	}
}