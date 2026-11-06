const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'internships.db');

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Table and Seed Initial Data
    db.run(`CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      domain TEXT NOT NULL,
      location TEXT NOT NULL,
      duration TEXT NOT NULL,
      stipend TEXT NOT NULL
    )`, (createErr) => {
      if (!createErr) {
        // Insert seed records if table is empty
        db.get(`SELECT COUNT(*) as count FROM internships`, (countErr, row) => {
          if (row.count === 0) {
            const seedData = [
              ["Java Full Stack Developer Intern", "TechNova Solutions", "Engineering", "Remote / Bengaluru", "6 Months", "₹25,000 / month"],
              ["UI/UX Product Designer", "Creative Studio", "Design", "Hybrid / Chennai", "3 Months", "₹18,000 / month"],
              ["Associate Product Manager Intern", "NextGen Mobility", "Product", "Remote", "6 Months", "₹30,000 / month"],
              ["Digital Marketing Specialist", "GrowthPulse", "Marketing", "On-site / Hyderabad", "4 Months", "₹15,000 / month"],
              ["Backend Engineering Intern (Java/Spring)", "CloudScale Systems", "Engineering", "Remote", "6 Months", "₹28,000 / month"]
            ];
            
            const stmt = db.prepare(`INSERT INTO internships (title, company, domain, location, duration, stipend) VALUES (?, ?, ?, ?, ?, ?)`);
            seedData.forEach(item => stmt.run(item));
            stmt.finalize();
            console.log('Database seeded with initial records.');
          }
        });
      }
    });
  }
});

module.exports = db;
