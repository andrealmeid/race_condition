/**
 * Sensor target
 * @readonly
 * @enum {number}
 */
 const Target = {
    CAR: 0,
    ROADSIDE: 1,
    FINISH: 2,
  };
  
  /**
   * @param {Object} myCar
   * @property {number} myCar.rotation
   * @property {number} myCar.x
   * @property {number} myCar.y
   * @property {number} myCar.speed
   * @property {number} myCar.collisionCount
   * @property {{distance: number, target: Target}[]} myCar.sensors - Ultrasound sensors
   * @property {function} myCar.accelerate
   * @property {function} myCar.brake
   * @property {function} myCar.turnRight
   * @property {function} myCar.turnLeft
    }
   */
  function userFunc(myCar) {
    myCar.accelerate();
  }
  
  const cars = [car];
  const userAIs = [userFunc];
  
  // On start up
  cars.forEach(function(userCar) {
    userCar.accelerate = () => {};
    userCar.brake = () => {};
    userCar.turnRight = () => {};
    userCar.turnLeft = () => {};
  });
  
  // In each frame
  userAIs.forEach(function(userAI, i) {
    const userCar = cars[i];
    userAI(userCar);
  });
