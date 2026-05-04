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
