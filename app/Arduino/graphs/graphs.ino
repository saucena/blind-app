#include <Wire.h>
#include <EEPROM.h>
#include <Adafruit_PWMServoDriver.h>

using namespace std;

Adafruit_PWMServoDriver pwm1 = Adafruit_PWMServoDriver(0X40);
Adafruit_PWMServoDriver pwm2 = Adafruit_PWMServoDriver(0X41);

#define SERVO_FREQ 50 // The servo frequency, typically 50 Hz

#define MAXFORWARD 100 // This is the 'minimum' pulse length count
#define MAXBACK 500    // This is the 'maximum' pulse length count
#define STOP 4096      // This is the pulse length count that will stop the servo

#define MAXPOSITION 100 // The maximum position that can be entered, change to adjust precision
#define MAXDELAY 2250   // Maximum delay, tweak to fit strip size

// Servo # counters
const int firstServo1 = 0;
const int lastServo1 = 10;
const int servoNum1 = lastServo1 - firstServo1 + 1;
const int firstServo2 = 0;
const int lastServo2 = 11;
const int servoNum2 = lastServo2 - firstServo2 + 1;

// Input array, will be changed to read from a file that will be inserted by app
// Each number corresponds to the position of a servo, with 16 total servos
int positions[] = {65.36752222627989,49.920367328926666,34.48099959581692,20.5592125668738,9.516397750080323,2.432416106142012,0,2.457011900308509,9.563184151116504,20.623614399988725,34.55671909848066,50,65.44328090151934,79.37638560001128,90.4368158488835,97.5429880996915,100,97.567583893858,90.48360224991968,79.4407874331262,65.51900040418307,50.079632671073334,34.632477773720126};

int calibrationFactors[23];

// Change to whichever pin is connected to the switch circuit
int stopSwitch1 = A3;
int stopSwitch2 = A2;

//int thresholds[] = {140,150,140,137,144,147,143,139,146,149,144,149,142,149,146,145,142,142,142,143,146,148,145};
int servoTimes[23];

const unsigned long calibrationTime = 1900;

void resetServo();
void moveServo(int n, int pos, bool reset);
void resetTest();

void setup()
{

  Serial.begin(9600);
  Serial.println("8 channel Servo test!");

  pwm1.begin();
  pwm1.setOscillatorFrequency(27000000);
  pwm1.setPWMFreq(SERVO_FREQ);
  pwm2.begin();
  pwm2.setOscillatorFrequency(27000000);
  pwm2.setPWMFreq(SERVO_FREQ);

  delay(10);
  //resetServo();
  //  findAllThresholds();

  //
        //  for(int i = firstServo1; i <= lastServo1; i++)

        //    moveOpposite(i, 50, true);

        //  for(int i = firstServo2; i <= lastServo2; i++)

        //    moveOpposite(i, 50, false);


        //  for(int i = firstServo1; i <= lastServo1; i++)

        //    moveServo(i, 50, true);

        //  for(int i = firstServo2; i <= lastServo2; i++)

        //    moveServo(i, 50, false);


resetServo(false);
  for (int i = lastServo2; i >= firstServo2; i--)
    moveServo(i, positions[i], false);

  for (int i = lastServo1; i >= firstServo1; i--)

    moveServo(i, positions[i + 12], true);

  // findAllThresholds(true);
  // resetServo(false);

  //  resetServo(false);

  //  moveServo(0, 100, false);
  //    moveOpposite(5, 30, true);
  //  moveOpposite(7, 30, true);
  //  moveOpposite(10, 30, true);
  //  moveOpposite(2, 30, false);
  //  moveOpposite(4, 30, false);
  //  moveOpposite(9, 30, false);

  //  findAllThresholds(true);
  //
  //for(int i=0; i<23; i++){
  //  Serial.println(EEPROM.read(i));
  //}

  // findAllThresholds(false);

  // for(int i=23; i<46; i++){
  //   Serial.println(EEPROM.read(i));
  // }

  //  moveServo(1, 100, false);
  //  moveServo(2, 100, false);
  //  moveServo(3, 100, false);

  //    moveOpposite(11, 100, false);
  //        moveOpposite(10, 100, false);
  //
  //    moveOpposite(9, 100, false);
}

void loop() {}

void findAllThresholds(bool forward)
{
  int j = forward ? 0 : 23;
  int temp;
  for (int i = firstServo1; i <= lastServo1; i++)
  {
    temp = findThreshold(i, true, forward);
    //    Serial.println(temp);
    EEPROM.write(j, temp);
    j++;
  }

  for (int i = firstServo2; i <= lastServo2; i++)
  {
    temp = findThreshold(i, false, forward);
    //    Serial.println(temp);
    EEPROM.write(j, temp);
    j++;
  }
}

int findThreshold(int n, bool first, bool forward)
{
  //  int localThreshold[100];
  int minValue = 1000;
  int temp;

  int direct = forward ? MAXFORWARD : MAXBACK;
  if (first)
  {
    pwm1.setPWM(n, 0, direct);
  }
  else
  {
    pwm2.setPWM(n, 0, direct);
  }

  for (int i = 0; i < 100; i++)
  {
    delay(5);
    temp = analogRead(A2) - analogRead(A3);
    //    Serial.println(temp);
    if (temp < minValue)
    {
      minValue = temp;
    }
  }

  if (first)
    pwm1.setPWM(n, 0, STOP);
  else
    pwm2.setPWM(n, 0, STOP);
  return temp;
}

void calibrateServo(int n, bool first)
{
  int threshold = 150;
  unsigned long startTime = millis();

  if (first)
  {
    pwm1.setPWM(n, 0, MAXBACK); //correct direction?
  }
  else
    pwm2.setPWM(n, 0, MAXBACK);

  while (analogRead(A2) - analogRead(A3) > threshold)
  {
    delay(1);
  }

  unsigned long endTime = millis();

  pwm2.setPWM(n, 0, STOP);

  unsigned long delta = endTime - startTime;

  calibrationFactors[n] = calibrationTime / delta;
}

int timeServo(int n, bool first)
{
  unsigned long startTime = millis();
  int j = first ? n : 23 + n;
  if (first)
  {
    pwm1.setPWM(n, 0, MAXBACK); //correct direction?
  }
  else
    pwm2.setPWM(n, 0, MAXBACK);

  while (analogRead(A2) - analogRead(A3) > EEPROM.read(j))
  {
    delay(1);
  }

  unsigned long endTime = millis();

  pwm2.setPWM(n, 0, STOP);

  return endTime - startTime;
}

void calibrateAll()
{
  int servoTimes = new int[23];
  for (int i = firstServo1; i <= lastServo1; i++)

    calibrateServo(i, true);

  for (int i = firstServo2; i <= lastServo2; i++)

    calibrateServo(i, true);

  for (int i = firstServo1; i <= lastServo1; i++)

    calibrateServo(i, true);

  for (int i = firstServo2; i <= lastServo2; i++)

    calibrateServo(i, true);
}

// Moves a servo to the position entered, by converting the position into a delay.

// Only moves servos in one direction unless "reset" is true.

void moveServo(int n, int pos, bool first)

{

  if (first)

    pwm1.setPWM(n, 0, MAXFORWARD);

  else

    pwm2.setPWM(n, 0, MAXFORWARD);

  int waitTime = map(pos, 0, MAXPOSITION, 0, MAXDELAY);
  delay(waitTime);

  if (first)
    pwm1.setPWM(n, 0, STOP);
  else
    pwm2.setPWM(n, 0, STOP);
}

void moveOpposite(int n, int pos, bool first)
{
  if (first)
    pwm1.setPWM(n, 0, MAXBACK);
  else
    pwm2.setPWM(n, 0, MAXBACK);
  int waitTime = map(pos, 0, MAXPOSITION, 0, MAXDELAY);
  delay(waitTime);

  if (first)
    pwm1.setPWM(n, 0, STOP);
  else
    pwm2.setPWM(n, 0, STOP);
}

//Used to reset servos to the initial position before drawing a graph

void resetServo(bool forward)
{
  int j = forward ? 0 : 23;
  int direct = forward ? MAXFORWARD : MAXBACK;
  for (int i = firstServo1; i <= lastServo1; i++)
  {
    Serial.println(j);
    pwm1.setPWM(i, 0, direct);
    Serial.print("Threshold for this motor: ");
    Serial.println(EEPROM.read(j));
    delay(10);
    Serial.println(analogRead(A2) - analogRead(A3));
    while ((analogRead(A2) - analogRead(A3)) < EEPROM.read(j))
    {
      Serial.println(analogRead(A2) - analogRead(A3));
      delay(1);
    }
    pwm1.setPWM(i, 0, STOP);
    j++;
  }

  for (int i = firstServo2; i <= lastServo2; i++)
  {
    Serial.println(j);
    pwm2.setPWM(i, 0, direct);
    Serial.print("Threshold for this motor: ");
    Serial.println(EEPROM.read(j));
    delay(10);
    Serial.println(analogRead(A2) - analogRead(A3));
    while ((analogRead(A2) - analogRead(A3)) < EEPROM.read(j))
    {

      Serial.println(analogRead(A2) - analogRead(A3));
      delay(1);
    }
    pwm2.setPWM(i, 0, STOP);
    j++;
  }
}

//void resetServo() {

//  for(int i = firstServo1; i <= lastServo1; i++) {

//    pwm1.setPWM(i, 0, MAXBACK);

//      delay(2000);

//    pwm1.setPWM(i, 0, STOP);

//  }

//  for(int i = firstServo2; i <= lastServo2; i++) {

//    pwm2.setPWM(i, 0, MAXBACK);

//      delay(2000);

//    pwm2.setPWM(i, 0, STOP);

//  }

//}
