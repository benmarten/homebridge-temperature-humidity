import { Service, PlatformAccessory, CharacteristicValue } from 'homebridge'
import { ClimateHomebridgePlatform } from './platform'
import { request } from 'http'

export class HumidifierAccessory {
  private service: Service
  private states = { on: false }

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
    this.service =
      this.accessory.getService(this.platform.Service.Switch) ||
      this.accessory.addService(this.platform.Service.Switch)
    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      'Humidifier'
    )
    this.service
      .getCharacteristic(this.platform.Characteristic.On)
      .onSet(this.setOn.bind(this))
      .onGet(this.getOn.bind(this))

    this.platform.config
  }

  async setOn(value: CharacteristicValue) {
    this.states.on = value as boolean

    const req = request(
      {
        hostname: this.platform.config.humidifier_ip,
        port: this.platform.config.humidifier_port,
        path: `/switch/kauf_plug/turn_${this.states.on ? 'on' : 'off'}`,
        method: 'POST',
      },
      (res) => res.on('data', (d) => this.platform.log.debug(d))
    )
    req.on('error', (error) =>
      this.platform.log.error(
        error.name + '\n' + error.message + '\n' + error.stack
      )
    )
    req.end()

    this.platform.log.debug('Humidifier On ->', value)
  }

  async getOn(): Promise<CharacteristicValue> {
    this.platform.log.debug('Humidifier On ->', this.platform.config)

    return new Promise((resolve, reject) => {
      const req = request(
        {
          hostname: this.platform.config.humidifier_ip,
          port: this.platform.config.humidifier_port,
          path: '/switch/kauf_plug',
          method: 'GET',
        },
        (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })
          res.on('end', () => {
            const json = JSON.parse(data)
            this.states.on = json.value
            resolve(this.states.on)
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
