import test from 'ava'
import luqs from '.'

test('luqs()', async t => {
  const stations = await luqs()
  t.truthy(Array.isArray(stations))
  t.is(stations.length, 166)
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
  const error = await t.throwsAsync(luqs.station('AAAAA'))
  t.is(error.message, 'Kuerzel is to long')
})
