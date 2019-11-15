const luqs = require('.')

luqs()
  .then(response => {
    console.log(response)
  })
  .catch(error => {
    console.log(error)
  })

luqs.station('unna')
  .then(response => {
    console.log(response)
  })
  .catch(error => {
    console.log(error)
  })

luqs.aktuell()
  .then(response => {
    console.log(response)
  })
  .catch(error => {
    console.log(error)
  })
