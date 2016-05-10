# starter-feather

Use johnny-five to wirelessly control your Adafruit Feather HUZZAH with JavaScript!

This is basically a slight modification of the IoTReX [starter-platform](https://github.com/iotrex/starter-platform) repo. The main difference is in the device config. You need to use Etherport Client to use the Feather wirelessly. 

This assumes you already have the Firmata firmware installed on the board.

Be aware that the ADC on the Feather has a max of 1v, which is less than a lot of sensors out there. You'll need to voltage divide your circuit and pass `aref: 1` to johnny-five (as I've done in this example).

To get going:
1. `npm install` (you'll need Gulp installed globally)
2. `npm start`

Thanks to Rick Waldron for patiently debugging with me.