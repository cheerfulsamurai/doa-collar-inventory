const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

const SEED = [
  {id:'s1', serial:'16535',   type:'2 Dog Micro',   status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s2', serial:'16578',   type:'2 Dog Micro',   status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s3', serial:'16579',   type:'2 Dog Micro',   status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s4', serial:'95750',   type:'2 Dog Standard',status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s5', serial:'102040',  type:'2 Dog Standard',status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s6', serial:'102104',  type:'2 Dog Standard',status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s7', serial:'102378',  type:'2 Dog Standard',status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s8', serial:'138190',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s9', serial:'139344',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s10',serial:'141442',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s11',serial:'142867',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s12',serial:'143553',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s13',serial:'147646',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s14',serial:'147728',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s15',serial:'149094',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s16',serial:'149345',  type:'Micro',         status:'Assigned to Client', client:'Shaw, Sue',              date:'2026-02-17', trainer:'Amya'},
  {id:'s17',serial:'149359',  type:'Micro',         status:'Assigned to Client', client:'Cole, Alyssa',           date:'2026-04-29', trainer:'Amya'},
  {id:'s18',serial:'149403',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s19',serial:'149413',  type:'Micro',         status:'Assigned to Client', client:'Tuss, Melissa',          date:'2026-03-11', trainer:'Amya'},
  {id:'s20',serial:'149751',  type:'Micro',         status:'Delivered',          client:'LeBaron',                date:'2026-01-17', trainer:'Dom'},
  {id:'s21',serial:'149752',  type:'Micro',         status:'Assigned to Client', client:'Jablonski, Lisa',        date:'2026-03-10', trainer:'Dom'},
  {id:'s22',serial:'150022',  type:'Micro',         status:'Delivered',          client:'Dills, Jenifer',         date:'2026-01-23', trainer:'Amya'},
  {id:'s23',serial:'150023',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s24',serial:'150024',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s25',serial:'150025',  type:'Micro',         status:'Assigned to Client', client:'Grosby, Alexander',      date:'2026-04-11', trainer:'Amya'},
  {id:'s26',serial:'150030',  type:'Micro',         status:'Delivered',          client:'Irizarry, Nicky',        date:'2026-01-27', trainer:'Amya'},
  {id:'s27',serial:'150037',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s28',serial:'150040',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s29',serial:'150044',  type:'Micro',         status:'Delivered',          client:'Gutierrez, Patricia',    date:'2026-01-13', trainer:'Dom'},
  {id:'s30',serial:'150045',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s31',serial:'150064',  type:'Micro',         status:'Delivered',          client:'Fulghum, Hillary',       date:'2026-02-19', trainer:'Turk'},
  {id:'s32',serial:'150071',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s33',serial:'150077',  type:'Micro',         status:'Assigned to Client', client:'Mccloskey, Luke',        date:'2026-04-02', trainer:'Amya'},
  {id:'s34',serial:'150100',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s35',serial:'150207',  type:'Micro',         status:'Assigned to Client', client:'Bishop, Karen',          date:'2026-04-14', trainer:'Dom'},
  {id:'s36',serial:'150215',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s37',serial:'150216',  type:'Micro',         status:'Assigned to Client', client:'Kota, Prithivi',         date:'2026-02-16', trainer:'Dom'},
  {id:'s38',serial:'150217',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s39',serial:'150224',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s40',serial:'150234',  type:'Micro',         status:'Assigned to Client', client:'Padget, Susan',          date:'2026-03-18', trainer:'Dom'},
  {id:'s41',serial:'150274',  type:'Micro',         status:'Assigned to Client', client:'Trovato, Michele',       date:'2026-03-04', trainer:'Amya'},
  {id:'s42',serial:'150909',  type:'Micro',         status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s43',serial:'1493459', type:'Standard',      status:'Assigned to Client', client:'Moxim, Lona & Eric',     date:'2026-01-22', trainer:'Amya'},
  {id:'s44',serial:'1512149', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s45',serial:'1512432', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s46',serial:'1512503', type:'Standard',      status:'Assigned to Client', client:'Thompson, Snoopy',       date:'2026-03-14', trainer:'Amya'},
  {id:'s47',serial:'1512507', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s48',serial:'1512509', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s49',serial:'1588166', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s50',serial:'1588167', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s51',serial:'1589184', type:'Standard',      status:'Assigned to Client', client:'James, Kassidy',         date:'2026-02-26', trainer:'Amya'},
  {id:'s52',serial:'1589185', type:'Standard',      status:'Delivered',          client:'Moxim, Lona & Eric',     date:'2026-01-22', trainer:'Amya'},
  {id:'s53',serial:'1590035', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s54',serial:'1590037', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s55',serial:'1590046', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s56',serial:'1590047', type:'Standard',      status:'Assigned to Client', client:'Frapech, Katrina',       date:'2026-03-20', trainer:'Amya'},
  {id:'s57',serial:'1590048', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s58',serial:'1590049', type:'Standard',      status:'Assigned to Client', client:'Neuwirth, Lily',         date:'2026-04-02', trainer:'Amya'},
  {id:'s59',serial:'1590051', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s60',serial:'1590064', type:'Standard',      status:'Assigned to Client', client:'Stack, Kristina & David',date:'2026-02-06', trainer:'Dom'},
  {id:'s61',serial:'1590065', type:'Standard',      status:'Assigned to Client', client:'Szymeczek, Suzy',        date:'2026-03-27', trainer:'Amya'},
  {id:'s62',serial:'1590066', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s63',serial:'1590067', type:'Standard',      status:'Assigned to Client', client:'Price, Candice & Jared', date:'2026-02-18', trainer:'Dom'},
  {id:'s64',serial:'1590068', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s65',serial:'1590069', type:'Standard',      status:'Assigned to Client', client:'Nofsinger, Olivia',      date:'2026-04-08', trainer:'Amya'},
  {id:'s66',serial:'1603470', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s67',serial:'1603471', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
  {id:'s68',serial:'1603472', type:'Standard',      status:'Client Ready',       client:'', date:'', trainer:''},
];

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS collars (
      id         VARCHAR(50)  PRIMARY KEY,
      serial     VARCHAR(50)  NOT NULL UNIQUE,
      type       VARCHAR(50)  NOT NULL,
      status     VARCHAR(50)  NOT NULL DEFAULT 'Received',
      client     VARCHAR(200) NOT NULL DEFAULT '',
      date       VARCHAR(20)  NOT NULL DEFAULT '',
      trainer    VARCHAR(100) NOT NULL DEFAULT '',
      created_at TIMESTAMP    DEFAULT NOW()
    )
  `);
  const { rows } = await pool.query('SELECT COUNT(*) FROM collars');
  if (parseInt(rows[0].count) === 0) {
    for (const c of SEED) {
      await pool.query(
        'INSERT INTO collars (id,serial,type,status,client,date,trainer) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [c.id, c.serial, c.type, c.status, c.client, c.date, c.trainer]
      );
    }
    console.log('Seeded 68 collars');
  }
}

app.get('/api/collars', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM collars ORDER BY created_at ASC');
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

app.post('/api/collars', async (req, res) => {
  const { serial, type } = req.body;
      const id = require('crypto').randomUUID();
  try {
    const { rows } = await pool.query(
      'INSERT INTO collars (id,serial,type,status,client,date,trainer) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [id, serial, type, 'Received', '', '', '']
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

app.patch('/api/collars/:id', async (req, res) => {
  const { id } = req.params;
  const { status, client, date, trainer } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE collars SET status=$1, client=$2, date=$3, trainer=$4 WHERE id=$5 RETURNING *',
      [status, client || '', date || '', trainer || '', id]
    );
    res.json(rows[0]);
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

app.delete('/api/collars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM collars WHERE id=$1', [id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

initDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => { console.error('DB init failed:', err); process.exit(1); });
