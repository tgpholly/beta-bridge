const Packet = require("./Packet.js");

class Packet255Kick extends Packet {
	constructor(reason = "") {
		super(0xFF);

		this.reason = reason;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeString(this.reason);

		return this.toBuffer();
	}
}

module.exports = Packet255Kick;