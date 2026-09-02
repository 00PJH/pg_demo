---
name: plAI-ground — web_combine_demo
description: 순수 블랙 캔버스 위 액체금속 오브와 글래스 콘솔 — 학습 과정이 증명이 되는 AI 실습 플랫폼의 시각 시스템
colors:
  void: "#050505"
  pit: "#0a0a0c"
  ink: "#f2f0eb"
  mist: "#a8a49b"
  dim: "#8d897f"
  line: "rgba(255, 255, 255, 0.08)"
  glass: "rgba(255, 255, 255, 0.05)"
  gold: "#e8b34b"
  gold-deep: "#9a6c1c"
  cobalt: "#5b78ff"
  mint: "#4ade9b"
  ember: "#fb7185"
  amber-warn: "#fcd34d"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Noto Sans KR, sans-serif"
    fontSize: "clamp(2.6rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Schibsted Grotesk, Noto Sans KR, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Schibsted Grotesk, Noto Sans KR, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Noto Sans KR, Schibsted Grotesk, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Noto Sans KR, Schibsted Grotesk, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "24px"
rounded:
  pill: "9999px"
  card: "16px"
  panel: "24px"
  focus: "4px"
spacing:
  gutter: "24px"
  card: "20px"
  card-lg: "24px"
  panel: "28px"
  grid-gap: "20px"
  stat-gap: "16px"
  band: "96px"
  section: "112px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.void}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.mist}"
    rounded: "{rounded.pill}"
    padding: "12px 28px"
  button-gold:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.void}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  nav-pill-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.void}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  badge-status:
    backgroundColor: "rgba(91, 120, 255, 0.15)"
    textColor: "{colors.cobalt}"
    typography: "{typography.mono}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
---

# Design System: plAI-ground (web_combine_demo)

> 적용 범위: `web_combine_demo/` 한정. 옆의 `web_demo/`는 의도적으로 다른(각진 rounded-sm · slate) 시스템을 쓰며 이 문서의 지배를 받지 않는다.

## Overview

**Creative North Star: "The Liquid Ledger"**

순수 블랙(#050505) 캔버스 위에 단 하나의 발광체 — 유리질 골드/블루 액체금속 오브 — 로 시선을 모으는 세계. 카테고리 기본형(slate 대시보드 그리드 + 이모지 카드)을 거부하고, 어둠·유리·금속 세 가지 재질만으로 "학습 과정 자체가 증명이 된다"는 제품 명제를 시각화한다. 랜딩의 오브가 약속이라면, 콘솔의 pit 바닥 로그 콘솔은 그 약속의 실행이다. 사용자 고정 레퍼런스는 Liquid Brokers 랜딩(binding).

밀도는 낮고 여백은 크다. 헤드라인은 영문 대형 그로테스크, 본문은 한글, 원시 출력(로그·해시·코드)은 모노스페이스 — 세 목소리가 섞이지 않는다. 목업 화면은 반드시 모노 배지(SIMULATION, SAMPLE DATA)로 정체를 밝힌다.

**Key Characteristics:**
- #050505 블랙 캔버스 + 미세 별빛 노이즈(히어로 한정)
- backdrop-blur 글래스 카드와 pill 실루엣(내비·CTA·배지 전부 rounded-full)
- 골드=증명/브랜드, 코발트=진행/텔레메트리, 민트=성공, 엠버=에러의 4역 시그널 팔레트
- 영문 헤드라인 + 한글 본문 + JetBrains Mono 원시 출력의 3성부 타이포그래피
- 진입 모션은 rise 스태거 하나, 상시 모션은 오브의 breathe/drift 둘뿐

## Colors

밤하늘 위 금속 반사광 — 무채색 어둠 3단과 뼈백색 텍스트 3단 위에, 채도 있는 색은 오직 시그널로만 쓰인다.

### Primary
- **Gold** (`gold`): 증명·브랜드의 색. 로고 도트(+glow), VERIFIED LEDGER 배지, B2B 하이라이트 카드의 그라디언트 테두리와 CTA, 진행 레일의 완주 노드, 선택된 모델 카드 테두리(`gold/60` + `gold/5` 배경), 스크롤바·캐럿·선택 영역·포커스 링. 짝인 **Gold Deep** (`gold-deep`)은 오브 그라디언트 내부에서만 쓰인다.

### Secondary
- **Cobalt** (`cobalt`): 살아있는 프로세스의 색. 로그의 스텝 라벨(`[1/4]`), PROVISIONING/IN PROGRESS 상태, Accuracy 지표, 텔레메트리 아이콘, SIMULATION 배지. "지금 돌아가는 중"은 언제나 코발트다.

### Tertiary (시그널)
- **Mint** (`mint`): 성공·완료·READY. 상태 도트, 완료 배너(`mint/30` 테두리 + `mint/5` 배경), 학습 곡선 스트로크, 성공 CTA.
- **Ember** (`ember`): 에러·예외. FAILED 상태, 에러 배너(`ember/40` 테두리 + `ember/10` 배경), diff의 삭제 행, 해결된 예외 카운트.
- **Amber Warn** (`amber-warn`): 비차단 경고 텍스트와 일시정지 아이콘. Tailwind 기본 `amber-300`을 그대로 쓴다 — 아직 `@theme`에 승격되지 않은 유일한 시그널 색.

### Neutral
- **Void** (`void`): 페이지 캔버스이자 어두운 pill 위 텍스트 색.
- **Pit** (`pit`): 한 단 밝은 바닥 — 로그 콘솔, 상태 행, 파이프라인 밴드(`pit/60`), 가격 카드 내부.
- **Ink** (`ink`): 기본 텍스트·헤드라인, 그리고 주 CTA의 배경(반전).
- **Mist** (`mist`): 본문·설명·비활성 내비.
- **Dim** (`dim`): 캡션·타임스탬프·풋노트.
- **Line** (`line`): 유일한 테두리 색. **Glass** (`glass`): 글래스 카드 바탕.

**The One Ember Rule.** 채도 색은 상태를 말할 때만 등장한다. 장식 목적의 컬러 블록·컬러 배경 섹션은 없다 — 넓은 면은 언제나 void/pit/glass다.

**The Ink CTA Rule.** 주 행동은 항상 뼈백색(ink) 배경 pill이고 hover에 순백으로 밝아진다. 골드 배경 버튼은 B2B 하이라이트 카드 한 곳, 민트 배경 버튼은 세팅 완료 배너 한 곳뿐 — 색 버튼의 희소성이 위계다.

## Typography

**Display Font:** Schibsted Grotesk (Noto Sans KR 폴백)
**Body Font:** Noto Sans KR (Schibsted Grotesk 폴백)
**Label/Mono Font:** JetBrains Mono (ui-monospace 폴백)

**Character:** 영문 헤드라인·라벨은 그로테스크로 크고 타이트하게(tracking-tight ~ -0.03em, bold 700 고정), 한글 본문은 Noto Sans KR로 편안하게(leading-relaxed), 기계의 출력은 전부 모노스페이스로. 카피 언어는 "영문 헤드라인/라벨 + 한글 본문"이 확정 규칙이다.

### Hierarchy
- **Display** (700, 2.6rem→4.5rem 반응형, lh 1.04, ls -0.03em): 히어로 2행 헤드라인 전용.
- **Headline** (700, 1.875–2.25rem, tracking-tight): 랜딩 섹션 제목과 콘솔 페이지 h1(콘솔은 1.875rem 고정).
- **Title** (700, 1.125–1.25rem): 카드 제목, 빈 상태 제목. 스탯 카드 값은 같은 display 계열 700에 1.25–1.5rem + `tabular-nums`.
- **Body** (400, 14px, lh 1.625): 설명문. 리드 문단은 15px. 보조 본문은 13px.
- **Label** (500, 11–13px): 내비 13px, 카드 라벨·캡션 11–12px(mist/dim).
- **Mono** (400–500, 10–12px, lh 24px): 로그 콘솔(11–12px/leading-6), 배지(10–11px), 해시·경로·명령어 인라인 코드.

**The Three Voices Rule.** 역할이 글꼴을 정한다: 헤드라인/값 = Schibsted Grotesk bold, 한글 산문 = Noto Sans KR, 기계가 낸 문자열(로그·해시·ID·명령·상태 코드) = JetBrains Mono. 상태 배지 텍스트도 기계의 말이므로 모노다.

**The Keep-All Rule.** `h1, h2, h3, p { word-break: keep-all; }` — 한글 제목·문단은 음절 단위로 꺾지 않는다 (index.css 전역 규칙).

## Layout

- **컨테이너**: 랜딩 `max-w-6xl`(72rem), 콘솔 대시보드 `max-w-5xl`, 위저드형(Start AI) `max-w-3xl`, IDE 전면 뷰 `max-w-[1400px]`. 좌우 거터는 항상 `px-6`(모바일 콘솔은 px-4).
- **헤더**: 고정(fixed) 플로팅 pill — 글래스 카드 + rounded-full, 랜딩 h-14, 콘솔 h-13. 본문은 `pt-24`로 내려 시작한다. 헤더는 페이지에 붙지 않고 떠 있다.
- **섹션 리듬**: 랜딩 섹션 `py-28`(112px), 톤 반전 밴드(파이프라인)는 `py-24` + `bg-pit/60` + `border-y border-line`.
- **그리드**: 피처 카드는 12컬럼 7/5 비대칭 분할(`lg:grid-cols-12`, `gap-5`), 스탯/KPI는 2→4 또는 1→3 컬럼(`gap-4`), 가격은 3컬럼 `items-stretch`.
- **반응형**: Tailwind 기본 브레이크포인트(sm 640/md 768/lg 1024). 플로팅 스탯 카드는 `hidden sm:block`, 데스크톱 내비는 `hidden md:flex`, 테이블은 `overflow-x-auto` 래퍼로 가로 스크롤.

## Elevation & Depth

깊이는 그림자 계층이 아니라 **재질**로 만든다: 블러(backdrop-filter 14px) + 1px 백색 테두리 + 반투명 백색 바탕이 유리를, pit의 한 단 밝은 바닥이 우물을 만든다. 그림자는 두 역할뿐이다.

### Shadow Vocabulary
- **Glass ambient** (`box-shadow: 0 18px 40px rgba(0,0,0,0.45)`): `.glass-card` 전용 — 유리가 캔버스에서 떨어져 있다는 최소한의 근거.
- **Gold glow** (`0 0 12px rgba(232,179,75,0.7~0.8)`): 로고 도트와 진행 레일 완주 노드의 발광. 상자 그림자가 아니라 광원이다.
- **CTA hover glow** (`0 0 30px rgba(255,255,255,0.25)`): 히어로 주 CTA hover 한정.
- **Orb stack**: 오브 전용 6겹 inset/outset 스택(index.css `.orb-body`) — 다른 곳에 재사용하지 않는다.

**The Glow-Not-Shadow Rule.** 오프셋 그림자로 띄우지 않는다. 강조가 필요하면 발광(glow)·테두리 밝기·배경 투명도를 올린다.

## Shapes

두 실루엣만 존재한다: **완전한 원/pill**과 **크게 깎인 사각**.

- **Pill (9999px)**: 인터랙티브 요소 전부 — 내비, CTA, 배지, 스텝 인디케이터, 상태 칩, 명령어 캡슐, 게이지 트랙까지. 각진 버튼은 이 세계에 없다.
- **Card (16px, rounded-2xl)**: 스탯 카드, 상태 행, 로그 콘솔, 토스트, IDE 헤더, 선택 카드.
- **Panel (24px, rounded-3xl)**: 대형 피처 카드, 차트/텔레메트리 패널, 가격 카드, 빈 상태 컨테이너.
- **테두리**: 항상 1px, 기본 `line`. 상태 강조 시 시그널 색의 /30~/60 투명도 버전. B2B 하이라이트는 `p-[1px]` + 골드 그라디언트(`from-gold/60 via-gold/15 to-transparent`) 래퍼로 그라디언트 보더를 만든다.
- **오브**: border-radius 50% 완전 원. 히어로에서 화면 하단 밖으로 흘러나간다.

## Components

### Buttons
- **Shape:** pill (9999px), 텍스트 13–14px semibold.
- **Primary:** ink 배경 + void 텍스트, `px-6~7 py-2.5~3`. Hover: 순백(`hover:bg-white`), 히어로에서만 white glow 추가. Disabled: `opacity-40 cursor-not-allowed`.
- **Ghost:** 투명 배경 + `border-line` + mist 텍스트. Hover: `text-ink` + `border-white/25~30`(+선택적으로 `bg-white/5`).
- **Gold / Mint:** void 텍스트, hover `brightness-110`. 각각 B2B 카드·세팅 완료 배너 전용 (The Ink CTA Rule).
- 아이콘은 Lucide 스트로크 12–14px(`w-3~3.5`)를 텍스트 앞뒤에 `gap-2`로.

### Chips (상태 배지)
- **Style:** pill, `px-2~2.5 py-0.5~1`, JetBrains Mono 10–11px, 시그널색 `/15` 배경 + 시그널색 텍스트 (예: `bg-mint/15 text-mint`). 중립은 `bg-white/8~10 text-mist|dim`.
- **역할:** 상태(COMPLETED/IN PROGRESS)와 정직성 표기(SIMULATION, SAMPLE DATA, VERIFIED LEDGER) 둘 다 이 형태.

### Cards / Containers
- **Glass stat card:** `.glass-card rounded-2xl p-4~5` — 11–12px mist 라벨 위, display bold `tabular` 값(색은 지표 의미의 시그널색), 아래 11px dim 서브텍스트. 히어로 플로팅 버전은 `animate-drift`(+지연차).
- **Feature panel:** `.glass-card rounded-3xl p-7`, 전체가 `<button>`. Hover: 의미색으로 테두리 착색(`hover:border-gold/40` 또는 `cobalt/40`) + 우상단 원형 아이콘 버튼(`w-9 h-9 rounded-full bg-white/10`)이 의미색 `/20` 배경으로.
- **Console(로그) 카드:** `rounded-2xl bg-pit border-line p-4`, mono 11–12px leading-6, 자동 스크롤. 라인 톤: 스텝=cobalt, 성공=mint, 에러=ember, 경고=amber-warn, 기본=mist, 구분선=dim.
- **Alert 배너:** `rounded-2xl` + 시그널색 `/30~40` 테두리 + `/5~10` 배경 + 시그널색 텍스트, 아이콘 `w-4 shrink-0`.

### Inputs / Fields (선택 카드)
- 폼 입력 대신 선택 카드(radio 카드)가 이 세계의 입력이다: `rounded-2xl border p-4`, 기본 `border-line bg-pit`, hover `border-white/20`, 선택 시 `border-gold/60 bg-gold/5`. 키보드 접근(role="radio", Enter/Space) 필수.
- **Focus:** 전역 `:focus-visible` — `outline: 2px solid rgba(232,179,75,0.75)`, offset 2px, radius 4px.

### Navigation
- 글래스 pill 바 안의 pill 탭: 비활성 `text-mist hover:text-ink`(13px), 활성 `bg-ink text-void font-semibold` + `aria-current`. 로고는 골드 발광 도트 + display bold 워드마크. 우측에 환경 상태(mint 도트 + "LOCAL").

### Tables (LMS)
- `rounded-3xl` 글래스 카드 안, 13px, 헤더 11px dim `border-b border-line`, 행 `border-line/60` + `hover:bg-white/3`. 숫자·ID는 mono + `tabular`. 상태는 칩, 행동은 ghost pill.

### Progress
- **진행 레일(파이프라인):** 노드 = `w-3 h-3 rounded-full`, 미완 `border-2 border-gold/70 bg-void`, 완주 `bg-gold` + gold glow. 노드 사이는 `h-px bg-gradient-to-r from-gold/50 to-white/10`.
- **게이지/바:** 트랙 `h-1~1.5 rounded-full bg-white/8~10`, 필 시그널색, `transition-all duration-700`.
- **스텝 인디케이터(위저드):** pill 4분할 — 현재 `bg-ink text-void`, 완료 `bg-mint/15 text-mint border-mint/30`, 대기 `border-line text-dim`.

### The Orb (시그니처)
`.orb-body`(5겹 radial-gradient + 6겹 shadow + ::after 시엔 마스크)와 `.orb-rim`(blur 18px 골드 타원광). **히어로에 단 한 번**, `animate-breathe`, `aria-hidden`. 위치·크기는 마크업 유틸리티(absolute/inset/aspect-square)가 담당한다 — 아래 Don't 참조.

### Starfield (시그니처)
`.starfield` — 10개 radial-gradient 점광. 히어로 배경 전용.

### Toast
우하단 fixed 스택, 글래스 `rounded-2xl px-4 py-3`, mint 체크 + 12px 본문 + 닫기, `role="status" aria-live="polite"`, 3.5초 자동 소멸.

## Motion

문법은 셋뿐이며 이징은 하나다: `cubic-bezier(0.16, 1, 0.3, 1)`.

- **rise** (0.9s, `both`): 진입 모션. 24px 아래에서 떠오르며 페이드인. 스태거는 0.15s 간격의 `animate-rise / -late / -later` 3단 — 히어로 헤드라인→리드→CTA 순.
- **breathe** (7s infinite): 오브 전용 — scale 1.015 + brightness 1.12의 호흡.
- **drift** (9s infinite): 플로팅 스탯 카드 — -10px 부유, 카드 간 `animationDelay`로 위상차.
- 그 외 상태 변화는 전부 `transition-colors`/`transition-all`(기본 지속시간), 게이지만 `duration-700`. 스크롤 트리거 애니메이션은 없다(스크롤은 `scroll-behavior: smooth`만).

**The Calm Console Rule.** 상시 모션(무한 루프)은 랜딩 히어로의 breathe/drift와 로딩 스피너(`animate-spin`), 라이브 커서 점멸뿐이다. 콘솔 화면은 데이터가 움직일 때만 움직인다.

## Browser Surfaces

브라우저 기본 표면까지 골드로 통일한다 (index.css 전역):
- **Selection:** `rgba(232,179,75,0.28)` 배경 + `#f8f6f0` 텍스트.
- **Scrollbar:** thin, 골드 `0.3~0.35` 썸(8px, radius 4px), 트랙 투명.
- **Caret:** `caret-color: gold`.
- **Focus ring:** 골드 0.75 2px 아웃라인, offset 2px (Components > Inputs 참조).

## Do's and Don'ts

### Do:
- **Do** 인터랙티브 요소는 pill(9999px), 컨테이너는 16px/24px 두 단만 쓴다.
- **Do** 기계의 출력(로그·해시·명령·상태 코드·ID)은 항상 JetBrains Mono + pit 바닥 + line 테두리에 담는다.
- **Do** 시그널색은 의미 고정으로 쓴다: gold=증명/브랜드, cobalt=진행 중, mint=성공, ember=에러, amber=경고.
- **Do** 목업/샘플 화면에는 mono 대문자 배지(SIMULATION, SAMPLE DATA)를 제목 옆에 단다 — 정직성이 시각 규칙이다.
- **Do** 진입은 rise 3단 스태거, 상태 강조는 시그널색 `/15` 배경 + `/30~40` 테두리 조합으로.
- **Do** 숫자 값에는 `tabular`(tabular-nums), 아이콘은 Lucide 스트로크 12–16px.

### Don't:
- **Don't** 커스텀(unlayered) CSS 컴포넌트 클래스 안에 `position` 등 유틸리티 소유 속성을 넣지 않는다. **Tailwind v4에서 unlayered 규칙은 `@layer utilities`를 이긴다** — `.orb-body`에 position을 넣으면 마크업의 `absolute`가 무시되어 레이아웃이 무너진다(실제 발생). 레이아웃(position/inset/크기)은 마크업 유틸리티, 재질(배경/그림자/radius)만 컴포넌트 클래스.
- **Don't** slate 팔레트·각진 모서리·이모지 아이콘 카드를 들여오지 않는다 — 그것은 옆 세계(web_demo)의 문법이다.
- **Don't** 오브·별빛을 히어로 밖에서 재사용하지 않는다. 오브는 단 한 점이라서 성립한다.
- **Don't** 오프셋 박스 섀도로 요소를 띄우지 않는다 — 발광·테두리·투명도가 이 세계의 강조 수단이다.
- **Don't** 콘솔 화면에 무한 루프 장식 모션을 추가하지 않는다 (The Calm Console Rule).
- **Don't** 증명 불가능한 수치를 UI에 박지 않는다 — 값은 백엔드 응답 또는 venture.md 출처만, 예시 해시에는 "(예시)"를 명기한다.
