# Story 1.1: 모바일 세로형 게임 셸과 기본 씬 구조 구성

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,  
I want 모바일 세로형 게임이 빠르게 로드되고 시작 화면에서 진입할 수 있기를,  
so that 설치 없이 즉시 플레이를 시작할 수 있다.

## Acceptance Criteria

1. 모바일 브라우저에서 게임을 열면 `BootScene`, `PreloadScene`, `MenuScene`, `GameScene`, `UIScene`, `ResultScene` 기본 흐름이 초기화되어야 한다.
2. 게임은 세로형 기준으로 동작해야 하며, 시작 화면에서 `시작` CTA가 최우선으로 보여야 한다.
3. 플레이어가 `시작`을 누르면 새 런의 pre-launch 상태로 진입해야 한다.
4. 불필요한 보조 메뉴 없이 최소 진입 UX를 유지해야 한다.

## Tasks / Subtasks

- [x] Phaser 3 + TypeScript + Vite 기반 앱 셸을 `app/` 아래에 초기화한다. (AC: 1, 2)
  - [x] `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts` 기본 구성을 만든다.
  - [x] `src/main.ts`에서 Phaser 게임 인스턴스를 부팅하도록 연결한다.
- [x] 씬 소유권 규칙에 맞는 기본 씬 골격을 만든다. (AC: 1)
  - [x] `BootScene`, `PreloadScene`, `MenuScene`, `GameScene`, `UIScene`, `ResultScene` 파일을 생성한다.
  - [x] `SceneKeys`와 기본 전환 흐름을 정의한다.
- [x] 세로형 모바일 게임 설정을 구성한다. (AC: 2)
  - [x] portrait only 기준 해상도와 스케일 설정을 `gameConfig.ts`에 반영한다.
  - [x] WebGL 우선, Canvas fallback 허용 설정을 적용한다.
- [x] 시작 화면과 첫 진입 상태를 최소 기능으로 연결한다. (AC: 2, 3, 4)
  - [x] `MenuScene`에 `시작` CTA를 배치한다.
  - [x] CTA 실행 시 `GameScene`의 pre-launch 상태와 `UIScene`이 함께 활성화되도록 연결한다.
- [x] 초기 상태 전이와 기본 부팅 흐름을 검증한다. (AC: 1, 3)
  - [x] 앱 실행 시 씬 초기화 순서를 점검한다.
  - [x] `시작` 클릭 후 런 시작 상태 진입을 수동 테스트한다.

## Dev Notes

- 이 스토리의 목적은 “코어 플레이 구현”이 아니라, 이후 모든 시스템이 안전하게 올라갈 수 있는 모바일 웹 게임 셸과 씬 구조를 고정하는 것이다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md#L106]
- 제품 목표상 첫 진입은 즉시성이 중요하다. 시작 화면은 과한 메뉴보다 단일 CTA 중심으로 구성해야 한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L54]
- 상용 품질 요구상 이 단계부터 반응성과 세로형 UX를 전제로 잡아야 한다. 추후 폴리시가 붙더라도 기본 셸이 이를 방해하면 안 된다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L65]
- UX 기준상 Entry State는 즉시 플레이 가능한 진입 화면이어야 하고, CTA는 `시작` 하나가 최우선이다. 이후 Pre-Launch State에서 공 부착과 `탭해서 시작` 유도가 이어진다. 이번 스토리에서는 그 전이 지점까지 연결해 두는 것이 중요하다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L175] [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L181]
- 아키텍처상 `Phaser 3 + TypeScript + Arcade Physics + Vite` 조합이 확정이며, 씬은 오케스트레이션만 담당해야 한다. 게임 규칙은 이후 `systems/`로 내려갈 예정이므로, 지금은 씬 뼈대와 전환만 책임진다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L24] [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L52] [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L213]

### Project Structure Notes

- 생성 대상 기본 구조는 [game-architecture.md](/home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L52)에 맞춘다.
- 현재 실제 `app/` 내부 구현은 비어 있을 가능성이 높으므로, 이번 스토리는 구조 생성과 초기 연결에 집중한다.
- 아직 `systems/`, `presentation/`, `ui/`의 구체 로직은 넣지 않는다. 빈 클래스/파일 또는 최소 스텁 수준으로만 준비한다.
- 씬 파일명과 키 이름은 후속 스토리들이 그대로 참조할 예정이므로, 여기서 정한 네이밍을 이후에 바꾸지 않는 편이 좋다.

### Technical Requirements

- 런타임은 `Phaser 3`, 언어는 `TypeScript`, 빌드 도구는 `Vite`를 사용한다.
- 렌더링은 WebGL 우선, Canvas fallback 허용으로 둔다.
- 세로형 portrait only 기준으로 부팅되어야 한다.
- 씬 간 전환은 이후 HUD/결과 오버레이 분리까지 고려해 `MenuScene -> GameScene + UIScene` 구조를 염두에 둔다.

### Architecture Compliance

- `BootScene`: 환경 초기화, 전역 설정
- `PreloadScene`: 에셋 로딩
- `MenuScene`: 시작 화면
- `GameScene`: 실제 플레이 및 시스템 업데이트
- `UIScene`: HUD, 튜토리얼, 경량 알림
- `ResultScene`: 실패/클리어/재시도 CTA

- Scene는 오케스트레이션만 담당한다.
- 게임 규칙은 개별 엔티티나 씬 안에 흩뿌리지 않고 이후 `systems/`로 분리한다.
- 이번 스토리에서 필요한 최소 전역 파일은 `Game.ts`, `SceneKeys.ts`, `gameConfig.ts`다.

### Library / Framework Requirements

- `phaser` 의존성 추가가 필요하다.
- TypeScript strictness는 후속 에이전트 간 충돌을 줄이기 위해 유지하는 편이 좋다.
- 브라우저 즉시 실행을 위해 불필요한 추가 프레임워크는 넣지 않는다.

### File Structure Requirements

- 예상 주요 생성/수정 파일:
- `bmad-projects/Breakout_Reborn/app/index.html`
- `bmad-projects/Breakout_Reborn/app/package.json`
- `bmad-projects/Breakout_Reborn/app/tsconfig.json`
- `bmad-projects/Breakout_Reborn/app/vite.config.ts`
- `bmad-projects/Breakout_Reborn/app/src/main.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/config/gameConfig.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/core/Game.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/core/SceneKeys.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/BootScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/PreloadScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/MenuScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/UIScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/ResultScene.ts`

### Testing Requirements

- 최소 수동 검증:
- 모바일 브라우저 뷰포트에서 앱이 세로형으로 실행되는지 확인
- 시작 화면에 `시작` CTA가 가장 먼저 보이는지 확인
- `시작` 클릭 후 오류 없이 `GameScene`과 `UIScene`이 활성화되는지 확인
- 브라우저 콘솔에 치명적 초기화 오류가 없는지 확인

- 후속 자동화 후보:
- 앱 부팅 smoke test
- start CTA 클릭 시 scene transition test

### References

- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md#L110]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L54]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L65]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L114]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L175]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L181]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L24]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L52]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L213]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L222]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- WSL `nvm` 경로를 직접 로드해 `node v24.14.0`, `npm 11.9.0` 사용
- `npm install --include=dev` 실행 후 `npm run build` 성공
- Vite 번들 경고: 메인 JS 청크가 500kB를 초과했지만 빌드는 성공

### Completion Notes List

- Ultimate context engine analysis completed - comprehensive developer guide created
- 앱 셸, Phaser 설정, 기본 씬 구조, 시작 CTA 전환까지 구현 완료
- WSL 환경에서 의존성 설치와 프로덕션 빌드 검증 완료
- 다음 스토리에서는 입력/발사 로직 연결 전 bundle split 여부를 검토할 수 있음

### File List

- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-1-game-shell-and-scenes.md
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/package-lock.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/index.html
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/package.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/tsconfig.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/vite.config.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/main.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/styles.css
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/config/gameConfig.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/core/Game.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/core/SceneKeys.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/BootScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/PreloadScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/MenuScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/UIScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/ResultScene.ts
