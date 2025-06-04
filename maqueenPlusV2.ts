
const enum PatrolSpeed {
    //% block="1"
    Speed1 = 1,
    //% block="2"
    Speed2 = 2,
    //% block="3"
    Speed3 = 3,
    //% block="4"maqueenPlusV2.readLightIntensity(DirectionType.Left)
    Speed4 = 4,
    //% block="5"
    Speed5 = 5,
}

/**
 * Custom graphic block
 */
//% weight=100 color=#0fbc11 icon="\uf067" block="MaqueenPlusV2&V3"
//% groups="['V3']"
namespace maqueenPlusV2 {

    //Motor selection enumeration
    export enum MyEnumMotor {
        //% block="left motor"
        LeftMotor,
        //% block="right motor"
        RightMotor,
        //% block="all motor"
        AllMotor,
    };

    //PID interruption
    export enum MyInterruption {
        //% block="Allow interruption"
        Allowed,
        //% block="No interruptions allowed"
        NotAllowed,
    };

    //Motor direction enumeration selection
    export enum MyEnumDir {
        //% block="rotate forward"
        Forward,
        //% block="backward"
        Backward,
    };

    //LED light selection enumeration
    export enum MyEnumLed {
        //% block="left led light"
        LeftLed,
        //% block="right led light"
        RightLed,
        //% block="all led light"
        AllLed,
    };

    //LED light switch enumeration selection
    export enum MyEnumSwitch {
        //% block="close"
        Close,
        //% block="open"
        Open,
    };

    //Line sensor selection
    export enum MyEnumLineSensor {
        //% block="L2"
        SensorL2,
        //% block="L1"
        SensorL1,
        //% block="M"
        SensorM,
        //% block="R1"
        SensorR1,
        //% block="R2"
        SensorR2,
    };
    /**
     * Well known colors for a NeoPixel strip
     */
    export enum NeoPixelColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }
    
    export enum CarLightColors {
        //% block=red
        Red = 1,
        //% block=green
        Green = 2,
        //% block=yellow
        Yellow = 3,
        //% block=blue
        Blue = 4,
        //% block=purple
        Purple = 5,
        //% block=cyan
        Cyan = 6,
        //% block=white
        White = 7,
        //% block=black
        Black = 0
    }

    const I2CADDR = 0x10;
    const ADC0_REGISTER = 0X1E;
    const ADC1_REGISTER = 0X20;
    const ADC2_REGISTER = 0X22;
    const ADC3_REGISTER = 0X24;
    const ADC4_REGISTER = 0X26;
    const LEFT_LED_REGISTER = 0X0B;
    const RIGHT_LED_REGISTER = 0X0C;
    const LEFT_MOTOR_REGISTER = 0X00;
    const RIGHT_MOTOR_REGISTER = 0X02;
    const LINE_STATE_REGISTER = 0X1D;
    const VERSION_CNT_REGISTER = 0X32;
    const VERSION_DATA_REGISTER = 0X33;
    
    let irstate: number;
    let neopixel_buf = pins.createBuffer(16 * 3);
    for (let i = 0; i < 16 * 3; i++) {
        neopixel_buf[i] = 0
    }
    let _brightness = 255
    let state: number;

    /**
     *  Init I2C until success
     */

    //% weight=100
    //%block="initialize via I2C until success"
    export function I2CInit(): void {
        let Version_v = 0;
        //V3 systemReset
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 0x49;
        allBuffer[1] = 1;
        pins.i2cWriteBuffer(I2CADDR, allBuffer); 
        basic.pause(100);//waiting  reset

        pins.i2cWriteNumber(I2CADDR, 0x32, NumberFormat.Int8LE);
        Version_v = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        while (Version_v == 0) {
            basic.showLeds(`
                # . . . #
                . # . # .
                . . # . .
                . # . # .
                # . . . #
                `, 10)
            basic.pause(500)
            basic.clearScreen()
            pins.i2cWriteNumber(0x10, 0x32, NumberFormat.Int8LE);
            Version_v = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        }
        basic.showLeds(`
                . . . . .
                . . . . #
                . . . # .
                # . # . .
                . # . . .
                `, 10)
        basic.pause(500)
        basic.clearScreen()
    }

    /**
     * Control motor module running
     * @param emotor Motor selection enumeration
     * @param edir   Motor direction selection enumeration
     * @param speed  Motor speed control, eg:100
     */

    //% block="set %emotor direction %edir speed %speed"
    //% speed.min=0 speed.max=255
    //% weight=99
    export function controlMotor(emotor:MyEnumMotor, edir:MyEnumDir, speed:number):void{
        switch(emotor){
            case MyEnumMotor.LeftMotor:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = edir;
                leftBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, leftBuffer);
            break;
            case MyEnumMotor.RightMotor:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = edir;
                rightBuffer[2] = speed;
                pins.i2cWriteBuffer(I2CADDR, rightBuffer);
            break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = edir;
                allBuffer[2] = speed;
                allBuffer[3] = edir;
                allBuffer[4] = speed;
                pins.i2cWriteBuffer(I2CADDR, allBuffer)
            break;   
        }
    }

    /**
     * Control the motor module to stop running
     * @param emotor Motor selection enumeration
     */

    //% block="set %emotor stop"
    //% weight=98
    export function controlMotorStop(emotor:MyEnumMotor):void{
        switch (emotor) {
            case MyEnumMotor.LeftMotor:
                let leftBuffer = pins.createBuffer(3);
                leftBuffer[0] = LEFT_MOTOR_REGISTER;
                leftBuffer[1] = 0;
                leftBuffer[2] = 0;
                pins.i2cWriteBuffer(I2CADDR, leftBuffer);
                break;
            case MyEnumMotor.RightMotor:
                let rightBuffer = pins.createBuffer(3);
                rightBuffer[0] = RIGHT_MOTOR_REGISTER;
                rightBuffer[1] = 0;
                rightBuffer[2] = 0;
                pins.i2cWriteBuffer(I2CADDR, rightBuffer);
                break;
            default:
                let allBuffer = pins.createBuffer(5);
                allBuffer[0] = LEFT_MOTOR_REGISTER;
                allBuffer[1] = 0;
                allBuffer[2] = 0;
                allBuffer[3] = 0;
                allBuffer[4] = 0;
                pins.i2cWriteBuffer(I2CADDR, allBuffer)
                break;
        }
    }

    /**
     * Control left and right LED light switch module
     * @param eled LED lamp selection
     * @param eSwitch Control LED light on or off
     */

    //% block="control %eled %eSwitch"
    //% weight=97
    export function controlLED(eled:MyEnumLed, eSwitch:MyEnumSwitch):void{
        switch(eled){
            case MyEnumLed.LeftLed:
                let leftLedControlBuffer = pins.createBuffer(2);
                leftLedControlBuffer[0] = LEFT_LED_REGISTER;
                leftLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, leftLedControlBuffer);
            break;
            case MyEnumLed.RightLed:
                let rightLedControlBuffer = pins.createBuffer(2);
                rightLedControlBuffer[0] = RIGHT_LED_REGISTER;
                rightLedControlBuffer[1] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, rightLedControlBuffer);
            break;
            default:
                let allLedControlBuffer = pins.createBuffer(3);
                allLedControlBuffer[0] = LEFT_LED_REGISTER;
                allLedControlBuffer[1] = eSwitch;
                allLedControlBuffer[2] = eSwitch;
                pins.i2cWriteBuffer(I2CADDR, allLedControlBuffer);
            break;
        }
    }

    /**
     * Get the state of the patrol sensor
     * @param eline Select the inspection sensor enumeration
     */

    //% block="read line sensor %eline state"
    //% weight=96
    export function readLineSensorState(eline:MyEnumLineSensor):number{
        pins.i2cWriteNumber(I2CADDR, LINE_STATE_REGISTER, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE)
        let state;
        switch(eline){
            case MyEnumLineSensor.SensorL1: 
                state = (data & 0x08) == 0x08 ? 1 : 0; 
            break;
            case MyEnumLineSensor.SensorM: 
                state = (data & 0x04) == 0x04 ? 1 : 0; 
            break;
            case MyEnumLineSensor.SensorR1: 
                state = (data & 0x02) == 0x02 ? 1 : 0; 
            break;
            case MyEnumLineSensor.SensorL2: 
                state = (data & 0x10) == 0X10 ? 1 : 0; 
            break;
            default:
                state = (data & 0x01) == 0x01 ? 1 : 0;
            break;
        }
        return state;
    }
    
    /**
     * The ADC data of the patrol sensor is obtained
     * @param eline Select the inspection sensor enumeration
     */

    //% block="read line sensor %eline  ADC data"
    //% weight=95
    export function readLineSensorData(eline:MyEnumLineSensor):number{
        let data;
        switch(eline){
            case MyEnumLineSensor.SensorR2:
                pins.i2cWriteNumber(I2CADDR, ADC0_REGISTER, NumberFormat.Int8LE);
                let adc0Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc0Buffer[1] << 8 | adc0Buffer[0]
            break;
            case MyEnumLineSensor.SensorR1:
                pins.i2cWriteNumber(I2CADDR, ADC1_REGISTER, NumberFormat.Int8LE);
                let adc1Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc1Buffer[1] << 8 | adc1Buffer[0];
            break;
            case MyEnumLineSensor.SensorM:
                pins.i2cWriteNumber(I2CADDR, ADC2_REGISTER, NumberFormat.Int8LE);
                let adc2Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc2Buffer[1] << 8 | adc2Buffer[0];
            break;
            case MyEnumLineSensor.SensorL1:
                pins.i2cWriteNumber(I2CADDR, ADC3_REGISTER, NumberFormat.Int8LE);
                let adc3Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc3Buffer[1] << 8 | adc3Buffer[0];
            break;
            default:
                pins.i2cWriteNumber(I2CADDR, ADC4_REGISTER, NumberFormat.Int8LE);
                let adc4Buffer = pins.i2cReadBuffer(I2CADDR, 2);
                data = adc4Buffer[1] << 8 | adc4Buffer[0];
            break;

        }
        return data;
    }
    function mydelayUs(unit: number):void{
        let i
        while((--unit)>0){
            for (i = 0; i < 1; i++) {
            } 
        }
    }
    /**
     * Acquiring ultrasonic data
     * @param trig trig pin selection enumeration, eg:DigitalPin.P13
     * @param echo echo pin selection enumeration, eg:DigitalPin.P14
     * @note fit sr04/urm10   The difference between the two is that the echo sending time is different. 
     * The sr04 sends the echo only after receiving the echo. When urm10 is triggered, it sends echo and stops after the echo
     */
    //% block="set ultrasonic sensor TRIG pin %trig ECHO pin %echo read data unit:cm"
    //% weight=94

    export function readUltrasonic(trig:DigitalPin, echo:DigitalPin):number{
        let data;
        pins.digitalWritePin(trig, 1);
        mydelayUs(10);
        pins.digitalWritePin(trig, 0)
        data = pins.pulseIn(echo, PulseValue.High, 1000 * 58);
        if(data==0) //repeat
        {
            pins.digitalWritePin(trig, 1);
            mydelayUs(10);
            pins.digitalWritePin(trig, 0);
            data = pins.pulseIn(echo, PulseValue.High, 1000 * 58)
        }
        //59.259 / ((331.5 + 0.6 * (float)(10)) * 100 / 1000000.0) // The ultrasonic velocity (cm/us) compensated by temperature
        data = data / 59.259;

        if (data <= 0)
            return 0;
        if (data > 300)
            return 300;
        return Math.round(data);
    }

    /**
     * Getting the version number
     */
    
    //% block="read version"
    //% weight=30
    //% advanced=true
    export function readVersion():string{
        let version;
        pins.i2cWriteNumber(I2CADDR, VERSION_CNT_REGISTER, NumberFormat.Int8LE);
        version = pins.i2cReadNumber(I2CADDR, NumberFormat.Int8LE);
        pins.i2cWriteNumber(I2CADDR, VERSION_DATA_REGISTER, NumberFormat.Int8LE);
         version= pins.i2cReadBuffer(I2CADDR, version);
        let versionString = version.toString();
        return versionString
    }
    
   

    /** 
    * Set the three primary color:red, green, and blue
    * @param r  , eg: 100
    * @param g  , eg: 100
    * @param b  , eg: 100
    */

    //% weight=60
    //% r.min=0 r.max=255
    //% g.min=0 g.max=255
    //% b.min=0 b.max=255
    //% block="red|%r green|%g blue|%b"
    export function rgb(r: number, g: number, b: number): number {
        return (r << 16) + (g << 8) + (b);
    }

    /**
     * The LED positions where you wish to begin and end
     * @param from  , eg: 0
     * @param to  , eg: 3
     */

    //% weight=60
    //% from.min=0 from.max=3
    //% to.min=0 to.max=3
    //% block="range from |%from with|%to leds"
    export function ledRange(from: number, to: number): number {
        return ((from) << 16) + (2 << 8) + (to);
    }
    /**
     * Gets the RGB value of a known color
    */
    //% weight=2 blockGap=8
    //% blockId="neopixel_colors" block="%color"
    //% advanced=true
    export function colors(color: NeoPixelColors): number {
        return color;
    }
    /**
     * Set the color of the specified LEDs
     * @param index  , eg: DigitalPin.P15
     */

    //% weight=60
    //% index.min=0 index.max=3
    //% pin.defl=DigitalPin.P15
    //% block="SET PIN|%pin RGB light |%index show color|%rgb=neopixel_colors"
    export function setIndexColor(pin:DigitalPin,index: number, rgb: number) {
        let f = index;
        let t = index;
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);

        if (index > 15) {
            if (((index >> 8) & 0xFF) == 0x02) {
                f = index  >> 16;
                t = index  & 0xff;
            } else {
                f = 0;
                t = -1;
            }
        }
        for (let i = f; i <= t; i++) {
            neopixel_buf[i * 3 + 0] = Math.round(g)
            neopixel_buf[i * 3 + 1] = Math.round(r)
            neopixel_buf[i * 3 + 2] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, pin)

    }

    /**
     * Set the color of all RGB LEDs
     * eg: DigitalPin.P15
     */

    //% weight=60
    //% pin.defl=DigitalPin.P15
    //% block=" SET PIN|%pin RGB show color|%rgb=neopixel_colors"
    export function showColor(pin:DigitalPin,rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        for (let i = 0; i < 16 * 3; i++) {
            if ((i % 3) == 0)
                neopixel_buf[i] = Math.round(g)
            if ((i % 3) == 1)
                neopixel_buf[i] = Math.round(r)
            if ((i % 3) == 2)
                neopixel_buf[i] = Math.round(b)
        }
        ws2812b.sendBuffer(neopixel_buf, pin)
    }

    /**
     * Set the brightness of RGB LED
     * @param brightness  , eg: 100
     */

    //% weight=70
    //% brightness.min=0 brightness.max=255
    //% block="set RGB brightness to |%brightness"
    export function setBrightness(brightness: number) {
        _brightness = brightness;
    }

    /**
     * Turn off all RGB LEDs
     * eg: DigitalPin.P15
     */

    //% weight=40
    //% pin.defl=DigitalPin.P15
    //% block="Set pin|%pin clear all RGB"
    export function ledBlank(pin: DigitalPin) {
       showColor(pin,0)
    }

    /**
     * RGB LEDs display rainbow colors 
     */

    //% weight=50
    //% pin.defl=DigitalPin.P15
    //% startHue.defl=1
    //% endHue.defl=360
    //% startHue.min=0 startHue.max=360
    //% endHue.min=0 endHue.max=360
    //% blockId=led_rainbow block="SET PIN|%pin set RGB show rainbow color from|%startHue to|%endHue"
    export function ledRainbow(pin:DigitalPin,startHue: number, endHue: number) {
        startHue = startHue >> 0;
        endHue = endHue >> 0;
        const saturation = 100;
        const luminance = 50;
        let steps = 3 + 1;
        const direction = HueInterpolationDirection.Clockwise;

        //hue
        const h1 = startHue;
        const h2 = endHue;
        const hDistCW = ((h2 + 360) - h1) % 360;
        const hStepCW = Math.idiv((hDistCW * 100), steps);
        const hDistCCW = ((h1 + 360) - h2) % 360;
        const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
        let hStep: number;
        if (direction === HueInterpolationDirection.Clockwise) {
            hStep = hStepCW;
        } else if (direction === HueInterpolationDirection.CounterClockwise) {
            hStep = hStepCCW;
        } else {
            hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
        }
        const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

        //sat
        const s1 = saturation;
        const s2 = saturation;
        const sDist = s2 - s1;
        const sStep = Math.idiv(sDist, steps);
        const s1_100 = s1 * 100;

        //lum
        const l1 = luminance;
        const l2 = luminance;
        const lDist = l2 - l1;
        const lStep = Math.idiv(lDist, steps);
        const l1_100 = l1 * 100

        //interpolate
        if (steps === 1) {
            writeBuff(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
        } else {
            writeBuff(0, hsl(startHue, saturation, luminance));
            for (let i = 1; i < steps - 1; i++) {
                const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                const s = Math.idiv((s1_100 + i * sStep), 100);
                const l = Math.idiv((l1_100 + i * lStep), 100);
                writeBuff(0 + i, hsl(h, s, l));
            }
            writeBuff(3, hsl(endHue, saturation, luminance));
        }
        ws2812b.sendBuffer(neopixel_buf, pin)
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }

    function writeBuff(index: number, rgb: number) {
        let r = (rgb >> 16) * (_brightness / 255);
        let g = ((rgb >> 8) & 0xFF) * (_brightness / 255);
        let b = ((rgb) & 0xFF) * (_brightness / 255);
        neopixel_buf[index * 3 + 0] = Math.round(g)
        neopixel_buf[index * 3 + 1] = Math.round(r)
        neopixel_buf[index * 3 + 2] = Math.round(b)
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);

        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;

        return (r << 16) + (g << 8) + b;
    }

    /* maqueen PlusV3 */

    export enum MotorType {
        //% block="Motor133"
        Motor133 = 1,
        //% block="Motor266"
        Motor266 = 2,
    }

    export enum Intersection {
        //% block="Straight"
        Straight = 3,
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
        //% block="Stop"
        Stop = 4,
    }

    export enum Trord {
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
        //% block="Stop"
        Stop = 4,
    }

    export enum LeftOrStraight {
        //% block="Straight"
        Straight = 3,
        //% block="Left"
        Left = 1,
        //% block="Stop"
        Stop = 4,
    }

    export enum RightOrStraight {
        //% block="Straight"
        Straight = 3,
        //% block="Right"
        Right = 2,
        //% block="Stop"
        Stop = 4,
    }

    export enum Patrolling {
        //% block="ON"
        ON = 1,
        //% block="OFF"
        OFF = 2,
    }

    export enum DirectionType {
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
        //% block="All"
        All = 3,
    }
    export enum DirectionType2 {
        //% block="Left"
        Left = 1,
        //% block="Right"
        Right = 2,
    }

    export enum SpeedDirection {
        //% block="CW"
        SpeedCW = 1,
        //% block="CCW"
        SpeedCCW = 2,
    }


    /**
     * return the corresponding PatrolSpeed number
     */
    //% blockId="PatrolSpeed_conv" block="%item"
    //% weight=2 blockHidden=true
    export function getPatrolSpeed(item: PatrolSpeed): number {
        return item as number;
    }


    /**
     * Set the line-following speed of the trolley.
     * @param speed to speed ,eg: PatrolSpeed.Speed1
     */

    //% block="Line Following Settings Speed %speed=PatrolSpeed_conv"
    //% weight=24
    //% group="V3"
    //% advanced=true
    export function setPatrolSpeed(speed: number) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 63;
        allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * Set motor type
     * @param type to type ,eg: MotorType.Motor133
     */

    //% block="set up motor type %type"
    //% weight=23
    //% group="V3"
    //% advanced=true
    //% deprecated=true
    export function setMotorType(type: MotorType) {

    }

    /**
     * ...
     * @param mode to mode ,eg: Intersection.Straight
     */
    maqueenPlusV2.setRightOrStraightRunMode(RightOrStraight.Straight)
    //% block="At Crossroads %mode"
    //% weight=22
    //% group="V3"
    //% advanced=true
    export function setIntersectionRunMode(mode: Intersection) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 69;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param mode to mode ,eg: Trord.Left
     */

    //% block="At T-junction %mode"
    //% weight=21
    //% group="V3"
    //% advanced=true
    export function setTRordRunMode(mode: Trord) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 70;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param mode to mode ,eg: LeftOrStraight.Straight
     */

    //% block="At Left Turn and Straight Intersection %mode"
    //% weight=20
    //% group="V3"
    //% advanced=true
    export function setLeftOrStraightRunMode(mode: LeftOrStraight) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 71;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * ...
     * @param mode to mode ,eg: RightOrStraight.Straight
     */

    //% block="At Right Turn and Straight Intersection %mode"
    //% weight=19
    //% group="V3"
    //% advanced=true
    export function setRightOrStraightRunMode(mode: RightOrStraight) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 72;
        allBuffer[1] = mode;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * Set the line-following function.
     * @param patrol to patrol ,eg: Patrolling.ON
     */

    //% block="Line patrolling %patrol"
    //% weight=18
    //% group="V3"
    //% advanced=true
    export function patrolling(patrol: Patrolling) {
        let allBuffer = pins.createBuffer(2);
        if (patrol == Patrolling.ON)
            allBuffer[1] = 0x04|0x01;
        else
            allBuffer[1] = 0x08;
        allBuffer[0] = 60;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * Get the status of the intersection
     */

    //% block="Intersection Detection"
    //% weight=17
    //% group="V3"
    //% advanced=true
    export function intersectionDetecting(): number {
        pins.i2cWriteNumber(I2CADDR, 61, NumberFormat.Int8LE);
        let data = pins.i2cReadNumber(I2CADDR, 1);
        return data;
    }

    /**
     * Get the light intensity
     * @param type to type ,eg: DirectionType.Left
     */

    //% block="Read Light Values %type"
    //% weight=16
    //% group="V3"
    //% advanced=true
    export function readLightIntensity(type: DirectionType2): number {
        let allBuffer = pins.createBuffer(4);
        pins.i2cWriteNumber(I2CADDR, 78, NumberFormat.Int8LE);
        allBuffer = pins.i2cReadBuffer(I2CADDR, 4);
        if (type == DirectionType2.Left)
            return allBuffer[0] << 8 | allBuffer[1];
        else
            return allBuffer[2] << 8 | allBuffer[3];
    }

    /**
     * Set the distance controlled by PID.
     * @param dir to dir ,eg: SpeedDirection.SpeedCW
     * @param speed to speed ,eg: PatrolSpeed.Speed1
     * @param distance to distance ,eg: 50
     */

    //% block="PID Distance Control %dir  distance %distance cm   %interruption  interruption"
    //% weight=15
    //% group="V3"
    //% advanced=true
    export function pidControlDistance(dir: SpeedDirection, distance: number, interruption: MyInterruption) {
        let speed =2 ;
        let allBuffer = pins.createBuffer(2);
        if (distance >= 6000)
            distance = 60000;
        allBuffer[0]=64; allBuffer[1] =dir;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 85; allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 65; allBuffer[1] = distance>>8;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 66; allBuffer[1] = distance ;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 60; allBuffer[1] = 0x04 | 0x02;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)

        if (interruption == MyInterruption.NotAllowed){
            pins.i2cWriteNumber(I2CADDR, 87, NumberFormat.Int8LE);
            let flagBuffer = pins.createBuffer(1);
            flagBuffer = pins.i2cReadBuffer(I2CADDR, 1);
            while (flagBuffer[0]==1){
                basic.pause(10);
                flagBuffer=pins.i2cReadBuffer(I2CADDR, 1);  
            }
        }

    }

    /**
     * Set the control angle of PID.
     * @param speed to speed ,eg: PatrolSpeed.Speed1
     * @param angle to angle ,eg: 90
     */

    //% block="PID Angle Control speed  angle %angle %interruption  interruption"
    //% angle.min=-180 angle.max=180 angle.defl=90
    //% weight=14
    //% group="V3"
    //% advanced=true
    export function pidControlAngle(angle: number, interruption: MyInterruption) {
        let speed = 2;
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 67;
        if (angle>=0)allBuffer[1] = 1;
        else{
            allBuffer[1] = 2;
            angle = -angle;
        } 
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 86; allBuffer[1] = speed;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 68; allBuffer[1] = angle;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
        allBuffer[0] = 60; allBuffer[1] = 0x04 | 0x02;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)

        if (interruption == MyInterruption.NotAllowed) {
            pins.i2cWriteNumber(I2CADDR, 87, NumberFormat.Int8LE);
            let flagBuffer = pins.createBuffer(1);
            flagBuffer = pins.i2cReadBuffer(I2CADDR, 1);
            while (flagBuffer[0] == 1) {
                basic.pause(10);
                flagBuffer = pins.i2cReadBuffer(I2CADDR, 1);
            }
        }

    }
    /**
     * Set the PID (Proportional-Integral-Derivative)
     */

    //% block="PID Control Stop"
    //% weight=13
    //% group="V3"
    //% advanced=true
    export function pidControlStop() {
        let allBuffer = pins.createBuffer(2);
        allBuffer[0] = 60;
        allBuffer[1] = 0x10;
        pins.i2cWriteBuffer(I2CADDR, allBuffer)
    }

    /**
     * Gets the real-time speed in cm/s
     * @param type to type ,eg: DirectionType.Left
     */

    //% block="Read Real-time Speed %type wheel"
    //% weight=12
    //% group="V3"
    //% advanced=true
    export function readRealTimeSpeed(type: DirectionType2): number {
        let allBuffer = pins.createBuffer(2);
        pins.i2cWriteNumber(I2CADDR, 76, 1);
        allBuffer = pins.i2cReadBuffer(I2CADDR, 2);
        if (type == DirectionType2.Left)
            return allBuffer[0] / 5;
        else
            return allBuffer[1] / 5;
    }

    /**
     * Set the color of the vehicle lights.
     * @param type to type ,eg: DirectionType.Left
     * @param rgb to rgb ,eg: CarLightColors.Red
     */

    //% block="RGB Car Lights %type color %rgb"
    //% weight=11
    //% group="V3"
    //% advanced=true
    export function setRgblLed(type: DirectionType, rgb: CarLightColors) {
        let allBuffer = pins.createBuffer(2);
        allBuffer[1] = rgb;
        if (type == DirectionType.Left) {
            allBuffer[0] = 11;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        } else if (type == DirectionType.Right) {
            allBuffer[0] = 12;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        } else if (type == DirectionType.All) {
            allBuffer[0] = 11;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
            allBuffer[0] = 12;
            pins.i2cWriteBuffer(I2CADDR, allBuffer)
        }
    }

}



