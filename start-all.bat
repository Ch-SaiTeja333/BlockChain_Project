@echo off
echo =========================================================================
echo  Starting Industrial Equipment Maintenance Ledger (Full-Stack System)
echo =========================================================================

echo [1/4] Starting Local Hardhat Blockchain Node (Port 8545)...
start "Hardhat Node (Ethereum Localhost 8545)" cmd /k "cd blockchain && npx hardhat node"

echo Waiting 5 seconds for Hardhat node initialization...
powershell -Command "Start-Sleep -Seconds 5"

echo [2/4] Deploying Smart Contracts and Initializing Ledger Data...
cd blockchain && npx hardhat run scripts/deploy.js --network localhost && cd ..

echo [3/4] Seeding Database and Starting Express API Backend (Port 5000)...
start "Express Backend API (Port 5000)" cmd /k "cd backend && node src/seed.js && npm start"

echo [4/4] Starting Vite React Frontend Dashboard (Port 5173)...
start "Vite React Dashboard (Port 5173)" cmd /k "cd frontend && npm run dev"

echo =========================================================================
echo  All services launched in separate windows!
echo  Frontend UI: http://localhost:5173
echo  Backend API: http://localhost:5000/api/health
echo  Hardhat RPC: http://127.0.0.1:8545 (Chain ID: 31337)
echo =========================================================================
pause
