const Packet = require("./Packet.js");

class Packet13PlayerPositionAndLook extends Packet {
    constructor(x = 0, stance = 0, y = 0, z = 0, yaw = 0.0, pitch = 0.0) {
        super(0x0D);

        this.x = x;
        this.stance = stance;
        this.y = y;
        this.z = z;
        this.yaw = yaw;
        this.pitch = pitch;
    }

    writePacket() {
        super.writePacket();

        this.writer.writeDouble(this.x)
                   .writeDouble(this.y)
                   .writeDouble(this.stance)
                   .writeDouble(this.z)
                   .writeFloat(this.yaw)
                   .writeFloat(this.pitch)
                   .writeBool(true)

        return this.toBuffer();
    }
}

module.exports = Packet13PlayerPositionAndLook;