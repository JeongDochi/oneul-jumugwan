"""
타입캐스트 API로 민원인 음성 파일을 한 번에 만드는 스크립트

준비
  1) python -m pip install --upgrade typecast-python
  2) 타입캐스트 API 키를 tools/typecast_key.txt 에 한 줄로 저장 (이미 들어 있음)
  3) 쓸 캐릭터(용식·숙희·김반장)의 voice_id 확인 후 아래에 붙여 넣기

실행 (프로젝트 폴더에서)
  python tools/make_voices.py              # 아직 없는 파일만 만들기
  python tools/make_voices.py --only fine  # 과태료 시나리오만
  python tools/make_voices.py --force      # 이미 있는 파일도 다시 만들기

대본은 tools/voice-script.csv 에서 읽습니다.
'읽을 대사' 칸은 (책상을 쾅 내리치며) 같은 지문을 뺀 문장이라 그대로 읽힙니다.
"""

import argparse
import csv
import os
import sys

# 시나리오별 목소리. voice_id 는 https://typecast.ai/developers/api/voices 에서 이름으로 찾아 붙여 넣기
SHOP_OWNER = "tc_5feb2085cca1a479e73bac37"   # 용식 · 과태료 이의 · 동네 가게 사장님
GRANDMA    = "tc_61c2f70c343884babeed840b"   # 숙희 · 복지 급여 탈락 · 70대 할매
RESIDENT   = "tc_63aaebf1cef3e7d6ce6d3628"   # 김반장 · 공사장 소음 · 아파트 주민
VOICES = {
    "fine": SHOP_OWNER,
    "welfare": GRANDMA,
    "noise": RESIDENT,
}

MODEL = "ssfm-v30"
TEMPO = 1.0              # 말 빠르기 (0.5 ~ 2.0)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SCRIPT = os.path.join(HERE, "voice-script.csv")
KEY_FILE = os.path.join(HERE, "typecast_key.txt")   # API 키 보관 파일 (GitHub에 올라가지 않음)


def load_key():
    key = os.environ.get("TYPECAST_API_KEY", "").strip()
    if not key and os.path.exists(KEY_FILE):
        with open(KEY_FILE, encoding="utf-8") as f:
            key = f.read().strip()
    return key


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="fine / welfare / noise 중 하나만 만들기")
    ap.add_argument("--force", action="store_true", help="이미 있는 파일도 다시 만들기")
    args = ap.parse_args()

    needed = [k for k, v in VOICES.items() if "여기에" in v and (not args.only or k == args.only)]
    if needed:
        sys.exit("tools/make_voices.py 맨 위에 voice_id 를 먼저 넣어 주세요: " + ", ".join(needed))

    from typecast import Typecast
    from typecast.models import TTSRequest, PresetPrompt, Output

    key = load_key()
    if not key:
        sys.exit("API 키가 없어요. tools/typecast_key.txt 에 키를 한 줄로 넣어 주세요.")
    client = Typecast(api_key=key)

    with open(SCRIPT, encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))

    made = skipped = failed = 0
    for row in rows:
        rel = row["파일"]
        scenario = rel.split("/")[2]
        if args.only and scenario != args.only:
            continue
        out = os.path.join(ROOT, rel)
        if os.path.exists(out) and not args.force:
            skipped += 1
            continue
        os.makedirs(os.path.dirname(out), exist_ok=True)

        try:
            res = client.text_to_speech(TTSRequest(
                text=row["읽을 대사"],
                voice_id=VOICES[scenario],
                model=MODEL,
                language="kor",
                prompt=PresetPrompt(
                    emotion_type="preset",
                    emotion_preset=row["추천 감정"],
                    emotion_intensity=float(row["감정 강도"]),
                ),
                output=Output(audio_format="mp3", audio_tempo=TEMPO),
            ))
            data = getattr(res, "audio_data", None) or getattr(res, "audio", None)
            with open(out, "wb") as w:
                w.write(data)
            made += 1
            print("만듦  ", rel)
        except Exception as e:  # 캐릭터가 지원하지 않는 감정이면 여기서 실패할 수 있음
            failed += 1
            print("실패  ", rel, "-", e)

    print(f"\n만듦 {made} · 건너뜀 {skipped} · 실패 {failed}")
    if failed:
        print("실패한 줄은 voice-script.csv 의 '추천 감정'을 normal 로 바꾸고 다시 실행해 보세요.")


if __name__ == "__main__":
    main()
