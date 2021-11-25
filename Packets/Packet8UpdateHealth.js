/*
	========- Packet0KeepAlive.js -=========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet8UpdateHealth extends Packet {
	constructor(health = 0, food = 0, saturation = 0.0) {
		super(0x08);

		this.health = health;
		this.food = food;
		this.saturation = saturation;
	}

	writePacket() {
		super.writePacket();

		this.writer.writeShort(this.health);
		this.writer.writeShort(this.food);
		this.writer.writeFloat(this.saturation);

		return this.toBuffer();
	}
}

module.exports = Packet8UpdateHealth;