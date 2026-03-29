# Story 1.2: 상대 드래그 패들 조작 구현

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,  
I want 화면 하단 어디서든 드래그로 패들을 자연스럽게 움직이기를,  
so that 손가락이 패들을 가리지 않아도 정확히 컨트롤할 수 있다.

## Acceptance Criteria

1. 플레이어가 화면 하단 35% 구역을 터치하고 좌우로 드래그하면, 패들은 절대 위치가 아닌 상대 이동량으로 움직여야 한다.
2. 패들 입력 감도는 `0.85 / 1.0 / 1.15` 세 단계 중 하나를 적용할 수 있어야 한다.
3. 손가락이 화면 밖으로 벗어나거나 입력이 종료되면 패들은 즉시 정지해야 하며 관성은 적용되지 않아야 한다.
4. 입력 처리는 저프레임 상황에서도 누락보다 지연 최소화를 우선해야 하며, 이후 공 반사/발사 로직과 분리된 구조여야 한다.

## Tasks / Subtasks

- [x] 상대 드래그 입력용 시스템 구조를 추가한다. (AC: 1, 4)
  - [x] `src/game/systems/InputSystem.ts`를 생성해 `pointerdown`, `pointermove`, `pointerup`을 상대 이동량 기준으로 정규화한다.
  - [x] 입력 허용 구역을 화면 하단 35%로 제한하는 규칙을 구현한다.
- [x] 패들 엔티티와 패들 이동 시스템을 추가한다. (AC: 1, 3)
  - [x] `src/game/entities/Paddle.ts`에 최소 패들 뷰/상태를 만든다.
  - [x] `src/game/systems/PaddleSystem.ts`에 패들 위치 갱신, 화면 경계 제한, 즉시 정지 처리를 구현한다.
- [x] 감도 설정과 기본 입력 설정 파일을 추가한다. (AC: 2)
  - [x] `src/game/config/inputConfig.ts`에 `0.85 / 1.0 / 1.15` 감도 프리셋을 정의한다.
  - [x] 기본 감도 1.0을 적용하고 이후 스토리에서 교체 가능하게 만든다.
- [x] `GameScene`에 입력/패들 시스템을 연결한다. (AC: 1, 3, 4)
  - [x] pre-launch 상태에서도 드래그 연습이 가능하도록 패들을 표시한다.
  - [x] `GameScene`은 시스템 호출만 담당하고 계산 로직은 `systems/`에 유지한다.
- [x] 최소 검증 코드를 추가하고 빌드 검증을 수행한다. (AC: 1, 2, 3, 4)
  - [x] 입력 허용 영역, 상대 이동량, 즉시 정지 동작을 점검할 수 있는 단위 또는 스모크 테스트를 추가한다.
  - [x] WSL 기준 `npm run build`와 가능한 범위의 수동 입력 검증을 수행한다.

## Dev Notes

- 이 스토리는 `Breakout_Reborn`의 핵심 차별점인 “손가림 없는 상대 드래그 조작”을 처음으로 구현하는 단계다. 그래서 단순히 패들이 움직이기만 하면 되는 게 아니라, 이후 공 반사와 손맛 검증의 기준점이 되는 입력 구조를 만들어야 한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md#L128]
- GDD 기준 패들 이동은 화면 하단 아무 위치나 터치 후 좌우 드래그, 절대 이동이 아닌 상대 이동이며, 목적은 패들을 직접 가리지 않게 하는 것이다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L104]
- 입력 감도는 `0.85 / 1.0 / 1.15` 세 단계만 허용하고, 입력 허용 구역은 하단 35%, 손가락이 화면 밖으로 벗어나면 패들은 즉시 정지하며 관성은 적용하지 않는다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L151]
- UX 기준에서도 동일한 규칙이 반복 확인된다. 상대 드래그는 최초 터치 위치와 관계없이 상대값으로 계산되어야 하고, 입력 허용 구역은 하단 35%다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L114] [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L120]
- 아키텍처 문서는 Phaser 기본 드래그를 직접 쓰지 말고 별도 `InputSystem`에서 `pointerdown`, `pointermove`, `pointerup`을 받아 상대 이동량으로 계산하라고 명시한다. 이 패턴을 어기면 이후 UX 일관성이 무너진다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L177]
- 1.1 구현 결과로 기본 씬 구조와 `MenuScene -> GameScene + UIScene` 흐름은 이미 존재한다. 이번 스토리는 그 위에 패들 표시와 입력 시스템을 얹는 작업이며, 씬 내부에 입력 계산을 직접 흩뿌리지 않는 것이 중요하다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-1-game-shell-and-scenes.md#L40]

### Project Structure Notes

- 새로 추가될 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/config/inputConfig.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/entities/Paddle.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/systems/InputSystem.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/systems/PaddleSystem.ts`

- 수정 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/config/gameConfig.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/core/Game.ts`

- 아직 만들지 말아야 할 것:
- 공 반사 계산
- 공 발사 로직
- 물리 충돌 처리
- 파워업 입력 우선순위 분기

### Technical Requirements

- 입력은 Phaser의 기본 drag behavior 대신 pointer 이벤트를 직접 해석하는 구조여야 한다.
- 패들 이동은 화면 좌표 절대값에 스냅되지 않고 `deltaX` 기반으로 계산되어야 한다.
- 패들은 플레이 필드 가로 경계를 벗어나면 안 된다.
- 감도 설정은 상수 하드코딩이 아니라 config 파일에서 읽는 구조여야 한다.

### Architecture Compliance

- `GameScene`는 입력 계산 로직을 직접 소유하지 않고 시스템을 오케스트레이션만 해야 한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L213]
- 게임 규칙은 `systems/`에, 상태/뷰는 `entities/`에 둔다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L222]
- 장기적으로 `InputSystem -> PaddleSystem` 계약은 `deltaX` 전달 구조가 되어야 하므로, 이번 스토리도 그 형식을 미리 따르는 편이 좋다.

### Previous Story Intelligence

- 1.1에서 앱 셸과 씬 구조는 이미 생성되었고, `GameScene`은 pre-launch 플레이스홀더 상태를 가진다.
- `MenuScene`에서 `runState = launch_ready`를 registry에 기록하고 `GameScene`, `UIScene`을 여는 흐름이 있으므로, 이번 스토리는 그 흐름을 깨지 말고 pre-launch 상태에서 패들 이동 연습이 가능하게 만드는 것이 좋다.
- 첫 스토리에서 번들 경고가 있었지만 빌드는 성공했다. 이번 스토리에서는 입력 시스템 추가에 집중하고, 성능 최적화는 과도하게 선행하지 않는다.

### Library / Framework Requirements

- 기존 `phaser`, `typescript`, `vite` 조합을 유지한다.
- 새 라이브러리는 추가하지 않는다.
- 테스트를 넣더라도 현 프로젝트 구조에 과도한 프레임워크 확장은 피한다.

### File Structure Requirements

- 네이밍 규칙:
- Scene: `PascalCase` + `Scene`
- System: `PascalCase` + `System`
- Entity: `PascalCase`
- Config file: `camelCase.ts`

- 입력/패들 관련 상태와 렌더 책임을 분리해야 한다:
- 입력 해석: `InputSystem`
- 패들 위치 계산/경계 제한: `PaddleSystem`
- 패들 표시 객체: `Paddle`

### Testing Requirements

- 최소 검증 항목:
- 하단 35% 밖에서 시작한 포인터 입력은 패들 이동을 유발하지 않아야 한다.
- 하단 35% 안에서 시작한 포인터 입력은 상대 이동량만큼 패들을 이동시켜야 한다.
- 포인터 업 또는 화면 이탈 시 패들은 즉시 정지해야 한다.
- 감도 1.0 기준 이동량과 패들 이동이 일관되게 대응해야 한다.

- 가능하면 포함할 테스트:
- 입력 정규화 로직에 대한 단위 테스트
- `GameScene`에 시스템 연결 후 빌드 회귀 검증

### References

- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md#L128]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L104]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md#L151]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L114]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md#L120]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L177]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L213]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md#L222]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-1-game-shell-and-scenes.md#L38]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- WSL `nvm` 환경에서 `npm test` 통과
- WSL `nvm` 환경에서 `npm run build` 통과
- Node 내장 TS 실행 제약 때문에 테스트 대상 모듈을 순수 계산 중심으로 분리

### Completion Notes List

- 1.2 스토리 컨텍스트 생성 완료
- 상대 드래그 입력 시스템, 패들 엔티티, 패들 이동 시스템 구현 완료
- pre-launch 상태에서 하단 35% 드래그로 패들 이동 연습 가능
- 입력 계산 및 경계 clamp 동작에 대한 테스트 5건 통과
- 프로덕션 빌드 성공, 다만 Phaser 번들로 인한 큰 청크 경고는 계속 존재

### File List

- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-2-relative-drag-paddle-control.md
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/package.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/tsconfig.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/config/inputConfig.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/entities/Paddle.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/InputSystem.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/PaddleSystem.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/paddleMath.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/tests/input-system.test.ts
