/*
	========- Packet4TimeUpdate.js -========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet54BlockAction extends Packet {
	constructor(x = 0, y = 0, z = 0, byte1 = 0, byte2 = 0) {
		super(0x36);

		this.x = x;
		this.y = y;
		this.z = z;
		this.byte1 = byte1;
		this.byte2 = byte2;
	}

	readPacket() {
		
	}

	writePacket() {
		super.writePacket();

		this.writer.writeInt(this.x);
		this.writer.writeShort(this.y);
		this.writer.writeInt(this.z);
		this.writer.writeByte(this.byte1);
		this.writer.writeByte(this.byte2);

		return this.toBuffer();
	}
}

module.exports = Packet54BlockAction;