const Packet = require("./Packet.js");

class Packet6SpawnPosition extends Packet {
    constructor(x = 0, y = 0, z = 0) {
        super(0x06);

        this.x = x;
        this.y = y;
        this.z = z;
    }

    writePacket() {
        super.writePacket();

        this.writer.writeInt(Math.floor(this.x))
                   .writeInt(Math.floor(this.y))
                   .writeInt(Math.floor(this.z));

        return this.toBuffer();
    }
}

module.exports = Packet6SpawnPosition;