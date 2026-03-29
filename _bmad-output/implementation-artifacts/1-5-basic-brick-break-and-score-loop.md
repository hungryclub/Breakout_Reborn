# Story 1.5: 기본 브릭 파괴와 점수 루프 구현

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,  
I want 기본 브릭을 깨고 즉각적인 점수 상승을 보기를,  
so that 첫 1분 안에 성공과 보상의 핵심 루프를 명확히 체감할 수 있다.

## Acceptance Criteria

1. Stage 1 플레이 영역에 기본 브릭 배열이 생성되어야 한다.
2. 공이 기본 브릭과 충돌하면 브릭은 파괴되고 공은 계속 진행해야 한다.
3. 브릭 파괴 시 기본 점수가 즉시 증가하고 HUD 점수 표시도 함께 갱신되어야 한다.
4. 브릭 파괴 시 짧고 분명한 시각 반응이 있어야 하지만 공과 메인 판독성을 방해하지 않아야 한다.
5. 브릭 파괴와 점수 증가 규칙은 시스템과 순수 함수로 분리되어 테스트 가능해야 한다.
6. 이 스토리에서는 스테이지 클리어 화면이나 보상 선택까지 연결하지 않고, 기본 파괴 루프와 점수 루프까지만 다룬다.

## Tasks / Subtasks

- [x] 기본 브릭 엔티티와 배치 규칙을 추가한다. (AC: 1, 5)
  - [x] `Brick` 엔티티와 Stage 1용 기본 브릭 레이아웃 생성을 추가한다.
  - [x] 브릭 배치 계산은 순수 함수로 분리한다.
- [x] 브릭 충돌과 파괴 루프를 연결한다. (AC: 2, 4, 5)
  - [x] `GameScene`에서 공과 브릭의 collider를 연결한다.
  - [x] 브릭이 맞으면 파괴 처리와 최소 시각 반응이 일어나게 한다.
- [x] 기본 점수 루프를 추가한다. (AC: 3, 5)
  - [x] 브릭 1개당 기본 점수 증가 규칙을 시스템에 둔다.
  - [x] HUD 점수 텍스트가 이벤트 기반으로 즉시 갱신되게 한다.
- [x] 스토리 범위를 고정한다. (AC: 6)
  - [x] 브릭이 모두 파괴되어도 아직 스테이지 클리어 UI는 띄우지 않는다.
  - [x] 결과 화면, 보상 선택, 콤보 증가는 다음 스토리로 남긴다.
- [x] 테스트와 빌드 검증을 수행한다. (AC: 1, 2, 3, 5)
  - [x] 브릭 배치 수, 브릭 파괴 결과, 점수 증가 규칙을 검증하는 테스트를 추가한다.
  - [x] WSL `npm test`, `npm run build`를 통과시킨다.

## Dev Notes

- 이 스토리는 Epic 1의 마지막 단계로, 지금까지 만든 입력, 발사, 반사 위에 “파괴 -> 점수 -> 또 한 번” 루프를 얹는 작업이다. 여기까지 오면 최소 브레이크아웃 경험이 닫힌다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md]
- GDD 기준 초반 1분 안에 명확한 성공 경험과 점수 반응이 필요하다. 다만 콤보, 특수 브릭, 파워업은 아직 범위 밖이다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md]
- UX 기준 점수 반응은 빠르고 읽히되 공과 충돌 지점의 판독성을 해치면 안 된다. 과한 파티클보다는 짧은 파괴 반응과 HUD 갱신이 우선이다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md]
- 아키텍처 기준 엔티티와 시스템 책임을 유지해야 하므로, 브릭 생성과 파괴 규칙은 `BrickSystem`, 배치와 점수 계산은 순수 함수로 분리하는 편이 좋다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md]
- Story 1.4까지 공은 발사 후 벽과 패들에 안정적으로 반사된다. 이제 브릭 충돌을 같은 물리 루프 안에 추가해도 된다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-4-reflection-and-collision-basics.md]

### Project Structure Notes

- 새로 추가될 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/config/brickConfig.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/entities/Brick.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/systems/BrickSystem.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/systems/brickMath.ts`
- `bmad-projects/Breakout_Reborn/app/tests/brick-system.test.ts`

- 수정 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/UIScene.ts`

- 아직 만들지 말아야 할 것:
- 콤보 배수
- 강체/폭발/아이템 브릭
- 파워업 드롭
- 스테이지 클리어 UI

### Technical Requirements

- 브릭은 정적 물리 바디를 사용해 공과 충돌해야 한다.
- 브릭 파괴 후 collider에 남지 않도록 비활성화 또는 destroy가 즉시 이뤄져야 한다.
- 점수 갱신은 이벤트 기반으로 UI 씬에 전달하는 편이 좋다.
- 브릭이 모두 사라져도 현재 스토리에서는 상태 전이를 만들지 않는다.

### Architecture Compliance

- `GameScene`: 공-브릭 collider 연결, 시스템 호출
- `Brick`: 브릭 뷰와 최소 상태
- `BrickSystem`: 브릭 생성, 충돌 처리, 파괴, 점수 반환
- `brickMath.ts`: 레이아웃 생성, 점수 계산

### Previous Story Intelligence

- Story 1.3에서 공 부착과 탭 발사가 구현되었다.
- Story 1.4에서 패들 반사와 world bounds 반사가 구현되었다.
- 따라서 1.5는 같은 공 상태를 유지하면서 브릭 충돌과 점수 루프만 추가하면 된다.

### Testing Requirements

- 최소 검증 항목:
- Stage 1 기본 브릭 수와 좌표가 예상 범위 안에 생성되는지 확인
- 브릭 1회 충돌 시 파괴 결과와 점수 증가가 올바른지 확인
- 브릭 파괴 후 남은 수가 감소하는지 확인

- 가능하면 포함할 테스트:
- 점수 이벤트를 받은 HUD 텍스트 갱신 스모크 검증
- WSL 빌드 스모크 검증

### References

- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/ux-design-specification.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-4-reflection-and-collision-basics.md]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- WSL `nvm` 환경에서 `npm test` 통과
- WSL `nvm` 환경에서 `npm run build` 통과
- 번들 크기 경고는 유지되지만 빌드 실패는 아님

### Completion Notes List

- 기본 브릭 설정, 엔티티, 레이아웃 계산, 브릭 시스템을 추가
- 공-브릭 collider와 파괴 루프를 연결
- 점수 HUD를 이벤트 기반으로 갱신하도록 UI 씬을 보강
- 브릭 파괴 시 짧은 플래시 반응을 넣되 스테이지 클리어 상태 전이는 아직 유보
- 테스트와 전체 빌드 검증을 통과

### File List

- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-5-basic-brick-break-and-score-loop.md
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/package.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/config/brickConfig.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/entities/Brick.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/UIScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/BrickSystem.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/brickMath.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/tests/brick-system.test.ts
