module.exports = function(block) {
    switch (block.name) {
        case "grass_block":
            return [2,0];

        default:
            return [0,0];
    }
}