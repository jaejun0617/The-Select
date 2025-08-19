// js/main.js

/**
 * =================================================================
 * THE SELECT | 메인 페이지 스크립트
 * -----------------------------------------------------------------
 * - 상품 데이터 로딩 및 렌더링
 * - 'New Arrivals' 및 'Trend Pick' 섹션의 '더보기/닫기' 기능
 * - 상품 클릭 시 모달 열기 및 상세 정보 표시
 * =================================================================
 */

import { fetchProducts, formatCurrency } from './utils.js';
// utils.js에서 데이터 가져오기(fetchProducts)와 가격 포맷 함수(formatCurrency)를 가져옴

import { openModal, renderModalContent, initializeModal } from './modal.js';
// modal.js에서 모달 관련 기능 import
// openModal: 모달 열기
// renderModalContent: 모달에 상품 정보 렌더링
// initializeModal: 모달 초기화 (닫기 버튼, 배경 클릭 등 이벤트 바인딩)

gsap.registerPlugin(ScrollToPlugin);
// GSAP의 스크롤 애니메이션 플러그인을 등록
// 스크롤 이동 시 부드럽게 애니메이션 처리 가능

// --- 2. DOM 요소 선택 ---
// HTML에서 조작할 주요 컨테이너와 버튼들을 변수에 담아 재사용
const newArrivalsContainer = document.querySelector('.new-arrivals-container');
const newArrivalsGrid = document.querySelector('.new-arrivals-grid');
const newArrivalsBtn = document.querySelector('#new-arrivals-btn');

const trendPickContainer = document.querySelector('.trend-pick-container');
const trendPickGrid = document.querySelector('.trend-pick-grid');
const trendPickBtn = document.querySelector('#trend-pick-btn');

const productGrid = document.querySelector('.product-list-grid');
// 공통적으로 사용되는 상품 그리드 (상품 클릭 이벤트 위임용)

// --- 3. 재사용 가능한 범용 함수 ---
// 상품 데이터를 받아 HTML 카드로 렌더링하는 범용 함수
function renderProductCards(products, container) {
   if (!container || !products) {
      if (container) container.innerHTML = ''; // 안전하게 비우기
      return;
   }

   // 각 상품을 HTML 카드로 변환
   const productHtml = products
      .map(product => {
         // 할인 여부에 따라 가격 렌더링
         let priceHtml = product.salePrice
            ? `
             <p class="product-price">
                 <del>${formatCurrency(product.price)}</del>
                 <span class="sale-price">${formatCurrency(product.salePrice)}</span>
             </p>`
            : `<p class="product-price">${formatCurrency(product.price)}</p>`;

         // 최종 HTML 구조 반환
         return `
          <div class="product-card">
            <a href="/product-detail.html?id=${product.id}">
                  <div class="product-image">
                      <img src="${product.image}" alt="${product.name}" loading="lazy">
                  </div>
                  <div class="product-info">
                      <span class="product-brand">${product.brand}</span>
                      <h3 class="product-name">${product.name}</h3>
                      ${priceHtml}
                  </div>
              </a>
          </div>`;
      })
      .join(''); // 모든 카드들을 하나의 문자열로 합침

   container.innerHTML = productHtml; // DOM에 삽입
}

// --- 4. '더보기/닫기' 기능 ---
// 넷플릭스 스타일 토글(펼치기/닫기) 기능 구현
function createNetflixStyleToggle(sectionContainer, gridContainer, viewMoreBtn, productList, itemsPerRow = 4) {
   if (!gridContainer || !viewMoreBtn || !sectionContainer) return; // 필수 요소 체크

   let isAnimating = false; // 연속 클릭 방지용 플래그
   renderProductCards(productList, gridContainer); // 처음에 전체 상품 렌더링

   const initialVisibleCount = itemsPerRow * 2; // 초기 2줄만 보여줌
   if (productList.length <= initialVisibleCount) {
      viewMoreBtn.style.display = 'none'; // 2줄 이하라면 버튼 숨김
      return;
   }

   function toggleView() {
      if (isAnimating) return; // 애니메이션 중이면 클릭 무시
      isAnimating = true;

      gridContainer.classList.toggle('expanded'); // CSS로 펼치기/접기
      const isExpanded = gridContainer.classList.contains('expanded');
      viewMoreBtn.textContent = isExpanded ? 'Close' : 'View More'; // 버튼 텍스트 변경

      if (!isExpanded) {
         // 닫을 때 섹션 상단으로 스크롤
         gsap.to(window, {
            duration: 0.7,
            scrollTo: sectionContainer,
            ease: 'power2.inOut',
         });
      }

      setTimeout(() => {
         isAnimating = false; // 애니메이션 종료 후 다시 클릭 가능
      }, 700);
   }

   viewMoreBtn.addEventListener('click', toggleView);
   viewMoreBtn.disabled = false; // 버튼 활성화
}

// --- 5. 공통 모달 이벤트 위임 함수 ---
// 각 상품 카드 클릭 시 모달 열기 기능을 이벤트 위임으로 처리
function attachProductClickHandler(container, allProducts) {
   if (!container) return;

   container.addEventListener('click', async event => {
      const productCardLink = event.target.closest('.product-card a');
      // 클릭 대상이 카드 내부 링크인지 확인
      if (!productCardLink) return;

      event.preventDefault(); // 기본 링크 이동 막기

      const productId = productCardLink.getAttribute('href').split('?id=')[1];
      // URL에서 상품 ID 추출

      try {
         const product = allProducts.find(p => p.id === parseInt(productId));
         // 전체 상품 배열에서 ID로 상품 검색
         if (product) {
            renderModalContent(product, formatCurrency); // 모달에 상품 정보 렌더링
            openModal(); // 모달 열기
         } else {
            console.error('상품을 찾을 수 없습니다:', productId);
         }
      } catch (error) {
         console.error('상품 상세 정보를 가져오는 중 오류 발생:', error);
      }
   });
}

// --- 6. 페이지 초기화 ---
// 페이지 로딩 시 실행되는 메인 컨트롤 함수
async function initializePage() {
   try {
      const allProducts = await fetchProducts(); // 서버에서 상품 데이터 가져오기
      if (!allProducts) {
         console.error('상품 데이터를 불러오는 데 실패했습니다.');
         return;
      }

      // New Arrivals 섹션 초기화
      const allNewArrivals = allProducts.filter(product => product.isNew);
      createNetflixStyleToggle(newArrivalsContainer, newArrivalsGrid, newArrivalsBtn, allNewArrivals);

      // Trend Pick 섹션 초기화
      const trendItems = allProducts.filter(p => p.isTrendPick);
      createNetflixStyleToggle(trendPickContainer, trendPickGrid, trendPickBtn, trendItems);

      // 공통 모달 이벤트 연결
      attachProductClickHandler(productGrid, allProducts);
      attachProductClickHandler(newArrivalsGrid, allProducts);
      attachProductClickHandler(trendPickGrid, allProducts);
   } catch (error) {
      console.error('페이지 초기화 오류:', error);
   }
}

// DOMContentLoaded 이벤트: HTML 로딩 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
   initializePage(); // 페이지 동적 기능 초기화
   initializeModal(); // 모달 초기화
});
