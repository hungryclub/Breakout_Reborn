# Story 2.5: Stage 1-2 코어 템포 구성

Status: review

## Story

As a 플레이어,  
I want Stage 1과 Stage 2가 서로 다른 학습 목표와 감정 템포를 주기를,  
so that 초반 3분 안에 “빠른 성공”과 “각도 제어 학습”을 모두 경험할 수 있다.

## Acceptance Criteria

1. Stage 1은 빠른 성공과 첫 파괴 루프를 주는 배치여야 한다.
2. Stage 2는 강체 브릭과 각도 제어 학습이 더 드러나는 배치여야 한다.
3. 현재 Stage 번호와 상태가 HUD에 즉시 반영되어야 한다.
4. Stage 데이터는 순수 함수나 데이터 객체로 분리되어 테스트 가능해야 한다.

## Dev Notes

- 파티모드 논의 기준으로 Stage 1은 “내가 잘하고 있다”, Stage 2는 “내가 컨트롤하고 있다” 감정이 핵심이다.
- Stage 3/4의 더 강한 감정 곡선은 Epic 4에서 별도로 확장한다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- WSL `nvm` 환경에서 `npm test` 통과
- WSL `nvm` 환경에서 `npm run build` 통과

### Completion Notes List

- Stage 1/2 배치 규칙을 데이터 함수로 분리
- BrickSystem이 stage 기반 배치를 생성하도록 확장
- HUD stage 표시를 이벤트 기반으로 반영
- Stage 3/4 확장을 위한 레이아웃 기반도 함께 마련
