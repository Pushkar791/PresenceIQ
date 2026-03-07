if (!(Test-Path -Path "backend/node_modules")) {
    Write-Host "Installing backend dependencies..."
    Set-Location -Path backend
    npm install
    Set-Location -Path ..
}

if (!(Test-Path -Path "frontend/node_modules")) {
    Write-Host "Installing frontend dependencies..."
    Set-Location -Path frontend
    npm install
    Set-Location -Path ..
}

Write-Host "Starting all services..."

# Start Backend
Write-Host "Starting Node.js Backend on port 5000..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; npm start`""

# Start Python API
Write-Host "Starting Python API on port 8000..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd python-api; pip install -r requirements.txt; python app.py`""

# Start Frontend
Write-Host "Starting Vite Frontend..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""

Write-Host "Services are starting in separate windows. Close those windows to stop them."
