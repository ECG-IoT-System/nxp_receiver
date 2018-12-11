const errors = require('../config/errors');
const Characteristic = require('./characteristic');

module.exports = class Peripheral {
  constructor(peripheral) {
    this.uuid = peripheral.uuid;
    this.address = peripheral.address;
    this.peripheral = peripheral;
  }

  connect() {
    this.peripheral.once('connect', function(a) {
      console.log('\x1b[32m[Peripheral]\x1b[0m Connect', this.address);
    });

    this.peripheral.once('disconnect', function(a) {
      console.log('\x1b[31m[Peripheral]\x1b[0m Disconnect', this.address);
    });

    return new Promise((resolve, reject) => {
      this.peripheral.connect(err => {
        if (err) return errors('ConnectionError: ' + err + ' on peripheral ' + this.address);
        resolve();
      });
    });
  }

  find(svcUuids, chrUuids) {
    function reducer(obj, svc) {
      switch (svc.constructor.name) {
        case 'Characteristic':
          obj[svc.uuid] = new Characteristic(svc);
          break;
        default:
          obj[svc.uuid] = svc;
      }
      return obj;
    }

    return new Promise((resolve, reject) => {
      this.peripheral.discoverSomeServicesAndCharacteristics(svcUuids, chrUuids, function(err, svcs, chrs) {
        resolve({
          svcs: svcs ? svcs.reduce(reducer, {}) : {},
          chrs: chrs ? chrs.reduce(reducer, {}) : {},
        });
      });
    });
  }
};
