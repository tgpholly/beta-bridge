const { parentPort } = require('worker_threads'),
	  { deflateSync } = require("zlib");
const Chunk = require("prismarine-chunk")("1.16.5");
const Vec3 = require("vec3");
const BlockConverter = require("../BlockConverter.js");
const bufferStuff = require("../bufferStuff.js");

let busyInterval = null;

parentPort.on("message", (data) => {
	// This stops the thread from stopping :)
	if (busyInterval == null) busyInterval = setInterval(() => {}, 86400000); // Runs once a day

	switch (data[0]) {
		case "chunk":
			parentPort.postMessage([data[0], doChunk(data[1]), data[2], data[3]]);
		break;
	}
});

const addArray = new bufferStuff.Writer(32768);
for (let section = 0; section < 16; section++) {
	let nibbleHack = false;
	for (let y = 0; y < 16; y++) {
		for (let z = 0; z < 16; z++) {
			for (let x = 0; x < 16; x++) {
				if (nibbleHack) {
					addArray.writeNibble(0, 0);
				}
				nibbleHack = !nibbleHack;
			}
		}
	}
}

const biome = new bufferStuff.Writer(256);
for (let x = 0; x < 16; x++) {
	for (let z = 0; z < 16; z++) {
		biome.writeUByte(0);
	}
}

const theVec3 = new Vec3(0, 0, 0);
function set(x = 0, y = 0, z = 0) {
	theVec3.x = x;
	theVec3.y = y;
	theVec3.z = z;

	return theVec3;
}

function doChunk(packet) {
	const modernChunk = new Chunk();

	modernChunk.load(Buffer.from(packet.chunkData), packet.bitMap, false, packet.groundUp);

	const chunkData = new bufferStuff.Writer();
	const blocks = new bufferStuff.Writer(65536);
	const metadata = new bufferStuff.Writer(32768);
	const blockLight = new bufferStuff.Writer(32768);
	const skyLight = new bufferStuff.Writer(32768);
	for (let section = 0; section < 16; section++) {
		let nibbleHack = false;

		for (let y = 0; y < 16; y++) {
			for (let z = 0; z < 16; z++) {
				for (let x = 0; x < 16; x++) {
					const block = BlockConverter(modernChunk.getBlock(set(x, y + (section << 4), z)));
					blocks.writeUByte(block[0])

					if (nibbleHack) {
						metadata.writeNibble(BlockConverter(modernChunk.getBlock(set(x - 1, y + (section << 4), z)))[1], block[1]);
						blockLight.writeNibble(
							modernChunk.getBlockLight(set(x - 1, y + (section << 4), z)),
							modernChunk.getBlockLight(set(x, y + (section << 4), z))
						);
						skyLight.writeNibble(
							modernChunk.getSkyLight(set(x - 1, y + (section << 4), z)),
							modernChunk.getSkyLight(set(x, y + (section << 4), z))
						);
					}
					nibbleHack = !nibbleHack;
				}
			}
		}
	}
	chunkData.writeBuffer(blocks.buffer);
	chunkData.writeBuffer(metadata.buffer);
	chunkData.writeBuffer(blockLight.buffer);
	chunkData.writeBuffer(skyLight.buffer);
	chunkData.writeBuffer(addArray.buffer);
	chunkData.writeBuffer(biome.buffer);

	const deflatedData = deflateSync(chunkData.buffer);

	const writer = new bufferStuff.Writer(22)
		.writeUByte(0x33) // ChunkData
		.writeInt(packet.x) // X
		.writeInt(packet.z) // Z
		.writeBool(packet.groundUp) // Ground-up
		.writeUShort(0xffff) // Primary bit map
		.writeUShort(0) // Add bit map
		.writeUInt(deflatedData.length) // Compressed size
		.writeInt(0) // Unused
		.writeBuffer(deflatedData); // Chunk data (compressed)

	return writer.buffer;
}