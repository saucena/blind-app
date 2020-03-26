# Arduino script for plotting graphs

This script is uploaded onto the arduino to make the servos draw a graph based on an input array of positions.

## Working principle

We use continuous (360-degree) servos. Therefore, there is no angle feedback on them. To control the strips' position, we turn them on at maximum speed and map the displacement (0-100) onto delays (The maximum being 2250 ms, found empirically).

## Constants

There are several constants, some of which can be tweaked to calibrate the device. They are:

```
#define MAXFORWARD 100 // This is the pulse length that runs the servos at maximum speed clockwise. Don't change this.
#define MAXBACK 500    // This is the pulse length that runs the servos at maximum speed anticlockwise. Don't change this.
#define STOP 4096      // This is the pulse length count that stops the servos. Don't change this.

#define MAXPOSITION 100 // The maximum position that can be entered, tweak to adjust precision.
#define MAXDELAY 2250   // Maximum delay, determined empirically. Tweak to fit strip size.
```

## Functions

We use two chained PWM servo drivers, so each function has a parameter `first` which if true refers to the first driver and else refers to the second one.

1. `moveServo(int n, int pos, bool first)`
   Moves a servo to a given position, given that it was at position 0 initially.
2. `moveOpposite(int n, int pos, bool first)`
   Moves a servo to a given position, given that it was at position MAXPOSITION initially.
3. `resetServo(bool forward)`
   Resets all servos to the position MAXPOSITION if `forward` is true and to position 0 if `forward` is false. To do this, servos are moved individually until they reach the end of the strip and stall, causing a current spike which is detected by a sense resistor connected to the 5V power rail. When the spike reaches a threshold determined by `findThreshold`, the servo stops and the program starts moving the next servo.
4. `findThreshold(int n, bool first, bool forward)`
   For a given servo `n`, 1) If `forward` is false, assumes that it is already at position 0, moves it backwards for 100 ms 2) If `forward` is true, assumes that it is already at position `MAXPOSITION` and moves it forwards for 100 ms.
   Then measures the current spike once every millisecond. Returns the lowest value of the spike.
5. `findAllThresholds(bool forward)`
   Measures all thresholds and stores the values in the Arduino's EEPROM.
6. `calibrateServo(int n, bool first)`
   Moves a servo from position 0 to `MAXPOSITION`, measures the time it takes and calculates the speed. Creates a calibration factor and adds this to an array of calibration factors.
7. `calibrateAll()`
   Calibrates all servos.

**Automatic calibration usng `calibrateServo` is not possible at this moment, because of difficulties when trying to measure the speed of the servo. This is because this measurement requires spike detection on both sides of the strips, and detection at `MAXPOSITION` is not reliable enough yet (due to mechanical problems such as non-constant gear and timing belt tensions). Thus, a manual "Position differences" array was used to calibrate servos in the final version of the script. This is named `calibrationFactors[]`.**

## Future work

In the future, there are a couple things that can be done to improve this script, the most important being:

- Fix reliability issues and implement automatic calibration.
