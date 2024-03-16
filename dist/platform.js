"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClimateHomebridgePlatform = void 0;
const settings_1 = require("./settings");
const humidifierAccessory_1 = require("./humidifierAccessory");
const sensorAccessory_1 = require("./sensorAccessory");
/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
class ClimateHomebridgePlatform {
    constructor(log, config, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.Service = this.api.hap.Service;
        this.Characteristic = this.api.hap.Characteristic;
        // this is used to track restored cached accessories
        this.accessories = [];
        this.log.debug('Finished initializing platform:', this.config.name);
        // When this event is fired it means Homebridge has restored all cached accessories from disk.
        // Dynamic Platform plugins should only register new accessories after this event was fired,
        // in order to ensure they weren't added to homebridge already. This event can also be used
        // to start discovery of new accessories.
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback');
            // run the method to discover / register your devices as accessories
            this.discoverDevices();
        });
    }
    /**
     * This function is invoked when homebridge restores cached accessories from disk at startup.
     * It should be used to setup event handlers for characteristics and update respective values.
     */
    configureAccessory(accessory) {
        this.log.info('Loading accessory from cache:', accessory.displayName);
        // add the restored accessory to the accessories cache so we can track if it has already been registered
        this.accessories.push(accessory);
    }
    /**
     * This is an example method showing how to register discovered accessories.
     * Accessories must only be registered once, previously created accessories
     * must not be registered again to prevent "duplicate UUID" errors.
     */
    discoverDevices() {
        // EXAMPLE ONLY
        // A real plugin you would discover accessories from the local network, cloud services
        // or a user-defined array in the platform config.
        const devices = [
            {
                uniqueId: 'humidifier',
                displayName: 'Humidifier',
            },
            {
                uniqueId: 'sensor',
                displayName: 'Sensor',
            },
        ];
        // loop over the discovered devices and register each one if it has not already been registered
        for (const device of devices) {
            // generate a unique id for the accessory this should be generated from
            // something globally unique, but constant, for example, the device serial
            // number or MAC address
            const uuid = this.api.hap.uuid.generate(device.uniqueId);
            // see if an accessory with the same uuid has already been registered and restored from
            // the cached devices we stored in the `configureAccessory` method above
            const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid);
            if (existingAccessory) {
                this.log.info('Restoring existing accessory from cache:', existingAccessory.displayName);
                this._getAccesory(existingAccessory.displayName, existingAccessory);
            }
            else {
                this.log.info('Adding new accessory:', device.displayName);
                const accessory = new this.api.platformAccessory(device.displayName, uuid);
                accessory.context.device = device;
                this._getAccesory(accessory.displayName, accessory);
                this.api.registerPlatformAccessories(settings_1.PLUGIN_NAME, settings_1.PLATFORM_NAME, [
                    accessory,
                ]);
            }
        }
    }
    _getAccesory(displayName, accessory) {
        if (displayName == 'Humidifier') {
            new humidifierAccessory_1.HumidifierAccessory(this, accessory);
        }
        else if (displayName == 'Sensor') {
            new sensorAccessory_1.SensorAccessory(this, accessory);
        }
    }
}
exports.ClimateHomebridgePlatform = ClimateHomebridgePlatform;
//# sourceMappingURL=platform.js.map