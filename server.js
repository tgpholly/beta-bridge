const server = (require("net").Server)();
const mc = require('minecraft-protocol');
const Chunk = require("prismarine-chunk")("1.16.5");
const Vec3 = require("vec3");

server.listen(25565, () => console.log("lmao"));

// https://wiki.vg/index.php?title=Protocol&oldid=928

server.on("connection", (socket) => {

    /*const proxyClient = mc.createClient({
		host: "192.168.2.240",   // optional minecraft.eusv.ml
		port: 27896,         // optional
		username: "mcb1732",
		auth: 'mojang', // optional; by default uses mojang, if using a microsoft account, set to 'microsoft'
		version: "1.16.5"
	});

	let fixedPos = new Vec3(0, 0, 0);
	proxyClient.on('packet', function(packet, packetMeta) {
		//console.log(packetMeta.name);
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
				//socket.write(new PacketMappingTable[NamedPackets.SpawnPosition](packet.location.x, packet.location.y, packet.location.z).writePacket());
				//socket.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](packet.location.x, packet.location.y + 1.6200000047683716, packet.location.y, packet.location.z, 0, 0, false).writePacket());
			break;
		}
	});*/

    socket.on("data", (buffer) => {
        
    });

    function dcErr(reason) {

    }

    socket.on("close", dcErr);
    socket.on("error", dcErr);
});