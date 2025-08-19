# 🛒 THE SELECT SHOP – 반응형 쇼핑몰 웹사이트 제작 프로젝트

https://jaejun0617.github.io/The-Select/index.html

## 🗓 기간

2025년 8월 14일 ~ 2025년 8월 20일

## 📝 최종 목표

- 반응형 멀티페이지 쇼핑몰 제작
- 상품 데이터(JSON) 연동
- 사용자 경험을 극대화하는 인터랙션 구현  
  (스크롤, 애니메이션, 슬라이드, 모바일 햄버거 메뉴 등)

## 🧠 기획 및 설계 방향

- 데이터 중심 개발: products.json 하나의 데이터 소스를 기준으로 모든 페이지가 유기적으로 동작
- 클릭 한 번으로 URL이 바뀌고, JS가 데이터를 가공하여 완전히 다른 화면을 동적으로 생성
- 상태 관리, URL 파라미터, LocalStorage 연동 등을 고려하여 사용자 경험 최적화
- 프로젝트 목표: 데이터 흐름과 UI/UX를 동시에 고려한 실무 감각 체득

## 📂 프로젝트 폴더 구조

```
shopping/
├─ index.html                  # 메인 페이지
├─ product-list.html           # 상품 리스트 페이지
├─ product-detail.html         # 상품 상세 페이지
├─ cart.html                   # 장바구니 페이지
├─ assets/                     # 정적 자원 폴더
│  ├─ images/                  # 상품 이미지, 배너 등
│  ├─ fonts/                   # 웹폰트
│  └─ icons/                   # 아이콘 이미지
├─ css/                        # 스타일 시트
│  ├─ reset.css                # 브라우저 기본 스타일 초기화
│  ├─ variables.css            # CSS 변수(:root) 정의
│  ├─ common.css               # 공통 스타일( body, h1~h6, p, 헤더/푸터 등 전역 적용 + 클래스별 스타일 일부)
│  ├─ layout.css               # 레이아웃 관련 스타일(Flex/Grid)
│  └─ components.css           # 카드, 버튼, 모달 등 UI 컴포넌트 스타일
├─ js/                         # 자바스크립트 파일
│  ├─ main.js                  # 전체 공통 스크립트
│  ├─ product-list.js          # 상품 리스트 페이지 전용 스크립트
│  ├─ product-detail.js        # 상품 상세 페이지 전용 스크립트
│  ├─ cart.js                  # 장바구니 페이지 전용 스크립트
│  └─ utils.js                 # fetch, LocalStorage 등 공통 유틸 함수
└─ data/                       # JSON 데이터 폴더
   └─ products.json            # 상품 데이터 파일
```

## 🔥 핵심 기능 상세 가이드

### 1. 상품 데이터 연동 및 동적 렌더링

- **JSON 구조 예시**

```json
[
   {
      "id": 1,
      "name": "프리미엄 코튼 티셔츠",
      "price": 29000,
      "category": "상의",
      "imageUrl": "./assets/images/product01.jpg",
      "description": "최고급 수피마 코튼으로 제작되어 부드러운 감촉을 자랑합니다."
   }
]
```

- **구현**
   - fetch API로 JSON 데이터 불러오기
   - 메인 페이지 및 상품 리스트 페이지에서 동적 상품 카드 생성

### 2. 바닐라 JS로 구현하는 동적 페이지 이동

- URL 파라미터 활용: `product-detail.html?id=1`
- **상세 페이지 로직**
   - `URLSearchParams`로 id 추출
   - 전체 상품 데이터 fetch 후 `Array.find()`로 해당 상품 객체 선택
   - 상세 정보(이미지, 이름, 가격, 설명 등) 동적 렌더링

### 3. LocalStorage 기반 장바구니 관리

- **데이터 구조**: id와 수량만 배열로 저장

```javascript
// LocalStorage 예시
[
   { id: 1, quantity: 2 },
   { id: 3, quantity: 1 },
];
```

- **핵심 로직**
   - '장바구니 담기' 클릭 → LocalStorage 업데이트
   - 장바구니 페이지 → LocalStorage 기반 상품 정보 재조회 후 렌더링
   - (추가) 헤더 장바구니 아이콘에 총 수량 뱃지 표시

## 📄 페이지별 상세 설계 및 기능

## 🔥 핵심 기능

1. 데이터 중심 동적 렌더링
   - fetchProducts()로 JSON 데이터 불러오기 → 모든 페이지에서 동적 생성
   - 메인 페이지, 상품 리스트, 상세 페이지, 모달, 장바구니 모두 동일 데이터 소스 활용
   - UI와 데이터 분리 → 유지보수, 테스트, 기능 확장 용이
2. 바닐라 JS 기반 동적 페이지 이동
   - URL 파라미터 활용: product-detail.html?id=1
   - URLSearchParams → 해당 상품 객체 선택 → 동적 렌더링
   - 모달과 상세 페이지 모두 동일 로직 재사용
3. LocalStorage 기반 장바구니
   - theSelectCartItems에 상품 id, 사이즈, 수량 저장
   - 장바구니 페이지 → LocalStorage 기반 재조회 후 렌더링
   - 헤더 장바구니 뱃지 실시간 업데이트

## 📄 페이지별 상세 기능

1. 메인 페이지 (index.html)
   - 메인 배너 슬라이드(Swiper.js)
   - MD 추천/신상품 섹션: JSON 기반 동적 렌더링
   - 모바일 햄버거 메뉴 구현, 반응형 레이아웃 최적화
2. 상품 리스트 페이지 (product-list.html)
   - 반응형 상품 카드 갤러리 (CSS Grid, 2~4열)
   - 브랜드/카테고리/사이즈 필터, URL 파라미터 연동
   - 페이지네이션, 필터 + 페이지네이션 상태 유지
   - 상품 카드 클릭 → 모달 상세 보기
   - 데이터 중심 설계: allProducts 배열 기반 필터링, 페이지 전환, 모달 연동
3. 상품 상세 페이지 (product-detail.html)
   - URL id 기반 상품 렌더링
   - 이미지, 이름, 브랜드, 가격, 세일 정보, 설명, 사이즈 선택
   - 수량 선택 (+/-) 및 '장바구니 담기' → LocalStorage 연동
   - 관련 상품 추천 슬라이드 (동일 category)
4. 장바구니 페이지 (cart.html)
   - LocalStorage 기반 상품 목록 렌더링
   - 수량 증가/감소, 삭제 기능 → 이벤트 위임
   - 총 결제 금액 실시간 계산
   - 헤더 장바구니 뱃지 실시간 업데이트
   - 주문하기 버튼 (결제 연동은 alert 처리)

## 🧠 회고 및 배운 점

- 데이터 흐름과 UX 동시 고려 경험: 필터, 페이지네이션, 모달, 장바구니 모두 상태 관리 필요
- 상태 관리 체득: JS 변수(currentPage, selectedBrand)와 URL 파라미터 연동
- 모달 UX: 외부 클릭 닫기, 사이즈 선택 필수 처리, 장바구니 연동
- LocalStorage 활용 경험: 장바구니 상태 유지 및 UI 동기화
- 이벤트 위임 & DOM 조작 실무 경험: 동적 요소 이벤트 안정적 처리
- 비동기 처리: async/await, fetch, 디버깅, 예외 처리 반복 학습
- 실무 감각 체득: 실제 쇼핑몰처럼 UX 디테일 고려

## ⚠ 부족한 점 / 다음 단계

- URL 기반 단일 상품 페이지 초기화 문제, SPA 구조 도입 고려
- 다중 필터, 페이지네이션, 모달 상태 관리 구조 최적화 필요
- 장바구니 직접 입력, 추천 상품 슬라이드 등 UX 개선
- 코드 구조 최적화: 중복 제거, 기능별 모듈화, 재사용 컴포넌트화
- 결제 프로세스 구현: 주문 → 결제 → 재고 처리
- 예외 처리 강화: fetch 실패, 잘못된 id, LocalStorage 파싱 오류 등

## 💻 사용 기술

- HTML, CSS(Flexbox, Grid, CSS 변수)
- JavaScript(ES6+, Fetch API, URLSearchParams, Event Delegation)
- JSON, LocalStorage
- Swiper.js (슬라이드/캐러셀)
