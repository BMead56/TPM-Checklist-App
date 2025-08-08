// backend/server.cjs
 
require('dotenv').config();             // loads .env if present
const express = require('express');
const sql     = require('mssql');
const cors    = require('cors');
const fs = require('fs');
const path = require('path');
 
const app = express();
const port = process.env.PORT;
 
// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '20mb' })); // Increased limit to 20mb
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// ─── SQL Server connection configuration ───────────────────────────────────────
const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  database: process.env.SQL_DATABASE,
  server: process.env.SQL_SERVER,
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
app.get('/api/tpm/getPlants', async (req, res) => {
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


app.get('/api/tpm/getLine', async (req, res) => {
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

app.get('/api/tpm/getQuestions', async (req, res) => {
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

app.get('/api/tpm/getNameByBadge/:badge', async (req, res) => {
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
app.get('/api/tpm/getDepartments', async (req, res) => {
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
app.get('/api/tpm/getLineTypes', async (req, res) => {
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

app.post('/api/tpm/submitResponses', async (req, res) => {
  const responses = req.body;

  if (!Array.isArray(responses)) {
    return res.status(400).json({ error: 'Expected an array of responses' });
  }

  try {
    const pool = await createPool();

    // 1. Get the current max RespID
    const result = await pool.request().query(`
      SELECT ISNULL(MAX(RespID), 0) AS maxRespID FROM [ignition].[dbo].[TPM_CL_Response]
    `);
    const newRespID = result.recordset[0].maxRespID + 1;

    // 2. Insert all responses with the new RespID
    for (const r of responses) {
      console.log('Processing response:', {
        qid: r.qid,
        hasImage: !!r.imageData,
        imageDataLength: r.imageData ? r.imageData.length : 0
      });
      let imagePath = null;
      if (r.imageData) {
        const now = new Date();
        const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 15); // YYYYMMDDHHmmss
        const ms = now.getMilliseconds();
        const lineName = r.lineId || 'unknownLine';
        const unique = Date.now() + '_' + Math.floor(Math.random() * 10000);
        const fileName = `${lineName}_${r.qid}_${unique}.jpg`; // UNIQUE!
        const saveDir = 'F:\\MFGSHARE\\TPM_Checklist';
        const savePath = path.join(saveDir, fileName);

        const base64Data = r.imageData.replace(/^data:image\/jpeg;base64,/, '');
        try {
          fs.writeFileSync(savePath, base64Data, 'base64');
          imagePath = savePath;
        } catch (err) {
          console.error('Failed to save image:', savePath, err);
          imagePath = null;
        }
      }

      await pool.request()
        .input('RespID', sql.Int, newRespID)
        .input('Plant', sql.VarChar(50), r.plantId)
        .input('line', sql.VarChar(50), r.lineId)
        .input('qid', sql.Int, r.qid)
        .input('name', sql.VarChar(100), r.name)
        .input('badge', sql.Int, parseInt(r.badge, 10))
        .input('response', sql.Bit, r.response)
        .input('timestamp', sql.DateTime, new Date(r.timestamp))
        .input('imagePath', sql.VarChar(255), imagePath)
        .query(`
          INSERT INTO [ignition].[dbo].[TPM_CL_Response] 
            (RespID, Plant, Line, QID, OpName, BadgeNum, Response, SubTime, ImgPath)
          VALUES 
            (@RespID, @Plant, @line, @qid, @name, @badge, @response, @timestamp, @imagePath)
        `);
    }

    res.json({ status: 'success', respID: newRespID });
  } catch (err) {
    console.error('Error saving responses:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ─── Start listening ───────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});