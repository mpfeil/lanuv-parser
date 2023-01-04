# lanuv-parser

Simple parser for [Luftqualitätsüberwachungssystem LUQS](https://www.lanuv.nrw.de/umwelt/luft/luftueberwachung/luftqualitaetsueber-wachungssystem-luqs) by [Landesamt für Natur, Umwelt und Verbraucherschutz Nordrhein-Westfalen LANUV](https://www.lanuv.nrw.de/).

## Install

```
$ npm install lanuv-parser or yarn add lanuv-parser
```

## Usage
```js
const luqs = require('lanuv-parser')

const run = async () => {
  const stations = await luqs()
  console.log(stations)
}

run()

```

## API

### luqs()
Returns an array containing all LUQS stations.

Source: https://www.lanuv.nrw.de/luqs/messorte/messorte.php

Optionally accepts an `options` object as first parameter:

- `status: aktiv|inaktiv|alle` returns stations with the specified status
- `allStations: true` returns all active and inactive stations. Overrides the `status` option **Deprecated**

### luqs.station(kuerzel)
Returns detailed information about a specific LUQS station

Source: https://www.lanuv.nrw.de/luqs/messorte/steckbrief.php?ort={KUERZEL}

Optionally accepts an `options` object as first parameter:

- `format: json|geojson` return the details in the specified format.

### luqs.aktuell()

Returns the current measurements for all LUQS stations.

Source: https://www.lanuv.nrw.de/fileadmin/lanuv/luft/immissionen/aktluftqual/eu_luft_akt.htm