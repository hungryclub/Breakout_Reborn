# Story 2.4: 파워업 4종 효과와 중첩 규칙 구현

Status: review

## Story

As a 플레이어,  
I want 획득한 파워업이 분명한 효과와 중첩 규칙으로 작동하기를,  
so that 매 런의 빌드 차이가 플레이 감각으로 이어진다는 느낌을 받는다.

## Acceptance Criteria

1. `expand`, `laser`, `multiball`, `magnet` 4종 파워업은 공통 효과 시스템 안에서 상태를 가져야 한다.
2. `expand`는 패들 크기를 늘리고 중첩 상한을 가져야 한다.
3. `laser`는 별도 활성 상태 또는 충전 상태를 가져야 한다.
4. `multiball`은 멀티볼 확장을 위한 상태와 상한을 가져야 한다.
5. `magnet`은 패들 접촉 시 특별한 흡착 규칙을 적용할 수 있는 상태를 가져야 한다.
6. 각 파워업의 중첩과 지속/보유 규칙은 테스트 가능하게 분리되어야 한다.

## Dev Notes

- 파티모드 논의 기준으로 이번 단계는 “모든 효과를 완전히 화려하게 구현”하기보다, 4종이 모두 같은 계약 아래 관리되고 최소한의 체감 효과를 갖게 만드는 것이 중요하다.
- `expand`와 `magnet`은 직접 플레이 감각과 연결되므로 우선적으로 실제 동작까지 붙이는 편이 좋다.
- `laser`와 `multiball`은 차후 세부 확장 전에도 상태와 상한 규칙을 먼저 고정해야 한다.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- WSL `nvm` 환경에서 `npm test` 통과
- WSL `nvm` 환경에서 `npm run build` 통과

### Completion Notes List

- 4종 파워업 공통 상태와 중첩 규칙 프레임워크 추가
- expand 스택과 paddle scale 적용
- magnet charge 소비와 패들 재부착 흐름 연결
- laser, multiball은 차후 확장을 위한 상태/상한 계약 고정
