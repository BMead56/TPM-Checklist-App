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
        console.error('Database Connection Failed: ', err);
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
      SELECT DISTINCT Plant
      FROM ignition.dbo.TPM_CL_Assignments
      ORDER BY Plant;
    `);
    return res.json(result.recordset.map(row => ({
      value: row.Plant,  // or row.PlantName if your backend uses that name
      label: row.Plant  // or row.PlantName
    })));
  } catch (err) {
    console.error('Error fetching plants:', err);
    return res.status(500).json({ error: 'Database query failed.' });
  }
});


app.get('/getLine', async (req, res) => {
  const { plantName, department, lineType } = req.query;

  if (!plantName || !department || !lineType) {
    return res.status(400).json({ error: 'Missing required query parameters' });
  }

  try {
    const pool = await createPool();
    const result = await pool.request()
      .input('plant', sql.VarChar(50), plantName)
      .input('department', sql.VarChar(50), department)
      .input('lineType', sql.VarChar(50), lineType)
      .query(`
        SELECT DISTINCT Plant, Line, BU AS departmentId, Type AS lineTypeId
        FROM ignition.dbo.TPM_CL_Assignments
        WHERE Plant = @plant AND BU = @department AND Type = @lineType
        ORDER BY Line;
      `);

    return res.json(result.recordset.map(row => ({
      value: row.Line,
      label: row.Line,
      plantId: row.Plant,
      departmentId: row.departmentId,
      lineTypeId: row.lineTypeId
    })));
  } catch (err) {
    console.error('Error fetching lines:', err);
    res.status(500).json({ error: 'Internal server error' });
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

app.get('/getNameByBadge/:badge', async (req, res) => {
  const badge = parseInt(req.params.badge, 10);
  try {
    const pool = await createPool();
    const result = await pool.request()
      .input('badge', sql.Int, badge)
      .query(`SELECT display_name FROM ignition.dbo.EmployeesInfo WHERE badge_number = @badge`);
    if (result.recordset.length > 0) {
      res.json({ name: result.recordset[0].display_name });
    } else {
      res.json({ name: '' });
    }
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).json({'Error fetching name': err.message});
  }
});


// ─── Get Departments (BU) ───────────────────────────────
app.get('/getDepartments', async (req, res) => {
  try {
    const pool = await createPool();
    const result = await pool.request().query(`
      SELECT DISTINCT BU
      FROM ignition.dbo.TPM_CL_Assignments
      ORDER BY BU;
    `);

    return res.json(result.recordset.map(row => ({ 
      value: row.BU,
      label: row.BU
    })));
  } catch (err) {
    console.error('Error fetching departments:', err);
    return res.status(500).json({ error: 'Database query failed.' });
  }
});

// ─── Get Line Types (Type) ───────────────────────────────
app.get('/getLineTypes', async (req, res) => {
  try {
    const pool = await createPool();
    const result = await pool.request().query(`
      SELECT DISTINCT Type
      FROM ignition.dbo.TPM_CL_Assignments
      ORDER BY Type;
    `);
    return res.json(result.recordset.map(row => ({
      value: row.Type,
      label: row.Type
    })));
  } catch (err) {
    console.error('Error fetching line types:', err);
    return res.status(500).json({ error: 'Database query failed.' });
  }
});



 
// ─── 2. Health-check endpoint ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/submitResponses', async (req, res) => {
  const responses = req.body;

  if (!Array.isArray(responses)) {
    return res.status(400).json({ error: 'Expected an array of responses' });
  }

  try {
    const pool = await createPool();

    for (const r of responses) {
      await pool.request()
        .input('line', sql.VarChar(50), r.lineId)
        .input('qid', sql.Int, r.qid)
        .input('name', sql.VarChar(100), r.name)
        .input('response', sql.Bit, r.response)
        .input('timestamp', sql.DateTime, new Date(r.timestamp))
        .input('imagePath', sql.VarChar(255), r.imagePath)
        .query(`
          INSERT INTO [ignition].[dbo].[TPM_CL_Responses] (Line, QID, Name, Response, Timestamp, ImagePath)
          VALUES (@line, @qid, @name, @response, @timestamp, @imagePath)
        `);
    }

    res.json({ status: 'success' });
  } catch (err) {
    console.error('Error saving responses:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Start listening ───────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});