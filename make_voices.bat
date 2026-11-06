@echo off
chcp 65001 > nul
set PYTHONIOENCODING=utf-8
cd /d "%~dp0"

echo ==============================================
echo   오늘부터 주무관 - 민원인 음성 만들기 (타입캐스트)
echo ==============================================
echo.

python --version > nul 2>&1
if errorlevel 1 (
  echo [!] 파이썬이 설치되어 있지 않아요.
  echo     python.org 에서 설치할 때 "Add python.exe to PATH" 를 꼭 체크하세요.
  pause
  exit /b
)

echo 필요한 프로그램을 설치하는 중... (처음 한 번만 조금 걸려요)
python -m pip install --quiet --upgrade typecast-python
echo.

if not exist "tools\typecast_key.txt" (
  set /p TYPECAST_API_KEY=타입캐스트 API 키를 붙여 넣고 Enter ^(붙여 넣기는 마우스 오른쪽 클릭^): 
  echo.
)
echo 무엇을 만들까요?
echo   1  과태료 시나리오(용식)만 먼저 시험
echo   2  없는 음성 전부 만들기
set /p CHOICE=번호 입력 후 Enter: 
echo.

if "%CHOICE%"=="1" (
  python tools\make_voices.py --only fine
) else (
  python tools\make_voices.py
)

echo.
echo 끝났어요. index.html 을 열어 소리를 들어 보세요.
pause
