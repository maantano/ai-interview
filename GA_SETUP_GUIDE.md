# Google Analytics Data API 설정 가이드

## 📊 실제 GA 데이터 사용을 위한 설정

현재 구현된 시스템은 다음과 같이 작동합니다:

### 1. 데이터 수집 (자동)
- **페이지 방문**: 사용자가 사이트에 접속하면 자동으로 `page_view` 이벤트 발생
- **면접 시작**: "면접 시작하기" 버튼 클릭 시 `session_start` 커스텀 이벤트 발생  
- **분석 완료**: "답변 분석하기" 버튼 클릭 후 성공 시 `answer_analyzed` 커스텀 이벤트 발생

### 2. 데이터 표시 (실시간)
- 메인 페이지 대시보드에서 `/api/analytics?action=stats` 호출
- 30초마다 자동 업데이트
- 실제 GA 데이터를 가져와서 표시

## 🔧 실제 GA Data API 활성화 방법

### 단계 1: Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스 > 라이브러리**에서 "Google Analytics Data API" 검색 후 활성화

### 단계 2: 서비스 계정 생성

1. **API 및 서비스 > 사용자 인증 정보** 이동
2. **사용자 인증 정보 만들기 > 서비스 계정** 선택
3. 서비스 계정 이름 입력 (예: "ga-data-reader")
4. **키 > 새 키 추가 > JSON** 선택하여 키 파일 다운로드

### 단계 3: Google Analytics 권한 설정

1. [Google Analytics](https://analytics.google.com/) 접속
2. **관리 > 속성 > 속성 액세스 관리** 이동
3. **+** 버튼 클릭하여 사용자 추가
4. 서비스 계정 이메일 주소 입력 (JSON 파일의 `client_email`)
5. **뷰어** 권한 부여

### 단계 4: 환경 변수 설정

`.env.local`에 다음 변수 추가:

```env
# 기존 GA 설정
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WQNEQX1T08

# GA Data API 설정 (새로 추가)
GA_PROPERTY_ID=000000000  # GA4 속성 ID (숫자만)
GA_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GA_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 단계 5: API 코드 활성화

`app/api/analytics/route.ts` 파일에서 주석 처리된 실제 GA API 코드를 활성화:

```typescript
// 주석 해제하고 실제 구현 사용
import { google } from 'googleapis';

// getGoogleAnalyticsData() 함수 활성화
// mockData 대신 실제 GA 데이터 사용
```

### 단계 6: Vercel 배포 설정

Vercel 대시보드에서 환경 변수 추가:
- `GA_PROPERTY_ID`
- `GA_CLIENT_EMAIL`  
- `GA_PRIVATE_KEY`

## 📈 수집되는 데이터

### 자동 수집 이벤트
- `page_view`: 페이지 방문 (GA4 기본 이벤트)
- `session_start`: 면접 시작 (커스텀 이벤트)
- `answer_analyzed`: 답변 분석 완료 (커스텀 이벤트)

### 대시보드 지표
- **총 방문자**: `page_view` 이벤트 수
- **면접 참여자**: `session_start` 이벤트 수
- **AI 첨삭 완료**: `answer_analyzed` 이벤트 수
- **전환율**: 계산된 지표 (참여율, 완료율 등)

## 🔄 현재 상태

- ✅ GA4 이벤트 추적 설정 완료
- ✅ 대시보드 UI 구현 완료
- ✅ API 엔드포인트 구현 완료
- ⏳ GA Data API 인증 설정 필요 (위 가이드 따라 진행)
- ⏳ 실제 데이터 연동 테스트 필요

## 🚀 즉시 사용 가능한 기능

현재도 다음 기능들이 정상 작동합니다:
- Google Analytics 이벤트 추적
- 실시간 대시보드 (모의 데이터)
- 30초마다 자동 업데이트
- 반응형 디자인

실제 GA 데이터 연동은 위 설정 완료 후 즉시 작동됩니다!