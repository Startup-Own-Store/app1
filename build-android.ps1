Write-Host "Building OwnStore Android Application with Google Sign-In..." -ForegroundColor Green
Write-Host ""

Write-Host "Cleaning previous build..." -ForegroundColor Yellow
Set-Location android
& ./gradlew clean
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error cleaning project" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "Building debug APK..." -ForegroundColor Yellow
& ./gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building project" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "APK location: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Cyan
Write-Host ""
Write-Host "To install on device:" -ForegroundColor Yellow
Write-Host "1. Enable USB debugging on your Android device"
Write-Host "2. Connect device via USB"
Write-Host "3. Run: adb install android/app/build/outputs/apk/debug/app-debug.apk"
Write-Host ""
Write-Host "To test Google Sign-In:" -ForegroundColor Yellow
Write-Host "1. Install the APK on a physical device (not emulator)"
Write-Host "2. Ensure device has Google Play Services"
Write-Host "3. Open the app and tap 'Sign in with Google'"
Write-Host ""
Read-Host "Press Enter to continue"
