@echo off
echo Building OwnStore Android Application with Google Sign-In...
echo.

echo Cleaning previous build...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo Error cleaning project
    pause
    exit /b 1
)

echo.
echo Building debug APK...
call gradlew assembleDebug
if %errorlevel% neq 0 (
    echo Error building project
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo APK location: android/app/build/outputs/apk/debug/app-debug.apk
echo.
echo To install on device:
echo 1. Enable USB debugging on your Android device
echo 2. Connect device via USB
echo 3. Run: adb install android/app/build/outputs/apk/debug/app-debug.apk
echo.
echo To test Google Sign-In:
echo 1. Install the APK on a physical device (not emulator)
echo 2. Ensure device has Google Play Services
echo 3. Open the app and tap "Sign in with Google"
echo.
pause
