# Maqueen Plus V2

## 介绍

This is the latest version of Maqueen Plus, a programming robot for STEAM education. Optimized with more expansion ports, larger capacity power supply and larger body, the Maqueen Plus V2.0 can be perfectly compatible with more peripheral components like HuskyLens AI camera and Maqueen Mechanic kits, which makes it an accessible STEAM robot teaching tool for primary and secondary students. Besides, it can be not only suitable for classroom teaching, but also can be used for after-school extended exercises and robot competitions. Besides all the functions of Maqueen Lite, it offers richer and more flexible functions and stronger performance. Whether you have ever used Maqueen series products or not, you'll find it very easy to get started.

[购买链接](https://www.dfrobot.com/product-2026.html)

## Basic usage

1. forward

```blocks

DFRobotMaqueenPlusV2.I2CInit()
basic.forever(function () {
    DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eAllMotor, MyEnumDir.eForward, 100)
})

```

2. Backward

```blocks

DFRobotMaqueenPlusV2.I2CInit()
basic.forever(function on_forever() {
    DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eAllMotor, MyEnumDir.eBackward, 100)
})

```

3. Blinking LED

```blocks

DFRobotMaqueenPlusV2.I2CInit()
music.startMelody(music.builtInMelody(Melodies.Dadadadum), MelodyOptions.Forever)
DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eAllMotor, MyEnumDir.eForward, 255)
basic.forever(function () {
    DFRobotMaqueenPlusV2.setIndexColor(DFRobotMaqueenPlusV2.ledRange(0, 3), NeoPixelColors.Red)
    basic.pause(1000)
    DFRobotMaqueenPlusV2.setIndexColor(DFRobotMaqueenPlusV2.ledRange(0, 3), NeoPixelColors.Blue)
    basic.pause(1000)
})

```

4. Light Sensing Robot

```blocks

DFRobotMaqueenPlusV2.I2CInit()
basic.forever(function () {
    basic.showNumber(input.lightLevel())
})

```

5. Ultrasonic

```blocks

DFRobotMaqueenPlusV2.I2CInit()
basic.forever(function () {
    basic.showNumber(DFRobotMaqueenPlusV2.readUltrasonic(DigitalPin.P13, DigitalPin.P14))
})

```

6. Line-tracking Robot

```blocks

DFRobotMaqueenPlusV2.I2CInit()
basic.forever(function () {
    if (DFRobotMaqueenPlusV2.readLineSensorState(MyEnumLineSensor.eM) == 1) {
        DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eAllMotor, MyEnumDir.eForward, 100)
    } else {
        if (DFRobotMaqueenPlusV2.readLineSensorState(MyEnumLineSensor.eL1) == 0 && DFRobotMaqueenPlusV2.readLineSensorState(MyEnumLineSensor.eR1) == 1) {
            DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eLeftMotor, MyEnumDir.eForward, 160)
            DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eRightMotor, MyEnumDir.eForward, 30)
        }
        if (DFRobotMaqueenPlusV2.readLineSensorState(MyEnumLineSensor.eL1) == 1 && DFRobotMaqueenPlusV2.readLineSensorState(MyEnumLineSensor.eR1) == 0) {
            DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eRightMotor, MyEnumDir.eForward, 160)
            DFRobotMaqueenPlusV2.controlMotor(MyEnumMotor.eLeftMotor, MyEnumDir.eForward, 30)
        }
    }
})

```
## License

MIT

Copyright (c) 2020, microbit/micropython Chinese community

## Supported targets

* for PXT/microbit


```package
maqueenPlusV2=github:DFRobot/pxt-DFRobot_MaqueenPlus_v20
```
