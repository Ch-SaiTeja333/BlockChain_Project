@echo off
echo Deploying IndustrialEquipmentRegistry.sol to local Hardhat network...
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
pause
