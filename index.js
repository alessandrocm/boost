const PoweredUP = require("node-poweredup");
const poweredUP = new PoweredUP.PoweredUP();
const Colors = PoweredUP.Consts.Color;
const ColorNames = PoweredUP.Consts.ColorNames;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

poweredUP.on("discover", async (hub) => { // Wait to discover a Hub
    console.log(`Discovered ${hub.name}!`);
    await hub.connect(); // Connect to the Hub
    console.log(`Battery level @${hub.batteryLevel}%`);
    const leftMotor = await hub.waitForDeviceAtPort("A"); // Make sure a motor is plugged into port A
    const rightMotor = await hub.waitForDeviceAtPort("B"); // Make sure a motor is plugged into port B
    const head = await hub.waitForDeviceAtPort("D"); // Make sure a motor is plugged into port D
    let adjusting = false;
    // leftMotor.setPower(50);
    // rightMotor.setPower(50);

    const distanceDetected =  async (distance) => {
      try {

        if (distance && distance < 185 && !adjusting) {
          adjusting = true;
          console.log(`Proximity threshold reached. (Distance: ${distance})`);
          rightMotor.brake();
          leftMotor.brake();
  
          head.rotateByDegrees(50);
          await sleep(500);
          head.rotateByDegrees(50, -50);
          await sleep(500);
          
          leftMotor.setPower(30);
          rightMotor.setPower(-30);
          await sleep(1000); // Do nothing for 1 second
          rightMotor.brake();
          leftMotor.brake();
  
          leftMotor.setPower(50);
          rightMotor.setPower(50);
          adjusting = false;
        }

      } catch (e) {
        console.error(e);
      }
    }

    const colorDetected = async (color) => {

      try {

        if (!adjusting) {
          adjusting = true;

          if ([Colors.BLUE, Colors.LIGHT_BLUE, Colors.CYAN].includes(color)) {

            leftMotor.setPower(30);
            rightMotor.setPower(-30);
            await sleep(1000); // Do nothing for 1 second
            leftMotor.setPower(50);
            rightMotor.setPower(50);
            adjusting = false;

          }
          else if (color === Colors.RED) {

            rightMotor.brake();
            leftMotor.brake();

          }

        }

        if (color === Colors.BLACK) {
          
          leftMotor.setPower(50);
          rightMotor.setPower(50);
          adjusting = false;
        }

      } catch (e) {
        console.error(e);
      }

    }

    hub.on('colorAndDistance', async (port, {color, distance}) => {
      console.log('Color', ColorNames[color]);
      console.log(`Distance: ${distance}`);
      colorDetected(color);
      distanceDetected(distance);
    });

    console.log("Connected");

});

poweredUP.scan(); // Start scanning for Hubs
console.log("Scanning for Hubs...");
