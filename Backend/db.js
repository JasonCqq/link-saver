const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const DBconnect = async () => {
  try {
    const client = new Client({
      host: process.env.PGHOST,
      user: process.env.PGUSER,
      port: process.env.PGPORT,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
    })

    await client.connect()
    const res = await client.query('SELECT * FROM weather');
    console.log(res);
    await client.end()
  } catch (err) {
    console.log(err);
  }
}

DBconnect();