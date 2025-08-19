// product-list.js

// utils.js 파일에서 fetchProducts와 formatCurrency 함수를 가져옵니다.
import { fetchProducts, formatCurrency } from './utils.js';
// modal.js 파일에서 필요한 모달 관련 함수들을 가져옵니다.
import { openModal, renderModalContent, initializeModal } from './modal.js';

document.addEventListener('DOMContentLoaded', function () {
   // --- 1. STATE MANAGEMENT ---
   let allProducts = [];
   let currentScrollY = 0;

   let currentPage = 1;
   const productsPerPage = 12;
   let totalPages = 0;

   // --- 2. ELEMENT SELECTORS ---
   const productGrid = document.querySelector('.product-list-grid');
   const filterLists = document.querySelectorAll('.brand-list, .category-list, .size-list');
   const filterToggles = document.querySelectorAll('.js-filter-toggle');
   const headerNavLinks = document.querySelectorAll('header nav ul li a');
   const paginationContainer = document.querySelector('.pagination-container');

   // --- 3. EVENT LISTENERS ---
   filterToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
         const target = toggle.nextElementSibling;
         toggle.classList.toggle('is-active');
         target.classList.toggle('is-active');
      });
   });

   filterLists.forEach(list => {
      list.addEventListener('click', event => {
         if (event.target.tagName !== 'A') return;
         event.preventDefault();

         currentScrollY = window.scrollY;

         const clickedListItem = event.target.parentElement;
         const currentList = clickedListItem.parentElement;
         currentList.querySelectorAll('li').forEach(item => item.classList.remove('active'));
         clickedListItem.classList.add('active');

         currentPage = 1;
         updateProducts();
      });
   });

   headerNavLinks.forEach(link => {
      if (link.getAttribute('href') === '#') {
         link.addEventListener('click', event => event.preventDefault());
      } else if (link.getAttribute('href')?.startsWith('product-list.html')) {
         link.addEventListener('click', event => {
            event.preventDefault();
            currentScrollY = window.scrollY;

            const urlParams = new URLSearchParams(link.getAttribute('href').split('?')[1]);
            const categoryFromLink = urlParams.get('category') || 'all';
            const brandFromLink = urlParams.get('brand') || 'all';
            const sizeFromLink = urlParams.get('size') || 'all';

            // 좌측 필터 메뉴 업데이트
            document.querySelectorAll('.category-list li a').forEach(catLink => {
               if (catLink.dataset.category === categoryFromLink) {
                  catLink.closest('ul').querySelectorAll('li').forEach(li => li.classList.remove('active'));
                  catLink.parentElement.classList.add('active');
               }
            });
            document.querySelectorAll('.brand-list li a').forEach(brandLink => {
               if (brandLink.dataset.brand === brandFromLink) {
                  brandLink.closest('ul').querySelectorAll('li').forEach(li => li.classList.remove('active'));
                  brandLink.parentElement.classList.add('active');
               }
            });
            document.querySelectorAll('.size-list li a').forEach(sizeLink => {
               if (sizeLink.dataset.size === sizeFromLink) {
                  sizeLink.closest('ul').querySelectorAll('li').forEach(li => li.classList.remove('active'));
                  sizeLink.parentElement.classList.add('active');
               }
            });

            currentPage = 1;
            updateProducts();

            setTimeout(() => window.scrollTo(0, currentScrollY), 0);
         });
      }
   });

   // --- 4. CORE LOGIC ---
   function updateProducts() {
      const selectedBrand = document.querySelector('.brand-list li.active a')?.dataset.brand || 'all';
      const selectedCategory = document.querySelector('.category-list li.active a')?.dataset.category || 'all';
      const selectedSize = document.querySelector('.size-list li.active a')?.dataset.size || 'all';

      let filteredProducts = [...allProducts];

      if (selectedBrand !== 'all') {
         filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase().replace(/ /g, '-') === selectedBrand);
      }
      if (selectedCategory !== 'all') {
         filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      if (selectedSize !== 'all') {
         filteredProducts = filteredProducts.filter(product => {
            if (product.category === 'Shoes') {
               if (typeof product.size === 'number') return product.size === parseInt(selectedSize);
               if (Array.isArray(product.size)) return product.size.includes(parseInt(selectedSize));
            } else if (product.category === 'Clothing') {
               if (Array.isArray(product.size)) return product.size.includes(selectedSize);
            }
            return true;
         });
      }

      totalPages = Math.ceil(filteredProducts.length / productsPerPage);
      const startIndex = (currentPage - 1) * productsPerPage;
      const endIndex = startIndex + productsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      renderProductCards(paginatedProducts, productGrid);
      renderPagination(filteredProducts.length);
   }

   function renderProductCards(products, container) {
      if (!container) return;
      if (!products || products.length === 0) {
         container.innerHTML = '<p class="no-results">해당 상품은 준비중 입니다.</p>';
         return;
      }

      const productHtml = products.map(product => {
         let priceHtml = `<p class="product-price">${formatCurrency(product.price)}</p>`;
         if (product.salePrice) {
            priceHtml = `<p class="product-price"><del>${formatCurrency(product.price)}</del> <span class="sale-price">${formatCurrency(product.salePrice)}</span></p>`;
         }

         let sizeDisplay = '';
         if (product.category === 'Clothing' && Array.isArray(product.size)) {
            const sizeItems = product.size.map(s => `<li>${s}</li>`).join('');
            sizeDisplay = `<div class="product-sizes"><h4>Sizes:</h4><ul>${sizeItems}</ul></div>`;
         } else if (product.category === 'Shoes') {
            const sizes = typeof product.size === 'number' ? [product.size] : Array.isArray(product.size) ? product.size : [];
            if (sizes.length > 0) {
               const sizeItems = sizes.map(s => `<li>${s}</li>`).join('');
               sizeDisplay = `<div class="product-sizes"><h4>Size:</h4><ul>${sizeItems}</ul></div>`;
            }
         }

         return `
            <div class="product-card">
               <a href="./product-detail.html?id=${product.id}">
                  <div class="product-image"><img src="${product.image}" alt="${product.name}"></div>
                  <div class="product-info">
                     <span class="product-brand">${product.brand}</span>
                     <h4 class="product-name">${product.name}</h4>
                     ${priceHtml}
                     ${sizeDisplay}
                  </div>
               </a>
            </div>`;
      }).join('');

      container.innerHTML = productHtml;
   }

   function renderPagination(totalItems) {
      if (!paginationContainer) return;

      totalPages = Math.ceil(totalItems / productsPerPage);
      let paginationHtml = `<button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''}>&laquo; Prev</button>`;

      for (let i = 1; i <= totalPages; i++) {
         paginationHtml += `<button class="pagination-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>`;
      }

      paginationHtml += `<button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''}>Next &raquo;</button>`;

      paginationContainer.innerHTML = paginationHtml;
      addPaginationEventListeners();
   }

   function addPaginationEventListeners() {
      const paginationButtons = paginationContainer.querySelectorAll('.pagination-btn');
      paginationButtons.forEach(button => {
         button.addEventListener('click', () => {
            const pageNum = parseInt(button.dataset.page);

            if (button.classList.contains('prev-btn')) {
               if (currentPage > 1) currentPage--;
            } else if (button.classList.contains('next-btn')) {
               if (currentPage < totalPages) currentPage++;
            } else if (!isNaN(pageNum)) {
               currentPage = pageNum;
            }

            currentScrollY = window.scrollY;
            updateProducts();
            setTimeout(() => window.scrollTo(0, currentScrollY), 0);
         });
      });
   }

   function applyFilterFromURL() {
      const urlParams = new URLSearchParams(window.location.search);
      const categoryFromURL = urlParams.get('category');
      const brandFromURL = urlParams.get('brand');
      const sizeFromURL = urlParams.get('size');

      if (categoryFromURL) {
         document.querySelectorAll('.category-list li a').forEach(link => {
            if (link.dataset.category === categoryFromURL) {
               link.closest('ul').querySelectorAll('li').forEach(li => li.classList.remove('active'));
               link.parentElement.classList.add('active');
            }
         });
      }
      if (brandFromURL) {
         document.querySelectorAll('.brand-list li a').forEach(link => {
            if (link.dataset.brand === brandFromURL) {
               link.closest('ul').querySelectorAll('li').forEach(li => li.classList.remove('active'));
               link.parentElement.classList.add('active');
            }
         });
      }
      if (sizeFromURL) {
         document.querySelectorAll('.size-list li a').forEach(link => {
            if (link.dataset.size === sizeFromURL) {
               link.closest('ul').querySelectorAll('li').forEach(li => li.classList.remove('active'));
               link.parentElement.classList.add('active');
            }
         });
      }
   }

   async function initializeProductListPage() {
      try {
         const products = await fetchProducts();
         if (products) allProducts = products;
         else throw new Error('상품 데이터를 불러오지 못했습니다.');

         applyFilterFromURL();
         updateProducts();
      } catch (error) {
         console.error('페이지 초기화 중 오류 발생:', error);
         if (productGrid) productGrid.innerHTML = '<p class="no-results">상품 정보를 불러오는 데 실패했습니다.</p>';
      }
   }

   // --- 모달 ---
   productGrid.addEventListener('click', async event => {
      const productCardLink = event.target.closest('.product-card a');
      if (!productCardLink) return;

      event.preventDefault();

      const productId = productCardLink.getAttribute('href').split('?id=')[1];
      const product = allProducts.find(p => p.id === parseInt(productId));

      if (product) {
         renderModalContent(product, formatCurrency);
         openModal();
      } else {
         console.error('상품을 찾을 수 없습니다:', productId);
      }
   });

   initializeProductListPage();
   initializeModal();
});
