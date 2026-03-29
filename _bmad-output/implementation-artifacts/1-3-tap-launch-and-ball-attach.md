# Story 1.3: 탭 발사와 공 부착 상태 구현

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,  
I want 공이 패들 위에서 대기하다가 탭 한 번으로 즉시 발사되기를,  
so that 조작 규칙을 첫 몇 초 안에 이해하고 바로 플레이를 시작할 수 있다.

## Acceptance Criteria

1. 런이 시작되거나 생명을 잃고 복귀한 pre-launch 상태에서는 공 1개가 패들 상단 중앙에 부착된 상태로 유지되어야 한다.
2. pre-launch 상태에서는 플레이어가 하단 35% 영역에서 상대 드래그로 패들을 이동하면, 부착된 공도 패들과 함께 자연스럽게 따라와야 한다.
3. 플레이어가 탭하면 부착 상태가 해제되고 공이 문서에 정의된 초기 발사 각도와 속도로 즉시 발사되어야 한다.
4. 발사 직후 짧은 입력 보호 구간이 적용되어 탭과 드래그가 중복 인식되더라도 공이 다시 부착되거나 발사 상태가 흔들리지 않아야 한다.
5. `GameScene`은 상태 전이와 시스템 오케스트레이션만 담당하고, 공 부착 위치 계산과 발사 규칙은 별도 시스템과 순수 계산 함수로 분리되어야 한다.
6. 발사 직후 공은 수직에 가깝되 완전한 수직은 피하는 초기 각도를 사용해 초반 반복 루프를 줄여야 한다.

## Tasks / Subtasks

- [x] 공 엔티티와 발사 규칙의 최소 구조를 추가한다. (AC: 1, 3, 5)
  - [x] `src/game/entities/Ball.ts`를 생성해 부착 상태와 발사 상태를 표현할 수 있는 최소 공 엔티티를 만든다.
  - [x] 공 크기, 기본 색상, 초기 속도 등 1.3에 필요한 설정을 `config/`로 분리한다.
- [x] 공 부착과 발사 규칙을 별도 시스템으로 분리한다. (AC: 1, 2, 3, 5)
  - [x] `src/game/systems/BallSystem.ts`를 생성해 부착 위치 갱신, 발사, 초기 속도 적용을 담당하게 한다.
  - [x] 패들 기준 공 부착 좌표와 초기 발사 벡터 계산은 테스트 가능한 순수 함수로 분리한다.
- [x] `GameScene`에 pre-launch 발사 흐름을 연결한다. (AC: 1, 2, 3, 4, 5)
  - [x] 패들 생성 시 공도 함께 생성하고 pre-launch 상태에서 자동으로 부착한다.
  - [x] 탭 입력과 드래그 입력을 구분해 탭 발사가 하단 드래그 연습 흐름을 깨지 않도록 연결한다.
  - [x] 발사 직후 짧은 입력 보호 시간 또는 상태 플래그를 둬서 중복 발사를 막는다.
- [x] UI와 안내 문구를 현재 단계에 맞게 조정한다. (AC: 1, 3, 4)
  - [x] `탭해서 시작` 또는 동등한 문구를 pre-launch 화면에서 명확히 표시한다.
  - [x] 발사 후에는 안내 문구가 launch 이후 상태에 맞게 갱신되거나 사라지도록 처리한다.
  - [x] 발사 직후 안내 문구는 즉시 사라지거나 짧게 페이드되어 launch 상태의 가독성을 방해하지 않도록 한다.
- [x] 최소 검증 코드를 추가하고 WSL 기준 빌드 검증을 수행한다. (AC: 1, 2, 3, 4, 5)
  - [x] 공 부착 위치 계산, 초기 발사 벡터, 중복 발사 방지 로직에 대한 순수 함수 테스트를 추가한다.
  - [x] WSL `npm test`, `npm run build`를 통과시킨다.

## Dev Notes

- 이 스토리는 Epic 1에서 “상대 드래그 패들 조작” 다음에 바로 오는 조작 규칙 완성 단계다. 플레이어는 패들 이동을 익힌 직후 탭 한 번으로 공을 시작할 수 있어야 하며, 이 흐름이 첫 10초 UX를 결정한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md]
- GDD 기준 pre-launch 상태에서는 공이 패들 위에 부착된 채 대기하고, 탭 시 즉시 발사된다. 이때 발사 직후 중복 입력으로 상태가 흔들리지 않도록 짧은 보호 구간이 필요하다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md]
- UX 명세상 첫 진입은 “드래그해 위치를 맞추고 탭으로 시작” 흐름이 한눈에 읽혀야 한다. 드래그와 발사가 충돌하면 학습성이 무너지므로 입력 의도를 분리해야 한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md]
- 아키텍처 문서상 `GameScene`은 시스템 오케스트레이션에 머물러야 하고, 게임 규칙은 `systems/`, 표현 상태는 `entities/`, 계산 규칙은 순수 함수로 분리하는 것이 원칙이다. 이번 스토리에서도 공 부착 위치와 초기 발사 벡터는 테스트 가능한 순수 함수로 다루는 편이 좋다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md]
- Story 1.2 구현 결과 하단 35% 상대 드래그, 감도 프리셋, 즉시 정지 규칙이 이미 연결되어 있다. 이번 스토리는 그 입력 구조를 재사용하면서 공 상태만 얹는 방향으로 가야 다음 반사/충돌 스토리와 자연스럽게 이어진다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-2-relative-drag-paddle-control.md]

### Project Structure Notes

- 새로 추가될 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/config/ballConfig.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/entities/Ball.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/systems/BallSystem.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/systems/ballMath.ts`
- `bmad-projects/Breakout_Reborn/app/tests/ball-system.test.ts`

- 수정 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/UIScene.ts`
- `bmad-projects/Breakout_Reborn/app/package.json`

- 아직 만들지 말아야 할 것:
- 패들 반사 각도 보정
- 벽 충돌과 브릭 충돌
- 생명 차감과 복구 상태
- 메인 공 판독성 계층

### Technical Requirements

- 공은 Phaser Arcade Physics 바디를 사용하되, 1.3 범위에서는 “부착 상태”와 “발사 직후 이동 상태”까지만 다룬다.
- 초기 발사 벡터는 위쪽 진행을 보장하는 고정된 시작 규칙이어야 하며, 아직 패들 충돌 기반 각도 조정은 넣지 않는다.
- 초기 발사 각도는 완전 수직 직선 루프를 피하기 위해 미세한 좌우 편향을 포함하되, 플레이어가 예측 가능하다고 느낄 정도로만 제한한다.
- 발사 입력은 탭 한 번으로 충분히 이해 가능해야 하고, pre-launch 드래그와 충돌하지 않도록 상태 플래그 또는 짧은 쿨다운으로 보호한다.
- 테스트는 Phaser 런타임에 덜 의존하도록 부착 좌표와 발사 벡터 계산을 순수 함수로 분리해 작성한다.

### Architecture Compliance

- `GameScene`: 입력 이벤트와 상태 전이, 시스템 호출만 담당
- `Ball`: 화면에 보이는 공 엔티티와 최소 시각 상태 보유
- `BallSystem`: 공 부착 위치 갱신, 발사, 초기 속도 적용 담당
- `ballMath.ts`: 부착 좌표와 발사 벡터 계산 담당

- 드래그 계산은 기존 `InputSystem`을 재사용하고, 공 관련 규칙은 `BallSystem`으로 분리한다.
- 향후 `1-4-reflection-and-collision-basics`에서 반사 규칙이 들어오더라도 1.3 코드가 그대로 재사용될 수 있어야 한다.

### Previous Story Intelligence

- Story 1.1에서 씬 구조와 pre-launch 진입이 이미 구성되었다.
- Story 1.2에서 상대 드래그 패들 이동과 입력 구역 제한이 구현되었고 테스트까지 붙어 있다.
- 따라서 1.3은 새 입력 체계를 만들기보다, 기존 입력에 “부착된 공이 따라오고 탭으로 발사되는 상태 전이”만 추가하는 방향이 적절하다.

### Testing Requirements

- 최소 검증 항목:
- 패들 중앙 기준 공 부착 좌표가 안정적으로 계산되는지 확인
- 초기 발사 벡터가 항상 위쪽 진행을 보장하는지 확인
- 초기 발사 벡터가 완전 수직 0편향으로 떨어지지 않는지 확인
- pre-launch 상태에서 탭 1회가 발사 1회로만 처리되는지 확인
- 발사 직후 보호 구간에서 중복 발사가 차단되는지 확인

- 가능하면 포함할 테스트:
- 드래그 중 공 부착 좌표가 패들 이동을 따라가는 순수 함수 테스트
- `GameScene` 연결 후 빌드 스모크 검증

### References

- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-2-relative-drag-paddle-control.md]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- WSL `nvm` 환경에서 `npm test` 통과
- WSL `nvm` 환경에서 `npm run build` 통과
- Vite 번들 경고는 계속 존재하지만 빌드 실패는 아님

### Completion Notes List

- 공 설정, 공 엔티티, 공 부착 및 발사 시스템을 분리해 추가
- pre-launch 상태에서 패들 이동과 함께 부착 공이 추적되도록 연결
- 탭 후보 판정과 발사 잠금 시간을 넣어 드래그와 발사 중복 인식을 방지
- `탭해서 시작` 프롬프트와 본문 안내 문구가 발사 직후 페이드되도록 연결
- 순수 함수 테스트와 WSL 빌드 검증을 모두 통과

### File List

- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-3-tap-launch-and-ball-attach.md
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/package.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/config/ballConfig.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/entities/Ball.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/UIScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/BallSystem.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/ballMath.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/tests/ball-system.test.ts
