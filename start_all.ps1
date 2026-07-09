if (!(Test-Path -Path "backend/node_modules")) {
    Set-Location -Path backend
    npm install
    Set-Location -Path ..
}

if (!(Test-Path -Path "frontend/node_modules")) {
    Set-Location -Path frontend
    npm install
    Set-Location -Path ..
}

Start-Process powershell -ArgumentList "-NoExit -Command `"cd backend; npm start`""
Start-Process powershell -ArgumentList "-NoExit -Command `"cd python-api; pip install -r requirements.txt; python app.py`""
Start-Process powershell -ArgumentList "-NoExit -Command `"cd frontend; npm run dev`""
