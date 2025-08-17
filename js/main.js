// js/main.js

/**
 * =================================================================
 * THE SELECT | 메인 페이지 스크립트
 * -----------------------------------------------------------------
 * 이 파일은 메인 페이지(index.html)의 동적인 기능들을 관리합니다.
 * - 상품 데이터 로딩 및 렌더링
 * - '신상품' 및 '트렌드 픽' 섹션의 '더보기/닫기' 기능
 * =================================================================
 */

// --- 1. 외부 모듈 및 라이브러리 가져오기 ---
// 다른 파일에 있는 전문가(함수)들을 섭외합니다.
import { fetchProducts, formatCurrency } from './utils.js';
// GSAP의 스크롤 플러그인을 사용할 준비를 합니다.
gsap.registerPlugin(ScrollToPlugin);

// --- 2. DOM 요소 선택 ---
// 스크립트가 조작할 HTML 요소들을 미리 찾아 변수에 할당합니다.
const newArrivalsContainer = document.querySelector('.new-arrivals-container');
const newArrivalsGrid = document.querySelector('.new-arrivals-grid');
const newArrivalsBtn = document.querySelector('#new-arrivals-btn');

const trendPickContainer = document.querySelector('.trend-pick-container');
const trendPickGrid = document.querySelector('.trend-pick-grid');
const trendPickBtn = document.querySelector('#trend-pick-btn');

// --- 3. 재사용 가능한 범용 함수 ---

/**
 * 상품 데이터를 받아 HTML 카드로 변환하여 화면에 렌더링하는 '만능 렌더링 엔진'
 * @param {Array} products - 렌더링할 상품 객체들의 배열
 * @param {HTMLElement} container - 생성된 HTML 카드가 들어갈 부모 요소
 */
function renderProductCards(products, container) {
   // 방어 코드: 렌더링할 컨테이너나 상품 데이터가 없으면 함수를 즉시 종료합니다.
   if (!container || !products) {
      if (container) container.innerHTML = ''; // 컨테이너가 있다면 안전하게 비워줍니다.
      return;
   }

   // 상품 배열을 순회하며 각 상품을 HTML 문자열 조각으로 변환합니다.
   const productHtml = products
      .map(product => {
         // 할인 상품인지 아닌지에 따라 가격 표시를 다르게 하는 '조건부 렌더링'
         let priceHtml;
         if (product.salePrice) {
            // 할인가가 있다면, 원래 가격에 취소선을 긋고 할인가를 강조합니다.
            priceHtml = `
             <p class="product-price">
                 <del>${formatCurrency(product.price)}</del>
                 <span class="sale-price">${formatCurrency(product.salePrice)}</span>
             </p>`;
         } else {
            // 할인가가 없다면, 원래 가격만 표시합니다.
            priceHtml = `<p class="product-price">${formatCurrency(product.price)}</p>`;
         }

         // 최종적으로 완성된 상품 카드 HTML을 반환합니다.
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
      .join(''); // 모든 HTML 조각들을 하나의 긴 문자열로 합칩니다.

   // 완성된 HTML 문자열을 지정된 컨테이너의 내용으로 한번에 교체합니다.
   container.innerHTML = productHtml;
}

// --- 4. '더보기/닫기' 기능 모듈 ---

/**
 * '더보기/닫기' 기능을 생성하는 팩토리(공장) 함수.
 * 이 함수를 호출하면, 지정된 섹션에 맞는 '더보기' 기능이 완성되어 나옵니다.
 * @param {HTMLElement} sectionContainer - '닫기' 클릭 시 스크롤의 기준이 될 부모 섹션
 * @param {HTMLElement} gridContainer - 상품 카드가 펼쳐지고 접힐 그리드
 * @param {HTMLElement} viewMoreBtn - 기능을 제어할 '더보기' 버튼
 * @param {Array} productList - 렌더링할 전체 상품 목록
 * @param {number} itemsPerRow - 한 줄에 표시되는 상품 개수 (버튼 표시 여부 계산용)
 */
function createNetflixStyleToggle(sectionContainer, gridContainer, viewMoreBtn, productList, itemsPerRow = 4) {
   // 방어 코드: 기능에 필요한 핵심 요소 중 하나라도 없으면 실행하지 않습니다.
   if (!gridContainer || !viewMoreBtn || !sectionContainer) return;

   // '잠금 장치': 애니메이션이 실행 중일 때 추가 클릭을 막기 위한 변수
   let isAnimating = false;

   // 1. 모든 상품을 그리드에 미리 렌더링합니다. (CSS가 일부를 숨김)
   renderProductCards(productList, gridContainer);

   // 2. 상품이 2줄 이하면 '더보기' 버튼이 필요 없으므로 숨깁니다.
   const initialVisibleCount = itemsPerRow * 2;
   if (productList.length <= initialVisibleCount) {
      viewMoreBtn.style.display = 'none';
      return;
   }

   // 3. 버튼을 클릭했을 때 실행될 핵심 토글 함수
   function toggleView() {
      // 애니메이션이 진행 중이면, 사용자가 버튼을 여러 번 눌러도 아무 일도 일어나지 않게 막습니다.
      if (isAnimating) return;

      // 이제 애니메이션을 시작하므로, '잠금' 상태로 변경합니다.
      isAnimating = true;

      // 그리드에 'expanded' 클래스를 추가하거나 제거하여 CSS 애니메이션을 촉발합니다.
      gridContainer.classList.toggle('expanded');

      // 현재 펼쳐진 상태인지 확인합니다.
      const isExpanded = gridContainer.classList.contains('expanded');
      // 상태에 따라 버튼의 텍스트를 변경합니다.
      viewMoreBtn.textContent = isExpanded ? 'Close' : 'View More';

      // 만약 '닫기'를 눌러서 목록이 접힌 상태라면,
      if (!isExpanded) {
         // GSAP을 이용해 페이지를 해당 섹션의 맨 위로 부드럽게 스크롤합니다.
         gsap.to(window, {
            duration: 0.7,
            scrollTo: sectionContainer,
            ease: 'power2.inOut',
         });
      }

      // CSS 애니메이션 시간(0.7s)이 지난 후에 '잠금'을 해제하여 다시 클릭할 수 있게 합니다.
      setTimeout(() => {
         isAnimating = false;
      }, 700);
   }

   // 4. 준비가 끝나면 버튼에 클릭 이벤트를 연결하고 활성화합니다.
   viewMoreBtn.addEventListener('click', toggleView);
   viewMoreBtn.disabled = false;
}

// --- 5. 페이지 전체 초기화 (메인 컨트롤 타워) ---

/**
 * 페이지의 모든 동적 기능들을 시작시키는 메인 함수
 */
async function initializePage() {
   try {
      // 1. 가장 먼저, 서버(JSON 파일)에서 모든 상품 데이터를 가져옵니다.
      const allProducts = await fetchProducts();
      // 데이터를 가져오지 못하면, 이후의 모든 작업을 중단합니다.
      if (!allProducts) {
         console.error('상품 데이터를 불러오는 데 실패하여 페이지 초기화를 중단합니다.');
         return;
      }

      // 2. 'New Arrivals' 섹션을 초기화합니다.
      // 전체 상품 중 'isNew'인 것만 필터링하여 재료로 넘겨줍니다.
      const allNewArrivals = allProducts.filter(product => product.isNew);
      createNetflixStyleToggle(newArrivalsContainer, newArrivalsGrid, newArrivalsBtn, allNewArrivals);

      // 3. 'Trend Pick' 섹션을 초기화합니다.
      // 전체 상품 중 'isTrendPick'인 것만 필터링하여 재료로 넘겨줍니다.
      const trendItems = allProducts.filter(p => p.isTrendPick);
      createNetflixStyleToggle(trendPickContainer, trendPickGrid, trendPickBtn, trendItems);
   } catch (error) {
      console.error('페이지 초기화 과정에서 오류가 발생했습니다:', error);
   }
}

// 브라우저가 HTML 문서를 모두 읽고 준비가 되면, `initializePage` 함수를 호출하여 모든 것을 시작합니다.
document.addEventListener('DOMContentLoaded', initializePage);
