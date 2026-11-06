const express = require('express');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 1. Root Route
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Internship REST API",
    endpoints: {
      getAll: "GET /api/internships?page=1&limit=5&domain=Engineering",
      getById: "GET /api/internships/:id",
      create: "POST /api/internships",
      update: "PUT /api/internships/:id",
      delete: "DELETE /api/internships/:id"
    }
  });
});

// 2. GET all internships with Pagination & Domain Filter
app.get('/api/internships', (req, res) => {
  let { page = 1, limit = 10, domain } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let query = `SELECT * FROM internships`;
  let countQuery = `SELECT COUNT(*) as total FROM internships`;
  let params = [];

  if (domain) {
    query += ` WHERE domain = ?`;
    countQuery += ` WHERE domain = ?`;
    params.push(domain);
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  db.get(countQuery, domain ? [domain] : [], (err, countRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({
        totalRecords: countRow.total,
        page,
        limit,
        totalPages: Math.ceil(countRow.total / limit),
        data: rows
      });
    });
  });
});

// 3. GET internship by ID
app.get('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  db.get(`SELECT * FROM internships WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Internship record not found." });
    }
    res.json(row);
  });
});

// 4. POST create new internship (with validation)
app.post('/api/internships', (req, res) => {
  const { title, company, domain, location, duration, stipend } = req.body;

  // Validation
  if (!title || !company || !domain || !location || !duration || !stipend) {
    return res.status(400).json({ 
      error: "Validation Error: All fields (title, company, domain, location, duration, stipend) are required." 
    });
  }

  const query = `INSERT INTO internships (title, company, domain, location, duration, stipend) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [title, company, domain, location, duration, stipend], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Internship created successfully",
      id: this.lastID,
      data: { id: this.lastID, title, company, domain, location, duration, stipend }
    });
  });
});

// 5. PUT update internship
app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { title, company, domain, location, duration, stipend } = req.body;

  if (!title || !company || !domain || !location || !duration || !stipend) {
    return res.status(400).json({ error: "Validation Error: All fields are required for update." });
  }

  const query = `UPDATE internships SET title = ?, company = ?, domain = ?, location = ?, duration = ?, stipend = ? WHERE id = ?`;
  db.run(query, [title, company, domain, location, duration, stipend, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Internship record not found." });
    }
    res.json({ message: "Internship updated successfully", id });
  });
});

// 6. DELETE internship
app.delete('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM internships WHERE id = ?`, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Internship record not found." });
    }
    res.json({ message: "Internship deleted successfully", id });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
