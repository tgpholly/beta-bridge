/*
	========- Packet0KeepAlive.js -=========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet8UpdateHealth extends Packet {
	constructor(health = 0) {
		super(0x08);

		this.health = health;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeShort(this.health);

		return this.toBuffer();
	}
}

module.exports = Packet8UpdateHealth;