## Install

1. First, install [NodeJs](https://nodejs.org/en/download/), [Yarn](https://classic.yarnpkg.com/en/docs/install#windows-stable) and  [arduino-cli](https://arduino.github.io/arduino-cli/installation/).
2. Install the core board as given in the [Getting Started](https://arduino.github.io/arduino-cli/getting-started/) for Arduino-CLI
3. Make sure that Arduino is also installed.
4. Install the Adafruit-PWM-Servo-Driver Library.

Next, clone the repo via git or download it (it would better to clone it, since if I make an update to the code, you can just pull my changes quickly via git).

And then install the dependencies with yarn:

```bash
$ cd your-project-name
$ yarn
```

## Starting Development

If everything installed correctly, the app should open by running:

```bash
$ yarn dev
```

##  Working logic

The front end I assume will not be changed and it's quite detailed, so I'll skip it's explanation.

The main logic of the app is:

  * Type in a graph
  * Type in the step size
  * Click the 'Preview' button
  * If the graph is valid, and the api connection works it should draw a graph.*
  * Press the 'Upload' button and the code with the positions should upload to the device.

The logic for calculating the positions and drawing graphs is in `app\components\Home.js`.
\* This is the only part that needs internet connection. If the graph is valid (in state) and it's not drawing, it should still graph. Error messages can be found in the console in developer tools.
## Uploading

The following logic happens in `app\components\NavBar.js`.
The way it uploads is after the positions are set in `Home.js`, if the graph is valid, the positions will replace `INSERT_HERE` in `app\constants\sketch.ino`, and then copy it to `app\Arduino\graphs\graphs.ino`, the sketch is compiled and uploaded using `arduino-cli`. You can change the COM port and module count (number of motors) in `app\constants\device.json`

## Developing

Each time you upload a graph, two things have to happen: the sketch in `app\Arduino\graphs\graphs.ino` is created with the correct positions in it and the sketch is uploaded to the Arduino (Arduino lights flash).
When the app is open, you can toggle the Developer Tools (View -> Toggle Developer Tools) and use them for debugging, and for state checking.

When the Developer Tools are open, go to `>>`, then click `Redux`, then `State`, then `graphs`, this object holds the state of the app. You can test it by writing a formula into the text field, with each character `formula` field in the object will change.
The `isValid` value flags if the formula typed is valid.
The `values` object inside `graphs` holds the values of the current graph. It changes after pressing *Preview* (if the graph is valid). `unscaled` holds the actual numerical values of the y-axis, `x` holds the x-axis values, `y` holds the scaled 0-100 y-axis values.

If you want to output any variable at some point, just type in `console.log(the-variable-name)`. You should find occurences of this in the code.

## Further work
The main changes for now that you might make are to do with the Arduino. I'd suggest using the Arduino-IDE and independently trying the code on it. Whenever you feel ready to upload it through the app, copy the arduino sketch into `app\constants\sketch.ino`, change `positions[]` array to `{INSERT_HERE}` if you want to use the positions dynamically (set using the app).

