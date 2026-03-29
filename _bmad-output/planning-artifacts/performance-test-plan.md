---
project: "Breakout_Reborn"
date: "2026-03-29"
author: "Codex"
workflow: "gds-performance-test"
engine: "Phaser 3"
build_tool: "Vite"
target_platform: "mobile-web"
status: "draft-complete"
---

# Performance Test Plan: Breakout_Reborn

## Overview

`Breakout_Reborn`는 `Phaser 3 + TypeScript + Vite` 기반의 모바일 웹 게임이다. 이 프로젝트의 성능 테스트 목표는 단순 평균 FPS 확인이 아니라, 실제 플레이 핵심 구간에서 조작감과 판독성이 무너지지 않는지를 검증하는 것이다. 특히 현재 빌드에서는 번들 크기 경고가 존재하고, Stage 3~4의 멀티볼/레이저/폭발 브릭 조합이 late-stage 병목 후보이므로 그 구간을 중심으로 테스트를 설계한다.

## Performance Targets

### Frame Rate Targets

| Platform | Target FPS | Minimum FPS | Notes |
| -------- | ---------- | ----------- | ----- |
| Mobile Web High Tier | 60 | 45 | 최신 iPhone, 고성능 Android |
| Mobile Web Standard Tier | 30 | 30 | 중급 Android, 일반 브라우저 |
| Mobile Web Low-End Validation | 30 | 24 | 구형 기기, 열화 조건 검증용 |

### Frame Time Targets

| Metric | Target | Maximum |
| ------ | ------ | ------- |
| Average Frame Time | 16.7ms | 33.3ms |
| P95 Frame Time | 22ms | 40ms |
| Worst-Case Spike During Chaos | 40ms | 66ms |

### Memory Targets

| Device Class | Estimated Total RAM | Game Budget | Notes |
| ------------ | ------------------- | ----------- | ----- |
| High Tier Mobile | 6 GB+ | 2 GB 이하 | 브라우저/OS 여유 포함 |
| Standard Mobile | 4 GB | 1.5 GB 이하 | 백그라운드 앱 고려 |
| Low-End Validation | 3-4 GB | 1 GB 이하 권장 | 장시간 세션 안정성 우선 |

### Loading Time Targets

| Scenario | Target | Maximum |
| -------- | ------ | ------- |
| Cold Boot to Interactive | 5s | 10s |
| First Playable Scene Ready | 3s | 5s |
| Retry / Re-entry | 2s | 5s |
| Resume After Interrupt | 1s | 3s |

## Test Objectives

1. 모바일 웹에서 코어 플레이 중 최소 성능 기준이 유지되는지 검증한다.
2. 멀티볼, 레이저, 폭발 브릭, 파워업 드롭이 겹치는 구간에서 프레임 드롭과 입력 지연이 허용 범위 내인지 검증한다.
3. 장시간 세션과 반복 재시작에서 메모리 누수 또는 누적 오브젝트 잔존이 없는지 검증한다.
4. 현재 대용량 번들 경고가 실제 부팅 체감과 low-end 기기 성능에 얼마나 영향을 주는지 검증한다.

## Representative Test Scenarios

### Frame Rate Tests

#### Scenario A: First 3 Minutes Baseline

- Purpose: 코어 손맛 구간 기준선 확보
- Conditions:
  - Stage 1~2 플레이
  - 일반 브릭, 강체 브릭, 기본 파워업 중심
  - 사운드 on
- Pass Criteria:
  - High tier 평균 55 FPS 이상
  - Standard tier 평균 30 FPS 이상
  - 입력 지연 체감 이슈 없음

#### Scenario B: Stage 3 Chaos Control

- Purpose: 중반부 카오스 구간 병목 검증
- Conditions:
  - Stage 3 진입
  - 폭발 브릭 연쇄 발생
  - 콤보 8 이상 시도
  - 파워업 토스트와 HUD 갱신 동시 발생
- Pass Criteria:
  - P95 frame time 40ms 이하
  - 메인 공 추적 가능
  - 오디오 스터터링 없음

#### Scenario C: Stage 4 Worst-Case Chaos

- Purpose: 최악 구간 하한 성능 검증
- Conditions:
  - Stage 4
  - 멀티볼 4~5개
  - 레이저 사용
  - 폭발 브릭과 아이템 드롭 중첩
  - HUD, result/reward 이전 상태 모두 정상 갱신
- Pass Criteria:
  - High tier 평균 45 FPS 이상
  - Standard tier 최저 24 FPS 이상
  - 입력 손실 없음
  - 메인 공 판독성 붕괴 없음

### Memory and Stability Tests

#### Scenario D: Extended Session

- Purpose: 누수 및 누적 상태 검증
- Conditions:
  - 30분 연속 플레이
  - 최소 10회 이상 retry
  - reward/result/interrupt 상태 반복 진입
- Pass Criteria:
  - 메모리 사용량이 지속 상승만 하지 않을 것
  - retry 이후 드롭/파워업/오버레이 잔존 없음
  - 브라우저 탭 크래시 없음

#### Scenario E: Retry Loop Stress

- Purpose: 재시작 반복에 대한 오브젝트 정리 검증
- Conditions:
  - 일부러 빠르게 실패 후 retry 20회
  - 매 5회마다 Stage 2 이상 진입 시도
- Pass Criteria:
  - 프레임 저하 누적 없음
  - 파워업 상태가 런 간 누수되지 않음
  - 브릭, 공, 드롭 객체 수가 반복적으로 증가하지 않음

#### Scenario F: Interrupt / Resume Stability

- Purpose: 모바일 웹 특화 복귀 안정성 검증
- Conditions:
  - 플레이 중 탭 이탈
  - 잠깐 백그라운드 후 복귀
  - 10회 반복
- Pass Criteria:
  - resume 후 입력 상태 정상
  - 오버레이 중복 없음
  - physics resume 이후 공 속도 이상 없음

### Loading Tests

#### Scenario G: Cold Boot

- Purpose: 번들 크기와 초기 로드 체감 확인
- Conditions:
  - 캐시 비운 상태
  - 모바일 네트워크 또는 throttled devtools 환경
- Pass Criteria:
  - interactive state 10초 이내
  - 하얀 화면 정지처럼 느껴지는 구간 없음

#### Scenario H: Warm Restart

- Purpose: `한 판 더` UX와 체감 성능 검증
- Conditions:
  - 결과 화면 -> retry
  - 5회 연속 반복
- Pass Criteria:
  - retry 후 2초 이내 pre-launch 진입
  - 이전 런 상태 잔존 없음

## Methodology

### Automated Checks

현재 프로젝트는 브라우저 게임이므로 엔진 전용 자동화 대신 아래 조합을 사용한다.

1. Unit test regression
   - `npm test`
   - 입력, 반사, 브릭, 콤보, 파워업 상태 규칙 보호
2. Production build regression
   - `npm run build`
   - 번들 크기 변화 추적
3. Bundle artifact tracking
   - `dist/assets/*.js` 파일 크기 기록
   - 10% 이상 증가 시 원인 분석

### Browser Profiling

#### Chrome / Edge DevTools

- Performance panel
  - frame timeline
  - scripting / rendering / painting 분리
- Memory panel
  - heap snapshot before/after retry stress
  - detached nodes, retained objects 확인
- Coverage panel
  - 실제 사용 대비 과도한 초기 로드 확인

#### Safari Web Inspector

- iPhone 실기기 프레임 타임과 메모리 관찰
- 모바일 Safari에서의 long task 여부 확인

### Manual Profiling Checklist

#### CPU

- [ ] Stage 1 baseline frame time 수집
- [ ] Stage 3 chaos frame time 수집
- [ ] Stage 4 worst-case frame time 수집
- [ ] retry 20회 후 frame time 변화 확인
- [ ] long task 50ms 이상 이벤트 기록

#### Rendering

- [ ] 멀티볼 5개 상태에서 paint spike 확인
- [ ] 레이저/폭발 연쇄 시 draw/update spike 확인
- [ ] 오버레이 전환 중 레이아웃/paint 급증 확인

#### Memory

- [ ] cold boot 직후 baseline heap 기록
- [ ] retry 10회 후 heap 기록
- [ ] 30분 세션 후 heap 기록
- [ ] interrupt/resume 10회 후 heap 기록

## Benchmark Suite

### Benchmark Matrix

| Benchmark | Purpose | Duration | Key Metrics |
| --------- | ------- | -------- | ----------- |
| Boot Benchmark | 초기 진입 성능 | 3 runs | boot time, first interactive |
| Core Loop Benchmark | Stage 1~2 기준선 | 5 min | avg FPS, P95 frame time |
| Chaos Benchmark | Stage 3~4 최악 구간 | 5 min | min FPS, long tasks, readability note |
| Retry Benchmark | 재시작 연속 부하 | 20 loops | retry time, heap delta |
| Resume Benchmark | 중단/복귀 안정성 | 10 loops | resume time, overlay duplication |

### Baseline Capture Process

1. 기준 기기 3종 선정
   - iPhone 최근 모델 1종
   - Android 중급기 1종
   - Android 저사양/구형 1종
2. 각 benchmark 3회 측정
3. 평균값, 최솟값, P95 기록
4. 다음 조건 중 하나면 regression 후보로 분류
   - 평균 FPS 10% 이상 하락
   - P95 frame time 15% 이상 상승
   - boot/retry time 20% 이상 증가
   - heap baseline 대비 10% 이상 지속 상승

## Platform Matrix

### Mobile Web High Tier

- Devices:
  - iPhone 13 이상
  - 고성능 Android flagship
- Focus:
  - 60 FPS 근접 유지
  - 상용 폴리시 체감
  - late-stage visuals 안정성

### Mobile Web Standard Tier

- Devices:
  - 2~3년 전 Android 중급기
  - 일반 모바일 브라우저 환경
- Focus:
  - 30 FPS 안정 유지
  - 입력 누락/버벅임 방지
  - retry loop 안정성

### Low-End Validation

- Devices:
  - 구형 Android
  - 메모리 여유가 작은 환경
- Focus:
  - 조작감 유지
  - late-stage에서 플레이 불능으로 무너지지 않을 것
  - thermal/GC 성능 저하 조기 발견

## Regression Criteria

### Hard Fail

- Standard tier에서 평균 30 FPS 미만
- retry 후 상태 누수로 플레이 규칙 붕괴
- interrupt/resume 후 입력/공 상태 비정상
- boot 또는 retry가 최대 허용 시간 초과
- 플레이 중 브라우저 탭 크래시

### Soft Fail

- High tier 60 FPS 목표 미달이지만 45 FPS 이상 유지
- 번들 크기 증가로 boot 체감 저하
- Stage 4에서 일시적 spike는 있으나 플레이 지속 가능
- 메모리 상승이 있으나 세션 종료 전 회복 가능

## Recommended Instrumentation

현재 코드베이스에서 추가 권장되는 계측은 아래와 같다.

- FPS 샘플러
  - 1초 평균 FPS, P95 frame time 내부 로깅
- active object counters
  - 공 수, 브릭 수, 드롭 수, 오버레이 수
- retry metrics
  - result shown -> pre-launch ready 시간
- chaos markers
  - multiball count 3+, combo 8+, explosion chain 발생 시점 태깅

## Schedule

### When To Run

- 매 story 묶음 큰 변경 후: `npm test`, `npm run build`
- 주 1회 내부 성능 benchmark
- 플레이테스트 직전 1회
- 배포 후보 빌드마다 full matrix 1회

### Ownership

- Performance owner: 구현 담당자
- Review owner: QA/기획 동석 검토
- Sign-off condition:
  - core loop benchmark 통과
  - chaos benchmark에서 플레이 불능 이슈 없음
  - retry/resume benchmark 통과

## Immediate Next Actions

1. 현재 빌드 기준 boot benchmark와 retry benchmark부터 측정한다.
2. Stage 4 worst-case benchmark를 위한 고정 재현 절차를 만든다.
3. 번들 크기 경고에 대해 code-splitting 또는 manual chunking 검토를 시작한다.
4. 플레이테스트와 같은 기기 세트에서 성능 benchmark를 병행한다.

## Success Condition

이 계획의 성공 기준은 `Breakout_Reborn`가 단순히 돌아가는 수준이 아니라, 모바일 웹에서도 “손에 붙는 조작감”과 “읽히는 카오스”를 유지하는지 수치와 관찰로 증명하는 것이다.
