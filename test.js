import test from 'ava'
import luqs from '.'

test('luqs()', async t => {
  const stations = await luqs()
  t.truthy(Array.isArray(stations))
  t.is(stations.length, 165)
})

test('luqs.station() should reject with TypeError', async t => {
  const error = await t.throwsAsync(luqs.station())
  t.is(error.message, 'Expected a string')
})

test('luqs.station() should reject with Error is to short', async t => {
  const error = await t.throwsAsync(luqs.station('AAH'))
  t.is(error.message, 'Kuerzel is to short')
})

test('luqs.station() should reject with Error is to long', async t => {
  const error = await t.throwsAsync(luqs.station('AAAAAAA'))
  t.is(error.message, 'Kuerzel is to long')
})

test('luqs.aktuell() should resolve with array', async t => {
  const currentMeasurements = await luqs.aktuell()
  t.truthy(Array.isArray(currentMeasurements))
  t.truthy(currentMeasurements.length >= 1)
})

test('luqs.aktuell() should resolve with array containing current measurements', async t => {
  const currentMeasurements = await luqs.aktuell()
  t.truthy(Array.isArray(currentMeasurements))
  t.truthy(currentMeasurements.length >= 1)
})

test('luqs.aktuell() measurement object should have all keys', async t => {
  const currentMeasurements = await luqs.aktuell()
  const measurement = currentMeasurements[0]

  t.truthy(Object.prototype.hasOwnProperty.call(measurement, 'station'))
  t.truthy(Object.prototype.hasOwnProperty.call(measurement, 'kuerzel'))
  t.truthy(Object.prototype.hasOwnProperty.call(measurement, 'ozon'))
  t.truthy(Object.prototype.hasOwnProperty.call(measurement, 'so2'))
  t.truthy(Object.prototype.hasOwnProperty.call(measurement, 'no2'))
  t.truthy(Object.prototype.hasOwnProperty.call(measurement, 'pm10'))
})
