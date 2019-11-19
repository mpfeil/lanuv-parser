const luqs = require('.')

const run = async () => {
  const stations = await luqs()
  console.log(stations)
  const unna = await luqs.station('unna')
  console.log(unna)
  const currentMeasurements = await luqs.aktuell()
  console.log(currentMeasurements)
}

run()
