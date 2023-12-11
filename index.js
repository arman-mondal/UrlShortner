const express = require('express');
const mysql = require('mysql2');
const winston = require('winston');
const path = require('path');
require('dotenv').config();
// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs.log' })
  ]
});

// MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password:process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    logger.error('Error connecting to MySQL database:', err);
    return;
  }
  logger.info('Connected to MySQL database');
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint to create a short URL
app.post('/shorten', (req, res) => {
  const { longUrl } = req.body;

  // Generate a short code (for simplicity, using a random string)
  const shortCode = Math.random().toString(36).substr(2, 7);

  // Save the short URL and original URL in the database
  const sql = 'INSERT INTO urls (long_url, short_code) VALUES (?, ?)';
  db.query(sql, [longUrl, shortCode], (err, result) => {
    if (err) {
      logger.error('Error creating short URL:', err);
      res.status(500).json({ error: 'Unable to create short URL' });
      return;
    }
    const shortUrl = `https://shortner.techarman.me/${shortCode}`;
    res.status(201).json({ shortUrl });
    logger.info(`Short URL created: ${shortUrl} for ${longUrl}`);
  });
});

// Endpoint to redirect to the original URL
app.get('/:shortCode', (req, res) => {
  const { shortCode } = req.params;

  // Retrieve the original URL from the database
  const sql = 'SELECT long_url FROM urls WHERE short_code = ?';
  db.query(sql, [shortCode], (err, result) => {
    if (err) {
      logger.error('Error fetching original URL:', err);
      res.status(500).json({ error: 'Unable to fetch original URL' });
      return;
    }
    if (result.length > 0) {
      const longUrl = result[0].long_url;
      res.redirect(longUrl);
      logger.info(`Redirecting from ${shortCode} to ${longUrl}`);
    } else {
      res.status(404).json({ error: 'Short URL not found' });
    }
  });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public','index.html'));
});
app.get('/files/css',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public','style.css'));
}
);
app.get('/files/js',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public','script.js'));
}
);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
