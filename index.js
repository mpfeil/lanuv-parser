'use strict'

const request = require('request')
const cheerio = require('cheerio')

const messorteUrl = 'https://www.lanuv.nrw.de/luqs/messorte/messorte.php'
const messortBildUrl = 'https://www.lanuv.nrw.de/luqs/messorte/bilder/'
const steckbriefUrl = 'https://www.lanuv.nrw.de/luqs/messorte/steckbrief.php?ort='
const messwerteUrl = 'https://www.lanuv.nrw.de/fileadmin/lanuv/luft/immissionen/aktluftqual/eu_luft_akt.htm'

const MIN_KUERZEL_LENGTH = 4
const MAX_KUERZEL_LENGTH = 6

function capitalizeFirstLetter (string) {
  if (string.includes('+')) {
    const splitted = string.split('+')
    const first = capitalizeFirstLetter(splitted[0])
    const second = capitalizeFirstLetter(splitted[1])
    return `${first}+${second}`
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Helper function to query a url and load
 * response with cheeriojs
 *
 * @param {String} url
 */
const query = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    request({
      url,
      method: options.method ? options.method : 'GET',
      formData: options.formData ? options.formData : undefined
    }, function (error, response, body) {
      if (error) {
        reject(error)
      }

      // Wrong URL is redirected and error is null
      if (response.statusCode >= 400) {
        reject(response.statusMessage)
      }

      resolve(cheerio.load(body))
    })
  })
}

/**
 * Requests LUQS stations website and parse stations table.
 *
 * @param ort
 * @param kurzname
 * @param klassifizierung
 * @param status
 * @param options.allStations return all stations if true
 * @returns Promise resolves with an array of all luqs stations
 */
const luqs = (options = {}) => {
  return new Promise((resolve, reject) => {
    const formData = {}
    const { ort, kurzname, klassifizierung, status, allStations } = options

    if (ort) formData.suche_ort = ort
    if (kurzname) formData.suche_kurzname = kurzname
    if (status) formData.auswahl_status = status
    if (klassifizierung) formData.auswahl_klassifizierung = capitalizeFirstLetter(klassifizierung)

    if (allStations) {
      console.info('Option allStations is deprecated and will be removed in a future release!')
      formData.auswahl_status = 'alle'
    }

    query(messorteUrl, {
      method: 'POST',
      formData: formData
    })
      .then($ => {
        const stations = []
        const tableRows = $('#wrapper > table > tbody > tr')
        $(tableRows).each(function (_, tableRow) {
          const data = $(tableRow).text().trim().split('\n')
          const station = {};
          [station.messort, station.kuerzel, station.plz, station.standort] = data
          stations.push(station)
        })
        resolve(stations.splice(1, stations.length))
      })
      .catch(error => {
        reject(error)
      })
  })
}

/**
 * Requests details page of a LUQS station and parses
 * details of the station.
 *
 * @param string kuerzel
 * @returns Promise resolves with an object
 */
luqs.station = (kuerzel, options = {}) => {
  if (typeof kuerzel !== 'string') {
    return Promise.reject(new TypeError('Expected a string'))
  }

  if (kuerzel.length < MIN_KUERZEL_LENGTH) {
    return Promise.reject(new Error('Kuerzel is to short'))
  }

  if (kuerzel.length > MAX_KUERZEL_LENGTH) {
    return Promise.reject(new Error('Kuerzel is to long'))
  }

  return new Promise((resolve, reject) => {
    query(steckbriefUrl + kuerzel)
      .then($ => {
        const tableRows = $('#wrapper > table.table_details > tbody > tr')
        const tmpSteckbrief = []
        $(tableRows).each(function (_, tableRow) {
          $(tableRow).find('td.td_details').each(function (_, tableData) {
            const data = $(tableData).text().trim().split('\n')
            tmpSteckbrief.push(...data)
          })
        })
        const steckbrief = {};
        [
          steckbrief.eu_kennung,
          steckbrief.kuerzel,
          steckbrief.adresse,
          steckbrief.altitude,
          steckbrief.umgebung,
          steckbrief.longitude,
          steckbrief.standort,
          steckbrief.latitude,
          steckbrief.start_messung,
          steckbrief.ende_messung
        ] = tmpSteckbrief
        steckbrief.image = `${messortBildUrl}${steckbrief.kuerzel.toUpperCase()}.jpg`
        steckbrief.longitude = steckbrief.longitude.replace(',', '.')
        steckbrief.latitude = steckbrief.latitude.replace(',', '.')
        resolve([steckbrief])
      })
      .catch(error => {
        reject(error)
      })
  })
}

/**
 * Query and parse overview page of current LUQS measurements.
 *
 * @returns Array with current measured values
 */
luqs.aktuell = (options = {}) => {
  return new Promise((resolve, reject) => {
    query(messwerteUrl)
      .then($ => {
        const tableRows = $('table.rahmen')
        const results = []
        $(tableRows).find('tr').each(function (index, tableRow) {
          // Skip first to table rows
          if (index < 2) {
            return
          }

          const data = []
          $(tableRow).find('td').each(function (index, tableData) {
            data.push($(tableData).text().trim().split('\n')[0])
          })
          const station = {};
          [
            station.station,
            station.kuerzel,
            station.ozon,
            station.so2,
            station.no2,
            station.pm10
          ] = data
          results.push(station)
        })
        resolve(results)
      })
      .catch(error => {
        reject(error)
      })
  })
}

module.exports = luqs
module.exports.default = luqs
