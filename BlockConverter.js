module.exports = function(block) {
	switch (block.name) {
		case "air":
			return [0, 0];

		case "grass_block":
			return [2,0];

		case "grass":
			return [31, 1];

		case "fire":
		case "campfire":
			return [51, 0];

		// Slabs
		case "smooth_stone_slab":
		case "stone_slab":
			return [44, 0];

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
			return [17,0];

		case "dark_oak_log":
		case "spruce_log":
			return [17,1];

		case "birch_log":
			return [17,2];

		case "jungle_log":
			return [17,3];

		// Fence
		case "oak_fence":
		case "birch_fence":
		case "spruce_fence":
		case "jungle_fence":
		case "acacia_fence":
		case "dark_oak_fence":
			return [85,0];

		// Rails
		case "rail":
			return [66,0];

		case "lantern":
			return [124,0];

		default:
			return [2,0];
	}
}