# Buffett Diary — 매매일지 앱

## 프로젝트 개요

주식 매매 기록·통계·회고를 관리하는 풀스택 앱.
- **프론트엔드**: React 19 + Vite + Tailwind 4 + shadcn/ui → Vercel 배포
- **백엔드**: Spring Boot 3.4 + Kotlin + JPA → Railway 배포
- **DB**: MySQL 9.4 (Railway) / Redis (캐시)

## 모노레포 구조

```
buffett-diary/
├── backend/                          # Spring Boot (Kotlin, Gradle)
│   └── src/main/kotlin/com/buffettdiary/
│       ├── config/                   # SecurityConfig, CacheConfig, GlobalExceptionHandler, ...
│       ├── controller/               # AuthController, TradeController, StockController, OAuthController
│       ├── service/                  # AuthService, TradeService, TradeImageService, StockService, OAuthService, EmailService
│       ├── repository/               # JPA repositories
│       ├── entity/                   # Trade, User, TradeImage, Stock, RefreshToken + AuditEntity
│       ├── dto/                      # TradeDto, AuthDto
│       ├── enums/                    # Position(BUY/SELL), AuthProvider(LOCAL/GOOGLE/DEMO)
│       ├── exception/                # Sealed AppException hierarchy
│       └── security/                 # JwtUtil, JwtAuthFilter
│
└── frontend/                         # pnpm workspace
    ├── packages/shared/              # TypeScript 타입 정의 (Trade, User, Stock, ...)
    └── apps/web/                     # React SPA
        └── src/
            ├── api/                  # Axios client + API 함수 (auth, trades, stocks)
            ├── contexts/             # AuthContext (user state + localStorage)
            ├── pages/                # Login, Register, Dashboard, TradeList, OAuthCallback
            ├── components/           # Layout, TradeForm, BulkTradeModal, ui/ (shadcn)
            └── lib/                  # utils(cn), date helpers
```

## 로컬 개발 실행

### 백엔드

```bash
cd backend
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew bootRun --args='--spring.profiles.active=local'
# → http://localhost:8080
```

`application-local.yml`에 Railway DB/Redis/OAuth/JWT 접속 정보가 들어있음 (gitignored).

### 프론트엔드

```bash
cd frontend
pnpm install
pnpm --filter web dev
# → http://localhost:5173 (Vite proxy로 /api → localhost:8080 전달)
```

### 빌드 검증

```bash
# 백엔드 컴파일
cd backend && JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew clean compileKotlin

# 프론트엔드 빌드
cd frontend && pnpm build
```

## 배포

| 구성요소 | 플랫폼 | URL |
|---------|--------|-----|
| Frontend | Vercel | https://dayed.vercel.app |
| Backend | Railway | https://dayed.up.railway.app |
| MySQL | Railway | internal (public: switchback.proxy.rlwy.net:21935) |
| Redis | Railway | internal (public: turntable.proxy.rlwy.net:26522) |

- Railway 환경변수: `SPRING_PROFILES_ACTIVE=dev`
- Vercel 빌드: `pnpm --filter web build` → `apps/web/dist`

## API 설계

모든 인증 필요 엔드포인트는 `Authorization: Bearer <accessToken>` 헤더 필요.
인증 관련 (`/api/v1/auth/**`)은 public.

### 에러 처리

sealed `AppException` 계층으로 HTTP 상태 코드 자동 매핑:
- `NotFoundException` → 404
- `ForbiddenException` → 403
- `UnauthorizedException` → 401
- `ConflictException` → 409
- `BadRequestException` → 400
- `RateLimitException` → 429

응답 형식: `{ "message": "..." }`

## 코드 컨벤션

### 백엔드 (Kotlin)

- 예외는 반드시 `com.buffettdiary.exception` 패키지의 도메인 예외 사용. `IllegalArgumentException`/`IllegalStateException` 사용 금지.
- Entity의 `createdAt`/`updatedAt`는 JPA Auditing(`AuditEntity`)이 자동 관리. 수동 할당 금지.
- `User.provider`는 `AuthProvider` enum 사용. 문자열 리터럴 금지.
- 읽기 전용 서비스 메서드에 `@Transactional(readOnly = true)` 필수.
- `RestTemplate`은 `RestTemplateConfig` Bean 주입. 직접 생성 금지.
- Repository의 delete 커스텀 쿼리에는 `@Modifying` 필수.

### 프론트엔드 (TypeScript/React)

- 타입 정의는 `packages/shared`에 관리. 프론트엔드와 백엔드 DTO 일치 유지.
- API 호출은 `src/api/` 모듈 사용. Axios 인스턴스(`client.ts`)를 통해서만 호출.
- 스타일은 Tailwind CSS utility class. `cn()` 헬퍼로 조건부 클래스.
- UI 컴포넌트는 `components/ui/` (shadcn/ui). 커스텀 컴포넌트는 `components/`.
- 경로 alias: `@/` → `src/`

## 주의사항

- `application-local.yml`은 시크릿 포함. 절대 커밋하지 않기 (gitignored).
- `DataInitializer`는 `@Profile("local")`에서만 동작. 프로덕션 시드 데이터 방지.
- 프론트엔드 `tradeDate`는 백엔드에서 `LocalDate`로 자동 역직렬화됨 (Jackson JavaTimeModule).
- 캐시 TTL: trades/stats 5분, 이미지 30분, stocks 24시간.
