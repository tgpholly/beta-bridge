const server = (require("net").Server)();
var mc = require('minecraft-protocol');
const mineflayer = require("mineflayer");
const bufferStuff = require("./bufferStuff.js");
const { deflateSync } = require("zlib");

const Vec3 = require("vec3");

const Chunk = require("prismarine-chunk")("1.16.5");

const Converter = require("./Converter.js");

const PacketMappingTable = require("./PacketMappingTable.js");
const NamedPackets = require("./NamedPackets.js");

server.listen(25565, () => console.log("lmao"));

server.on("connection", (socket) => {
	console.log("connection");

	//piss

	var client = mc.createClient({
		host: "192.168.2.240",   // optional minecraft.eusv.ml
		port: 27896,         // optional
		username: "mcb1730",
		auth: 'mojang', // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
		version: "1.16.5"
	});

	let fixedPos = new Vec3(0, 0, 0);
	client.on('packet', function(packet, packetMeta) {
		//console.log(packetMeta.name);
		switch (packetMeta.name) {
			case "position":
				console.log(packet);
			break;

			case "player_info":
				//console.log(packet);
			break;

			case "chat":
				console.log(packet);
				socket.write(new PacketMappingTable[NamedPackets.ChatMessage](Converter.jsonTextToText(packet.message)).writePacket());
			break;

			case "update_light":

			break;

			case "map_chunk":
				//return;
				const thisChunk = new Chunk();

				if (!packet.groundUp || packet.chunkData.length == 0) return;

				thisChunk.load(packet.chunkData, packet.bitMap, false, packet.groundUp);

				socket.write(new PacketMappingTable[NamedPackets.PreChunk](packet.x, packet.z, true).writePacket());

				for (let x = 0; x < 16; x++) {
					for (let z = 0; z < 16; z++) {
						for (let y = 0; y < 128; y++) {
							if (y < 30 && y > 0) {
								const block = thisChunk.getBlock(new Vec3(x, y, z)).name;
								if (block != "air") {
									socket.write(new PacketMappingTable[NamedPackets.BlockChange]((packet.x << 4) + x, y, (packet.z << 4) + z, Converter.blockidConveter(block), 0).writePacket());
									//console.log();
								}
							}
						}
					}
				}

				//console.log(thisChunk.getBlock(new Vec3(2, 18, 8)).name);

				/*const writer = new bufferStuff.Writer(18);

				writer.writeByte(0x33); // Chunk
				writer.writeInt(packet.x); // Chunk X
				writer.writeShort(0 << 7); // Chunk Y
				writer.writeInt(packet.z); // Chunk Z
				writer.writeByte(15); // Size X
				writer.writeByte(127); // Size Y
				writer.writeByte(15); // Size Z

				console.log(packet.x, packet.z);
				console.log(packet.x << 4, packet.z << 4);

				// pre-alloc since doing an alloc 98,304 times takes a while yknow.
				const blocks = new bufferStuff.Writer(32768);
				const metadata = new bufferStuff.Writer(32768);
				const lighting = new bufferStuff.Writer(32768);

				let blockMeta = false;
				for (let x = 0; x < 16; x++) {
					for (let z = 0; z < 16; z++) {
						for (let y = 0; y < 128; y++) {
							blocks.writeByte(Math.floor(Math.random() * 2));
							if (blockMeta) {
								metadata.writeNibble(0, 0); // NOTE: This is sorta jank but it does work
								// Light level 15 for 2 blocks (1111 1111)
								lighting.writeNibble(15, 15); // TODO: Lighting (Client seems to do it's own (when a block update happens) so it's not top priority)
							}
							// Hack for nibble stuff
							blockMeta = !blockMeta;
						}
					}
				}
				// These are hacks for the nibbles
				blocks.writeBuffer(metadata.buffer);
				blocks.writeBuffer(lighting.buffer); // Block lighting
				//blocks.writeBuffer(lighting.buffer); // Sky lighting (Looks like this isn't needed???)

				// We're on another thread we don't care if we halt
				const deflated = deflateSync(blocks.buffer);
				writer.writeInt(deflated.length); // Compressed Size
				writer.writeBuffer(deflated); // Compressed chunk data

				socket.write(writer.buffer);*/

				//console.log(writer.buffer);
			break;

			case "update_view_position":

			break;

			case "spawn_entity_living":

			break;

			case "entity_head_rotation":

			break;

			case "entity_metadata":

			break;

			case "tile_entity_data":

			break;

			case "spawn_position":
				//console.log(packet);
				socket.write(new PacketMappingTable[NamedPackets.SpawnPosition](packet.location.x, packet.location.y, packet.location.z).writePacket());
				socket.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](packet.location.x, packet.location.y + 1.6200000047683716, packet.location.y, packet.location.z, 0, 0, false).writePacket());
				
				socket.write(new PacketMappingTable[NamedPackets.PreChunk](packet.x >> 4, packet.z >> 4, true).writePacket());

				for (let x = 0; x < 16; x++) {
					for (let z = 0; z < 16; z++) {
						socket.write(new PacketMappingTable[NamedPackets.BlockChange](((packet.location.x >> 4) << 4) + x, 18, ((packet.location.z >> 4) << 4) + z, 3, 0).writePacket());
					}
				}

				//fixedPos.x = packet.location.x;
				//fixedPos.y = packet.location.y;
				//fixedPos.z = packet.location.z;
			break;
		}
	});

	//thisUser.loginFinished = true;

	// Send chunks
	/*for (let x = -3; x < 4; x++) {
		for (let z = -3; z < 4; z++) {
			//global.chunkManager.multiBlockChunk(x, z, thisUser);
		}
	}*/

	// Send this user to other online user
	//global.sendToAllPlayersButSelf(thisUser.id, new PacketMappingTable[NamedPackets.NamedEntitySpawn](thisUser.id, thisUser.username, thisUser.entityRef.x, thisUser.entityRef.y, thisUser.entityRef.z, thisUser.entityRef.yaw, thisUser.entityRef.pitch, 0).writePacket());

	// send all online users to this user
	/*for (let key of netUserKeys) {
		if (key == thisUser.id) continue;
		const user = netUsers[key];

		socket.write(new PacketMappingTable[NamedPackets.NamedEntitySpawn](user.id, user.username, user.entityRef.x, user.entityRef.y, user.entityRef.z, user.entityRef.yaw, user.entityRef.pitch, 0).writePacket());
	}*/

	let tickCounter = 0;

	const proxyTicker = setInterval(() => {
		if (tickCounter % 20) {
			socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
		}

		//socket.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](fixedPos.x, fixedPos.y + 1.6200000047683716, fixedPos.y, fixedPos.z, 0, 0, false).writePacket());
		tickCounter++;
	}, 1000 / 20);

	let clientOnGround = false;

	socket.on("data", function(chunk) {
		//console.log(chunk);
		const reader = new bufferStuff.Reader(chunk);

		switch (reader.readByte()) {
			case NamedPackets.LoginRequest:
				socket.write(new PacketMappingTable[NamedPackets.LoginRequest](reader.readInt(), reader.readString(), reader.readLong(), reader.readByte()).writePacket(34));
				//socket.write(new PacketMappingTable[NamedPackets.SpawnPosition]().writePacket());

				/*for (let x = -3; x < 4; x++) {
					for (let z = -3; z < 4; z++) {
						socket.write(new PacketMappingTable[NamedPackets.PreChunk](x, z, true).writePacket());
					}
				}*/

				//socket.write(new PacketMappingTable[NamedPackets.PreChunk](0, 0, true).writePacket());

				// Place a layer of glass under the player so they don't fall n' die
				/*for (let x = 0; x < 16; x++) {
					for (let z = 0; z < 16; z++) {
						socket.write(new PacketMappingTable[NamedPackets.BlockChange](x, 64, z, 3, 0).writePacket());
					}
				}*/

				//socket.write(new PacketMappingTable[NamedPackets.Player](true).writePacket());

				socket.write(new PacketMappingTable[NamedPackets.SetSlot](0, 36, 3, 64, 0).writePacket());

				//socket.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](8.5, 65 + 1.6200000047683716, 65, 8.5, 0, 0, false).writePacket());
			break;

			case NamedPackets.Handshake:
				//thisUser.username = reader.readString();

				socket.write(new PacketMappingTable[NamedPackets.Handshake](reader.readString()).writePacket());
			break;

			case NamedPackets.ChatMessage:
				client.write('chat', {message: reader.readString()});
				//client.write(
				
			break;

			case NamedPackets.Player:
				clientOnGround = reader.readBool();
			break;

			case NamedPackets.PlayerPosition:
				const x = reader.readDouble();
				const y = reader.readDouble();
				reader.readDouble();
				const z = reader.readDouble();
				//console.log(x,y,z);
				//client.write("position", {x: x, y: y, z:z, onGround: clientOnGround});
			break;
		}
	});

	socket.on("end", function() {
		console.log("dc");
		clearInterval(proxyTicker);
	});
});