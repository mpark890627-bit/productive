# PRODUCTIV Monorepo

업무관리(Work Management) 앱을 위한 모노레포입니다.

## 구조
- `backend/`: Spring Boot 3 + Java 17 API
- `frontend/`: Vue 3 + Vite + TypeScript
- `docker-compose.yml`: postgres + backend + frontend 통합 실행

## 환경변수
1. 루트에서 `.env` 생성
```bash
cp .env.example .env
```

2. 주요 예시
```env
POSTGRES_DB=work_management
POSTGRES_USER=wm_user
POSTGRES_PASSWORD=wm_password
POSTGRES_PORT=55432
BACKEND_PORT=8080
FRONTEND_PORT=5173

JWT_SECRET=change-me-to-a-long-random-secret-key-2026
JWT_ACCESS_TOKEN_EXPIRATION_MS=3600000
APP_REMINDER_DUE_SOON_DAYS=2
APP_SCHEDULER_RECURRING_FIXED_DELAY_MS=60000
APP_SCHEDULER_REMINDER_FIXED_DELAY_MS=120000

# 로컬 프론트 dev 모드에서만 사용
VITE_API_BASE_URL=http://localhost:8080
```

기본값은 로컬 Postgres(5432) 충돌을 피하기 위해 Docker Postgres를 `55432`로 사용합니다.

## Docker 한 번에 실행
```bash
docker compose --env-file .env up --build
```

- Frontend: `http://localhost:${FRONTEND_PORT:-5173}`
- Backend API: `http://localhost:${BACKEND_PORT:-8080}`
- Swagger: `http://localhost:${BACKEND_PORT:-8080}/swagger-ui/index.html`

## Flyway
- backend 컨테이너 시작 시 Flyway가 자동 실행되어 스키마를 적용합니다.
- 기능팩 마이그레이션: `V3~V13` (Inbox/Saved View, Templates, Recurring, Notifications, Time Tracking, Approvals, Due Reminder, Risk Management)

## Risk Management (신규)
- 화면
  - `GET /app/projects/:projectId/risks` (Risk Register)
  - `GET /app/projects/:projectId/risks/:riskId` (Risk Detail)
- API
  - `POST /api/projects/{projectId}/risks`
  - `GET /api/projects/{projectId}/risks`
  - `GET /api/projects/{projectId}/risks/{riskId}`
  - `PATCH /api/projects/{projectId}/risks/{riskId}`
  - `DELETE /api/projects/{projectId}/risks/{riskId}`
- 권한: 프로젝트 owner만 접근 가능
- 활동로그: 리스크 생성/수정/상태변경/삭제 시 `activity_logs`에 기록

## 업무 효율 기능 팩 API (MVP)
- Inbox/Saved View
  - `GET /api/inbox/tasks`
  - `POST|DELETE /api/inbox/tasks/{taskId}/watch`
  - `GET|POST /api/inbox/views`, `PATCH|DELETE /api/inbox/views/{id}`
- Templates
  - `GET|POST /api/templates`
  - `POST /api/templates/{id}/apply`
  - `DELETE /api/templates/{id}`
- Recurring
  - `GET|POST /api/recurring-rules`
  - `PATCH|DELETE /api/recurring-rules/{id}`
- Notifications
  - `GET /api/notifications`
  - `PATCH /api/notifications/{id}/read`
  - `POST /api/notifications/read-all`
- Time Tracking
  - `POST /api/tasks/{taskId}/time/start`
  - `POST /api/tasks/{taskId}/time/stop`
  - `GET /api/tasks/{taskId}/time`
- Approval Workflow
  - `POST /api/approvals/request`
  - `GET /api/approvals/mine`
  - `POST /api/approvals/{id}/approve`
  - `POST /api/approvals/{id}/reject`

## 로컬 개발(컨테이너 없이)
1. DB만 실행
```bash
docker compose --env-file .env up -d postgres
```
2. backend
```bash
cd backend
mvn spring-boot:run
```
3. frontend
```bash
cd frontend
npm install
npm run dev
```

## 트러블슈팅
- 포트 충돌: `.env`에서 `POSTGRES_PORT`, `BACKEND_PORT`, `FRONTEND_PORT` 값을 변경하세요.
- CORS: docker compose 실행 시 프론트 nginx가 `/api`를 backend로 프록시하므로 기본적으로 CORS 문제가 줄어듭니다.
- 컨테이너 재생성: 설정 변경 후 `docker compose down` 뒤 `docker compose up --build`를 다시 실행하세요.
