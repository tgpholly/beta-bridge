const server = (require("net").Server)();
const { deflate } = require("zlib");
const bufferStuff = require("./bufferStuff.js");
const pRandom = require("./prettyRandom.js");
const mc = require('minecraft-protocol');
const Chunk = require("prismarine-chunk")("1.16.5");
const Block = require("prismarine-block")("1.16.5");
const Vec3 = require("vec3");
const NamedPackets = require("./NamedPackets.js");
const PacketMappingTable = require("./PacketMappingTable.js");
const BlockConverter = require("./BlockConverter.js");
const { Worker } = require('worker_threads');
const FunkyArray = require("./funkyArray.js");

// Thread shit start
const workerPath = `${__dirname}/Workers/ThreadWorker.js`;
let toRemove = [];
let threadPool = [];
let workPool = new FunkyArray(true);

let socketArray = new FunkyArray();

// WoAh!!! Thread pool in js!?!??!???!11!?!?!
for (let i = 0; i < 4; i++) {
	const worker = new Worker(workerPath);
	threadPool.push([false, worker]);
	const myID = i;
	worker.on("message", (data) => {
		switch (data[0]) {
			case "chunk":
				socketArray.getByKey(data[2]).write(Buffer.from(data[1]));
				toRemove.push(data[3]); // Set this job to be removed
				threadPool[myID][0] = false; // Set thread as not busy
			break;
		}
	});
}

setInterval(() => {
	for (let item of toRemove) {
		workPool.remove(item, false);
	}
	if (toRemove.length != 0) workPool.regenerateIterableArray();

	if (workPool.getLength() != 0) {
		let limit = Math.min(workPool.getLength(), threadPool.length);
		for (let i = 0; i < limit; i++) {
			for (let i1 = 0; i1 < threadPool.length; i1++) {
				let thread = threadPool[i1];
				if (!thread[0]) {
					const key = workPool.itemKeys[i];
					const item = workPool.getByKey(key);
					// Already being processed
					if (item == null) break;
					if (item[0] == true) {
						limit += 1;
						break;
					}
					item[0] = true;
					item[1][3] = key;
					thread[1].postMessage(item[1]);
					thread[0] = true;
					break;
				}
			}
		}
	}
}, 1000 / 144);
// Thread shit end

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

function jsonTextToText(json = "") {
	const parsedJson = JSON.parse(json);

	let outText = "";

	console.log(parsedJson);
	if (Object.keys(parsedJson).includes("extra")) {
		
		for (let t of parsedJson.extra) {
			if (Object.keys(t).includes("color")) outText += `${colourTable[t.color]}${t.text}`;
			else outText += t.text;
		}
	}

	outText += parsedJson.text;

	return outText;
}

function chatTextJsonToText(json = "") {
	const parsedJson = JSON.parse(json);

	let outText = "";

	if (parsedJson.translate != "chat.type.text") return "NOT A CHAT TEXT MESSAGE";
	for (let thing of parsedJson.with) {
		if (typeof(thing) == "object") {
			outText += `<${thing.text}> `;
		} else {
			outText += thing;
		}
	}

	return outText;
}

function jsonTextToSignText(json = "") {
	const parsedJson = JSON.parse(json);

	let outText = "";

	if (Object.keys(parsedJson).includes("extra")) {
		for (let t of parsedJson.extra) {
			if (Object.keys(t).includes("color")) outText += t.text;
			else outText += t.text;
		}
	}

	outText += parsedJson.text;

	return outText.slice(0, 15);
}

let idCount = 0;
let playerInfo = {};
let playerInfoKeys = [];
let playerByEntityId = {};

function serverConnection(client, socketId, username) {
	console.log(username);
	let proxyClient = mc.createClient({
		host: "127.0.0.1",   // optional
		port: 38461,         // optional
		username: username,
		auth: 'mojang', // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
		version: "1.16.5"
	});

	proxyClient.on("end", (reason) => {
		console.log(reason);
	});

	proxyClient.on("error", (err) => {
		console.error(err);
	});

	proxyClient.on("state", (newState, oldState) => console.log(newState, oldState));

	proxyClient.on('packet', function(packet, packetMeta) {
		switch (packetMeta.name) {
			case "update_health":
				client.write(new PacketMappingTable[NamedPackets.UpdateHealth](packet.health, packet.food, packet.foodSaturation).writePacket());
			break;

			case "update_time":
				client.write(new PacketMappingTable[NamedPackets.TimeUpdate](packet.time).writePacket());
			break;

			case "position":
				client.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](packet.x, packet.y + 1.6200000047683716, packet.y, packet.z, packet.yaw, packet.pitch, false).writePacket());
				proxyClient.write("teleport_confirm", {teleportId: packet.teleportId});
			break;

			case "player_info":
				for (let user of packet.data) {
					if (user.name != null) {
						if (user.name == "mc125") {
							proxyClient.myUUID = user.UUID;
						} else {
							playerInfo[user.UUID] = user;
							playerInfoKeys = Object.keys(playerInfo);
						}
					} else {
						playerInfo[user.UUID].ping = user.ping;
					}
				}
			break;

			case "chat":
				client.write(new PacketMappingTable[NamedPackets.ChatMessage](chatTextJsonToText(packet.message)).writePacket());
			break;

			case "update_light":
				//console.log(packet);
			break;

			case "map_chunk":
				if (!packet.groundUp || packet.chunkData.length == 0) return; // Need to handle non ground-up chunks

				AllocateChunk(client, packet.x, packet.z);
				ChunkData(socketId, packet);//, thisChunk);
			break;

			case "unload_chunk":
				AllocateChunk(client, packet.chunkX, packet.chunkZ, true);
			break;

			case "block_change":
				const block = BlockConverter(Block.fromStateId(packet.type));
				
				client.write(new PacketMappingTable[NamedPackets.BlockChange](
					packet.location.x,
					packet.location.y,
					packet.location.z,
					block[0],
					block[1]
				).writePacket());
			break;

			case "multi_block_change":
				//console.log(packet);
			break;

			case "update_sign":
				console.log(packet);
			break;

			case "open_window":
				//console.log(packet);
			break;

			case "window_items":
				//console.log(packet);
				let slotArray = [];
				for (let i = 0; i < packet.items.length; i++) {
					const slot = packet.items[i];
					if (!slot.present) slotArray.push(null);
					else slotArray.push([Block.fromStateId(slot.itemId).name, slot.itemCount, slot.nbtData]);
				}

				SendFullInventory(client, slotArray);
			break;

			case "update_view_position":

			break;

			case "spawn_entity_living":

			break;

			case "entity_metadata":

			break;

			case "tile_entity_data":
				//console.log(packet);
				switch (packet.action) {
					case 9:
						client.write(new PacketMappingTable[NamedPackets.UpdateSign](
							packet.location.x,
							packet.location.y,
							packet.location.z,
							jsonTextToSignText(packet.nbtData.value.Text1.value),
							jsonTextToSignText(packet.nbtData.value.Text2.value),
							jsonTextToSignText(packet.nbtData.value.Text3.value),
							jsonTextToSignText(packet.nbtData.value.Text4.value)
						).writePacket());
						//console.log(packet.nbtData.value);
					break;
				}
			break;

			case "combat_event":
				console.log(packet);
			break;

			case "spawn_position":
				client.shouldSendPos = true;
				client.write(new PacketMappingTable[NamedPackets.SpawnPosition](packet.location.x, packet.location.y, packet.location.z).writePacket());
				client.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](packet.location.x, packet.location.y + 1.6200000047683716, packet.location.y, packet.location.z, 0, 0, false).writePacket());
			break;

			case "named_entity_spawn":
				if (playerInfo[packet.playerUUID] != null) {
					(() => {
						const player = playerInfo[packet.playerUUID];
						playerByEntityId[packet.entityId] = player;
						player.entityId = packet.entityId;
						player.x = packet.x;
						player.y = packet.y;
						player.z = packet.z;
						player.lastX = packet.x;
						player.lastY = packet.y;
						player.lastZ = packet.z;
						player.yaw = packet.yaw;
						player.pitch = packet.pitch;
						
						const writer = new bufferStuff.Writer();
						writer.writeUByte(0x14);
						writer.writeInt(player.entityId);
						writer.writeString(player.name);
						writer.writeInt(Math.round(packet.x * 32));
						writer.writeInt(Math.round(packet.y * 32));
						writer.writeInt(Math.round(packet.z * 32));
						writer.writeByte(packet.yaw);
						writer.writeByte(packet.pitch);
						writer.writeShort(0);

						client.write(writer.buffer);
					})();
				}
			break;

			case "rel_entity_move":
				(() => {
					const player = playerByEntityId[packet.entityId];
					
					if (player != null) {
						// This is a player

						player.x = ((player.x * 4096) + packet.dX) / 4096;
						player.y = ((player.y * 4096) + packet.dY) / 4096;
						player.z = ((player.z * 4096) + packet.dZ) / 4096;
						const dX = player.x - player.lastX;
						const dY = player.y - player.lastY;
						const dZ = player.z - player.lastZ;
						player.lastX = player.x;
						player.lastY = player.y;
						player.lastZ = player.z;

						if (dX < -4 || dX > 4 || dY < -4 || dY > 4 || dZ < -4 || dZ > 4) {
							// Non relative for 1.2.5
							console.log("Player TELEPORT")
						} else {
							const writer = new bufferStuff.Writer(8);
							writer.writeUByte(0x1F);
							writer.writeInt(player.entityId);
							writer.writeByte(Math.floor(dX * 32));
							writer.writeByte(Math.floor(dY * 32));
							writer.writeByte(Math.floor(dZ * 32));

							client.write(writer.buffer);
						}
					} else {
						// This a normal entity
						
					}
				})();
			break;

			case "entity_move_look":
				(() => {
					const player = playerByEntityId[packet.entityId];

					if (player != null) {
						// This is a player

						player.x = ((player.x * 4096) + packet.dX) / 4096;
						player.y = ((player.y * 4096) + packet.dY) / 4096;
						player.z = ((player.z * 4096) + packet.dZ) / 4096;
						const dX = player.x - player.lastX;
						const dY = player.y - player.lastY;
						const dZ = player.z - player.lastZ;
						player.lastX = player.x;
						player.lastY = player.y;
						player.lastZ = player.z;

						if (dX < -4 || dX > 4 || dY < -4 || dY > 4 || dZ < -4 || dZ > 4) {
							// Non relative for 1.2.5
							console.log("Player TELEPORT")
						} else {
							const writer = new bufferStuff.Writer(10);
							writer.writeUByte(0x21);
							writer.writeInt(player.entityId);
							writer.writeByte(Math.floor(dX * 32));
							writer.writeByte(Math.floor(dY * 32));
							writer.writeByte(Math.floor(dZ * 32));
							writer.writeUByte(Math.round(((360 + packet.yaw) % 360) / 360 * 256));
							writer.writeUByte(Math.round(((360 + packet.pitch) % 360) / 360 * 256));

							client.write(writer.buffer);
						}
					} else {
						// This a normal entity
						
					}
				})();
			break;

			case "entity_look":
				(() => {
					const player = playerByEntityId[packet.entityId];

					if (player != null) {
						// This is a player

						const writer = new bufferStuff.Writer(7);
						writer.writeUByte(0x20);
						writer.writeInt(player.entityId);
						writer.writeUByte(Math.round(((360 + packet.yaw) % 360) / 360 * 256));
						writer.writeUByte(Math.round(((360 + packet.pitch) % 360) / 360 * 256));

						client.write(writer.buffer);
					} else {
						// This a normal entity
						
					}
				})();
			break;

			case "entity_head_rotation":
				(() => {
					const player = playerByEntityId[packet.entityId];

					if (player != null) {
						// This is a player

						//console.log(() / 256);

						const writer = new bufferStuff.Writer(6);
						writer.writeUByte(0x23);
						writer.writeInt(packet.entityId);
						writer.writeByte(packet.headYaw);

						client.write(writer.buffer);
					} else {
						// This a normal entity
						
					}
				})();
			break;

			case "entity_velocity":
				//console.log(packet);
				(() => {
					const player = playerByEntityId[packet.entityId];
					if (player) {
						console.log("PLAYER", packet.velocityX / 8000, packet.velocityY / 8000, packet.velocityZ / 8000);
						const writer = new bufferStuff.Writer(11);
						writer.writeUByte(0x1C);
						writer.writeInt(packet.entityId);
						writer.writeShort(packet.velocityX / 8000 * 32000);
						writer.writeShort(packet.velocityY / 8000 * 32000);
						writer.writeShort(packet.velocityZ / 8000 * 32000);
					}
				})();
			break;

			case "entity_teleport":
				(() => {
					const player = playerByEntityId[packet.entityId];
					if (player) {
						console.log(packet);
						const writer = new bufferStuff.Writer(19);
						writer.writeUByte(0x22);
						writer.writeInt(packet.entityId);
						writer.writeInt(Math.floor(packet.x * 32));
						writer.writeInt(Math.floor(packet.y * 32));
						writer.writeInt(Math.floor(packet.z * 32));
						writer.writeUByte(Math.round(((360 + packet.yaw) % 360) / 360 * 256));
						writer.writeUByte(Math.round(((360 + packet.pitch) % 360) / 360 * 256));

						client.write(writer.buffer);
					}
				})();
			break;

			case "block_action":
				console.log(packet);
				switch (packet.blockId) {
					// NoteBlock
					case 74:
						client.write(new PacketMappingTable[NamedPackets.BlockAction](packet.location.x, packet.location.y, packet.location.z, packet.byte1, packet.byte2).writePacket());

					case 100:
						client.write(new PacketMappingTable[NamedPackets.BlockAction](packet.location.x, packet.location.y, packet.location.z, packet.byte1, packet.byte2).writePacket());
				}
			break;

			case "entity_status":
				//console.log(packet);
			break;

			default:
				//console.log(packetMeta.name);
			break;
		}
	});

	return proxyClient;
}

server.listen(25565, () => console.log("lmao"));

// https://wiki.vg/index.php?title=Protocol&oldid=928

server.on("connection", (socket) => {
	let tickCounter = 0;
	let tickInterval = null;

	const socketId = socketArray.addAndReturnKey(socket);
	
	let proxyUsername = "";

	let proxyClient = null;

	let clientOnGround = true;

	socket.shouldSendPos = false;

	socket.on("data", (buffer) => {
		const reader = new bufferStuff.Reader(buffer);
		const packetID = reader.readUByte();
		switch (packetID) {
			case NamedPackets.KeepAlive:
				socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
			break;

			case NamedPackets.LoginRequest:
				if (proxyClient != null) return;
				LoginRequest(socket, reader);

				tickInterval = setInterval(() => {
					if (tickCounter % 20 == 0) {
						socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
					}
					tickCounter++;
				}, 1000 / 20);

				proxyClient = serverConnection(socket, socketId, proxyUsername);

				//setTimeout(() => shouldSendPos = true, 1000);
			break;

			case NamedPackets.Handshake:
				Handshake(socket, reader);
			break;

			case NamedPackets.ChatMessage:
				proxyClient.write('chat', {message: reader.readString()});
				//client.write(
				
			break;

			case NamedPackets.Player:
				clientOnGround = reader.readBool();
				proxyClient.write("flying", {onGround:clientOnGround});
			break;

			case NamedPackets.EntityAction:
				if (reader.readInt() == 0) {
					const actionID = reader.readUByte();
					switch (actionID) {
						// Crouch & Uncrouch
						case 1:
						case 2:

					}
				}
			break;

			case NamedPackets.PlayerPosition:
				if (!socket.shouldSendPos) return;
				x = reader.readDouble();
				y = reader.readDouble();
				reader.skipDouble(); // Couldn't care less about stance and neither could the modern server
				z = reader.readDouble();
				clientOnGround = reader.readBool();

				proxyClient.write("position", {x:x, y:y, z:z, onGround:clientOnGround});
			break;

			case NamedPackets.PlayerLook:
				if (!socket.shouldSendPos) return;
				yaw = reader.readFloat();
				pitch = reader.readFloat();
				clientOnGround = reader.readBool();

				proxyClient.write("look", {yaw:yaw, pitch:pitch, onGround:clientOnGround});
			break;

			case NamedPackets.PlayerPositionAndLook:
				if (!socket.shouldSendPos) return;
				x = reader.readDouble();
				y = reader.readDouble();
				reader.skipDouble(); // Couldn't care less about stance and neither could the modern server
				z = reader.readDouble();
				yaw = reader.readFloat();
				pitch = reader.readFloat();
				clientOnGround = reader.readBool();

				proxyClient.write("position_look", {x:x, y:y, z:z, yaw:yaw, pitch:pitch, onGround: clientOnGround});
			break;

			case NamedPackets.PlayerDigging:
				state = reader.readByte();
				x = reader.readInt();
				y = reader.readUByte();
				z = reader.readInt();
				face = reader.readUByte();

				if (state == 0 && state == 2) {
					proxyClient.write("block_dig", {status:state, location:{x:x, y:y, z:z}, face:face});
				} else {

				}
			break;
			
			case NamedPackets.Respawn:

			break;

			case NamedPackets.PlayerBlockPlacement:
				console.log(reader.buffer);
			break;

			case NamedPackets.Animation:
				EID = reader.readInt();
				animation = reader.readByte();

				if (animation == 1) {
					proxyClient.write("arm_animation", {hand:0});
				}
			break;

			case NamedPackets.HeldItemChange:
				slotId = reader.readShort();

				console.log(slotId);

				proxyClient.write("held_item_slot", {slot:slotId});
			break;

			case NamedPackets.ServerListPing:
				socket.write(new PacketMappingTable[NamedPackets.DisconnectOrKick]("JE Proxy Test§0§20").writePacket());
			break;

			case NamedPackets.DisconnectOrKick:
				if (proxyClient != null)
					proxyClient.end();
			break;

			default:
				console.log(packetID);
			break;
		}
	});

	function LoginRequest(socket, reader = new bufferStuff.Reader) {
		console.log(reader.buffer);
		if (reader.readInt() != 29)
			return socket.write(new PacketMappingTable[NamedPackets.DisconnectOrKick]("Incorrect game version! (Proxy version = 1.2.5)").writePacket());

		const username = reader.readString();

		if (proxyUsername != username)
			return socket.write(new PacketMappingTable[NamedPackets.DisconnectOrKick]("Client returned different username than in handshake (wtf?)").writePacket());

		const writer = new bufferStuff.Writer(34)
			.writeUByte(NamedPackets.LoginRequest) // Packet ID
			.writeInt(0)
			.writeString("") // Unused
			.writeString("default") // Level Type
			.writeInt(0) // Gamemode
			.writeInt(0) // Dimension
			.writeUByte(0) // Difficulty
			.writeUByte(0) // Unused
			.writeUByte(20); // Max players

		socket.write(writer.buffer);
	}

	function Handshake(socket, reader = new bufferStuff.Reader) {
		const username = reader.readString().split(";")[0];

		const writer = new bufferStuff.Writer(5)
			.writeUByte(NamedPackets.Handshake)
			.writeString("-");

		proxyUsername = username;

		socket.write(writer.buffer);
	}

	function dcErr(reason) {
		console.log("dc");
		if (proxyClient != null)
			proxyClient.end();
	}

	socket.on("close", dcErr);
	socket.on("error", dcErr);
});

function SendFullInventory(socket, data = [], inventorySize = 45) {
	const inventoryValues = new bufferStuff.Writer();

	for (let i = 0; i < Math.min(data.length, inventorySize); i++) {
		const slot = data[i];
		if (slot == null) inventoryValues.writeShort(-1);
		else {
			const block = BlockConverter(slot[0]);
			inventoryValues.writeShort(block[0])
				.writeByte(slot[1])
				.writeShort(0)
		}
	}

	const inventory = new bufferStuff.Writer()
		.writeUByte(0x68)
		.writeUByte(0)
		.writeUShort(Math.min(data.length, inventorySize))
		.writeBuffer(inventoryValues.buffer);

	socket.write(inventory.buffer);
}

function AllocateChunk(socket, x = 0, z = 0, unload = false) {
	const chunkAlloc = new bufferStuff.Writer()
		.writeUByte(0x32)
		.writeInt(x)
		.writeInt(z)
		.writeBool(!unload);

	socket.write(chunkAlloc.buffer);
}

function ChunkData(socketid, data = {}) { //modernChunk = new Chunk
	workPool.add([false, ["chunk", data, socketid, null]]);

	/*const biome = new bufferStuff.Writer(256);
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			biome.writeUByte(0);
		}
	}

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
					const block = BlockConverter(modernChunk.getBlock(new Vec3(x, y + (section << 4), z)));
					blocks.writeUByte(block[0])

					if (nibbleHack) {
						metadata.writeNibble(BlockConverter(modernChunk.getBlock(new Vec3(x - 1, y + (section << 4), z)))[1], block[1]);
						blockLight.writeNibble(15, 15);
						skyLight.writeNibble(15, 15);
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
	chunkData.writeBuffer(biome.buffer);

	deflate(chunkData.buffer, (err, deflated) => {
		if (err) throw err;

		const writer = new bufferStuff.Writer(22)
			.writeUByte(0x33) // ChunkData
			.writeInt(data.x) // X
			.writeInt(data.z) // Z
			.writeBool(data.groundUp) // Ground-up
			.writeUShort(65535) // Primary bit map
			.writeUShort(0) // Add bit map
			.writeUInt(deflated.length) // Compressed size
			.writeInt(0) // Unused
			.writeBuffer(deflated) // Chunk data (compressed)

		socket.write(writer.buffer);
	});*/
}
