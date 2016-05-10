var EtherPortClient = require("etherport-client").EtherPortClient;
var Firmata = require("firmata");
var five = require("johnny-five");

var board = new five.Board({
  io: new Firmata(new EtherPortClient({
    host: "192.168.0.110",
    port: 3030
  })),
  timeout: 1e5
});

var tempSensor;

function getDecorateIO() {
  function decorateIO(io) {
  	board.on('ready', function() {
      console.log("ready"); 
      
      tempSensor = new five.Thermometer({
        controller: "TMP36",
        pin: "A0",
        aref: 1
      });

      io.on('connection', function (socket) {
        console.log('sockets on connection');

        tempSensor.on('change', function(){
          console.log(this.C);
          console.log(this.F);
          socket.emit('tempData', this.F);
        });
      });
    });
  };

  return decorateIO;
};

module.exports = getDecorateIO;