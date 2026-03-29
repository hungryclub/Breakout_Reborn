# Breakout_Reborn 자동 플레이 버그 헌트 보고서
작성일: 2026-03-29

## 적용한 4단계

1. 시나리오형 봇
2. 상태 기반 봇
3. 몬테카를로 soak 테스트
4. 불변식 검사

## 구현 반영

- Playwright bot 스펙 추가: `app/e2e/bot-play.spec.ts`
- bot helper 및 invariant 검사 추가: `app/e2e/helpers.ts`
- 게임 내부 bot step 및 heartbeat 노출: `app/src/game/scenes/GameScene.ts`
- debug API 확장: `app/src/game/testing/debugApi.ts`
- bot 실행 스크립트 추가: `app/package.json`
- bot 전용 무거운 연출 제한: `app/src/game/scenes/GameScene.ts`, `app/src/game/testing/debugApi.ts`

## 최종 검증 결과

### 기본 품질 검증

- `npm test`: 통과
- `npm run build`: 통과

### 기존 핵심 E2E

- `npx playwright test e2e/gameplay.spec.ts --reporter=dot`: 5개 통과

### 자동 플레이 버그 헌트

- `npx playwright test e2e/bot-play.spec.ts --reporter=dot`: 3개 통과
- 총 실행 시간: 약 11.9분

## 이번 라운드에서 실제로 찾고 수정한 문제

### [P1] sustained bot run에서 Playwright 호출 대기 방식이 과도하게 취약했음

초기 구현은 매 스텝마다 여러 번 `page.evaluate()`를 호출하고, heartbeat 증가를 `waitForFunction`으로 강하게 기다리는 구조였다. 이 방식은 실제 게임 로직이 깨지지 않아도 bot run 중간에 Playwright 쪽 대기와 페이지 실행 컨텍스트가 엇갈리며 timeout을 만들 수 있었다.

수정 내용:

- 봇 의사결정을 게임 내부 `debugBotStep()`으로 압축
- `gotoGame()` 봇 전용 진입 조건 완화
- bot mode에서 UI/연출/오디오 일부를 비활성화해 장시간 실행 안정화
- `waitForFunction` 기반 heartbeat 대기를 짧은 프레임 대기로 단순화
- soak용 새 런 시작 시 `startGame()`이 bot mode에서는 게임 씬을 재초기화하도록 수정

## 현재 불변식 기준

자동 플레이 중 아래 규칙을 계속 검사한다.

- 생명은 `0..3` 범위를 벗어나지 않는다
- 점수는 음수가 되지 않는다
- 남은 브릭 수는 음수가 되지 않는다
- 공 개수는 1 미만으로 떨어지지 않는다
- 공 좌표/속도는 모두 finite 해야 한다
- 공은 플레이필드 경계를 과도하게 벗어나지 않는다
- 패들은 플레이필드 밖으로 나가지 않는다
- 움직여야 하는 상태에서 snapshot이 장시간 정지하지 않는다

## 남아 있는 리스크

- bot suite는 안정화됐지만 실행 시간이 길다
- bot mode는 연출을 줄여 규칙 검증에 집중하는 구성이라, 실제 상용 연출 풀세트에서의 장시간 soak는 별도 트랙으로 다시 볼 필요가 있다
- 모바일 실기기 브라우저에서의 장시간 터치/백그라운드 복귀 soak는 아직 미실행이다

## 다음 권장 작업

1. bot suite를 `smoke`와 `long-soak`로 분리
2. CI에서는 짧은 bot smoke만 상시 실행
3. 주기적 수동 또는 야간 실행으로 long-soak 수행
4. 모바일 실기기에서 `interrupt/resume` 전용 soak 시나리오 추가

## 결론

자동 플레이 기반 4단계 버그 헌트는 현재 유효하게 작동한다.  
초기에는 장시간 실행에서 timeout 문제가 있었지만, 봇 호출 구조를 게임 내부 step 중심으로 정리하고 bot mode를 경량화한 뒤 최종적으로 scenario/state/soak 3종이 모두 통과했다.
