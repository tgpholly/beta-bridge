const Packet = require("./Packet.js");
const pRandom = require("../prettyRandom.js");

class Packet0KeepAlive extends Packet {
	writePacket() {
		super.writePacket();

		this.writer.writeInt(pRandom(0, 999999999));

		return this.toBuffer();
	}
}

module.exports = Packet0KeepAlive;