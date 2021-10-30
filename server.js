const server = (require("net").Server)();
const { deflate } = require("zlib");
const bufferStuff = require("./bufferStuff.js");
const pRandom = require("./prettyRandom.js");
const mc = require('minecraft-protocol');
const Chunk = require("prismarine-chunk")("1.16.5");
const Vec3 = require("vec3");
const NamedPackets = require("./NamedPackets.js");
const PacketMappingTable = require("./PacketMappingTable.js");
const BlockConverter = require("./BlockConverter.js");

function serverConnection(client) {
	const proxyClient = mc.createClient({
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
				//socket.write(new PacketMappingTable[NamedPackets.TimeUpdate](packet.time).writePacket());
			break;

			case "position":
				//socket.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](packet.x, packet.y + 1.6200000047683716, packet.y, packet.z, packet.yaw, packet.pitch, false).writePacket());
				//proxyClient.write("teleport_confirm", {teleportId: packet.teleportId});
			break;

			case "player_info":

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

	socket.on("data", (buffer) => {
		const reader = new bufferStuff.Reader(buffer);
		const packetID = reader.readUByte();
		switch (packetID) {
			case NamedPackets.KeepAlive:
				socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
			break;

			case NamedPackets.LoginRequest:
				LoginRequest(socket, reader);

				tickInterval = setInterval(() => {
					if (tickCounter % 20 == 0) {
						socket.write(new PacketMappingTable[NamedPackets.KeepAlive]().writePacket());
					}
					tickCounter++;
				}, 1000 / 20);

				proxyClient = serverConnection(socket);
			break;

			case NamedPackets.Handshake:
				Handshake(socket, reader);
			break;

			case NamedPackets.PlayerPosition:

			break;

			case NamedPackets.ServerListPing:
				socket.write(new PacketMappingTable[NamedPackets.DisconnectOrKick]("JE Proxy Test§0§20").writePacket());
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

function ChunkData(socket, data = {}, modernChunk = new Chunk) {
	const chunkAlloc = new bufferStuff.Writer()
		.writeUByte(0x32)
		.writeInt(data.x << 4)
		.writeInt(data.z << 4)
		.writeBool(true)

	socket.write(chunkAlloc.buffer);

	const biome = new bufferStuff.Writer(256);
	for (let x = 0; x < 16; x++) {
		for (let z = 0; z < 16; z++) {
			biome.writeUByte(0);
		}
	}

	const chunkData = new bufferStuff.Writer();

	for (let section = 0; section < 4; section++) {
		const blocks = new bufferStuff.Writer(4096);
		const metadata = new bufferStuff.Writer(2048);
		const blockLight = new bufferStuff.Writer(2048);
		const skyLight = new bufferStuff.Writer(2048);

		let nibbleHack = false;
		for (let x = 0; x < 16; x++) {
			for (let z = 0; z < 16; z++) {
				for (let y = 0; y < 16; y++) {
					const block = BlockConverter(modernChunk.getBlock(new Vec3(x, y + (section << 4), z)));
					blocks.writeUByte(block[0])

					if (nibbleHack) {
						metadata.writeNibble(block[1], BlockConverter(modernChunk.getBlock(new Vec3(x, y + (section << 4), z)))[1]);
						blockLight.writeNibble(15, 15);
						skyLight.writeNibble(15, 15);
					}
					nibbleHack = !nibbleHack;
				}
			}
		}

		chunkData.writeBuffer(blocks.buffer);
		chunkData.writeBuffer(metadata.buffer);
		chunkData.writeBuffer(blockLight.buffer);
		chunkData.writeBuffer(skyLight.buffer);
	}
	chunkData.writeBuffer(biome.buffer);

	deflate(chunkData.buffer, (err, deflated) => {
		if (err) throw err;

		const writer = new bufferStuff.Writer(19)
			.writeUByte(0x33) // ChunkData
			.writeInt(data.x << 4)
			.writeInt(data.z << 4)
			.writeBool(data.groundUp)
			.writeUByte(15)
			.writeInt(deflated.length)
			.writeInt(0)
			.writeBuffer(deflated)

		socket.write(writer.buffer);
	});
}