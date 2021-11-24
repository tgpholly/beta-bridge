/*
	========- Packet4TimeUpdate.js -========
	  Created by Holly (tgpethan) (c) 2021
	  Licenced under MIT
	========================================
*/

const Packet = require("./Packet.js");

class Packet130UpdateSign extends Packet {
	constructor(x = 0, y = 0, z = 0, text1 = "", text2 = "", text3 = "", text4 = "") {
		super(0x82);

		this.x = x;
		this.y = y;
		this.z = z;
		this.text1 = text1;
		this.text2 = text2;
		this.text3 = text3;
		this.text4 = text4;
	}

	readPacket() {
		
	}

	writePacket() {
		super.writePacket();

		this.writer.writeInt(this.x);
		this.writer.writeShort(this.y);
		this.writer.writeInt(this.z);
		this.writer.writeString(this.text1);
		this.writer.writeString(this.text2);
		this.writer.writeString(this.text3);
		this.writer.writeString(this.text4);

		return this.toBuffer();
	}
}

module.exports = Packet130UpdateSign;