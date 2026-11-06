# 오늘부터 주무관 — 민원 응대 시뮬레이션

부산대학교 행정학과 체험 부스용 웹 게임입니다.
순수 HTML/CSS/JS로 만들어져 별도 설치 없이 `index.html`을 열면 실행됩니다.

## 실행
- 로컬: `index.html`을 브라우저로 열기
- GitHub Pages: Settings → Pages → Branch `main` / `(root)` 선택 후 Save

## 대사·선택지 추가 방법
`js/data.js`의 `SCENARIOS`만 수정합니다. 체험자는 상황 3개 중 하나를 골라 플레이합니다.
점수는 없고, **대화가 흘러간 길에 따라 결말이 정해지는 분기형**입니다.

```js
opening: { mood: 'annoyed', text: '첫 대사', audio: '' },
start: 's',                                   // 첫 선택지 묶음 이름
nodes: {
  s: { choices: [
    { text: '주무관 대사',
      reply: { mood: 'angry', text: '이걸 골랐을 때 민원인 반응', audio: '' },
      next: 'b' },                            // 대화가 이어지면 다음 묶음 이름
    { text: '...', reply: {...}, ending: 'cold' }   // 여기서 끝나면 결말 이름
  ] },
  b: { choices: [ ... ] }
},
endings: {
  cold: { result: 'bad', title: '듣지 않은 원칙', summary: '보고서 해설' }
}
```

- 고른 선택지의 `reply`가 곧 다음 대사이고, `ending`에 닿으면 그 반응을 보여 준 뒤 결과 화면으로 넘어갑니다.
- `result`가 `happy`면 ‘민원 대응 완료’, `bad`면 ‘민원 대응 재검토’ 도장이 찍힙니다.
- `mood`: calm | upset | annoyed | angry | furious

## 이미지·음성 파일
| 경로 | 내용 |
|---|---|
| `assets/images/pnu-logo.png` | 부산대학교 가로 로고 |
| `assets/images/arise-pnu.png` | Arise PNU 로고 |
| `assets/images/admin-logo.png` | 동동행정 로고 |
| `assets/images/campus-1~4.jpg` | 시작 화면에 떠다니는 캠퍼스 사진 (부산대학교 홈페이지, 가로 1000px로 축소) |
| `assets/audio/<시나리오>/*.mp3` | 타입캐스트로 만든 민원인 음성 (총 69개 · 사장님 용식, 할매 숙희, 주민 김반장) |

### 민원인 음성 만들기 (타입캐스트)
대사마다 파일 이름이 이미 `js/data.js`에 정해져 있어서, 그 이름대로 mp3를 넣기만 하면 됩니다.
파일이 아직 없는 대사는 소리 없이 넘어가고 ‘다시 듣기’ 버튼도 숨겨집니다.

- **대본표:** `tools/voice-script.csv` (엑셀로 열림). 파일 이름, 읽을 대사(지문 뺀 문장), 추천 감정이 한 줄씩 있습니다.
- **방법 A — 에디터에서 직접:** 타입캐스트에서 시나리오에 맞는 캐릭터(과태료 용식 · 복지 숙희 · 소음 김반장)를 고르고 ‘읽을 대사’를 붙여 넣어 감정을 맞춘 뒤 mp3로 내려받아, ‘파일’ 칸의 이름으로 저장합니다.
- **방법 B — API로 한 번에 (Windows):** voice_id 3개와 API 키(`tools/typecast_key.txt`)가 이미 들어 있어서, 게임 폴더의 `make_voices.bat`를 더블클릭하고 번호만 고르면 됩니다.
- **방법 B-2 — 직접 실행:** `tools/make_voices.py` 맨 위 설명대로 API 키와 세 캐릭터의 voice_id를 넣고 `python tools/make_voices.py`를 실행하면 69개를 한 번에 만듭니다.

## 주의
- `tools/typecast_key.txt`에는 API 키가 들어 있습니다. `.gitignore`로 GitHub에 올라가지 않게 해 두었으니, 이 파일을 다른 곳에 공유하지 마세요.
- 학교 로고와 이미지는 학교의 자산입니다. 공개 저장소에 올리기 전에 사용 가능 범위를 확인하세요.
- 타입캐스트 음성은 플랜별 이용 조건(출처 표기, 공개 배포 가능 여부)을 확인한 뒤 저장소에 포함하세요.
- 게임 속 모든 상황과 인물은 교육용 가상 설정입니다.