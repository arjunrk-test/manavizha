const { julian, moonposition } = require('astronomia');

const dt = new Date("1998-09-17T15:50:00.000Z");
const jd = julian.DateToJD(dt);
const pos = moonposition.position(jd);
console.log("Moon position in Astronomia:", pos);
console.log("JD:", jd);
