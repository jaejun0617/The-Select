// product-list.js

// utils.js 파일에서 fetchProducts와 formatCurrency 함수를 가져옵니다.
import { fetchProducts, formatCurrency } from './utils.js';
// modal.js 파일에서 필요한 모달 관련 함수들을 가져옵니다.
import { openModal, renderModalContent, initializeModal } from './modal.js';

document.addEventListener('DOMContentLoaded', function () {
   // --- 1. STATE MANAGEMENT ---
   // 모든 상품 데이터를 저장할 배열입니다.
   let allProducts = [];
   // 현재 스크롤 위치를 저장할 변수
   let currentScrollY = 0;

   // 페이지네이션 관련 변수
   let currentPage = 1;
   const productsPerPage = 12; // 한 페이지에 표시할 상품 수 (예시)
   let totalPages = 0;

   // --- 2. ELEMENT SELECTORS ---
   // 상품이 표시될 그리드 컨테이너 요소를 선택합니다.
   const productGrid = document.querySelector('.product-list-grid');
   // 브랜드, 카테고리, 사이즈 필터 목록을 모두 선택합니다.
   const filterLists = document.querySelectorAll('.brand-list, .category-list, .size-list');
   // 필터 제목 (클릭하면 하위 목록이 나타나는 요소)을 선택합니다.
   const filterToggles = document.querySelectorAll('.js-filter-toggle');
   // 헤더 메뉴 링크들을 선택합니다.
   const headerNavLinks = document.querySelectorAll('header nav ul li a');
   // 페이지네이션 컨테이너 선택
   const paginationContainer = document.querySelector('.pagination-container');

   // --- 3. EVENT LISTENERS ---
   // 각 필터 제목에 대한 클릭 이벤트 리스너를 추가합니다.
   filterToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
         // 클릭된 제목의 다음 형제 요소 (필터 목록)를 가져옵니다.
         const target = toggle.nextElementSibling;
         // 제목과 목록에 'is-active' 클래스를 토글하여 펼침/접힘 상태를 제어합니다.
         toggle.classList.toggle('is-active');
         target.classList.toggle('is-active');
      });
   });

   // 각 필터 목록 (브랜드, 카테고리, 사이즈)에 대한 클릭 이벤트 리스너를 추가합니다.
   filterLists.forEach(list => {
      list.addEventListener('click', event => {
         // 클릭된 요소가 <a> 태그가 아니면 함수를 종료합니다.
         if (event.target.tagName !== 'A') return;
         // ✅ 중요: 필터 링크 자체의 기본 동작(페이지 이동)을 막습니다.
         event.preventDefault();

         // 현재 스크롤 위치를 저장합니다.
         currentScrollY = window.scrollY;

         // 클릭된 <a> 태그가 속한 <li> 요소를 가져옵니다.
         const clickedListItem = event.target.parentElement;
         // 현재 클릭된 목록 (ul)을 가져옵니다.
         const currentList = clickedListItem.parentElement;
         // 현재 목록의 모든 <li> 에서 'active' 클래스를 제거합니다.
         currentList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
         // 클릭된 <li> 에 'active' 클래스를 추가하여 현재 선택된 항목임을 표시합니다.
         clickedListItem.classList.add('active');
         // 필터 변경 시 첫 페이지로 이동
         currentPage = 1;
         updateProducts();
      });
   });

   // 헤더 메뉴 링크에 대한 클릭 이벤트 리스너 추가
   headerNavLinks.forEach(link => {
      // '#' 링크는 기본 동작(맨 위 스크롤)을 막아줍니다.
      if (link.getAttribute('href') === '#') {
         link.addEventListener('click', event => {
            event.preventDefault(); // 맨 위로 스크롤하는 기본 동작 방지
         });
      }
      // product-list.html 로 이동하는 링크 (카테고리, 브랜드, 사이즈 필터링 링크)
      else if (link.getAttribute('href')?.startsWith('../pages/product-list.html')) {
         link.addEventListener('click', event => {
            // ✅ 중요: 헤더 메뉴 링크 클릭 시 페이지 이동(새로고침)을 막고,
            // 현재 페이지 내에서 필터링 및 스크롤 위치 유지를 처리합니다.
            event.preventDefault();

            // 현재 스크롤 위치를 저장합니다.
            currentScrollY = window.scrollY;

            // 헤더 링크의 href 속성에서 category, brand, size 파라미터 값을 추출합니다.
            const currentHref = link.getAttribute('href');
            const urlParams = new URLSearchParams(currentHref.split('?')[1]); // ? 뒤의 쿼리스트링에서 파라미터 가져오기
            const categoryFromLink = urlParams.get('category') || 'all';
            const brandFromLink = urlParams.get('brand') || 'all';
            const sizeFromLink = urlParams.get('size') || 'all';

            // --- 좌측 필터 메뉴의 'active' 클래스를 업데이트합니다. ---
            // 헤더 메뉴 클릭 시, 해당 카테고리/브랜드/사이즈에 맞는 좌측 필터 항목을 활성화합니다.

            // 카테고리 필터 업데이트
            document.querySelectorAll('.category-list li a').forEach(catLink => {
               if (catLink.dataset.category === categoryFromLink) {
                  // 현재 활성화된 항목에서 active 클래스 제거
                  catLink
                     .closest('ul')
                     .querySelectorAll('li')
                     .forEach(li => li.classList.remove('active'));
                  // 클릭된 항목에 active 클래스 추가
                  catLink.parentElement.classList.add('active');
               }
            });
            // 브랜드 필터 업데이트
            document.querySelectorAll('.brand-list li a').forEach(brandLink => {
               if (brandLink.dataset.brand === brandFromLink) {
                  brandLink
                     .closest('ul')
                     .querySelectorAll('li')
                     .forEach(li => li.classList.remove('active'));
                  brandLink.parentElement.classList.add('active');
               }
            });
            // 사이즈 필터 업데이트
            document.querySelectorAll('.size-list li a').forEach(sizeLink => {
               if (sizeLink.dataset.size === sizeFromLink) {
                  sizeLink
                     .closest('ul')
                     .querySelectorAll('li')
                     .forEach(li => li.classList.remove('active'));
                  sizeLink.parentElement.classList.add('active');
               }
            });
            // --- ---

            // 필터 변경 시 첫 페이지로 이동
            currentPage = 1;
            // 변경된 필터에 따라 상품 목록 업데이트
            updateProducts();

            // 업데이트 후 스크롤 위치 복원 (페이지 이동 없이 현재 위치 유지)
            setTimeout(() => {
               window.scrollTo(0, currentScrollY);
            }, 0);
         });
      }
   });

   // --- 4. CORE LOGIC ---
   // 상품 목록을 필터링하고 화면에 렌더링하는 함수입니다.
   function updateProducts() {
      // 현재 활성화된 브랜드, 카테고리, 사이즈 필터 값을 가져옵니다.
      const selectedBrand = document.querySelector('.brand-list li.active a')?.dataset.brand || 'all';
      const selectedCategory = document.querySelector('.category-list li.active a')?.dataset.category || 'all';
      const selectedSize = document.querySelector('.size-list li.active a')?.dataset.size || 'all';

      // 원본 상품 목록을 복사하여 필터링할 배열을 만듭니다.
      let filteredProducts = [...allProducts];

      // 브랜드 필터 적용
      if (selectedBrand !== 'all') {
         filteredProducts = filteredProducts.filter(product => {
            const formattedBrand = product.brand.toLowerCase().replace(/ /g, '-');
            return formattedBrand === selectedBrand;
         });
      }

      // 카테고리 필터 적용
      if (selectedCategory !== 'all') {
         filteredProducts = filteredProducts.filter(
            product => product.category.toLowerCase() === selectedCategory.toLowerCase(),
         );
      }

      // 사이즈 필터 적용 (의류와 신발에 따라 다르게 처리)
      if (selectedSize !== 'all') {
         filteredProducts = filteredProducts.filter(product => {
            // 신발 사이즈 처리
            if (product.category === 'Shoes') {
               // 신발은 size 속성이 숫자일 수도 있고 배열일 수도 있으므로, 모두 처리
               if (typeof product.size === 'number') {
                  return product.size === parseInt(selectedSize);
               } else if (Array.isArray(product.size)) {
                  // 배열인 경우, 선택된 사이즈가 숫자로 포함되어 있는지 확인
                  return product.size.includes(parseInt(selectedSize));
               }
            }
            // 의류 사이즈 처리
            else if (product.category === 'Clothing') {
               // 의류는 size 속성이 배열일 가능성이 높으므로 includes 사용
               if (Array.isArray(product.size)) {
                  return product.size.includes(selectedSize);
               }
            }
            return true; // 해당 카테고리나 size 속성이 없는 경우, 필터링에서 제외하지 않음
         });
      }

      // 페이지네이션 로직을 적용하여 현재 페이지에 맞는 상품만 보여주기
      totalPages = Math.ceil(filteredProducts.length / productsPerPage);
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      renderProductCards(paginatedProducts, productGrid);
      renderPagination(filteredProducts.length); // 전체 필터링된 상품 수를 기반으로 페이지네이션 렌더링
   }

   // 상품 카드 HTML 생성 및 렌더링
   function renderProductCards(products, container) {
      if (!container) return;
      if (!products || products.length === 0) {
         container.innerHTML = '<p class="no-results">해당 상품은 준비중 입니다.</p>';
         return;
      }
      const productHtml = products
         .map(product => {
            // 가격 표시 부분
            let priceHtml = `<p class="product-price">${formatCurrency(product.price)}</p>`;
            if (product.salePrice) {
               priceHtml = `<p class="product-price"><del>${formatCurrency(product.price)}</del> <span class="sale-price">${formatCurrency(product.salePrice)}</span></p>`;
            }

            // 사이즈 정보를 ul li 형식으로 생성
            let sizeDisplay = '';
            if (product.category === 'Clothing' && Array.isArray(product.size)) {
               const sizeItems = product.size.map(s => `<li>${s}</li>`).join('');
               sizeDisplay = `<div class="product-sizes">
                                 <h4>Sizes:</h4>
                                 <ul>${sizeItems}</ul>
                             </div>`;
            } else if (product.category === 'Shoes') {
               const sizes =
                  typeof product.size === 'number' ? [product.size] : Array.isArray(product.size) ? product.size : [];
               if (sizes.length > 0) {
                  const sizeItems = sizes.map(s => `<li>${s}</li>`).join('');
                  sizeDisplay = `<div class="product-sizes">
                                    <h4>Size:</h4>
                                    <ul>${sizeItems}</ul>
                                </div>`;
               }
            }

            return `
                <div class="product-card">
                    <a href="/product-detail.html?id=${product.id}">
                        <div class="product-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="product-info">
                            <span class="product-brand">${product.brand}</span>
                            <h4 class="product-name">${product.name}</h4>
                            ${priceHtml}
                            ${sizeDisplay}
                        </div>
                    </a>
                </div>`;
         })
         .join('');
      container.innerHTML = productHtml;
   }

   // 페이지네이션 UI 생성 및 렌더링 함수
   function renderPagination(totalItems) {
      if (!paginationContainer) return;

      totalPages = Math.ceil(totalItems / productsPerPage);
      let paginationHtml = '';

      // 이전 버튼 생성
      paginationHtml += `<button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Prev</button>`;

      // 페이지 번호 버튼 생성 (현재 페이지 주변 몇 개만 보여주는 로직 추가 가능)
      for (let i = 1; i <= totalPages; i++) {
         paginationHtml += `<button class="pagination-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }

      // 다음 버튼 생성
      paginationHtml += `<button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>Next &raquo;</button>`;

      paginationContainer.innerHTML = paginationHtml;
      addPaginationEventListeners();
   }

   // 페이지네이션 버튼 클릭 이벤트 핸들러
   function addPaginationEventListeners() {
      const paginationButtons = paginationContainer.querySelectorAll('.pagination-btn');
      paginationButtons.forEach(button => {
         button.addEventListener('click', () => {
            const pageNum = parseInt(button.dataset.page);

            if (button.classList.contains('prev-btn')) {
               if (currentPage > 1) {
                  currentPage--;
               }
            } else if (button.classList.contains('next-btn')) {
               if (currentPage < totalPages) {
                  currentPage++;
               }
            } else if (!isNaN(pageNum)) {
               // 페이지 번호 버튼 클릭 시
               currentPage = pageNum;
            }

            // 페이지 변경 시 현재 스크롤 위치 저장 및 업데이트
            currentScrollY = window.scrollY;
            updateProducts(); // 변경된 페이지 번호로 상품 목록 업데이트

            // 페이지 변경 후 원래 스크롤 위치로 돌아오기
            setTimeout(() => {
               window.scrollTo(0, currentScrollY);
            }, 0);
         });
      });
   }

   // --- 5. PAGE INITIALIZATION ---
   function applyFilterFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromURL = urlParams.get('category');
      const brandFromURL = urlParams.get('brand');
      const sizeFromURL = urlParams.get('size');

      // URL 파라미터에 따라 해당 필터 활성화
      if (categoryFromURL) {
         document.querySelectorAll('.category-list li a').forEach(link => {
            if (link.dataset.category === categoryFromURL) {
               link
                  .closest('ul')
                  .querySelectorAll('li')
                  .forEach(li => li.classList.remove('active'));
               link.parentElement.classList.add('active');
            }
         });
      }
      if (brandFromURL) {
         document.querySelectorAll('.brand-list li a').forEach(link => {
            if (link.dataset.brand === brandFromURL) {
               link
                  .closest('ul')
                  .querySelectorAll('li')
                  .forEach(li => li.classList.remove('active'));
               link.parentElement.classList.add('active');
            }
         });
      }
      if (sizeFromURL) {
         document.querySelectorAll('.size-list li a').forEach(link => {
            if (link.dataset.size === sizeFromURL) {
               link
                  .closest('ul')
                  .querySelectorAll('li')
                  .forEach(li => li.classList.remove('active'));
               link.parentElement.classList.add('active');
            }
         });
      }
   }

   async function initializeProductListPage() {
      try {
         const products = await fetchProducts();
         if (products) {
            allProducts = products;
         } else {
            throw new Error('상품 데이터를 불러오지 못했습니다.');
         }

         applyFilterFromURL(); // URL에서 필터 설정
         updateProducts(); // 초기 상품 목록 렌더링 (페이지네이션 포함)
      } catch (error) {
         console.error('페이지 초기화 중 오류 발생:', error);
         if (productGrid) productGrid.innerHTML = '<p class="no-results">상품 정보를 불러오는 데 실패했습니다.</p>';
      }
   }

   // --- 모달 관련 함수 ---
   // product-list.js 에서도 모달을 열기 위해 openModal, renderModalContent 함수를 사용하므로 import 해와야 합니다.
   // 또한, 모달 관련 이벤트 리스너 (닫기 버튼, 외부 클릭) 설정은 modal.js의 initializeModal 함수에서 처리하도록 위임합니다.

   // 상품 카드 클릭 이벤트 리스너 (모달 열기)
   productGrid.addEventListener('click', async event => {
      const productCardLink = event.target.closest('.product-card a'); // 상품 카드 링크 찾기
      if (!productCardLink) return;

      event.preventDefault(); // 기본 링크 동작 방지

      const productId = productCardLink.getAttribute('href').split('?id=')[1]; // href에서 id 추출

      try {
         const product = allProducts.find(p => p.id === parseInt(productId)); // id는 숫자이므로 parseInt 사용

         if (product) {
            // renderModalContent 함수에 formatCurrency 함수도 전달해야 할 수 있습니다.
            // 이는 formatCurrency가 modal.js 파일 스코프에서 바로 접근 가능하지 않을 경우입니다.
            // 만약 formatCurrency가 전역 함수이거나, modal.js에서 import 가능하다면 그대로 사용 가능합니다.
            renderModalContent(product, formatCurrency); // formatCurrency 함수를 같이 전달 (혹은 다른 방식으로 접근)
            openModal(); // 모달 열기
         } else {
            console.error('상품을 찾을 수 없습니다:', productId);
         }
      } catch (error) {
         console.error('상품 상세 정보를 가져오는 중 오류 발생:', error);
      }
   });

   initializeProductListPage(); // 페이지 로드 시 초기화 함수 호출
   initializeModal(); // 모달 관련 초기화 함수 호출
});
