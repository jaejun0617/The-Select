# 🛒 반응형 쇼핑몰 웹사이트 제작 프로젝트

## 🗓 기간

2025년 8월 14일 ~ 8월 20일

## 📝 최종 목표

- 반응형 멀티페이지 쇼핑몰 제작
- 상품 데이터(JSON) 연동
- 사용자 경험을 극대화하는 인터랙션 구현  
  (스크롤, 애니메이션, 슬라이드, 모바일 햄버거 메뉴 등)

## 🧠 기획 및 설계 방향: 데이터 중심 개발

- **핵심 포인트**: `products.json` 하나의 데이터 소스를 중심으로 모든 페이지가 유기적으로 동작하도록 설계
- 사용자의 클릭 한 번으로 URL이 바뀌고, JS가 데이터를 가공하여 완전히 다른 화면을 동적으로 생성
- 데이터 중심 방식으로 웹사이트를 설계하고 구현하는 경험 체득

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

### 1. 메인 페이지 (`index.html`)

- 역할: 쇼핑몰의 얼굴, 사용자의 흥미 유발
- **기능**
   - 메인 배너 슬라이드 (Swiper.js)
   - MD 추천 / 신상품 섹션: JSON 필터링 후 동적 렌더링
   - 팝업/모달: 이벤트, 공지사항 표시

### 2. 상품 리스트 페이지 (`product-list.html`)

- 역할: 상품 탐색 및 선택
- **기능**
   - 반응형 상품 카드 갤러리 (CSS Grid)
   - 필터링 & 정렬: 카테고리, 가격순, 신상품순
   - 검색 기능: 입력 키워드 기반 상품 필터링

### 3. 상품 상세 페이지 (`product-detail.html`)

- 역할: 구매 결정
- **기능**
   - URL id 기반 상품 상세 정보 출력
   - 수량 선택 (+ / - 버튼)
   - '장바구니 담기' → LocalStorage 업데이트 + Toast 알림
   - 관련 상품 추천 (동일 category) 슬라이드 표시

### 4. 장바구니 페이지 (`cart.html`)

- 역할: 구매 전 최종 확인
- **기능**
   - LocalStorage 기반 상품 목록 동적 렌더링
   - 수량 변경 및 삭제 기능
   - 총 결제 금액 실시간 계산
   - '주문하기' 버튼 (결제 로직 제외)

## 🎯 프로젝트를 통해 얻는 것

- JSON 기반 데이터 중심 웹 개발(Fetch → Manipulate → Render)
- 바닐라 JS 상태 관리 및 LocalStorage 활용 능력
- 완결된 사용자 흐름 설계 (탐색 → 상세 → 장바구니)
- 반복되는 UI 컴포넌트 함수화로 재사용성 향상

## 💻 사용 기술

- HTML, CSS(Flexbox, Grid, CSS 변수)
- JavaScript(ES6+, Fetch API, URLSearchParams)
- JSON, LocalStorage
- Swiper.js (슬라이드/캐러셀)
