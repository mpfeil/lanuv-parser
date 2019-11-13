const { Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'tutorial',
  password: 'password',
  port: 5432
})

const sql = 'SELECT * FROM conditions ORDER BY time DESC LIMIT 100;'

const run = async () => {
  try {
    await client.connect()
    const res = await client.query(sql)
    console.log(res)
    await client.end()
  } catch (error) {
    console.log(error)
  }
}

run()
