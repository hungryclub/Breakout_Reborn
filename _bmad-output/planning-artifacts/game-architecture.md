---
title: "Game Architecture"
project: "Breakout_Reborn"
date: "2026-03-28"
author: "Dhlee"
version: "1.1"
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9]
status: "draft-complete"

# Source Documents
gdd: "bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md"
ux: "bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md"
brief: "bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-brief.md"
---

# Architecture

## Executive Summary

`Breakout_Reborn`는 모바일 웹 우선의 세로형 브릭브레이커이므로, 빠른 입력 반응성, 일관된 2D 물리, 짧은 런 상태 전이, 그리고 HUD/오버레이 분리가 핵심이다. 이를 위해 `Phaser 3 + TypeScript + Arcade Physics` 기반의 씬 중심 아키텍처를 채택한다. 이 조합은 웹 배포, 2D 액션, 빠른 프로토타이핑, AI 에이전트 간 일관된 구현에 가장 적합하다.

초기 목표는 4스테이지 MVP를 안정적으로 구현하는 것이다. 아키텍처는 확장 가능하게 설계하되, 멀티플레이어, 서버 의존 기능, 무거운 에셋 스트리밍, 복잡한 메타 시스템은 의도적으로 제외한다. 최신 GDD에서 강화된 상용 품질 요구에 맞춰, 본 아키텍처는 “메인 공 판독성”, “피드백 강도 단계”, “스테이지별 감정 곡선”을 독립적인 구현 책임으로 다룬다.

### Project Initialization

- Runtime: `Phaser 3`
- Language: `TypeScript`
- Build tool: `Vite`
- Physics: `Arcade Physics`
- Target: mobile web browser
- Orientation: portrait only
- Rendering: WebGL 우선, Canvas fallback 허용

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| Game Engine | Phaser | 3.x | all | 모바일 웹, 2D 액션, 빠른 반복 개발에 적합 |
| Language | TypeScript | 5.x | all | 타입 안정성으로 AI 구현 충돌 감소 |
| Rendering | Phaser built-in 2D renderer | Phaser 3.x | 1,2,4 | 별도 렌더링 파이프라인 없이 MVP 요구 충족 |
| Physics | Arcade Physics | Phaser 3.x | 1,2 | 브릭브레이커의 단순 반사/충돌에 충분하고 빠름 |
| Input | Custom touch input layer on Phaser input | Phaser 3.x | 1,2,4 | 상대 드래그 규칙을 명확히 구현 가능 |
| Persistence | Serialized JSON + localStorage | Browser API | 3,4 | 짧은 세션 상태와 설정 저장에 충분 |
| UI Architecture | Scene overlay + UI component layer | Phaser 3.x | 2,3,4 | HUD와 런 상태 UI를 게임플레이와 분리 |
| Audio | Phaser native audio | Phaser 3.x | 2,4 | MVP 범위에서 충분하며 복잡도 낮음 |
| Presentation Layer | Dedicated feedback/presentation systems | Custom | 1,2,4 | 상용 게임 수준의 연출 일관성 확보 |
| Readability Control | Primary-ball and focus-priority orchestration | Custom | 2,4 | 카오스 상황에서도 판독성 유지 |
| Stage Emotion Data | Stage emotion profiles + pacing hooks | Custom | 2,4 | 4스테이지 감정 곡선 구현 보장 |
| Telemetry | Lightweight internal event hooks | Custom | 3,4 | UX/리텐션 개선을 위한 관측 기반 확보 |
| Deployment | Static web build | Vite | all | 배포 단순화, 즉시 테스트 용이 |

## Project Structure

```text
Breakout_Reborn/
  app/
    index.html
    package.json
    tsconfig.json
    vite.config.ts
    src/
      main.ts
      game/
        config/
          gameConfig.ts
          balanceConfig.ts
          inputConfig.ts
          presentationConfig.ts
        core/
          Game.ts
          SceneKeys.ts
          EventBus.ts
          Registry.ts
        scenes/
          BootScene.ts
          PreloadScene.ts
          MenuScene.ts
          GameScene.ts
          UIScene.ts
          ResultScene.ts
        systems/
          InputSystem.ts
          BallSystem.ts
          PaddleSystem.ts
          BrickSystem.ts
          PowerupSystem.ts
          ComboSystem.ts
          FocusSystem.ts
          StageFlowSystem.ts
          RunStateSystem.ts
          SaveStateSystem.ts
        presentation/
          FeedbackSystem.ts
          AudioCueSystem.ts
          MomentDirector.ts
          PresentationRouter.ts
          ReadabilityCoordinator.ts
        entities/
          Ball.ts
          Paddle.ts
          Brick.ts
          Powerup.ts
        ui/
          HudBar.ts
          RewardChoicePanel.ts
          TutorialHint.ts
          ResultOverlay.ts
        data/
          stages/
            stage01.ts
            stage02.ts
            stage03.ts
            stage04.ts
          powerups.ts
          brickTypes.ts
          audioCues.ts
          moments.ts
          stageEmotionProfiles.ts
          feedbackPriorityRules.ts
        types/
          game.ts
          events.ts
          ui.ts
      assets/
        audio/
        sprites/
        particles/
        ui/
      tests/
        unit/
        integration/
```

## Epic to Architecture Mapping

| Epic | Architectural Responsibility | Primary Modules |
| ---- | ---------------------------- | --------------- |
| Epic 1: Core Feel Prototype | 입력, 반사, 충돌, 이펙트 기본기 | `InputSystem`, `BallSystem`, `PaddleSystem`, `BrickSystem` |
| Epic 2: MVP Gameplay Loop | 벽돌/파워업/콤보/클리어-실패 흐름 | `PowerupSystem`, `ComboSystem`, `FocusSystem`, `RunStateSystem`, `UIScene` |
| Epic 3: Retention Layer | 보상 선택, 시작 선택지 확장, 경량 저장 | `RunStateSystem`, `SaveStateSystem`, `RewardChoicePanel`, `TelemetryHooks` |
| Epic 4: Presentation and Stability | HUD, 튜토리얼, 결과 UI, 연출 일관성, 성능 안정화 | `HudBar`, `TutorialHint`, `ResultOverlay`, `FeedbackSystem`, `AudioCueSystem`, `MomentDirector`, `ReadabilityCoordinator`, `StageFlowSystem` |

## Technology Stack Details

### Core Technologies

#### Phaser 3

- 씬 기반 구조 제공
- 모바일 웹 친화적
- Arcade Physics로 단순 반사/충돌 구현 가능
- HUD 씬과 게임 씬 분리에 적합

#### TypeScript

- 이벤트 이름, 게임 상태, 파워업 타입, 벽돌 타입을 강하게 타입화
- AI 에이전트가 코드 추가 시 인터페이스 충돌을 줄임
- 리팩터링 안정성 확보

#### Vite

- 빠른 개발 서버
- 간단한 정적 빌드
- 웹 MVP 테스트에 적합

### Integration Points

- Browser `localStorage`: 설정, 해금 상태, 마지막 세션 최소 정보 저장
- Pointer/touch input: Phaser input layer로 추상화
- Audio assets: Phaser loader 및 sound manager 사용
- Internal event bus: 씬 간 HUD/결과/상태 동기화
- Presentation router: 게임 이벤트를 화면/사운드/카메라 반응으로 변환
- Telemetry hook: 핵심 UX 이벤트를 내부 로그 또는 분석 포맷으로 기록

## Novel Pattern Designs

### Relative Drag Input Pattern

패들 입력은 Phaser 기본 드래그 동작을 직접 쓰지 않고, 별도 `InputSystem`에서 `pointerdown`, `pointermove`, `pointerup` 이벤트를 받아 상대 이동량으로 계산한다. 이렇게 해야 화면 어느 지점을 눌러도 동일한 UX 규칙을 보장할 수 있다.

### Primary Ball Highlight Pattern

멀티볼 상태에서 “메인 공”을 시스템적으로 추적한다. 메인 공은 최근 패들과 상호작용한 공 또는 기본 공으로 정의하며, 렌더링 우선순위와 이펙트 강도를 다르게 적용한다.

### Focus Priority Pattern

GDD의 판독성 규칙을 지키기 위해 화면 우선순위를 `메인 공 -> 즉시 충돌 지점 -> 위험/보상 요소` 순으로 고정한다. `FocusSystem`은 현재 메인 공, 직전 충돌 지점, 마지막 생존 위기 상황을 추적하고, `ReadabilityCoordinator`는 어떤 시각 효과를 축소하거나 지연해야 하는지 결정한다.

### Run State Priority Pattern

실패, 보상, 인터럽트, 클리어 상태가 충돌할 수 있으므로 `RunStateSystem`에서 상태 우선순위를 단일 관리한다. 우선순위는 `failed > interrupted > reward > playing`으로 둔다.

### Moment Director Pattern

상용 게임처럼 느껴지는 순간은 개별 시스템이 아니라 “묶인 연출 반응”에서 나온다. `MomentDirector`는 `first_combo`, `stage_clear`, `life_lost`, `run_failed`, `reward_selected` 같은 고수준 이벤트를 수신하고, `FeedbackSystem`, `AudioCueSystem`, `UIScene`으로 연쇄 지시를 보낸다.

### Feedback Token Pattern

연출을 하드코딩하지 않고 토큰화한다. 예를 들어 `fast_pop`, `reward_reveal`, `danger_pulse`, `fail_drop`, `combo_burst` 같은 토큰을 두고, 각 토큰은 화면 흔들림, 히트스톱, 플래시, 사운드 큐를 일관된 세트로 정의한다.

### Feedback Tier Pattern

피드백은 GDD 규칙에 따라 `base`, `accent`, `peak` 3단계로 관리한다. `MomentDirector`는 이벤트의 의미를 해석하고, `PresentationRouter`는 같은 프레임 또는 짧은 시간 윈도우에서 겹친 피드백을 우선순위에 따라 강등 또는 병합한다.

### Stage Emotion Profile Pattern

각 스테이지는 단순 난이도 데이터가 아니라 감정 곡선 데이터도 함께 가진다. `StageFlowSystem`은 `intro`, `angle_control`, `combo_reaction`, `chaos_control` 목표뿐 아니라 `openingBeat`, `midRunBeat`, `closingBeat` 같은 감정 훅을 읽고, 적절한 순간에 `MomentDirector`로 이벤트를 보낸다.

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Pattern 1: Scene Ownership

- `BootScene`: 환경 초기화, 전역 설정
- `PreloadScene`: 에셋 로딩
- `MenuScene`: 시작 화면
- `GameScene`: 실제 플레이 및 시스템 업데이트
- `UIScene`: HUD, 튜토리얼, 경량 알림
- `ResultScene`: 실패/클리어/재시도 CTA

### Pattern 2: System-First Game Logic

게임 규칙은 개별 엔티티 안에 흩어놓지 않고 `systems/`에 집중시킨다.

- 엔티티: 상태 보유, 렌더 대상
- 시스템: 규칙, 계산, 상태 전이

### Pattern 3: Config-Driven Balance

런 길이, 반사각 범위, 드롭률, 지속시간, 중첩 상한은 코드 하드코딩 대신 `config/`와 `data/`에서 읽는다.

- 피드백 단계 상한
- 메인 공 시각 강조 강도
- 스테이지 감정 곡선 훅 시점

### Pattern 4: Event-Driven UI

HUD 및 오버레이는 게임 로직을 직접 조회하지 않고 이벤트를 구독한다.

예시 이벤트:

- `ball_launched`
- `combo_increased`
- `powerup_collected`
- `reward_choice_opened`
- `run_failed`
- `retry_available`
- `session_interrupted`

### Pattern 5: Presentation-First Feedback

즉시 체감되는 품질은 `GameScene` 안의 임의 처리로 만들지 않는다.

- 시스템이 게임 이벤트를 발행
- `MomentDirector`가 어떤 상용 연출 순간인지 판정
- `FeedbackSystem`이 화면/시간 반응 적용
- `AudioCueSystem`이 사운드 우선순위와 중복 재생 제어
- `ReadabilityCoordinator`가 메인 공 가림 여부와 피크 충돌 여부를 검토
- 필요 시 피드백을 한 단계 낮추거나 지연시켜 판독성을 보존

### Pattern 6: Readability Before Spectacle

과장된 연출보다 메인 공과 핵심 판단 지점의 가시성이 항상 우선한다.

- 폭발/파이어볼/콤보 이펙트는 메인 공 실루엣을 일정 시간 이상 가리지 못함
- 멀티볼 상태에서도 메인 공은 항상 식별 가능해야 함
- 성능 저하 시 가장 마지막까지 유지할 것은 메인 공 강조와 핵심 충돌 피드백

### Pattern 7: Telemetry by Design

제품/UX 판단에 필요한 이벤트는 처음부터 구조에 포함한다.

- `first_combo`
- `retry_clicked`
- `reward_selected`
- `ball_lost`
- `session_resume`
- `run_abandoned`

## Consistency Rules

### Naming Conventions

- Scene: `PascalCase` + `Scene`
- System: `PascalCase` + `System`
- Entity: `PascalCase`
- Config/data files: `camelCase.ts`
- Event constants: `SCREAMING_SNAKE_CASE` 또는 typed literal union
- 타입명: `GameState`, `RunState`, `PowerupType`, `BrickType`

### Code Organization

- Scene는 오케스트레이션만 담당
- 게임 규칙은 `systems/`에 둠
- 연출 규칙은 `presentation/`에 둠
- 밸런스 값은 `config/` 또는 `data/`에 둠
- UI 표시 규칙은 `ui/`에 두되, 상태 소스는 이벤트로 연결
- 상용 감각 관련 토큰과 큐는 `data/audioCues.ts`, `data/moments.ts`, `config/presentationConfig.ts`에 둔다
- 메인 공 판독성과 피드백 우선순위는 `FocusSystem`, `ReadabilityCoordinator`, `data/feedbackPriorityRules.ts`에 둔다
- 스테이지 감정 곡선 규칙은 `StageFlowSystem`, `data/stageEmotionProfiles.ts`에 둔다

### Error Handling

- 치명적 에셋 로딩 실패: Boot/Preload 단계에서 즉시 오류 UI 노출
- 런 중 예외: 가능한 경우 안전한 일시정지 상태로 전환
- 저장 실패: 게임 진행은 유지하고 경고만 남김
- 잘못된 스테이지 데이터: 개발 단계에서는 예외 throw, 프로덕션에서는 fallback stage 차단

### Logging Strategy

- 개발 모드에서만 상세 로그
- 상태 전이 로그: `run_state_changed`
- 입력 이상 로그: `pointer_out_of_bounds`, `unexpected_input_state`
- 성능 로그: 프레임 드랍 구간 샘플링
- 제품/UX 로그: `first_combo`, `retry_clicked`, `reward_selected`, `run_failed`, `session_resumed`

## Data Architecture

### Core Data Models

#### RunState

```ts
type RunState =
  | "menu"
  | "launch_ready"
  | "playing"
  | "reward"
  | "failed"
  | "cleared"
  | "interrupted";
```

#### BallModel

```ts
interface BallModel {
  id: string;
  isPrimary: boolean;
  speed: number;
  direction: { x: number; y: number };
  active: boolean;
  highlightTier: "standard" | "primary" | "critical";
}
```

#### PowerupState

```ts
interface PowerupState {
  type: "paddle_expand" | "fireball" | "multiball" | "magnet";
  startedAt: number;
  durationMs: number;
  stackMode: "duration_only" | "no_stack";
}
```

#### MomentDefinition

```ts
interface MomentDefinition {
  id: "first_combo" | "combo_burst" | "stage_clear" | "life_lost" | "run_failed";
  feedbackToken: string;
  audioCue: string;
  priority: number;
  feedbackTier: "base" | "accent" | "peak";
}
```

#### StageDefinition

```ts
interface StageDefinition {
  id: string;
  goal: "intro" | "angle_control" | "combo_reaction" | "chaos_control";
  brickLayout: BrickSpawn[];
  rewardAfterClear: boolean;
  emotionProfileId: string;
}
```

#### StageEmotionProfile

```ts
interface StageEmotionProfile {
  id: "stage01_intro" | "stage02_control" | "stage03_combo" | "stage04_chaos";
  openingBeatMs: number;
  closingBeatWindowMs: number;
  targetEmotion: "relief" | "control" | "burst" | "survival_mastery";
}
```

#### FeedbackPriorityRule

```ts
interface FeedbackPriorityRule {
  eventType: string;
  priority: number;
  tier: "base" | "accent" | "peak";
  canDowngrade: boolean;
}
```

### Persistence Boundaries

저장 대상:

- 옵션 설정
- 해금된 시작 선택지
- 튜토리얼 완료 여부

저장하지 않는 것:

- 런 중 실시간 물리 상태 전체
- 상세 점수 히스토리
- 리플레이 데이터

## API Contracts

외부 네트워크 API는 MVP에 없다. 대신 내부 시스템 계약을 명확히 한다.

### Internal Contracts

#### InputSystem -> PaddleSystem

- 입력은 절대 좌표가 아니라 `deltaX`를 전달
- 한 프레임에 하나의 정규화된 입력 패킷만 전달

#### BallSystem -> ComboSystem

- 벽돌 파괴 이벤트 발생 시 공 ID와 파괴량 전달
- 바닥 추락 또는 생명 손실 시 콤보 리셋 이벤트 전달

#### RunStateSystem -> UIScene / ResultScene

- 상태 전이 시 단일 이벤트 발행
- UI는 해당 이벤트 기준으로만 열고 닫힘

#### EventBus -> MomentDirector

- 저수준 이벤트를 고수준 연출 순간으로 승격
- 동일 프레임 중복 순간은 우선순위 규칙으로 병합

#### MomentDirector -> FeedbackSystem / AudioCueSystem

- 하나의 순간에 대해 화면/오디오 반응을 분리 실행
- 실패, 클리어, 위험 상태는 항상 일반 충돌 반응보다 높은 우선순위를 가진다

#### FocusSystem -> ReadabilityCoordinator

- 현재 메인 공, 마지막 충돌 지점, 생존 위기 상태를 전달
- 판독성 위반 가능성이 있는 순간에 연출 축소 요청 신호를 보낸다

#### StageFlowSystem -> MomentDirector

- 스테이지 시작 15초 이내 핵심 감정 예고 비트를 발생시킨다
- 스테이지 종료 직전 마무리 비트를 발생시켜 다음 스테이지 기대를 만든다

## Security Architecture

MVP는 클라이언트 단일 구조이므로 전통적 보안 아키텍처보다는 무결성/안정성이 중요하다.

- 저장 데이터는 신뢰하지 않고 기본 검증 수행
- 해금 상태는 허용 목록 기반으로 검증
- 디버그 명령이나 개발용 토글은 프로덕션 빌드에서 제거

## Performance Considerations

### Render Budget

- 파티클 수 상한 설정
- 멀티볼 5개 상태에서도 프레임 유지
- HUD 업데이트는 값 변경 시에만 렌더 반영
- 화면 반응 효과는 토큰 단위로 강도 조절 가능해야 함
- 메인 공 외곽선, 잔상, 강조색은 저사양에서도 유지 가능한 경량 표현으로 구현

### Physics Budget

- 브릭브레이커에 필요한 단순 충돌만 사용
- Matter.js 도입 금지
- 충돌 처리 순서 일관화로 억울한 판정 방지

### Memory Strategy

- 에셋은 초기 로드 후 재사용
- 씬 전환 시 불필요한 리스너 제거
- 세션 반복에서 객체 풀링 검토

### Commercial Feel Strategy

- 공통 연출 토큰으로 전체 게임의 반응 리듬을 통일
- 사운드와 화면 피드백을 순간 단위로 설계해 “누를 때마다 살아있는” 인상을 강화
- 첫 콤보, 보상 선택, 실패, 재도전의 템포를 일정하게 유지해 제품 완성도를 높임
- 스테이지별 감정 곡선을 데이터화해, 레벨 배치가 바뀌어도 경험 목표가 유지되게 한다
- 판독성 규칙을 연출보다 상위 정책으로 둬, 카오스 구간에서도 상용 품질 인상을 지킨다

## Deployment Architecture

- 정적 웹 빌드 산출물 생성
- 단일 페이지 게임 호스팅
- 후보: local static host, GitHub Pages, itch.io web build
- 서비스워커/오프라인 모드는 MVP 이후 검토

## Development Environment

### Prerequisites

- Node.js LTS
- npm 또는 pnpm
- 최신 Chromium 기반 브라우저

### AI Tooling (MCP Servers)

- 현재 단계에서는 필수 엔진 MCP 없음
- 필요 시 브라우저 테스트 자동화를 위해 Playwright 계열 도입 가능

### Setup Commands

```bash
npm create vite@latest app -- --template vanilla-ts
cd app
npm install phaser
npm install
npm run dev
```

## Architecture Decision Records (ADRs)

### ADR-001: Phaser 채택

- Context: 모바일 웹 우선 2D 액션 게임
- Decision: Phaser 3 사용
- Consequence: 웹 배포와 프로토타이핑 속도는 유리, 고급 3D/복잡 렌더링은 비대상

### ADR-002: TypeScript 강제

- Context: 다수 AI 에이전트가 동일 코드베이스를 수정할 가능성
- Decision: TypeScript 사용
- Consequence: 초기 설정은 조금 늘지만 구현 일관성과 안정성이 올라감

### ADR-003: Scene + System 분리

- Context: UI와 플레이 상태 전이를 명확히 분리해야 함
- Decision: Scene은 orchestration, System은 rules 담당
- Consequence: 테스트와 스토리 분해가 쉬워짐

### ADR-004: MVP 메타 진행 최소화

- Context: 범위 팽창 위험
- Decision: 시작 선택지 확장 1축만 유지
- Consequence: 구현 복잡도 감소, 반복감 해소는 파워업 상호작용에 더 의존

### ADR-005: 상태 우선순위 단일 관리

- Context: 실패/보상/중단 상태 충돌 가능
- Decision: `RunStateSystem`에서 상태 우선순위 관리
- Consequence: UI/게임 흐름의 예측 가능성 증가

### ADR-006: Presentation Layer 분리

- Context: 상용 게임 느낌은 폴리시 일관성에서 나오며, 이를 `GameScene` 내부에 흩뿌리면 유지보수가 어려움
- Decision: `presentation/` 계층을 별도로 두고 `FeedbackSystem`, `AudioCueSystem`, `MomentDirector`를 둔다
- Consequence: 손맛 조정과 품질 향상이 쉬워지고, 구현 복잡도는 소폭 증가

### ADR-007: Telemetry Hook 내장

- Context: UX와 리텐션 개선을 감으로만 할 수 없음
- Decision: 핵심 플레이/UX 이벤트를 아키텍처 차원에서 표준화
- Consequence: 추후 분석과 밸런스 조정 기준 확보

### ADR-008: 판독성 우선 정책

- Context: 멀티볼, 폭발 연쇄, 피크 연출이 겹치면 상용 게임 느낌보다 혼란이 먼저 올 수 있음
- Decision: 메인 공 판독성과 핵심 판단 지점을 연출보다 상위 정책으로 둔다
- Consequence: 화려함 일부를 희생하더라도 플레이 신뢰성과 완성도 인상이 올라감

### ADR-009: 스테이지 감정 곡선 데이터화

- Context: 4스테이지 MVP가 짧더라도 각 스테이지가 다른 감정 피크를 줘야 상용 아케이드처럼 느껴짐
- Decision: 스테이지 정의에 감정 프로필과 비트 타이밍 데이터를 포함한다
- Consequence: 레벨 설계, 연출, 플레이테스트가 같은 경험 목표를 공유할 수 있음

---

_Generated by BMAD Decision Architecture Workflow v1.0_  
_Date: 2026-03-28_  
_For: Dhlee_

---

## 2026-03-29 Commercial Presentation Architecture Amendments

본 개정은 `Samus Shepard` 중심 디자인 리뷰에서 제기된 "현재 구조는 기능적으로는 충분하지만 상용 게임의 감각을 유지하기 위한 presentation contract가 아직 약하다"는 판단을 반영한다. 이 섹션은 기존 아키텍처를 폐기하지 않고, 상용 품질 유지에 필요한 표현 계층 책임을 더 강하게 고정한다.

### Architectural Position

`presentation/` 계층은 더 이상 선택적 폴리시 레이어가 아니다. `Breakout_Reborn`에서 presentation은 제품 정체성, 타격감, 보상 감정, stage 개성, 판독성을 지키는 필수 계층이다.

- gameplay 계층은 "무슨 일이 일어났는가"를 결정한다.
- presentation 계층은 "그 일이 얼마나 가치 있게 느껴지는가"를 결정한다.
- 두 계층은 이벤트 계약으로 연결되며, presentation 로직이 gameplay 규칙을 침범해서는 안 된다.

### Required Presentation Modules

#### ImpactProfileRegistry

브릭, 패들, 공, 파워업, UI 상태에 대한 충돌/반응 프로필을 데이터로 관리한다.

- 입력: `hitKind`, `surfaceType`, `comboTier`, `stageId`
- 출력: hitstop 길이, flash 강도, spark 타입, sound cue, camera response, score burst 스타일

이 레지스트리는 "일반 브릭", "강체 브릭", "폭발 브릭", "아이템 브릭"이 서로 전혀 다른 재질감으로 느껴지도록 하는 핵심 자료 구조다.

#### StageIdentityProfile

스테이지별 감정 목표와 시청각 토큰을 데이터로 관리한다.

- Stage 1: 깨끗하고 시원한 아케이드 톤
- Stage 2: 정밀하고 집중된 톤
- Stage 3: 연쇄 반응과 쇼타임 톤
- Stage 4: 통제 가능한 카오스 톤

프로필은 배경 accent, HUD accent, combo peak 강도, brick pulse, ambient audio 긴장도를 포함해야 한다.

#### RewardPresentationModel

보상 카드를 단순 텍스트 옵션이 아니라 상품형 선택 오브젝트로 다루기 위한 모델이다.

- `headline`
- `subcopy`
- `iconId`
- `impactTag`
- `previewMotion`
- `rarityStyle`

이 모델은 UX와 구현이 같은 카드 구조를 공유하도록 만든다.

#### PowerupSignatureProfile

각 파워업의 연출 서명을 고정한다.

- Expand: unfold animation, panel widening glow, metallic release cue
- Laser: lane telegraph, beam bloom, impact scorch
- Multiball: split flash, branching trail, spawn accent
- Magnet: field shimmer, snap-back cue, attach pulse

### Event Contract Extensions

다음 이벤트는 상용 감각을 위해 아키텍처 표준 이벤트로 승격한다.

- `impact:brick-hit`
- `impact:hard-brick-crack`
- `impact:explosion-chain`
- `impact:combo-peak`
- `impact:launch`
- `impact:ball-loss`
- `reward:presented`
- `reward:selected`
- `powerup:signature-triggered`
- `stage:identity-shift`

각 이벤트는 presentation layer가 소비할 수 있는 최소 데이터와 우선순위를 가져야 한다. 구현 세부는 scene 로직에 흩어져서는 안 된다.

### Readability Safeguards

상용 연출이 판독성을 망치지 않도록 다음 구조적 제한을 둔다.

- `ReadabilityCoordinator`는 모든 peak 이벤트의 최종 승인 지점이다.
- 메인 공 강조는 다른 모든 visual flourish보다 높은 우선순위를 가진다.
- 레이저, 폭발, 멀티볼 분열이 동시에 발생하면 `PresentationRouter`가 약한 이벤트를 자동 강등한다.
- stage별 accent 변경도 메인 공 대비율을 침해할 수 없다.

### Asset and Rendering Guidance

아키텍처는 그래픽 디테일을 직접 결정하지 않지만, 다음 수준의 hook를 제공해야 한다.

- 브릭 타입별 material variant key
- 균열 단계 표현을 위한 damage state channel
- combo tier별 ball trail preset
- reward card rarity skin key
- stage identity별 background treatment key

즉, 현재의 단색 도형 자산이 유지되더라도 이후 상품형 비주얼로 확장 가능한 슬롯을 먼저 보장해야 한다.

### Audio Architecture Additions

`AudioCueSystem`은 단순 효과음 재생기가 아니라 감정 곡선 조정 장치로 취급한다.

- brick type별 타격음 family 분리
- combo tier별 layer 추가
- reward 선택과 실패 순간의 short sting 제공
- stage identity별 얇은 ambient bed 전환

특히 peak 상황에서는 화면보다 소리가 먼저 "지금 특별한 순간"을 알려줄 수 있어야 한다.

### Implementation Directives

- `presentationConfig.ts`는 수치만이 아니라 `ImpactProfile`, `StageIdentityProfile`, `RewardPresentationModel`, `PowerupSignatureProfile`을 포함하도록 확장한다.
- `MomentDirector`는 stage 전환, combo peak, reward selection, final ball loss의 감정 비트를 오케스트레이션한다.
- `FeedbackSystem`은 브릭 타입과 combo tier를 함께 받아 복합 피드백을 산출해야 한다.
- `UIScene`은 reward/result/hud 렌더링에서 prototype 패널 재사용보다 model 기반 렌더링을 우선한다.

### Architecture Follow-up

- 다음 story 분해 시 presentation layer 전용 스토리를 별도 추적할 것
- `reward:selected`, `impact:combo-peak`, `powerup:signature-triggered`는 telemetry에도 연결할 것
- E2E 및 플레이테스트는 기능 성공뿐 아니라 `peak moment readability`와 `reward desirability`까지 관찰 대상으로 포함할 것
