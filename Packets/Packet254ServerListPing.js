const Packet = require("./Packet.js");

class Packet254ServerListPing extends Packet {
	constructor() {
		super(0xFE);
	}

	writePacket() {
		super.writePacket();

		return this.toBuffer();
	}
}

module.exports = Packet254ServerListPing;