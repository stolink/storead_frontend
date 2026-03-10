import random

# ==========================================
# [Virtual Data] AI가 생성한 가상의 웹소설 데이터베이스
# ==========================================
MOCK_NOVELS = [
    {
        "title": "SSS급 헌터가 회귀했다",
        "genre": "현대판타지",
        "desc": "지구 최강의 헌터였던 나, 동료의 배신으로 죽음을 맞이했다. 눈을 떠보니 10년 전 각성하던 날? 이번엔 내가 다 먹는다.",
        "img": "https://images.unsplash.com/photo-1614726365723-49cfae92782f?w=300&q=80"
    },
    {
        "title": "악역 영애는 조용히 살고 싶다",
        "genre": "로맨스판타지",
        "desc": "소설 속 단명하는 악녀에 빙의했다. 데드 플래그를 피하기 위해 남주를 피해 시골로 도망쳤는데, 왜 제국 황태자가 내 집 앞에 있죠?",
        "img": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80"
    },
    {
        "title": "천재 마법사의 무한 서고",
        "genre": "판타지",
        "desc": "가문의 수치라 불리던 망나니, 알고보니 9서클 대마법사의 기억을 가진 천재였다. 내 머릿속 도서관에는 금지된 마법이 가득하다.",
        "img": "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&q=80"
    },
    {
        "title": "재벌집 망나니는 천재 해커",
        "genre": "현대물",
        "desc": "대한민국 굴지의 대기업 3세로 환생했다. 그런데 내가 전생에 세계 랭킹 1위 해커였다고? 주가 조작, 기업 비밀... 다 내 손바닥 안이다.",
        "img": "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&q=80"
    },
    {
        "title": "레벨업하는 무림 맹주",
        "genre": "무협",
        "desc": "구파의 공적으로 몰려 죽은 맹주. 상태창과 함께 과거로 돌아왔다. [퀘스트 발생: 마교 교주를 처치하시오.]",
        "img": "https://images.unsplash.com/photo-1535581652167-3d6b98c36cd9?w=300&q=80"
    },
    {
        "title": "던전에서 치킨집 합니다",
        "genre": "일상물",
        "desc": "S급 던전 입구 앞, 몬스터 고기로 튀긴 치킨이 대박 났다. 헌터들이 줄을 서서 먹는 맛집 사장님의 이중생활.",
        "img": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=300&q=80"
    },
    {
        "title": "내 상태창이 이상하다",
        "genre": "퓨전",
        "desc": "남들은 힘, 민첩이 오르는데 나는 '매력'과 '요리' 스탯만 오른다? 이걸로 세계를 구하라고?",
        "img": "https://images.unsplash.com/photo-1516934024742-b461fba47600?w=300&q=80"
    },
    {
        "title": "황제의 외동딸로 태어났습니다",
        "genre": "로판",
        "desc": "폭군이라 불리는 황제가 아빠라고? 살아남기 위해 애교를 부렸더니, 이 양반 나한테 너무 진심이다.",
        "img": "https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?w=300&q=80"
    },
    {
        "title": "검은 머리 전술가",
        "genre": "대체역사",
        "desc": "눈을 떠보니 2차 세계대전 독일군 장교가 되어 있었다. 패배가 확정된 역사, 나의 전술로 뒤집는다.",
        "img": "https://images.unsplash.com/photo-1473186505569-9c61870c11f9?w=300&q=80"
    },
    {
        "title": "탑을 오르는 네크로맨서",
        "genre": "판타지",
        "desc": "모두가 기피하는 직업 네크로맨서. 하지만 내가 부리는 해골 병사는 S급 헌터보다 강하다.",
        "img": "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=300&q=80"
    },
    {
        "title": "이세계 아이돌 메이커",
        "genre": "연예계물",
        "desc": "연예 기획사 사장이 이세계에 떨어졌다. 엘프, 오크, 드래곤을 모아 우주 최강 아이돌 그룹을 데뷔시켜라!",
        "img": "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=300&q=80"
    },
    {
        "title": "나 혼자만 로그인",
        "genre": "게임판타지",
        "desc": "서버 종료된 가상현실 게임. 그런데 나만 로그아웃이 안 된다? 텅 빈 세상, 모든 NPC와 아이템은 내 것이다.",
        "img": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=300&q=80"
    },
    {
        "title": "북부 대공의 계약 아내",
        "genre": "로판",
        "desc": "차갑기로 소문난 북부 대공과의 계약 결혼. 근데 이 남자, 밤만 되면 늑대로 변해서 어리광을 피운다?",
        "img": "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=300&q=80"
    },
    {
        "title": "닥터, 조선에 가다",
        "genre": "의학/역사",
        "desc": "천재 흉부외과 의사, 조선시대 돌팔이 의원으로 눈뜨다. 침과 뜸 대신 메스로 사람을 살리는 기적의 의술.",
        "img": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&q=80"
    },
    {
        "title": "망한 게임의 고인물",
        "genre": "판타지",
        "desc": "아무도 안 하는 똥망겜을 10년 동안 했다. 어느 날 현실이 게임처럼 변했고, 나는 유일한 공략본 보유자가 되었다.",
        "img": "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&q=80"
    },
    {
        "title": "야구천재가 돌아왔다",
        "genre": "스포츠",
        "desc": "부상으로 은퇴한 비운의 에이스. 고교 시절로 회귀하여 이번엔 메이저리그를 폭격한다.",
        "img": "https://images.unsplash.com/photo-1593341646271-05d8e0329d59?w=300&q=80"
    },
    {
        "title": "성좌들이 나를 좋아함",
        "genre": "성좌물",
        "desc": "지구 멸망 방송이 시작됐다. 다른 헌터들은 후원받으려 난리인데, 성좌들이 내게 먼저 코인을 쏜다.",
        "img": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80"
    },
    {
        "title": "퇴사하고 영지 경영",
        "genre": "경영물",
        "desc": "과로사한 회사원, 눈 떠보니 판타지 세계의 가난한 영주 아들이었다. 현대 경영학 지식으로 영지를 제국 제일의 도시로 만든다.",
        "img": "https://images.unsplash.com/photo-1533552026851-9336d396c00d?w=300&q=80"
    },
    {
        "title": "보스 몹이 내 부하",
        "genre": "헌터물",
        "desc": "F급 헌터인 내 능력은 '테이밍'. 지나가던 슬라임인 줄 알았는데 마왕이었다고?",
        "img": "https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?w=300&q=80"
    },
    {
        "title": "천마는 아이돌 지망생",
        "genre": "개그/무협",
        "desc": "천마신교 교주가 21세기 대한민국 연습생 몸에 들어왔다. 춤과 노래를 내공으로 마스터하고 센터를 차지한다.",
        "img": "https://images.unsplash.com/photo-1516280440614-6697288d5d38?w=300&q=80"
    }
]

def generate_mock_readme():
    filename = "README_mock.md"

    with open(filename, "w", encoding="utf-8") as f:
        # 헤더 작성
        f.write("### 📚 Featured Novels (Preview)\n")
        f.write("> 본 프로젝트의 UI/UX 시연을 위해 생성된 가상의 웹소설 데이터입니다.\n\n")

        # 테이블 헤더
        f.write("| Cover | Novel Info | Genre |\n")
        f.write("| :---: | :--- | :---: |\n")

        # 데이터 순회 및 행 작성
        for novel in MOCK_NOVELS:
            # 이미지 태그 (너비 고정)
            img_tag = f'<img src="{novel["img"]}" width="100" height="140" style="object-fit: cover; border-radius: 4px;" alt="cover">'

            # 정보 블록 (제목 + 설명)
            info_block = f"**{novel['title']}**<br><br><sub style='color:gray'>{novel['desc']}</sub>"

            # 장르 배지 (GitHub Style Badges)
            genre_badge = f"![{novel['genre']}](https://img.shields.io/badge/{novel['genre']}-e3e3e3?style=flat-square&logoColor=black)"

            # 행 합치기
            row = f"| {img_tag} | {info_block} | {genre_badge} |\n"
            f.write(row)

    print(f"✅ 가상 웹소설 데이터 생성 완료: {filename}")
    print("👉 파일을 열어 확인해보세요. 최신 웹소설 플랫폼 느낌이 날 것입니다.")

if __name__ == "__main__":
    generate_mock_readme()
