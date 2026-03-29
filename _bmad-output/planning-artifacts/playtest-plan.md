---
project: "Breakout_Reborn"
date: "2026-03-29"
author: "Codex"
workflow: "gds-playtest-plan"
playtest_type: "internal"
session_duration_minutes: 60
participant_count_target: 5
build_version: "0.1.0"
status: "draft-complete"
---

# Playtest Plan: Breakout_Reborn

## Overview

- Build version: `0.1.0`
- Platform: 모바일 웹 브라우저, 세로형 9:16
- Test type: 내부 플레이테스트
- Session date window: 2026-03-29 ~ 2026-04-02
- Primary goal: 코어 손맛, 재시도 루프, 판독성, 상용 퀄리티 가설 검증

## Why This Playtest

현재 빌드는 실제 플레이 가능한 수준이며 `npm test`, `npm run build`를 통과했다. 반면 implementation readiness와 code review 결과 기준으로는 다음 검증이 꼭 필요하다.

- 첫 10초 안에 조작이 이해되는지
- 첫 3분 안에 손맛, 보상, 재도전 욕구가 모두 전달되는지
- 멀티볼, 레이저, 폭발 벽돌, 보상 선택이 겹쳐도 메인 공 판독성이 유지되는지
- 실패/재시작/인터럽트 흐름이 억울하지 않고 빠르게 이어지는지
- 문서에서 약속한 “작지만 상용 게임처럼 느껴진다”는 기준이 실제 체감으로 성립하는지

## Playtest Objectives

### Primary Objectives

1. 상대 드래그 패들 조작이 한 손 플레이에서 즉시 이해되고 통제감 있게 느껴지는지 검증한다.
2. `발사 -> 반사 -> 브릭 파괴 -> 콤보 -> 보상 -> 재도전` 루프가 첫 3분 안에 자연스럽게 닫히는지 검증한다.
3. 멀티볼, 레이저, 폭발 브릭이 등장하는 카오스 구간에서도 메인 공과 핵심 판단 지점이 읽히는지 검증한다.
4. 실패 후 재시작 흐름이 5초 안에 다시 몰입으로 연결되는지 검증한다.

### Secondary Objectives

1. 스테이지 1~4 감정 곡선이 실제로 서로 다르게 느껴지는지 검증한다.
2. 보상 선택이 “다음 판 기대감”을 만드는지 확인한다.
3. 상단 HUD와 하단 안내/오버레이가 플레이를 방해하지 않는지 확인한다.
4. 모바일 웹 빌드의 체감 성능 문제가 late-stage에서 눈에 띄게 발생하는지 확인한다.

## Decisions This Will Inform

- 입력 감도, 발사/반사 튜닝 조정 여부
- 멀티볼과 레이저의 연출/사용 빈도 조정 여부
- Stage 3~4의 카오스 수준 상향/하향 여부
- HUD 및 오버레이의 정보량 조정 여부
- architecture correction pass가 presentation/readability 계층 구현까지 가야 하는지 여부

## Participant Criteria

### Target Participants

- 5명
- 모바일 캐주얼 액션 게임 경험자 3명 이상
- 브릭브레이커 장르 경험자 2명 이하도 포함
- 내부 팀 또는 협업 가능한 가까운 테스터

### Desired Mix

- 브릭브레이커 익숙한 플레이어: 2명
- 일반 모바일 액션 플레이어: 2명
- 비교적 라이트한 플레이어: 1명

### Exclusions

- 현재 설계 문서 작성자와 구현 담당자는 메인 피험자에서 제외
- 빌드 내부 구조를 이미 잘 아는 사람만으로 세션을 구성하지 않는다

## Session Structure

### Pre-Session (10 min)

1. 테스트 목적 설명
   - “실력을 보는 세션이 아니라, 게임이 얼마나 자연스럽게 느껴지는지 확인하는 세션”
2. 세팅 확인
   - 모바일 브라우저 실행 가능 여부
   - 사운드 on/off 상태 확인
   - 화면 밝기, 세로 고정 확인
3. 안내 문구
   - “평소처럼 플레이해 주세요.”
   - “가능하면 소리 내서 생각을 말해 주세요.”
   - “막히거나 답답하면 그 순간을 바로 말해 주세요.”

### Gameplay Session (35 min)

#### Segment A: First-Run Experience (10 min)

- 목표: 첫 10초 이해, 첫 1분 손맛, 첫 실패 후 재도전 검증
- 과제:
  - 아무 설명 없이 진입
  - 스스로 첫 발사 시도
  - 첫 스테이지 클리어 또는 첫 실패까지 진행

#### Segment B: Core Loop and Rewards (10 min)

- 목표: 보상 선택 이해도와 첫 3분 루프 검증
- 과제:
  - 최소 2회 보상 선택 경험
  - 의도적으로 다른 선택지를 골라 체감 차이 확인
  - 한 번은 실패 후 즉시 재도전

#### Segment C: Chaos and Readability (10 min)

- 목표: Stage 3~4, 멀티볼, 레이저, 폭발 브릭 구간의 판독성 검증
- 과제:
  - Stage 3 이상 플레이
  - 멀티볼 또는 레이저 획득 상황 경험
  - “지금 무엇을 봐야 하는지”를 플레이 중 말하게 유도

#### Segment D: Interrupt and Recovery (5 min)

- 목표: 인터럽트/복귀 UX 검증
- 과제:
  - 플레이 중 브라우저 탭 이탈 또는 화면 잠깐 전환
  - 복귀 후 재개 버튼으로 이어서 플레이

### Post-Session Interview (15 min)

1. 전체 인상
   - “처음 1분이 어땠나요?”
   - “한 판 더 하고 싶다는 느낌이 있었나요?”
2. 조작/판독성
   - “언제 가장 잘 조종된다고 느꼈나요?”
   - “언제 무엇을 봐야 할지 헷갈렸나요?”
3. 보상/리텐션
   - “보상 선택이 다음 스테이지 기대감을 만들었나요?”
   - “실패 후 다시 하기 버튼을 누르게 된 이유는 무엇이었나요?”
4. 상용 느낌
   - “프로토타입 같았나요, 완성형에 가까웠나요?”
   - “가장 세련돼 보인 순간과 가장 거칠었던 순간은 언제였나요?”

## Observation Guide

### Core Signals To Watch

| Category | Signals | What To Record |
| ------- | ------- | -------------- |
| 이해도 | 첫 입력 전 망설임, 잘못된 탭/드래그 시도 | 첫 발사까지 걸린 시간, 설명 요구 여부 |
| 통제감 | 패들 미세조정 성공, 각도 제어 의도 발화 | “내가 조종한다”는 표현 여부 |
| 혼란 | 멀티볼에서 시선 분산, 레이저 사용 타이밍 혼동 | 어떤 순간에 메인 공을 잃었는지 |
| 좌절 | 연속 실패, 억울함 표현, 재도전 포기 | 실패 원인, 포기 시점 |
| 몰입 | 콤보 반응, 반복 플레이 자발성, “한 판 더” 발언 | 어떤 시스템이 몰입을 만들었는지 |
| 체감 품질 | 사운드/연출 칭찬, 완성도 언급, 반대로 거칠다/버벅인다 발언 | 상용 느낌 관련 직접 인용 |

### Intervention Rules

- 플레이어가 20초 이상 완전히 멈출 때만 최소 힌트 제공
- 버그로 진행이 막힐 때만 개입
- 감정 곡선과 실패 체감은 가능한 한 자연 상태로 관찰
- “이렇게 해보세요”보다 “지금 무엇을 하려고 했나요?”를 먼저 묻는다

## Quantitative Metrics

### Required Metrics

- 첫 발사까지 걸린 시간
- 첫 실패까지 걸린 시간
- 첫 보상 선택까지 걸린 시간
- 첫 3분 내 콤보 3 이상 도달 여부
- 첫 3분 내 보상 선택 경험 여부
- 실패 후 재시작까지 걸린 시간
- Stage 3 이상 도달률
- 플레이 종료 전 자발적 재도전 횟수

### Quality Thresholds

- 80% 이상이 10초 안에 조작 방식을 이해할 것
- 80% 이상이 첫 3분 안에 보상 선택을 1회 이상 경험할 것
- 70% 이상이 실패 후 5초 안에 재도전할 것
- 70% 이상이 멀티볼/폭발 구간에서 “메인 공을 놓치지 않았다”고 응답할 것
- 60% 이상이 “프로토타입보다 완성형에 가깝다” 또는 동등 의미 응답을 줄 것

## Scenario Matrix

### Scenario 1: First 10 Seconds

- Focus: 온보딩 없는 이해 가능성
- Watch for:
  - 시작 CTA 발견 시간
  - 드래그 vs 탭 구분 실패
  - 하단 35% 입력 영역 직관성

### Scenario 2: First 3 Minutes

- Focus: 손맛, 보상, 재도전 루프
- Watch for:
  - 첫 성공 순간 감정 반응
  - 콤보 인지 여부
  - 보상 선택의 즉시 이해 가능성

### Scenario 3: Stage 3~4 Chaos

- Focus: 판독성, 과부하, 재미/피로 경계
- Watch for:
  - 멀티볼 중 메인 공 추적 가능 여부
  - 레이저 사용 직관성
  - 폭발 브릭 연쇄 시 정보 과밀 여부

### Scenario 4: Failure and Recovery

- Focus: 좌절보다 재도전 욕구가 먼저 오는지
- Watch for:
  - 실패 직후 표정/발화
  - 결과 UI 이해 시간
  - 재도전 CTA 선택 속도

### Scenario 5: Interrupt and Resume

- Focus: 모바일 웹 특유의 외부 인터럽트 복귀 안정성
- Watch for:
  - 중단 상태 인지 여부
  - 재개 CTA 이해 여부
  - 복귀 직후 입력 혼란 여부

## Note-Taking Template

```text
[참가자 ID]
- 플레이 성향:
- 브릭브레이커 경험:
- 모바일 액션 경험:

[시간] [구간] [관찰] [플레이어 발화] [심각도]
00:08  첫 진입    탭 대신 드래그만 반복함    "어? 시작이 안 되네"    Major
00:42  첫 성공    콤보 반응에 웃음          "이거 손맛 좋다"        Positive
02:31  보상 선택  두 카드 의미를 바로 읽음   "이건 멀티볼이네"       Positive
05:12  Stage 3    메인 공 상실               "잠깐 뭐 봐야 하지?"    Critical
07:40  실패       즉시 재도전                "한 번만 더"            Positive
```

## Session Questions

### Must-Ask Questions

1. 첫 10초 안에 무엇을 해야 하는지 바로 이해됐나요?
2. 패들 조작이 내 의도대로 움직인다고 느꼈나요?
3. 가장 재밌었던 순간은 언제였나요?
4. 가장 헷갈렸던 순간은 언제였나요?
5. 실패 후 바로 다시 하게 만든 이유가 있었나요?
6. 이 게임이 프로토타입 같았나요, 완성된 게임 같았나요?

### Optional Deep-Dive Questions

1. 보상 선택은 충분히 짧고 분명했나요?
2. Stage 3~4에서 너무 복잡했나요, 아니면 오히려 더 재밌었나요?
3. 레이저와 멀티볼은 얻었을 때 기대감과 사용감이 일치했나요?
4. HUD가 도움 됐나요, 아니면 신경 쓰이지 않았나요?

## Team Roles

- Facilitator: Dhlee 또는 플레이를 직접 구현하지 않은 내부 팀원
- Note-taker: 별도 1명
- Technical support: 구현 담당자 1명 대기

## Logistics

### Build Preparation

- URL 또는 로컬 빌드 진입 경로 준비
- 세로 화면 고정
- 사운드 on 상태 기본
- 테스트 시작 전 캐시 초기화 또는 메타 상태 초기화 여부 통일

### Devices

- Android 2대 이상
- iPhone 1대 이상
- 저사양 또는 구형 브라우저 환경 1회 이상 포함 권장

## Post-Playtest Analysis Framework

### Synthesis Method

1. 패턴 식별
   - 2명 이상에게 반복된 혼란/좌절 포인트 분리
   - 2명 이상이 칭찬한 순간 분리
2. 심각도 평가
   - Critical: 진행 차단, 메인 루프 붕괴, 판독성 붕괴
   - Major: 재미/리텐션 큰 저하
   - Minor: 다듬으면 좋아지는 수준
3. 액션 분류
   - 입력/물리 튜닝
   - UI/HUD 조정
   - 파워업 밸런스 조정
   - stage pacing 조정
   - 성능/번들 최적화

### Report Template

```markdown
# Playtest Report: Breakout_Reborn

## Summary

- Participants: {count}
- Session dates: {dates}
- Completion rate: {rate}
- Overall sentiment: {positive/mixed/negative}

## Key Findings

1. {finding}
2. {finding}
3. {finding}

## Recommendations

| Issue | Severity | Recommendation | Priority |
| ----- | -------- | -------------- | -------- |
| {issue} | {sev} | {recommendation} | {P0-P3} |

## Quotes

> "{notable player quote}" - Participant {N}

## Next Steps

1. {action}
2. {action}
3. {action}
```

## Recommended Immediate Follow-Up

이 플레이테스트 이후 우선순위는 아래 순서가 적절하다.

1. 입력/반사/레이저/멀티볼 관련 체감 이슈 정리
2. Stage 3~4 readability 관련 수정
3. story 문서와 sprint status 정합성 보정
4. 필요 시 `gds-performance-test`로 성능 전략 문서화

## Success Condition For This Plan

이번 플레이테스트 계획의 성공 기준은 단순히 의견을 많이 받는 것이 아니다. `Breakout_Reborn`가 실제로 “짧지만 손에 붙고, 다시 누르게 만들며, 카오스 구간에서도 읽히는” 게임인지에 대해 설계/구현을 움직일 수 있는 증거를 확보하는 것이다.
