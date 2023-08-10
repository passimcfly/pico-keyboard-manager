import { SerialPort } from 'serialport';

export class Serial {
    private static instance: Serial;

    public connection!: SerialPort;
    
    private constructor(ports: any[]) {
      // Private constructor to prevent instantiation from outside
      const port = ports.find((port) => port.vendorId === "239A") // CircuitPython vendorId

      if(!port) {
        throw new Error("No Connection to keyboard")
      }
      
      this.connection = new SerialPort({path: port.path, baudRate: 9600})
    }

    public async reconnect() {
      const ports = await SerialPort.list()
        const serial = new Serial(ports)
        this.connection = serial.connection
        Serial.instance = this
        return Serial.instance
    }
    
    public static async getInstance(): Promise<Serial> {
      if (!Serial.instance) {
        const ports = await SerialPort.list()
        const serial = new Serial(ports)
        Serial.instance = serial
      }

      return Serial.instance;
    }

    public static regReadEvent(serial: Serial): string | null {
        const strData = Buffer.from(serial.connection.read()).toString()        
        const [ident, data] = strData.split("|")

        if(ident === "PicoBoard") {
          return data.replaceAll("'", '"')
        }
        return null
    }
}