"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumidifierAccessory = void 0;
const http_1 = require("http");
class HumidifierAccessory {
    constructor(platform, accessory) {
        this.platform = platform;
        this.accessory = accessory;
        this.states = { on: false };
        this.accessory
            .getService(this.platform.Service.AccessoryInformation)
            .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Default-Manufacturer')
            .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
            .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Default-Serial');
        // Humidifer Service
        this.service =
            this.accessory.getService(this.platform.Service.Switch) ||
                this.accessory.addService(this.platform.Service.Switch);
        this.service.setCharacteristic(this.platform.Characteristic.Name, 'Humidifier');
        this.service
            .getCharacteristic(this.platform.Characteristic.On)
            .onSet(this.setOn.bind(this))
            .onGet(this.getOn.bind(this));
        this.platform.config;
    }
    async setOn(value) {
        this.states.on = value;
        const req = (0, http_1.request)({
            hostname: this.platform.config.humidifier_ip,
            port: this.platform.config.humidifier_port,
            path: `/switch/kauf_plug/turn_${this.states.on ? 'on' : 'off'}`,
            method: 'POST',
        }, (res) => res.on('data', (d) => this.platform.log.debug(d)));
        req.on('error', (error) => this.platform.log.error(error.name + '\n' + error.message + '\n' + error.stack));
        req.end();
        this.platform.log.debug('Humidifier On ->', value);
    }
    async getOn() {
        this.platform.log.debug('Humidifier On ->', this.platform.config);
        return new Promise((resolve, reject) => {
            const req = (0, http_1.request)({
                hostname: this.platform.config.humidifier_ip,
                port: this.platform.config.humidifier_port,
                path: '/switch/kauf_plug',
                method: 'GET',
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    const json = JSON.parse(data);
                    this.states.on = json.value;
                    resolve(this.states.on);
                });
            });
            req.on('error', (error) => {
                reject(error.name + '\n' + error.message + '\n' + error.stack);
            });
            req.end();
        });
    }
}
exports.HumidifierAccessory = HumidifierAccessory;
//# sourceMappingURL=humidifierAccessory.js.map