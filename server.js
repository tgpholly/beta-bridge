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

function serverConnection(client) {
	let proxyClient = mc.createClient({
		host: "192.168.2.240",   // optional minecraft.eusv.ml
		port: 27896,         // optional
		username: "mc125",
		auth: 'mojang', // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
		version: "1.16.5"
	});

	proxyClient.on('packet', function(packet, packetMeta) {
		switch (packetMeta.name) {
			case "update_health":
				//socket.write(new PacketMappingTable[NamedPackets.UpdateHealth](packet.health + 1).writePacket());
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
					if (user.name == "mc125") {
						proxyClient.myUUID = user.UUID;
					}
				}
			break;

			case "chat":
				//socket.write(new PacketMappingTable[NamedPackets.ChatMessage](Converter.jsonTextToText(packet.message)).writePacket());
			break;

			case "update_light":

			break;

			case "map_chunk":
				const thisChunk = new Chunk();

				if (!packet.groundUp || packet.chunkData.length == 0) return;

				thisChunk.load(packet.chunkData, packet.bitMap, false, packet.groundUp);

				ChunkData(client, packet, thisChunk);
			break;

			case "unload_chunk":
				AllocateChunk(client, packet.chunkX, packet.chunkZ, true);
			break;

			case "block_change":
				const block = Block.fromStateId(packet.type);
				//console.log(block);
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

				console.log(slotArray);
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

			case "combat_event":
				console.log(packet);
			break;

			case "spawn_position":
				client.write(new PacketMappingTable[NamedPackets.SpawnPosition](packet.location.x, packet.location.y, packet.location.z).writePacket());
				client.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](packet.location.x, packet.location.y + 1.6200000047683716, packet.location.y, packet.location.z, 0, 0, false).writePacket());
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
	
	let proxyUsername = "";

	let proxyClient = null;

	let clientOnGround = true;

	let shouldSendPos = false;

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

				proxyClient = serverConnection(socket);

				setTimeout(() => shouldSendPos = true, 1000);
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
				if (!shouldSendPos) return;
				x = reader.readDouble();
				y = reader.readDouble();
				reader.readDouble();
				z = reader.readDouble();
				proxyClient.write("position", {x:x, y:y, z:z, onGround:clientOnGround});
			break;

			case NamedPackets.PlayerLook:
				if (!shouldSendPos) return;
				yaw = reader.readFloat();
				pitch = reader.readFloat();
				proxyClient.write("look", {yaw:yaw, pitch:pitch});
			break;

			case NamedPackets.PlayerPositionAndLook:
				if (!shouldSendPos) return;
				x = reader.readDouble();
				y = reader.readDouble();
				reader.readDouble();
				z = reader.readDouble();
				yaw = reader.readFloat();
				pitch = reader.readFloat();
				proxyClient.write("position_look", {x:x, y:y, z:z, yaw:yaw, pitch:pitch, onGround: clientOnGround});
			break;

			case NamedPackets.PlayerBlockPlacement:
				
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
			.writeInt(1) // Gamemode
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

function AllocateChunk(socket, x = 0, z = 0, unload = false) {
	const chunkAlloc = new bufferStuff.Writer()
		.writeUByte(0x32)
		.writeInt(x)
		.writeInt(z)
		.writeBool(!unload);

	socket.write(chunkAlloc.buffer);
}

function ChunkData(socket, data = {}, modernChunk = new Chunk) {
	AllocateChunk(socket, data.x, data.z);

	const biome = new bufferStuff.Writer(256);
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
	});
}