const Peripheral = require('../models/peripheral');
const Characteristic = require('../models/characteristic');


var list = [];

module.exports = async function(peripheral) {
  if (list.indexOf(peripheral.address) > -1)
    return console.log('[Peripheral] Duplication connection', peripheral.address);


  peripheral.once('connect', function(a) {
    list.push(peripheral.address);
    console.log('\x1b[36m', list, '\x1b[0m');

  });

  peripheral.once('disconnect', function(a) {
    var index = list.indexOf(peripheral.address);
    if (index > -1) {
      list.splice(index, 1);
    }
    console.log('\x1b[36m', list, '\x1b[0m');

  });

  peripheral = new Peripheral(peripheral);

  // connect peripheral
  //
  // peripheral discover service fff0
  //
  // service fff0 discover chars fff1, fff2 , fff3, fff4
  //
  // fff1.write 03
  // fff1.read
  //
  // fff1.write 00
  // fff1.read
  //
  // fff1.write time
  // fff1.read
  //
  // fff4.notify
  // fff3.set ff
  //

  // svc stands for service
  // chr stands for characteristic
  //
  // ---
  // fff2.notify
  //
  // timer.start
  // fff1.write 00
  // fff2.read.notify
  // timer.end
  //
  // fff1.write time(tick-diff, hour, tick-start)
  // fff2.read notify (< ms)
  //
  // fff4.notify
  // fff3.set ff

  await peripheral.connect();
  console.log('connect');

  var svcUuids = ['fff0'];
  var chrUuids = ['fff1', 'fff2', 'fff3', 'fff4'];

  var p = await peripheral.find(svcUuids, chrUuids);

  var f1 = p.chrs['fff1'];
  var f2 = p.chrs['fff2'];
  var f3 = p.chrs['fff3'];
  var f4 = p.chrs['fff4'];

  let mac = peripheral.address.replace(/:/g, '');
  console.log(mac);
  f2.notify((data, isNotification) => {
    console.log(data);
  });

};
