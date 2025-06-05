// backend/server.cjs
 
require('dotenv').config();             // loads .env if present
const express = require('express');
const sql     = require('mssql');
const cors    = require('cors');
 
const app = express();
const port = process.env.PORT || 3000;
 
// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// ─── SQL Server connection configuration ───────────────────────────────────────
const sqlConfig = {
  user: "MESUser",
  password: "MESUser_Qual!AFL",
  database: "Ignition",
  server: "SPBMES-QASQL",
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};
 
// ─── Create a singleton connection pool ─────────────────────────────────────────
let poolPromise = null;
 
async function createPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(sqlConfig)
      .connect()
      .then(pool => {
        console.log('🗄️  Connected to SQL Server');
        return pool;
      })
      .catch(err => {
        console.error('❌ Database Connection Failed: ', err);
        throw err;
      });
  }
  return poolPromise;
}
 
// Optional: kick off the pool connection at startup
createPool().catch(() => {
  console.error('Unable to establish database connection. Exiting.');
  process.exit(1);
});
 
// ─── 1. getLine endpoint (using a query parameter) ─────────────────────────────
// Client calls: GET /getLine?plantName=SPB
app.get('/getPlants', async (req, res) => {
  try {
    const pool = await createPool();
    const result = await pool.request().query(`
      SELECT DISTINCT Plant FROM ignition.dbo.TPM_CL_Assignments ORDER BY Plant;
    `);
    return res.json(result.recordset.map(row => row.Plant));
  } catch (err) {
    console.error('Error fetching plants:', err);
    return res.status(500).json({ error: 'Database query failed.' });
  }
});


app.get('/getLine', async (req, res) => {
  const plantName = req.query.plantName;
  if (!plantName) {
    return res.status(400).json({ error: 'Missing required query parameter: plantName' });
  }
 
  try {
    const pool = await createPool();
    const result = await pool.request()
      .input('plant', sql.VarChar(50), plantName)
      .query(`
        SELECT DISTINCT Plant, Line
        FROM ignition.dbo.TPM_CL_Assignments
        WHERE Plant = @plant
        ORDER BY Line;
      `);
 
    // result.recordset is an array of { Plant: 'SPB', Line: 'LineA' }, etc.
    return res.json(result.recordset);
  }
  catch (err) {
    console.error('Error fetching lines for plant:', err);
    return res.status(500).json({ error: 'Database query failed.' });
  }
});

app.get('/getQuestions', async (req, res) => {
  const lineName = req.query.lineName;
  if (!lineName) {
    return res.status(400).json({ error: 'Missing required query parameter: lineName' });
  }

  try {
    const pool = await createPool();
    const result = await pool.request()
      .input('line', sql.VarChar(50), lineName)
      .query(`
        SELECT q.QID, q.Question, a.ReqImg
        FROM ignition.dbo.TPM_CL_Questions q
        JOIN ignition.dbo.TPM_CL_Assignments a ON q.QID = a.QID
        WHERE a.Line = @line
        ORDER BY q.QID;
      `);

    return res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching questions for line:', err);
    return res.status(500).json({ error: 'Database query failed.' });
  }
});


 
// ─── 2. Health-check endpoint ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});
 
// ─── Start listening ───────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});