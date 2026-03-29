---
project: "Breakout_Reborn"
date: "2026-03-29"
author: "Codex"
status: "executed"
scope: "automated validation and build/performance baseline"
---

# Test Execution Report: Breakout_Reborn

## Overview

2026-03-29 기준 현재 환경에서 자동 실행 가능한 테스트와 성능 기초 검증을 수행했다.  
이번 실행 범위는 아래와 같다.

- unit/regression test suite
- production build validation
- build artifact size capture
- basic timing capture for test/build commands

사람 참여가 필요한 플레이테스트와 실기기 기반 성능 측정은 이 보고서 범위에 포함되지 않는다.

## Executed Commands

### 1. Automated Test Suite

```bash
npm test
```

### 2. Production Build

```bash
npm run build
```

### 3. Build Artifact Inspection

```bash
ls -lh dist/assets
wc -c dist/assets/*.js dist/assets/*.css
```

## Results

### Automated Tests

- Status: PASS
- Total tests: 32
- Passed: 32
- Failed: 0
- Node test runner duration: 약 631ms
- Full command elapsed time: 약 0.91s

### Production Build

- Status: PASS
- TypeScript no-emit check: PASS
- Vite production build: PASS
- Vite reported build time: 약 5.18s
- Full command elapsed time: 약 7.85s

### Build Artifacts

- `dist/assets/index-4DW8xY6l.js`: 1,239,231 bytes
- `dist/assets/index-CatB_K_A.css`: 349 bytes
- Total inspected asset bytes: 1,239,580 bytes

## Observations

### Good Signals

- 현재 핵심 수학/규칙 계층은 회귀 테스트로 잘 보호되고 있다.
- 최근 수정한 `laser charge`, `magnet charge`, `multiball sync` 관련 테스트도 통과했다.
- 빌드는 안정적으로 생성되며 TypeScript 오류는 없다.

### Risks Still Present

- Vite chunk size warning이 계속 발생한다.
- 메인 JS 번들은 약 1.24MB로, 모바일 웹 cold boot 성능에 부담이 될 수 있다.
- 이번 실행은 브라우저 실기기 성능, thermal throttling, 실제 FPS, 메모리 누수, long task를 측정한 것이 아니다.

## Manual Tests Not Yet Executed

아래 항목은 계획 문서는 존재하지만, 현재 세션에서는 실행하지 못했다.

- [playtest-plan.md](/home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/playtest-plan.md) 기반 내부 플레이테스트
- [performance-test-plan.md](/home/dhlee/projects/ai-oca/bmad-projects/Breakout_Reborn/_bmad-output/planning-artifacts/performance-test-plan.md) 기반 실기기 benchmark
- Stage 3~4 chaos 상황에서의 실제 FPS/P95 frame time 측정
- mobile Safari / Android Chrome 실기기 cold boot 측정
- retry 20회, interrupt/resume 10회 반복에 대한 브라우저 메모리 측정

## Recommended Next Steps

1. 내부 플레이테스트 5명 세션을 실제로 진행한다.
2. 최소 3개 실기기에서 cold boot, retry loop, Stage 4 chaos benchmark를 측정한다.
3. 번들 크기 경고 대응을 위해 code-splitting 또는 manual chunking 검토를 시작한다.
4. 실기기 측정 결과를 별도 `performance-results` 문서로 누적 기록한다.

## Final Status

자동 실행 가능한 검증은 현재 모두 통과했다.  
다음 병목은 코드 안정성보다는 실기기 체감 성능과 실제 플레이 체험 검증이다.
