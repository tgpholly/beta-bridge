const server = (require("net").Server)();
var mc = require('minecraft-protocol');
const mineflayer = require("mineflayer");
const bufferStuff = require("./bufferStuff.js");

const PacketMappingTable = require("./PacketMappingTable.js");
const NamedPackets = require("./NamedPackets.js");

server.listen(25565, () => console.log("lmao"));

server.on("connection", (socket) => {
    console.log("connection");

    //piss


    //thisUser.loginFinished = true;

    // Send chunks
    for (let x = -3; x < 4; x++) {
        for (let z = -3; z < 4; z++) {
            //global.chunkManager.multiBlockChunk(x, z, thisUser);
        }
    }

    // Send this user to other online user
    //global.sendToAllPlayersButSelf(thisUser.id, new PacketMappingTable[NamedPackets.NamedEntitySpawn](thisUser.id, thisUser.username, thisUser.entityRef.x, thisUser.entityRef.y, thisUser.entityRef.z, thisUser.entityRef.yaw, thisUser.entityRef.pitch, 0).writePacket());

    // send all online users to this user
    /*for (let key of netUserKeys) {
        if (key == thisUser.id) continue;
        const user = netUsers[key];

        socket.write(new PacketMappingTable[NamedPackets.NamedEntitySpawn](user.id, user.username, user.entityRef.x, user.entityRef.y, user.entityRef.z, user.entityRef.yaw, user.entityRef.pitch, 0).writePacket());
    }*/

    socket.on("data", function(chunk) {
        //console.log(chunk);
        const reader = new bufferStuff.Reader(chunk);

        switch (reader.readByte()) {
            case NamedPackets.LoginRequest:
                socket.write(new PacketMappingTable[NamedPackets.LoginRequest](reader.readInt(), reader.readString(), global.chunkManager.seed, reader.readByte()).writePacket(thisUser.id));
                socket.write(new PacketMappingTable[NamedPackets.SpawnPosition]().writePacket());

                /*for (let x = -3; x < 4; x++) {
                    for (let z = -3; z < 4; z++) {
                        socket.write(new PacketMappingTable[NamedPackets.PreChunk](x, z, true).writePacket());
                    }
                }*/

                socket.write(new PacketMappingTable[NamedPackets.PreChunk](0, 0, true).writePacket());

                // Place a layer of glass under the player so they don't fall n' die
                for (let x = 0; x < 16; x++) {
                    for (let z = 0; z < 16; z++) {
                        socket.write(new PacketMappingTable[NamedPackets.BlockChange](x, 64, z, 3, 0).writePacket());
                    }
                }

                socket.write(new PacketMappingTable[NamedPackets.Player](true).writePacket());

                socket.write(new PacketMappingTable[NamedPackets.SetSlot](0, 36, 3, 64, 0).writePacket());

                socket.write(new PacketMappingTable[NamedPackets.PlayerPositionAndLook](8.5, 65 + 1.6200000047683716, 65, 8.5, 0, 0, false).writePacket());
            break;
        }
    });

    socket.on("end", function() {
        console.log("dc");
    });
});