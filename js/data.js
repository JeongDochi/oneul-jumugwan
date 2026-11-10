/* ============================================================
   게임 설정 + 시나리오 데이터 (분기형)
   - 대사/선택지/음성 파일은 이 파일만 수정하면 됩니다.
   - 점수 없이, 대화가 흘러간 길에 따라 결말이 정해집니다.

   구조
   opening : 민원인 첫 대사
   start   : 첫 선택지 묶음(노드) 이름
   nodes   : { 노드이름: { choices: [ 선택지, ... ] } }
   선택지   : { text: 주무관 대사,
               reply: { mood, text, audio },   ← 이 선택지를 골랐을 때 민원인 반응
               next: '다음 노드'  또는  ending: '결말 이름' }
   endings : { 결말이름: { result: 'happy' | 'bad', title, summary } }

   mood: calm | upset | annoyed | angry | furious → 민원인 표정
   audio: 타입캐스트 음성 파일 경로. 아직 없으면 '' 로 두기
   ============================================================ */

const GAME_CONFIG = {
  idleResetMs: 0,           // 부스 운영 시 120000(2분) 등으로 설정하면 무조작 시 첫 화면 복귀. 0이면 꺼짐
  typeSpeedMs: 28,          // 대사 타자 효과 속도
  voiceRate: 1.2,           // 민원인 음성 재생 속도 (1 = 원래 속도, 1.2 = 1.2배속). 0.5 ~ 2 사이로
  stampLabel: {
    happy: '민원 대응 완료',
    bad: '민원 대응 재검토'
  }
};

const SCENARIOS = [
  /* =========================================================
     1. 주정차 과태료 이의 (공정성)
     노드: s 시작 → a 공감받음 / b 차가워서 화남 / c 특혜 기대
           → a2 수긍 / r2 어긋났다 수습 중 / c2 특혜 기대 굳음
     ========================================================= */
  {
    id: 'fine',
    type: '과태료 이의',
    value: '공정성',
    title: '“5분 세웠는데 과태료라니요?”',
    intro: '주정차 위반 과태료 고지서를 든 민원인이 억울하다며 창구로 다가옵니다.',
    complainant: { name: '민원인 A · 동네 가게 사장님', character: 'owner' },   // character: owner / grandma / resident
    opening: {
      mood: 'annoyed',
      text: '아니 보소, 가게 앞에 물건 쫌 내린다꼬 딱 5분 세웠다 아입니꺼. 그걸로 과태료를 매기는 기 말이 됩니꺼?',
      audio: 'assets/audio/fine/opening.mp3'
    },
    start: 's',
    nodes: {
      s: { choices: [
        { text: '단속은 단속입니다. 고지서대로 납부하시면 됩니다.', next: 'b',
          reply: { mood: 'angry', text: '머라꼬예? 사람 말은 듣지도 않고! 옆 가게 사장은 구청에 말하이까 빼 줬다 카던데, 와 내만 안 되는데예!', audio: 'assets/audio/fine/s-1.mp3' } },
        { text: '많이 억울하셨겠어요. 어떤 상황이었는지 먼저 들어 보고, 단속 기준도 함께 설명드릴게요.', next: 'a',
          reply: { mood: 'annoyed', text: '그래, 들어나 보소. 근데 옆 가게 사장은 말하이까 빼 줬다 카던데, 와 내만 안 되는데예?', audio: 'assets/audio/fine/s-2.mp3' } },
        { text: '5분이면 봐드릴 수도 있을 것 같은데, 제가 한번 빼 볼게요.', next: 'c',
          reply: { mood: 'calm', text: '아이고, 말이 통하네! 옆 가게 사장도 그래 빼 줬다 카더라. 그라믄 내도 확실히 빼 주는 거지예?', audio: 'assets/audio/fine/s-3.mp3' } }
      ] },

      a: { choices: [
        { text: '그분은 아마 아는 사람이 있었나 봐요. 저도 위에 한번 말씀드려 볼게요.', next: 'c2',
          reply: { mood: 'calm', text: '역시 말하믄 되는 기네! 그라믄 고지서는 여 두고 가믄 되지예? 확실히 해 주소.', audio: 'assets/audio/fine/a-1.mp3' } },
        { text: '다른 분 처리 내용은 말씀드릴 수 없지만, 같은 기준이 모든 분께 똑같이 적용됩니다. 그래야 사장님도 손해 보지 않으세요.', next: 'a2',
          reply: { mood: 'upset', text: '…하모, 내도 남들만큼만 하믄 된다. 그라믄 내는 그냥 돈 내라는 기가? 방법이 하나도 없나?', audio: 'assets/audio/fine/a-2.mp3' } },
        { text: '다른 사람 얘기는 하지 마세요. 규정이 그렇습니다.', next: 'r2',
          reply: { mood: 'angry', text: '규정, 규정! 들어 준다 카더니 결국 그 소리가? …그래, 그라믄 방법이 하나도 없나?', audio: 'assets/audio/fine/a-3.mp3' } }
      ] },

      b: { choices: [
        { text: '제가 말씀을 너무 딱딱하게 드렸네요, 죄송합니다. 다른 분 처리 내용은 말씀드릴 수 없지만, 기준은 모든 분께 똑같습니다.', next: 'r2',
          reply: { mood: 'annoyed', text: '…그래, 말이라도 그래 해 주이 쫌 낫네. 그라믄 내는 그냥 돈 내라는 기가? 방법이 하나도 없나?', audio: 'assets/audio/fine/b-1.mp3' } },
        { text: '다른 사람 얘기는 하지 마세요. 규정이 그렇습니다.', ending: 'cold',
          reply: { mood: 'furious', text: '됐다 마! 말이 안 통하네. 내 다시는 여 안 온다!', audio: 'assets/audio/fine/b-2.mp3' } },
        { text: '알겠어요, 알겠어요. 화 푸세요, 이번만 빼 드릴게요.', next: 'c2',
          reply: { mood: 'calm', text: '진작 그래 할 일이지! 그라믄 고지서는 여 두고 가믄 되지예? 확실히 해 주소.', audio: 'assets/audio/fine/b-3.mp3' } }
      ] },

      c: { choices: [
        { text: '네, 걱정 마세요. 확실히 빼 드릴게요.', next: 'c2',
          reply: { mood: 'calm', text: '하모, 이래야 구청이지! 그라믄 고지서는 여 두고 가믄 되지예?', audio: 'assets/audio/fine/c-1.mp3' } },
        { text: '아, 그건 그냥 해 본 말이고요. 규정상 내셔야 합니다.', ending: 'broken',
          reply: { mood: 'furious', text: '머라카노? 빼 준다 캐 놓고 말을 바꾸나! 사람 갖고 노나, 내 민원 넣을 끼다!', audio: 'assets/audio/fine/c-2.mp3' } },
        { text: '제가 섣불리 말씀드렸습니다, 죄송합니다. 다른 분 처리 내용은 말씀드릴 수 없지만, 기준은 모든 분께 똑같이 적용돼요.', next: 'r2',
          reply: { mood: 'annoyed', text: '뭐꼬, 빼 준다 카더니… 사람 헷갈리게. 그라믄 내는 그냥 돈 내라는 기가? 방법이 하나도 없나?', audio: 'assets/audio/fine/c-3.mp3' } }
      ] },

      a2: { choices: [
        { text: '일단 고지서는 두고 가세요. 제가 알아서 처리해 둘게요.', ending: 'favor',
          reply: { mood: 'calm', text: '참말이가? 고맙데이! 나중에 딴말하믄 안 된데이.', audio: 'assets/audio/fine/a2-1.mp3' } },
        { text: '네, 방법 없습니다. 기한 넘기면 가산금 붙으니 빨리 내세요.', ending: 'cold',
          reply: { mood: 'furious', text: '와, 끝까지 들어 놓고 말은 정 없이 하네! 내 다시는 여 안 온다!', audio: 'assets/audio/fine/a2-2.mp3' } },
        { text: '사정이 있으셨다면 정해진 기간 안에 의견을 내실 수 있어요. 서류 작성을 도와드리고, 기한 안에 내시면 금액이 줄어드는 제도도 같이 안내해 드릴게요.', ending: 'best',
          reply: { mood: 'calm', text: '아, 그런 방법이 있었나. 진작 알았으믄 좋았을 낀데. 고마 서류 같이 써 봅시다.', audio: 'assets/audio/fine/a2-3.mp3' } }
      ] },

      r2: { choices: [
        { text: '사정이 있으셨다면 정해진 기간 안에 의견을 내실 수 있어요. 서류 작성을 도와드리고, 기한 안에 내시면 금액이 줄어드는 제도도 같이 안내해 드릴게요.', ending: 'recovered',
          reply: { mood: 'calm', text: '…그런 방법이 있으믄 처음부터 그래 말하지. 알았다, 서류 같이 써 봅시다.', audio: 'assets/audio/fine/r2-1.mp3' } },
        { text: '그럼 이번만 고지서 두고 가세요. 제가 알아서 해 볼게요.', ending: 'favor',
          reply: { mood: 'calm', text: '그라믄 진작 그래 해 주지! 딴말하기 없기다.', audio: 'assets/audio/fine/r2-2.mp3' } },
        { text: '네, 방법 없습니다. 기한 넘기면 가산금 붙으니 빨리 내세요.', ending: 'cold',
          reply: { mood: 'furious', text: '와, 진짜 말 한번 정 없이 하네! 내 다시는 여 안 온다!', audio: 'assets/audio/fine/r2-3.mp3' } }
      ] },

      c2: { choices: [
        { text: '네, 두고 가세요. 제가 알아서 처리해 둘게요.', ending: 'favor',
          reply: { mood: 'calm', text: '고맙데이! 역시 말하믄 다 되네.', audio: 'assets/audio/fine/c2-1.mp3' } },
        { text: '제가 드린 말씀은 지킬 수 없는 약속이었습니다, 죄송합니다. 대신 정해진 기간 안에 의견을 내시는 방법과 금액이 줄어드는 제도를 안내해 드릴게요.', ending: 'late',
          reply: { mood: 'angry', text: '이제 와서 말을 바꾸나? …그래도 거짓말로 넘기는 것보단 낫다. 서류나 줘 보소.', audio: 'assets/audio/fine/c2-2.mp3' } },
        { text: '아니요, 그건 안 됩니다. 그냥 납부하세요.', ending: 'broken',
          reply: { mood: 'furious', text: '빼 준다 캐 놓고 이제 와서 그냥 내라꼬? 사람 갖고 노나!', audio: 'assets/audio/fine/c2-3.mp3' } }
      ] }
    },
    endings: {
      best:      { result: 'happy', title: '모범 대응',
                   summary: '공감 → 형평성 설명 → 정식 절차 안내까지 흔들림 없이 이어졌어요. 공정성은 ‘모두에게 같은 기준’과 ‘누구나 쓸 수 있는 구제 절차’가 함께 있을 때 지켜집니다.' },
      recovered: { result: 'happy', title: '실수를 바로잡은 대응',
                   summary: '중간에 말이 어긋났지만, 잘못을 인정하고 정식 절차를 안내해 수습했어요. 실수보다 중요한 건 바로잡는 태도입니다.' },
      late:      { result: 'bad',   title: '늦게 바로잡은 약속',
                   summary: '끝내 바로잡은 건 다행이지만, 이미 ‘빼 주겠다’고 약속한 탓에 신뢰를 잃었어요. 권한 밖의 약속은 처음부터 하지 않는 것이 원칙입니다.' },
      favor:     { result: 'bad',   title: '특혜 처리',
                   summary: '민원인은 웃으며 돌아갔지만, ‘알아서 처리’는 특혜예요. 같은 위반에 다른 결과가 나오면 형평성이 무너지고 다른 시민이 손해를 봅니다.' },
      cold:      { result: 'bad',   title: '듣지 않은 원칙',
                   summary: '규정은 지켰지만 듣지도, 방법을 알려 주지도 않았어요. 원칙을 지키는 것과 민원인을 돕는 것은 함께 갈 수 있습니다.' },
      broken:    { result: 'bad',   title: '말 바꾸기',
                   summary: '빼 주겠다고 했다가 아무 설명 없이 말을 바꿨어요. 권한 밖의 약속과 무책임한 번복, 둘 다 행정에 대한 신뢰를 깎습니다.' }
    }
  },

  /* =========================================================
     2. 복지 급여 탈락 (공감과 연계)
     노드: s 시작 → a 공감받음 / b 차갑게 들음 / c 헛된 기대
           → a2 기준 이해 / r2 어긋났다 수습 중 / c2 잘못된 방법·기대 굳음
     ========================================================= */
  {
    id: 'welfare',
    type: '복지 급여 탈락',
    value: '공감과 연계',
    title: '“평생 세금 냈는데 왜 나만 안 된대요?”',
    intro: '기초연금 탈락 통지서를 든 어르신이 떨리는 목소리로 창구에 앉습니다.',
    complainant: { name: '민원인 B · 70대 할매', character: 'grandma' },   // character: owner / grandma / resident
    opening: {
      mood: 'upset',
      text: '이거 받았는데… 기초연금이 안 된다 카네. 평생 세금 꼬박꼬박 냈는데, 와 내만 안 되능교?',
      audio: 'assets/audio/welfare/opening.mp3'
    },
    start: 's',
    nodes: {
      s: { choices: [
        { text: '저도 이상하네요. 아마 뭔가 잘못된 것 같아요.', next: 'c',
          reply: { mood: 'upset', text: '그라제? 뭐가 잘못된 기제? 그라믄 다시 해 주는 기가? 내 가진 거라고는 집 한 채뿐인데.', audio: 'assets/audio/welfare/s-1.mp3' } },
        { text: '선정 기준에 안 맞으셔서 그래요. 통지서에 다 쓰여 있습니다.', next: 'b',
          reply: { mood: 'angry', text: '내 눈도 어둡고 이런 글은 봐도 모린다. 집 한 채 있는 기 다인데, 그기 그래 큰 죄가? 당장 생활비가 없는데…', audio: 'assets/audio/welfare/s-2.mp3' } },
        { text: '많이 놀라셨죠. 천천히 같이 보면서, 왜 이런 결과가 나왔는지 쉽게 설명해 드릴게요.', next: 'a',
          reply: { mood: 'upset', text: '아이고, 고맙데이. 근데 내 가진 거라고는 이 집 한 채뿐이라. 그거 때문에 안 된다 카는 기가? 당장 생활비가 없는데…', audio: 'assets/audio/welfare/s-3.mp3' } }
      ] },

      a: { choices: [
        { text: '주택도 소득으로 환산하는 기준이 있어서 그래요. 생활비가 걱정되시는 마음, 충분히 이해합니다.', next: 'a2',
          reply: { mood: 'upset', text: '아… 그런 기준이 있는 줄 몰랐네. 그라믄 내는 이제 아무것도 몬 받는 기가?', audio: 'assets/audio/welfare/a-1.mp3' } },
        { text: '집은 그냥 서류에서 빼고 다시 신청해 보세요.', next: 'c2',
          reply: { mood: 'upset', text: '그래도 되나? …나중에 들키믄 내만 혼나는 거 아이가? 그래도 니가 그래 하라 카이 해 볼까…', audio: 'assets/audio/welfare/a-2.mp3' } },
        { text: '집이 있으시면 형편이 괜찮으신 거죠. 어쩔 수 없어요.', next: 'r2',
          reply: { mood: 'angry', text: '형편이 괜찮다꼬? 집 한 채 갖고 밥 묵나! …그라믄 내는 이제 아무것도 몬 받는 기가?', audio: 'assets/audio/welfare/a-3.mp3' } }
      ] },

      b: { choices: [
        { text: '집이 있으시면 형편이 괜찮으신 거죠. 어쩔 수 없어요.', ending: 'cold',
          reply: { mood: 'upset', text: '…됐다. 니한테 물어본 내가 잘못이지. 고마 갈란다.', audio: 'assets/audio/welfare/b-1.mp3' } },
        { text: '제가 너무 어렵게 말씀드렸네요, 죄송해요. 주택도 소득으로 환산하는 기준이 있어서 그래요. 생활비 걱정되시는 마음, 충분히 이해합니다.', next: 'r2',
          reply: { mood: 'upset', text: '…그래, 이래 풀어서 말해 주이 알겠다. 그라믄 내는 이제 아무것도 몬 받는 기가?', audio: 'assets/audio/welfare/b-2.mp3' } },
        { text: '그럼 집은 서류에서 빼고 다시 신청해 보세요.', next: 'c2',
          reply: { mood: 'upset', text: '그래도 되나? …니가 그래 하라 카이 해 볼까…', audio: 'assets/audio/welfare/b-3.mp3' } }
      ] },

      c: { choices: [
        { text: '네, 제가 다시 신청해 드릴게요. 이번엔 될 거예요.', next: 'c2',
          reply: { mood: 'calm', text: '아이고, 고맙데이! 이번엔 꼭 되겠제?', audio: 'assets/audio/welfare/c-1.mp3' } },
        { text: '제가 섣불리 말씀드렸어요, 죄송합니다. 결과가 잘못된 건 아니고, 주택도 소득으로 환산하는 기준 때문이에요.', next: 'r2',
          reply: { mood: 'upset', text: '뭐꼬, 잘못된 기라 카더니… 늙은이 헷갈리게. 그라믄 내는 이제 아무것도 몬 받는 기가?', audio: 'assets/audio/welfare/c-2.mp3' } },
        { text: '아, 그건 제가 그냥 한 말이고요. 기준에 안 맞으시면 안 됩니다.', ending: 'broken',
          reply: { mood: 'upset', text: '잘못됐다 캐 놓고 이제 와서 안 된다꼬… 늙은이라꼬 막 대하나. 고마 갈란다.', audio: 'assets/audio/welfare/c-3.mp3' } }
      ] },

      a2: { choices: [
        { text: '그럼 집을 자녀분 명의로 돌려 두시고 다시 신청해 보세요.', ending: 'favor',
          reply: { mood: 'calm', text: '아, 그래 하믄 되나? 알았다, 아들한테 말해 보께.', audio: 'assets/audio/welfare/a2-1.mp3' } },
        { text: '네, 이번에는 안 되십니다. 내년에 다시 신청해 보세요.', ending: 'cold',
          reply: { mood: 'upset', text: '내년까지 우째 버티라꼬… 알았다, 고마 갈란다.', audio: 'assets/audio/welfare/a2-2.mp3' } },
        { text: '결과에 이의가 있으시면 이의신청을 하실 수 있어요. 받으실 수 있는 다른 복지 서비스도 같이 찾아보고, 복지 상담도 연결해 드릴게요.', ending: 'best',
          reply: { mood: 'calm', text: '아이고, 이래 끝까지 챙겨 주이 고맙데이. 같이 함 알아봐 주소.', audio: 'assets/audio/welfare/a2-3.mp3' } }
      ] },

      r2: { choices: [
        { text: '결과에 이의가 있으시면 이의신청을 하실 수 있어요. 받으실 수 있는 다른 복지 서비스도 같이 찾아보고, 복지 상담도 연결해 드릴게요.', ending: 'recovered',
          reply: { mood: 'calm', text: '…처음엔 서운했는데, 이래 챙겨 주이 고맙데이. 같이 함 알아봐 주소.', audio: 'assets/audio/welfare/r2-1.mp3' } },
        { text: '그건 다른 부서 일이라 저는 잘 모르겠어요.', ending: 'cold',
          reply: { mood: 'upset', text: '또 딴 데 가라 카나… 이 다리로 어델 또 가노. 됐다, 고마 갈란다.', audio: 'assets/audio/welfare/r2-2.mp3' } },
        { text: '그럼 집을 자녀분 명의로 돌려 두시고 다시 신청해 보세요.', ending: 'favor',
          reply: { mood: 'calm', text: '아, 그래 하믄 되나? 알았다, 아들한테 말해 보께.', audio: 'assets/audio/welfare/r2-3.mp3' } }
      ] },

      c2: { choices: [
        { text: '그건 어르신이 알아서 판단하세요.', ending: 'broken',
          reply: { mood: 'upset', text: '니가 하라 캐 놓고 알아서 하라꼬? …늙은이만 헷갈리게 하네.', audio: 'assets/audio/welfare/c2-1.mp3' } },
        { text: '네, 그렇게 하시면 돼요. 걱정 마세요.', ending: 'favor',
          reply: { mood: 'calm', text: '그래, 니만 믿는다. 고맙데이.', audio: 'assets/audio/welfare/c2-2.mp3' } },
        { text: '제가 잘못 말씀드렸어요, 죄송합니다. 결과는 기준대로 나온 거라 그렇게 하시면 안 돼요. 대신 이의신청과 받으실 수 있는 다른 복지 서비스를 안내해 드릴게요.', ending: 'late',
          reply: { mood: 'upset', text: '이랬다저랬다… 늙은이 정신없게. 그래도 바로 말해 주이 됐다. 그거나 알려 주소.', audio: 'assets/audio/welfare/c2-3.mp3' } }
      ] }
    },
    endings: {
      best:      { result: 'happy', title: '모범 대응',
                   summary: '마음을 먼저 알아주고, 기준을 쉽게 설명하고, 이의신청과 다른 복지 서비스로 연결했어요. ‘안 됩니다’로 끝내지 않고 할 수 있는 길을 찾아 주는 것, 이것이 적극행정입니다.' },
      recovered: { result: 'happy', title: '실수를 바로잡은 대응',
                   summary: '처음엔 어르신을 서운하게 했지만, 바로 사과하고 쉽게 다시 설명한 뒤 도움받을 길까지 연결했어요. 실수보다 중요한 건 바로잡는 태도입니다.' },
      late:      { result: 'bad',   title: '늦게 바로잡은 안내',
                   summary: '끝내 바로잡은 건 다행이지만, 잘못된 기대나 방법을 먼저 심어 드려 어르신을 혼란스럽게 했어요. 확실하지 않은 말은 처음부터 하지 않는 것이 원칙입니다.' },
      favor:     { result: 'bad',   title: '잘못된 방법 안내',
                   summary: '어르신은 고마워하며 돌아갔지만, 재산을 빼거나 명의를 돌리라는 안내는 부정수급으로 이어질 수 있어요. 나중에 받은 돈을 돌려주는 등 더 큰 피해를 입는 건 어르신입니다.' },
      cold:      { result: 'bad',   title: '길을 잃은 민원인',
                   summary: '기준은 맞게 전했지만 어르신은 도움받을 길을 모른 채 돌아갔어요. 이의신청이나 다른 복지 서비스처럼, 할 수 있는 방법을 함께 찾아 드리는 것까지가 행정입니다.' },
      broken:    { result: 'bad',   title: '말 바꾸기',
                   summary: '‘잘못된 것 같다’, ‘그렇게 하라’고 해 놓고 책임 없이 말을 바꿨어요. 근거 없는 말과 무책임한 번복은 행정에 대한 신뢰를 무너뜨립니다.' }
    }
  },

  /* =========================================================
     3. 공사장 소음 민원 반복 (한계와 보호)
     노드: s 시작 → a 경과 확인 약속 / b 무시당해 폭발 / c 헛약속
           → t 위협(차분히 대응한 뒤) / r 위협(실수를 바로잡은 뒤)
             / x 위협(상황을 키운 뒤) / c2 헛약속 굳음
     ========================================================= */
  {
    id: 'noise',
    type: '공사장 소음',
    value: '한계와 보호',
    title: '“몇 번을 신고했는데 왜 아무것도 안 해요!”',
    intro: '공사장 소음 민원을 여러 번 넣은 주민이 잔뜩 화가 난 채 창구로 들어옵니다.',
    complainant: { name: '민원인 C · 공사장 옆 아파트 주민', character: 'resident' },   // character: owner / grandma / resident
    opening: {
      mood: 'angry',
      text: '새벽부터 공사 소리 때문에 잠을 몬 잔다 아입니꺼! 벌써 네 번째 신고인데, 도대체 구청은 뭐 하는 기고?',
      audio: 'assets/audio/noise/opening.mp3'
    },
    start: 's',
    nodes: {
      s: { choices: [
        { text: '여러 번 신고하셨는데 해결이 안 돼서 많이 답답하셨겠어요. 지금까지 처리된 내용을 바로 확인해 드릴게요.', next: 'a',
          reply: { mood: 'angry', text: '확인? 그 소리 네 번째 듣는다. 맨날 확인만 한다 카고 바뀐 기 없다 아이가! 책임자 나오라 캐라!', audio: 'assets/audio/noise/s-1.mp3' } },
        { text: '오늘 당장 공사 중지시키겠습니다!', next: 'c',
          reply: { mood: 'annoyed', text: '당장? 참말이가? 지난번에도 누가 그래 말했는데 바뀐 기 없다. 이번에도 말뿐이믄 가만 안 있는다!', audio: 'assets/audio/noise/s-2.mp3' } },
        { text: '공사장 소음은 저희가 어떻게 할 수 있는 게 아니에요.', next: 'b',
          reply: { mood: 'furious', text: '머라카노? 구청이 몬 하믄 누가 하는데! 니 말고 책임자 나오라 캐라!', audio: 'assets/audio/noise/s-3.mp3' } }
      ] },

      a: { choices: [
        { text: '소리 지르실 거면 나가세요!', next: 'x',
          reply: { mood: 'furious', text: '(책상을 쾅 내리치며) 니 지금 내한테 나가라 캤나? 니 이름 뭐고! 가만 안 둔다!', audio: 'assets/audio/noise/a-1.mp3' } },
        { text: '지난번 현장 점검 결과와 앞으로의 조치를 정리해서 말씀드리겠습니다. 다만 언성을 조금만 낮춰 주시면 더 정확히 안내해 드릴 수 있어요.', next: 't',
          reply: { mood: 'angry', text: '내가 지금 언성 낮추게 생겼나! (책상을 쾅 내리치며) 니 이름 뭐고! 가만 안 둔다!', audio: 'assets/audio/noise/a-2.mp3' } },
        { text: '죄송합니다, 죄송합니다… 제가 다 잘못했습니다.', next: 'r',
          reply: { mood: 'furious', text: '사과만 하믄 다가? 뭘 우째 할 낀지를 말해야지! (책상을 쾅 내리치며) 니 이름 뭐고! 가만 안 둔다!', audio: 'assets/audio/noise/a-3.mp3' } }
      ] },

      b: { choices: [
        { text: '제가 말을 잘못했습니다. 구청이 할 수 있는 조치가 있습니다. 지난번 현장 점검 결과부터 정리해서 말씀드릴게요. 다만 언성을 조금만 낮춰 주세요.', next: 'r',
          reply: { mood: 'angry', text: '이제 와서? 처음부터 그래 말했어야지! (책상을 쾅 내리치며) 니 이름 뭐고! 가만 안 둔다!', audio: 'assets/audio/noise/b-1.mp3' } },
        { text: '소리 지르실 거면 나가세요!', ending: 'escalate',
          reply: { mood: 'furious', text: '니 지금 내 쫓아내나? 니 이름 똑똑히 기억해 둘 끼다. 이거 다 민원 넣을 끼다!', audio: 'assets/audio/noise/b-2.mp3' } },
        { text: '죄송합니다, 죄송합니다… 제가 다 잘못했습니다.', next: 'x',
          reply: { mood: 'furious', text: '몬 한다 캐 놓고 이제 와서 사과만 하나? (책상을 쾅 내리치며) 니 이름 뭐고! 가만 안 둔다!', audio: 'assets/audio/noise/b-3.mp3' } }
      ] },

      c: { choices: [
        { text: '네, 제가 책임지고 오늘 중지시키겠습니다.', next: 'c2',
          reply: { mood: 'annoyed', text: '그래? 니 이름 뭐고? 오늘 안 멈추믄 니 책임인 줄 알아라!', audio: 'assets/audio/noise/c-1.mp3' } },
        { text: '사실 공사 중지는 저희 권한이 아니라서요.', ending: 'broken',
          reply: { mood: 'furious', text: '멈춘다 캐 놓고 이제 와서 권한이 없다꼬? 사람 놀리나! 이거 다 민원 넣을 끼다!', audio: 'assets/audio/noise/c-2.mp3' } },
        { text: '제가 섣불리 말씀드렸습니다, 죄송합니다. 당장 중지는 어렵지만, 지난번 점검 결과와 이번에 할 수 있는 조치를 정리해 드릴게요.', next: 'r',
          reply: { mood: 'angry', text: '뭐꼬, 당장 멈춘다 카더니! 사람 놀리나? (책상을 쾅 내리치며) 니 이름 뭐고! 가만 안 둔다!', audio: 'assets/audio/noise/c-3.mp3' } }
      ] },

      t: { choices: [
        { text: '(아무 말 없이 계속 참고 듣는다)', ending: 'endure',
          reply: { mood: 'furious', text: '와 대답도 안 하노? 사람 무시하나! 내 오늘 안 간다!', audio: 'assets/audio/noise/t-1.mp3' } },
        { text: '폭언이 계속되면 상담을 중단하겠습니다. 지금부터 대화가 녹음될 수 있음을 알려드립니다. (동료에게 도움을 요청한다)', ending: 'best',
          reply: { mood: 'annoyed', text: '…녹음? 알았다, 알았다. 내도 화가 나서 그랬다. 그라믄 점검 결과나 똑바로 알려 주소.', audio: 'assets/audio/noise/t-2.mp3' } },
        { text: '저도 참는 데 한계가 있어요! 똑같이 해 볼까요?', ending: 'escalate',
          reply: { mood: 'furious', text: '니 지금 내한테 대드나? 이거 다 민원 넣을 끼다!', audio: 'assets/audio/noise/t-3.mp3' } }
      ] },

      r: { choices: [
        { text: '폭언이 계속되면 상담을 중단하겠습니다. 지금부터 대화가 녹음될 수 있음을 알려드립니다. (동료에게 도움을 요청한다)', ending: 'recovered',
          reply: { mood: 'annoyed', text: '…녹음? 알았다, 내도 너무 했다. 그라믄 할 수 있는 거나 똑바로 알려 주소.', audio: 'assets/audio/noise/r-1.mp3' } },
        { text: '저도 참는 데 한계가 있어요! 똑같이 해 볼까요?', ending: 'escalate',
          reply: { mood: 'furious', text: '니 지금 내한테 대드나? 이거 다 민원 넣을 끼다!', audio: 'assets/audio/noise/r-2.mp3' } },
        { text: '(아무 말 없이 계속 참고 듣는다)', ending: 'endure',
          reply: { mood: 'furious', text: '와 대답도 안 하노? 사람 무시하나! 내 오늘 안 간다!', audio: 'assets/audio/noise/r-3.mp3' } }
      ] },

      x: { choices: [
        { text: '저도 참는 데 한계가 있어요! 똑같이 해 볼까요?', ending: 'escalate',
          reply: { mood: 'furious', text: '니 지금 내한테 대드나? 이거 다 민원 넣을 끼다!', audio: 'assets/audio/noise/x-1.mp3' } },
        { text: '(아무 말 없이 계속 참고 듣는다)', ending: 'endure',
          reply: { mood: 'furious', text: '와 대답도 안 하노? 사람 무시하나! 내 오늘 안 간다!', audio: 'assets/audio/noise/x-2.mp3' } },
        { text: '폭언이 계속되면 상담을 중단하겠습니다. 지금부터 대화가 녹음될 수 있음을 알려드립니다. (동료에게 도움을 요청한다)', ending: 'late',
          reply: { mood: 'angry', text: '…녹음? 니가 먼저 사람 열 받게 해 놓고! 됐다, 내 위에다 직접 따질 끼다.', audio: 'assets/audio/noise/x-3.mp3' } }
      ] },

      c2: { choices: [
        { text: '네, 걱정 마세요. 오늘 꼭 멈추게 하겠습니다.', ending: 'promise',
          reply: { mood: 'calm', text: '그래, 니 이름 기억해 둔다. 오늘 안 멈추믄 다시 온데이.', audio: 'assets/audio/noise/c2-1.mp3' } },
        { text: '제가 지킬 수 없는 약속을 드렸습니다, 죄송합니다. 당장 중지는 어렵지만, 현장 점검 일정과 결과를 바로 알려 드리겠습니다.', ending: 'late',
          reply: { mood: 'angry', text: '…이제 와서? 그래도 거짓말 계속하는 것보단 낫다. 점검 결과는 꼭 알려 주소.', audio: 'assets/audio/noise/c2-2.mp3' } },
        { text: '제 이름은 왜 물으세요? 지금 협박하시는 겁니까?', ending: 'escalate',
          reply: { mood: 'furious', text: '협박? 약속한 거 지키라는 기 협박이가! 이거 다 민원 넣을 끼다!', audio: 'assets/audio/noise/c2-3.mp3' } }
      ] }
    },
    endings: {
      best:      { result: 'happy', title: '모범 대응',
                   summary: '처리 경과를 투명하게 알리고, 폭언에는 경고 → 녹음 안내 → 응대 중단 순서로 선을 그었어요. 공무원도 보호받아야 하고, 혼자 감당하지 않고 동료와 함께 대응하는 것이 원칙입니다.' },
      recovered: { result: 'happy', title: '실수를 바로잡은 대응',
                   summary: '중간에 흔들렸지만 잘못을 인정하고 할 수 있는 조치를 안내했어요. 폭언에는 단계적으로 선을 그어 상황을 수습했습니다.' },
      late:      { result: 'bad',   title: '이미 커진 갈등',
                   summary: '마지막엔 바로잡았지만, 앞선 대응이 이미 상황을 키웠어요. 지킬 수 없는 약속, 무시, 맞대응은 화난 민원인을 더 자극합니다.' },
      promise:   { result: 'bad',   title: '지킬 수 없는 약속',
                   summary: '민원인은 일단 돌아갔지만, 지킬 수 없는 약속은 다음 방문 때 더 큰 분노로 돌아와요. 할 수 있는 것과 없는 것을 솔직하게 구분해 안내해야 합니다.' },
      endure:    { result: 'bad',   title: '혼자 참은 폭언',
                   summary: '폭언을 혼자 참기만 하면 상황도 해결되지 않고 나도 다쳐요. 공무원도 보호받아야 합니다. 경고하고, 녹음을 안내하고, 동료와 함께 대응하세요.' },
      escalate:  { result: 'bad',   title: '감정 맞대응',
                   summary: '같이 언성을 높이면 상황이 더 커지고 갈등의 책임도 나에게 돌아와요. 감정에 감정으로 맞서지 않고 단계적으로 선을 긋는 것이 원칙입니다.' },
      broken:    { result: 'bad',   title: '말 바꾸기',
                   summary: '당장 멈추겠다고 했다가 권한이 없다며 말을 바꿨어요. 권한 밖의 약속과 무책임한 번복은 행정에 대한 신뢰를 무너뜨립니다.' }
    }
  }
];
