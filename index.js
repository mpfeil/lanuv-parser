'use strict'

const request = require('request')
const cheerio = require('cheerio')

const messorteUrl = 'https://www.lanuv.nrw.de/luqs/messorte/messorte.php'
const steckbriefUrl = 'https://www.lanuv.nrw.de/luqs/messorte/steckbrief.php?ort='
const messwerteUrl = 'https://www.lanuv.nrw.de/fileadmin/lanuv/luft/immissionen/aktluftqual/eu_luft_akt.htm'

const KUERZEL_LENGTH = 4

const query = (url) => {
  return new Promise((resolve, reject) => {
    request(url, function (error, response, body) {
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
 * @param {*} options
 * @returns Promise resolves with an array of all luqs stations
 */
const luqs = (options = {}) => {
  return new Promise((resolve, reject) => {
    query(messorteUrl)
      .then($ => {
        const stations = []
        const tableRows = $('#wrapper > table > tbody > tr')
        $(tableRows).each(function (_, tableRow) {
          const data = $(tableRow).text().trim().split('\n')
          const station = {};
          [station.messort, station.kuerzel, station.plz, station.standort] = data
          stations.push(station)
        })
        resolve(stations)
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

  if (kuerzel.length < KUERZEL_LENGTH) {
    return Promise.reject(new Error('Kuerzel is to short'))
  }

  if (kuerzel.length > KUERZEL_LENGTH) {
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
        resolve([steckbrief])
      })
      .catch(error => {
        reject(error)
      })
  })
}

luqs.aktuell = (options = {}) => {
  return new Promise((resolve, reject) => {
    query(messwerteUrl)
      .then($ => {
        const tableRows = $('table.rahmen')
        const results = []
        $(tableRows).find('tr').each(function (_, tableRow) {
          const data = []
          $(tableRow).find('td').each(function (index, tableData) {
            data.push($(tableData).text().trim().split('\n')[0])
          })
          results.push(data)
        })
        resolve(results)
      })
      .catch(error => {
        reject(error)
      })
  })
}

module.exports = luqs
