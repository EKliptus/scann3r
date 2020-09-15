const WebServer = require('./modules/WebServer.js');
const WebSocket = require('./modules/WebSocket.js');
const Stepper = require('./modules/Stepper.js');
const Camera = require('./modules/Camera.js');
const Registry = require('./lib/Registry.js');
const Config = require('./lib/Config.js');
const Redis = require('async-redis');
const Gpio = require('onoff').Gpio;

let gpio = {};

(async () => {

    const registry = new Registry();
    const config = new Config('../../config.js', registry);

    gpio = {
        light1: new Gpio(config.data.light.pins[0], 'out'),
        light2: new Gpio(config.data.light.pins[1], 'out'),
        turntableStep: new Gpio(config.data.turntable.step, 'out'),
        turntableDir: new Gpio(config.data.turntable.dir, 'out'),
        turntableEnable: new Gpio(config.data.turntable.enable, 'out'),
        rotorStep: new Gpio(config.data.rotor.step, 'out'),
        rotorDir: new Gpio(config.data.rotor.dir, 'out'),
        rotorEnable: new Gpio(config.data.rotor.enable, 'out'),
    }


    registry.set('config', config);
    registry.set('redis', Redis.createClient(config.data.redis));
    await config.loadValues();
    registry.set('gpio', gpio);

    registry.set('turntable', new Stepper(config.data.turntable, gpio.turntableStep, gpio.turntableDir, gpio.turntableEnable));
    registry.set('rotor', new Stepper(config.data.rotor, gpio.rotorStep, gpio.rotorDir, gpio.rotorEnable));
    registry.set('camera', new Camera(registry));
    registry.set('webServer', new WebServer(registry));
    registry.set('webSocket', new WebSocket(registry));

})();


process.on('SIGINT', _ => {

    for (let n in gpio) {
        gpio[n].unexport();
    }
});