import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge'
import { ClimateHomebridgePlatform } from './platform'
import { request } from 'http'

export class SensorAccessory {
  private temperatureService: Service
  private humidityService: Service

  constructor(
    private readonly platform: ClimateHomebridgePlatform,
    private readonly accessory: PlatformAccessory
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        'Default-Manufacturer'
      )
      .setCharacteristic(this.platform.Characteristic.Model, 'Default-Model')
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        'Default-Serial'
      )

    // Humidifer Service
    this.temperatureService =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor)
    this.temperatureService.setCharacteristic(
      this.platform.Characteristic.Name,
      'Temperature'
    )
    this.temperatureService
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getMetric.bind(this, 'temperature'))

    this.humidityService =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor)
    this.humidityService.setCharacteristic(
      this.platform.Characteristic.Name,
      'Humidity'
    )
    this.humidityService
      .getCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity)
      .onGet(this.getMetric.bind(this, 'humidity'))
  }

  async getMetric(type: string): Promise<CharacteristicValue> {
    return new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: this.platform.config.sensor_ip,
          port: this.platform.config.sensor_port,
          path: '/',
          method: 'GET',
        },
        (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })
          res.on('end', () => {
            const json = JSON.parse(data)
            resolve(parseFloat(json[type]))
          })
        }
      )
      req.on('error', (error) => {
        reject(error.name + '\n' + error.message + '\n' + error.stack)
      })
      req.end()
    })
  }
}
