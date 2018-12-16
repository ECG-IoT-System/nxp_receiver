var noble = require('noble');
var connect = require('./controllers/connect');
const errors = require('./config/errors');

const ECHO_SERVICE_UUID = 'fff0';
const ECHO_CHARACTERISTIC_UUID = 'fff2';

noble.on('stateChange', function(state) {
  console.log('state change: ', state);
  if (state === 'poweredOn') {
    setInterval(function() {
      noble.stopScanning();
      noble.startScanning([], false, function(err) {
        if (err) errors('ScanningError: ' + err);
      });
    }, 1000);
  } else {
    console.log('not scanning');
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
//NXP_QPP
//SimpleBLEPeripheral
  if (peripheral.advertisement.localName !== 'NXP_QPP') return;
  console.log('Discovered: ' + peripheral.address, peripheral.advertisement.localName);

  noble.stopScanning();
  //connectAndSetUp(peripheral);
  connect(peripheral);
});

function connectAndSetUp(peripheral) {

  peripheral.connect(error => {
    console.log('Connected to', peripheral.id);

    // specify the services and characteristics to discover
    const serviceUUIDs = [ECHO_SERVICE_UUID];
    const characteristicUUIDs = [ECHO_CHARACTERISTIC_UUID];

    peripheral.discoverSomeServicesAndCharacteristics(
        serviceUUIDs,
        characteristicUUIDs,
        onServicesAndCharacteristicsDiscovered
    );
  });
  
  peripheral.on('disconnect', () => console.log('disconnected'));
}

function onServicesAndCharacteristicsDiscovered(error, services, characteristics) {
  console.log('Discovered services and characteristics');
  const echoCharacteristic = characteristics[0];

  // data callback receives notifications
  echoCharacteristic.on('data', (data, isNotification) => {
    console.log('Received: "' + data + '"');
  });
  
  // subscribe to be notified whenever the peripheral update the characteristic
  echoCharacteristic.subscribe(error => {
    if (error) {
      console.error('Error subscribing to echoCharacteristic');
    } else {
      console.log('Subscribed for echoCharacteristic notifications');
    }
  });

  // create an interval to send data to the service
  let count = 0;
  setInterval(() => {
    count++;
    const message = new Buffer('hello, ble ' + count, 'utf-8');
    console.log("Sending:  '" + message + "'");
    echoCharacteristic.write(message);
  }, 2500);
}


noble.on('warning', function(message) {
  console.warn('\x1b[33m[Warn]\x1b[0m', message);
});

noble.on('unknown', function(message) {
  console.warn('\x1b[33m[Unknown]\x1b[0m', message);
});

noble.on('scanStart', function() {
  console.log('start scanning');
});

noble.on('scanStop', function() {
  console.log('stop scanning');
});
