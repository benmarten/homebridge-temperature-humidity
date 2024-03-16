import { PlatformAccessory, CharacteristicValue } from 'homebridge';
import { ClimateHomebridgePlatform } from './platform';
export declare class HumidifierAccessory {
    private readonly platform;
    private readonly accessory;
    private service;
    private states;
    constructor(platform: ClimateHomebridgePlatform, accessory: PlatformAccessory);
    setOn(value: CharacteristicValue): Promise<void>;
    getOn(): Promise<CharacteristicValue>;
}
//# sourceMappingURL=humidifierAccessory.d.ts.map