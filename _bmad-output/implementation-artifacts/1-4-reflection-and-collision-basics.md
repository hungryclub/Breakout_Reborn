# Story 1.4: 반사 물리와 기본 충돌 규칙 구현

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a 플레이어,  
I want 공이 패들 위치에 따라 읽을 수 있는 각도로 반사되기를,  
so that 실수와 숙련이 분명히 드러나는 방식으로 기본 브레이크아웃 플레이를 익힐 수 있다.

## Acceptance Criteria

1. 발사된 공은 상단 벽과 좌우 벽에 닿으면 속도를 크게 잃지 않고 반사되어 플레이 영역 안에 유지되어야 한다.
2. 공이 패들 중앙 근처에 맞으면 수직에 가까운 안정적인 각도로 반사되어야 하며, 완전 수직 또는 완전 수평으로 잠기지 않아야 한다.
3. 공이 패들 좌우 끝 20% 구간에 맞으면 더 공격적인 사선 각도로 반사되어야 한다.
4. 패들 충돌 후 반사 각도는 최소 20도, 최대 75도 범위 안에 유지되어야 한다.
5. 같은 프레임 또는 연속 프레임에서 패들 충돌이 중복 처리되어 비정상적인 반전이 일어나지 않도록 짧은 충돌 보호 규칙이 있어야 한다.
6. 반사 각도 계산은 순수 함수로 분리되어 테스트 가능해야 하며, `GameScene`은 충돌 처리 오케스트레이션만 담당해야 한다.
7. 하단 경계는 이후 생명 차감 스토리를 위해 반사시키지 않고 열어 두어야 한다.

## Tasks / Subtasks

- [x] 벽 반사와 패들 충돌 기본 구조를 연결한다. (AC: 1, 2, 3, 5, 6)
  - [x] 공 바디에 world bounds 충돌을 활성화하고 반사 계수를 설정한다.
  - [x] `GameScene`에서 패들과 공의 Arcade Physics collider를 연결한다.
- [x] 패들 반사 각도 계산을 순수 함수로 분리한다. (AC: 2, 3, 4, 6)
  - [x] 패들 충돌 지점 비율을 계산하는 순수 함수를 추가한다.
  - [x] 충돌 지점에 따라 20도~75도 사이 반사 벡터를 계산하는 순수 함수를 추가한다.
- [x] 충돌 보호 규칙을 적용한다. (AC: 5, 6)
  - [x] 짧은 패들 충돌 잠금 시간 또는 동일 프레임 중복 처리 방지 규칙을 둔다.
  - [x] 공이 패들 아래에서 위로 진입하지 않도록 최소 위치 보정 또는 방향 보정을 적용한다.
- [x] 최소 시각 피드백을 보강한다. (AC: 1, 2, 3)
  - [x] 패들 충돌 시 공 또는 패들에 짧은 반응을 줘서 반사가 읽히게 한다.
  - [x] launch 이후 플레이 상태와 반사 규칙을 설명하는 과도한 텍스트는 최소화한다.
- [x] 순수 함수 테스트와 빌드 검증을 수행한다. (AC: 2, 3, 4, 5, 6)
  - [x] 중심 충돌, 끝 충돌, 각도 clamp, 충돌 보호 규칙을 검증하는 테스트를 추가한다.
  - [x] WSL `npm test`, `npm run build`를 통과시킨다.

## Dev Notes

- 이 스토리는 Epic 1의 마지막 전 단계로, “탭으로 시작한다”에서 “원하는 방향으로 되돌려 보낸다”로 플레이를 전환하는 구간이다. 여기서 반사가 읽히지 않으면 브레이크아웃의 손맛 전체가 흔들린다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md]
- GDD에서는 패들 중앙 충돌 시 수직에 가까운 안정 반사, 패들 끝 20% 충돌 시 공격적인 사선 반사를 요구하고, 반사각은 20도~75도 범위에 머물러야 한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md]
- 상용 품질 요구상 공이 읽히지 않거나 반복해서 같은 축으로 잠기는 느낌은 초반 이탈을 부른다. 완전 수직 잠금과 중복 충돌 반전은 미리 막아 두는 편이 좋다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md]
- 아키텍처 문서상 충돌 규칙은 `systems/`와 순수 계산 함수에 두고, 씬은 collider 연결과 상태 전이만 담당해야 한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md]
- Story 1.3 구현 결과 공 엔티티와 `BallSystem`, 부착 상태, 탭 발사가 이미 연결되어 있다. 이번 스토리는 그 상태 위에 `launch 이후 반사`만 얹는 방향이어야 한다. [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-3-tap-launch-and-ball-attach.md]

### Project Structure Notes

- 새로 추가될 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/systems/reflectionMath.ts`
- `bmad-projects/Breakout_Reborn/app/tests/reflection-system.test.ts`

- 수정 가능성이 높은 파일:
- `bmad-projects/Breakout_Reborn/app/src/game/systems/BallSystem.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts`
- `bmad-projects/Breakout_Reborn/app/src/game/entities/Ball.ts`

- 아직 만들지 말아야 할 것:
- 브릭 충돌과 점수 증가
- 콤보 증가
- 파워업 드롭
- 생명 차감과 결과 화면

### Technical Requirements

- 공은 Arcade Physics를 사용해 world bounds에 반사되어야 한다.
- 패들 충돌 반사는 충돌 지점 비율과 현재 속력 기준으로 계산하되, 속력 자체는 초기 속도 기준에서 크게 흔들리지 않게 유지한다.
- 충돌 직후 공의 y 속도는 반드시 위쪽이어야 하며, 수평 잠금과 과도한 수직 잠금을 모두 피해야 한다.
- 같은 충돌이 연속 프레임에서 두 번 처리되지 않도록 짧은 충돌 보호 시간이 필요하다.
- 패들 충돌 보호 시간은 구현 단순성과 체감 안정성을 위해 약 60ms~100ms 범위의 짧은 잠금으로 시작하는 편이 좋다.
- 하단 world bounds 반사는 비활성화해 이후 생명/실패 흐름과 충돌하지 않게 한다.

### Architecture Compliance

- `GameScene`: collider 연결, 시스템 호출, 최소 시각 피드백 트리거
- `BallSystem`: 공 속도 적용, world bounds 설정, 충돌 보호 상태 관리
- `reflectionMath.ts`: 반사 각도와 벡터 계산

- 충돌 지점과 반사 벡터 계산은 테스트 가능한 순수 함수여야 한다.
- 다음 스토리의 브릭 충돌이 들어와도 패들 반사 로직이 독립적으로 유지되어야 한다.

### Previous Story Intelligence

- Story 1.2에서 하단 35% 상대 드래그 입력과 패들 clamp가 구현되었다.
- Story 1.3에서 공 부착, 탭 발사, launch 프롬프트 제거, 초기 발사 벡터가 구현되었다.
- 따라서 1.4는 새 입력 체계를 만들지 않고, launch 이후 물리 루프만 확장하는 작업이 되어야 한다.

### Testing Requirements

- 최소 검증 항목:
- 중심 충돌 시 공이 위쪽으로 안정 반사되는지 확인
- 끝 충돌 시 중심 충돌보다 큰 수평 성분이 적용되는지 확인
- 반사각이 20도~75도 범위 밖으로 벗어나지 않는지 확인
- 짧은 충돌 보호 시간 안에 중복 충돌이 차단되는지 확인

- 가능하면 포함할 테스트:
- 현재 속력 크기를 유지한 반사 벡터 계산 테스트
- WSL 빌드 스모크 검증

### References

- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/epics.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/gdd.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/game-architecture.md]
- [Source: /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-3-tap-launch-and-ball-attach.md]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- WSL `nvm` 환경에서 `npm test` 통과
- WSL `nvm` 환경에서 `npm run build` 통과
- 번들 크기 경고는 유지되지만 빌드 실패는 아님

### Completion Notes List

- world bounds 반사와 패들 collider를 연결
- 반사각 계산과 충돌 잠금 규칙을 순수 함수 및 시스템 레이어로 분리
- 하단 world bounds 반사를 비활성화해 이후 생명 차감 스토리와 충돌하지 않게 유지
- 패들 충돌 시 짧은 스케일 반응을 넣어 기본 반사 피드백을 보강
- 반사 규칙 테스트와 전체 빌드 검증을 통과

### File List

- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/implementation-artifacts/1-4-reflection-and-collision-basics.md
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/package.json
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/config/ballConfig.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/entities/Paddle.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/scenes/GameScene.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/BallSystem.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/PaddleSystem.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/src/game/systems/reflectionMath.ts
- /home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/app/tests/reflection-system.test.ts
