import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { ClimateHomebridgePlatform } from './platform';
export declare class SensorAccessory {
    private readonly platform;
    private readonly accessory;
    private temperatureService;
    private humidityService;
    constructor(platform: ClimateHomebridgePlatform, accessory: PlatformAccessory);
    getMetric(type: string): Promise<CharacteristicValue>;
}
//# sourceMappingURL=sensorAccessory.d.ts.map