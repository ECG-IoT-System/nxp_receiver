module.exports = class Packet {
  constructor(data, options) {
    this.id = data.readUInt8(0, 1);
    this.sequence = data.readUInt8(1, 1);
    this.hour = data.readUInt8(2, 1);
    this.minute = data.readUInt8(3, 1);
    this.second = data.readUInt8(4, 1);
    this.millisecond = data.readUInt16BE(5, 2);
    this.debug = data.readUInt8(7, 1);
    this.body = data.slice(8);
    this.data = data;

    this.parse();
  }

  parse_nxp_packet() {
    for (var i = 0; i < 30; i++) {
      this.ecgSignal.push(this.body.readInt16BE(2 * i, 2) / 32768 * 1.5 * 1.2);
    }
  }

  get() {
    return this.ecgSignal;
  }

  getGsensor(){
    return this.gSensor;
  }

  print() {
    // if (this.sequence == 1) {
    //   console.log('\x1b[33mid\tseq\thr\tmin\tsec\tms\tdebug\x1b[0m');
    // }

    var color = this.sequence <= 3 ? 32 : this.sequence == 255 ? 35 : 31;
    // console.log(
    //   `\x1b[${color}m${this.id}\t${this.sequence}\t${this.hour}\t${this.minute}\t${this.second}\t${this.millisecond}\t${
    //     this.debug
    //   }\x1b[0m`,
    // );

    // console.log(this.data);
  }

  getTime() {
    return new Date().setUTCHours(this.hour, this.minute, this.second, this.millisecond);
  }

  parse() {
    this.ecgSignal = [];
    this.gSensor = [];

    switch (this.sequence) {
      case 1:
      case 2:
        for (var i = 0; i < 120; i++) {
          this.ecgSignal.push(this.body.readInt16BE(2 * i, 2) / 72.2);
        }

        break;
      case 3:
        for (var i = 0; i < 16; i++) {
          this.ecgSignal.push(this.body.readInt16BE(2 * i, 2) / 72.2);
        }
        for (var i = 0; i < 30; i++) {
          this.gSensor.push((this.body.readInt8(32 + i, 2) * 15.6) / 1000);
        }
        break;
    }
  }
};
