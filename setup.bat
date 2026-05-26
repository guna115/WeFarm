@echo off
echo ========================================
echo  🌱 WeFarm — Project Setup
echo ========================================
echo.

echo [1/4] Installing frontend dependencies...
cd /d "c:\guna cade\WEFARM\frontend"
call npm install
echo.

echo [2/4] Installing backend dependencies...
cd /d "c:\guna cade\WEFARM\backend"
call npm install
echo.

echo [3/4] Setting up database tables...
cd /d "c:\guna cade\WEFARM\backend"
node -e "const { Pool } = require('pg'); require('dotenv').config(); const fs = require('fs'); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); const sql = fs.readFileSync('src/config/schema.sql', 'utf8'); pool.query(sql).then(() => { console.log('✅ Database tables created!'); pool.end(); }).catch(e => { console.error('❌ DB Error:', e.message); pool.end(); });"
echo.

echo [4/4] Setup complete!
echo.
echo ========================================
echo  To start the project, run:
echo    Terminal 1: cd frontend ^&^& npm run dev
echo    Terminal 2: cd backend ^&^& npm run dev
echo ========================================
pause
