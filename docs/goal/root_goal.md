# Root Goal

Goal active.

You are optimizing for steady convergence toward the documented North Star, not speed.

Ultimate Objective:
docs/*.md 전체 구현을 North Star로 삼고, North Star Completion Criteria가 충족될 때까지 구현 사이클을 반복하라.

Important:
A completed cycle is only a checkpoint.
Completing next_goal.md is not goal completion.
Do not pause, stop, or mark the goal complete after one cycle.
After each successful cycle, update next_goal.md and immediately continue to the next cycle.
Only stop when a Stop Condition is reached.

North Star Completion Criteria:
docs/*.md에 명시된 요구사항이 코드로 구현되어 있고, 가능한 검증을 통과했으며, 문서와 코드 상태가 일치하고, 남은 BLOCKED/PROPOSED 항목이 명확히 기록되어 있으면 완료로 본다.

Loop:
1. docs/*.md, next_goal.md, 현재 코드 상태를 읽고 North Star 대비 구현 현황을 파악한다.
2. next_goal.md가 현재 상태와 맞는지 검토한다.
3. next_goal.md가 낡았거나 부정확하면 docs/*.md에 맞게 보정한다.
4. 가장 작은 검증 가능한 작업 하나를 선택한다.
5. 구현한다.
6. 가능한 검증을 실행한다.
7. WORK_LOG 또는 작업 로그 문서에 before/after와 검증 결과를 기록한다.
8. next_goal.md를 다음 사이클에서 바로 실행 가능한 가장 작은 작업으로 갱신한다.
9. 작은 단위의 한국어 커밋으로 남긴다.
10. Stop Condition이 없고 North Star Completion Criteria가 아직 충족되지 않았으면, 사용자에게 멈춤 보고를 하지 말고 즉시 1번으로 돌아가 다음 사이클을 계속한다.

Work selection:
- 작은 검증 가능한 작업을 우선한다.
- North Star에 가까워지는 작업을 우선한다.
- 실행 안전성, 정책 엔진, 상태 관리, 장부/로그, 검증 가능성을 우선한다.
- 대규모 리팩터링보다 작은 구조 개선을 우선한다.
- 모호하면 docs/*.md의 의도에 맞춰 보수적으로 결정한다.

Safety:
- 위험한 인프라 작업, 비용 발생 작업, 외부 과금, 실제 지갑 자금 이동, 실제 온체인 트랜잭션, 대규모 삭제/마이그레이션은 실행하지 않는다.
- 위 작업이 필요하면 구현하지 말고 BLOCKED 또는 PROPOSED로 문서화한다.
- 보안 정책 우회 구현은 하지 않는다.
- 테스트/검증 없이 큰 변경을 하지 않는다.

Stop Conditions:
다음 중 하나에 해당할 때만 멈춘다.
1. North Star Completion Criteria가 충족되었다.
2. 안전 규칙상 더 이상 진행할 수 없다.
3. 외부 API key, 계정 생성, 유료 서비스 설정, 인프라 권한 등 인간 입력이 필요하다.
4. 검증 실패가 반복되어 보수적 판단상 추가 진행보다 인간 검토가 필요하다.
5. Codex 실행 예산, 시간, 권한, 샌드박스 한계에 도달했다.

Normal cycle behavior:
- 사이클이 성공하면 WORK_LOG에 기록하고 next_goal.md를 갱신한 뒤 즉시 다음 사이클을 시작한다.
- "이번 사이클 완료"를 멈춘 이유로 삼지 않는다.
- "next_goal.md 완료"를 멈춘 이유로 삼지 않는다.
- "Goal 완료 처리했습니다"라고 말하지 않는다. 단, North Star Completion Criteria가 충족된 경우는 예외다.

Required report only when stopping:
- 현재 상태:
- 마지막으로 선택한 작업:
- 선택 이유:
- before:
- after:
- 변경 파일:
- 실행한 검증:
- 검증 결과:
- 남은 문제:
- next_goal.md 갱신 내용:
- 커밋 해시:
- 멈춘 이유:

---

# Notification Gateway 설계 문서

## 1. 목적

여러 프로젝트에서 발생하는 알림을 하나의 통합 채널로 모아 받기 위한 공통 알림 게이트웨이를 구축한다.

현재 운영/개발 중인 프로젝트가 늘어나면서 각 프로젝트가 개별적으로 Telegram, Slack, Email 등을 직접 호출하면 다음 문제가 발생한다.

* 알림 포맷이 프로젝트마다 달라짐
* Telegram Bot Token 등 민감 정보가 여러 프로젝트에 분산됨
* 나중에 Slack, Email, Discord, SMS 등 다른 채널을 추가하기 어려움
* critical/warning/info 등 알림 우선순위 정책을 일관되게 적용하기 어려움
* AgentForge 같은 상위 orchestration system에서 운영 이벤트를 중앙집중적으로 추적하기 어려움

따라서 모든 프로젝트는 외부 알림 채널을 직접 호출하지 않고, 공통 Notification Gateway에 표준 이벤트만 전송한다.

---

## 2. 핵심 원칙

### 2.1 프로젝트는 알림 채널을 직접 알지 않는다

각 프로젝트는 Telegram API, Slack API, Email API 등을 직접 호출하지 않는다.

프로젝트는 다음 두 정보만 가진다.

```env
NOTIFY_ENDPOINT=https://notify.mugeon.kim/v1/notify
NOTIFY_API_KEY=...
```

Telegram Bot Token은 오직 Notification Gateway만 보유한다.

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
NOTIFY_API_KEY=...
```

### 2.2 프로젝트는 “전송”이 아니라 “이벤트”를 발행한다

나쁜 구조:

```txt
Project → Telegram API
Project → Slack API
Project → Email API
```

좋은 구조:

```txt
Project → Notification Gateway → Telegram
                              → Slack
                              → Email
```

프로젝트는 “Telegram 메시지를 보내라”가 아니라 “이런 일이 발생했다”는 이벤트를 발행한다.

### 2.3 URL에는 특정 채널명을 박지 않는다

비추천:

```txt
POST https://notify.mugeon.kim/telegram
```

추천:

```txt
POST https://notify.mugeon.kim/v1/notify
```

`/telegram`은 직관적이지만, 장기적으로는 Telegram 전용 서버처럼 보인다. Notification Gateway는 특정 채널 전용 서버가 아니라 통합 알림 라우터여야 한다.

---

## 3. 추천 인프라

### 3.1 서버 선택

초기 MVP는 Cloudflare Workers로 구축한다.

추천 구성:

```txt
Cloudflare Workers + Telegram Bot + notify.mugeon.kim
```

이유:

* 무료로 시작 가능
* 상시 서버가 필요 없음
* HTTP webhook receiver 용도에 적합
* 도메인 연결과 SSL 처리가 단순함
* VPS처럼 서버 패치, 방화벽, 프로세스 관리가 필요 없음
* AWS Lambda보다 초기 설정 부담이 작음

### 3.2 도메인

보유 중인 `mugeon.kim` 도메인을 사용한다.

추천 서브도메인:

```txt
notify.mugeon.kim
```

루트 도메인 `mugeon.kim`은 나중에 개인 홈페이지, 포트폴리오, 프로필 페이지 등에 사용할 수 있으므로 알림 게이트웨이는 서브도메인으로 분리한다.

권장 도메인 구조:

```txt
mugeon.kim              → 개인 홈페이지 / 포트폴리오 / 프로필
notify.mugeon.kim      → Notification Gateway
status.mugeon.kim      → 추후 상태 페이지
forge.mugeon.kim       → 추후 AgentForge control surface
```

---

## 4. 전체 아키텍처

```txt
Distill
AgentForge
Airdrop tools
Arbitrage scanner
AppDrop
Other project workers
        ↓
POST https://notify.mugeon.kim/v1/notify
        ↓
Cloudflare Worker
        ↓
Telegram Bot API
        ↓
Telegram group/channel
```

초기에는 Telegram 하나만 붙인다. 이후 필요하면 Slack, Email, Discord, SMS 등을 추가한다.

---

## 5. Endpoint 설계

### 5.1 Production endpoint

```http
POST /v1/notify
```

전체 URL:

```txt
https://notify.mugeon.kim/v1/notify
```

모든 프로젝트가 호출하는 표준 endpoint다.

### 5.2 Health check

```http
GET /health
```

응답 예시:

```json
{
  "ok": true,
  "service": "notification-gateway",
  "version": "1.0.0"
}
```

### 5.3 Telegram test endpoint

관리자/디버그용으로만 사용한다.

```http
POST /admin/telegram/test
```

주의:

* production 프로젝트가 이 endpoint를 호출하면 안 된다.
* Telegram 연결 확인, chat_id 확인, 테스트 메시지 전송용이다.

---

## 6. 인증 정책

`/v1/notify` endpoint는 반드시 인증을 요구한다.

요청 헤더:

```http
Authorization: Bearer <NOTIFY_API_KEY>
Content-Type: application/json
```

Gateway는 요청의 Bearer token이 환경변수 `NOTIFY_API_KEY`와 일치하는지 확인한다.

인증 실패 시:

```http
401 Unauthorized
```

응답 예시:

```json
{
  "ok": false,
  "error": "unauthorized"
}
```

---

## 7. 표준 Payload Schema

### 7.1 최소 payload

```json
{
  "source": "distill",
  "level": "warning",
  "title": "선정 가능한 클러스터 부족",
  "message": "selected_briefs=2, minimum_required=3"
}
```

### 7.2 권장 payload

```json
{
  "source": "agentforge",
  "project": "distill",
  "level": "critical",
  "event": "worker_failed",
  "title": "Worker execution failed",
  "message": "distill project build failed after retry.",
  "tags": ["build", "worker", "human_review_required"],
  "url": "https://github.com/...",
  "metadata": {
    "attempt": 2,
    "max_retries": 1,
    "queue": "human_review_queue"
  }
}
```

### 7.3 필드 정의

| 필드         | 필수 여부 | 설명                                                              |
| ---------- | ----: | --------------------------------------------------------------- |
| `source`   |    필수 | 이벤트를 보낸 시스템. 예: `distill`, `agentforge`, `airdrop`, `arbitrage` |
| `level`    |    필수 | 알림 심각도. `debug`, `info`, `success`, `warning`, `critical`       |
| `title`    |    필수 | Telegram 메시지의 제목                                                |
| `message`  |    필수 | 상세 메시지                                                          |
| `project`  |    선택 | 관련 project 이름. 예: `distill`, `appdrop`                          |
| `event`    |    선택 | 기계적으로 분류 가능한 이벤트명. 예: `worker_failed`, `daily_brief_sent`       |
| `tags`     |    선택 | 검색/분류용 태그 배열                                                    |
| `url`      |    선택 | GitHub PR, dashboard, log, report 등 관련 링크                       |
| `metadata` |    선택 | 추가 구조화 데이터                                                      |

---

## 8. 알림 레벨 정책

| level      | 용도         | Telegram 전송 여부        |
| ---------- | ---------- | --------------------- |
| `debug`    | 개발 중 진단 로그 | 기본 미전송 또는 개발 모드에서만 전송 |
| `info`     | 일반 정상 이벤트  | 선택적 전송                |
| `success`  | 중요한 성공 이벤트 | 전송 가능                 |
| `warning`  | 확인 필요      | 전송                    |
| `critical` | 즉시 확인 필요   | 반드시 전송                |

초기 MVP에서는 다음 3개만 사용해도 충분하다.

```txt
info
warning
critical
```

권장 기본 정책:

```txt
critical → Telegram 전송
warning  → Telegram 전송
success  → Telegram 전송 또는 source별 선택
info     → source별 선택
debug    → 미전송
```

---

## 9. Telegram 메시지 포맷

### 9.1 기본 포맷

```txt
[distill] WARNING
선정 가능한 클러스터 부족

selected_briefs=2, minimum_required=3

tags: daily, pipeline, fallback
```

### 9.2 AgentForge 예시

```txt
[agentforge] CRITICAL
Worker execution failed

project: distill
event: worker_failed
message: distill project build failed after retry.

tags: build, worker, human_review_required
url: https://github.com/...
```

### 9.3 Distill 예시

```txt
[distill] SUCCESS
오늘 브리핑 생성 완료

articles_collected: 143
clusters: 21
selected_briefs: 5
send_time: 07:30
```

### 9.4 Arbitrage scanner 예시

```txt
[arbitrage] INFO
가격차 후보 발견

pair: TOKEN/USDT
spread: 2.1%
exchange_a: ...
exchange_b: ...
liquidity_check: weak
```

주의: Arbitrage 알림은 매수/매도 지시가 아니라 후보 감지 알림으로만 취급한다.

### 9.5 Airdrop tools 예시

```txt
[airdrop] WARNING
Manual interaction may be required

project: ...
chain: ...
risk: manual confirmation required
```

주의: private key, seed phrase, full auth token, 민감한 wallet 정보는 절대 알림에 포함하지 않는다.

---

## 10. 보안 규칙

### 10.1 절대 알림에 포함하지 말아야 할 것

* Private key
* Seed phrase
* Full API token
* Full session cookie
* OAuth refresh token
* 개인정보 원문
* 민감한 금융정보 원문
* 전체 wallet private credential
* 결제수단 정보

### 10.2 민감정보 마스킹

필요한 경우 일부만 표시한다.

```txt
wallet: 0x1234...abcd
api_key: sk-...9f3a
email: a***@example.com
```

### 10.3 Bot Token 보관

Telegram Bot Token은 다음 위치에만 존재해야 한다.

```txt
Cloudflare Worker environment variable / secret
```

각 프로젝트 repo, `.env`, 로그, README, issue, PR description에 Telegram Bot Token을 넣지 않는다.

---

## 11. 프로젝트별 환경변수 표준

각 프로젝트는 다음 환경변수를 사용한다.

```env
NOTIFY_ENDPOINT=https://notify.mugeon.kim/v1/notify
NOTIFY_API_KEY=...
```

프로젝트는 Notification Gateway의 내부 구현을 알 필요가 없다.

금지:

```env
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

---

## 12. Cloudflare Worker 환경변수

Gateway에는 다음 secret을 설정한다.

```env
NOTIFY_API_KEY=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
```

선택적으로 추가 가능한 설정:

```env
MIN_LEVEL=warning
SERVICE_NAME=notification-gateway
ENVIRONMENT=production
```

---

## 13. 초기 구현 범위

### 13.1 MVP 필수 기능

* `GET /health`
* `POST /v1/notify`
* Bearer token 인증
* JSON body parsing
* 필수 필드 검증
* Telegram 메시지 포맷팅
* Telegram Bot API 호출
* 성공/실패 JSON 응답

### 13.2 MVP에서 제외 가능한 기능

* DB 저장
* retry queue
* Slack/Email 연동
* 관리자 UI
* source별 rate limit
* source별 mute 설정
* 알림 히스토리 dashboard

초기에는 단순하게 시작한다.

---

## 14. 향후 확장 방향

### 14.1 라우팅 정책 확장

```txt
critical → Telegram + Email
warning  → Telegram
info     → source별 선택
success  → source별 선택
debug    → 저장만 하고 미전송
```

### 14.2 AgentForge 연동

AgentForge에서는 Notification Gateway를 공통 infra module로 취급한다.

정의:

```txt
Notification Gateway is the single outbound alerting interface for all projects.
Projects must not call Telegram, Slack, Discord, or email providers directly.
They emit normalized notification events to the gateway.
The gateway handles routing, formatting, severity filtering, delivery, and audit logging.
```

### 14.3 추후 기능 후보

* 알림 히스토리 저장
* KV 또는 D1 기반 event log
* source별 mute/allowlist
* project별 routing rule
* critical 알림 중복 억제
* 일정 시간 내 같은 이벤트 deduplication
* admin dashboard
* Slack/Email/Discord/SMS 추가
* AgentForge approval link 버튼화

---

## 15. 최종 결정

현재 단계의 최종 선택은 다음과 같다.

```txt
서버: Cloudflare Workers
도메인: notify.mugeon.kim
Production endpoint: POST /v1/notify
Health check: GET /health
Telegram test: POST /admin/telegram/test
알림 채널: Telegram group/channel
인증: Authorization: Bearer <NOTIFY_API_KEY>
비밀정보: Telegram Bot Token은 Gateway에만 저장
```

핵심 결론:

```txt
각 프로젝트가 Telegram을 직접 호출하지 않는다.
각 프로젝트는 표준 notification event만 발행한다.
Notification Gateway가 채널 라우팅, 포맷팅, 인증, 전송을 책임진다.
```
