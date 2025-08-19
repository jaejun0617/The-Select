// js/main.js

import { fetchProducts, formatCurrency } from '/The-Select/js/utils.js';
import { openModal, renderModalContent, initializeModal } from '/The-Select/js/modal.js';

gsap.registerPlugin(ScrollToPlugin);

const newArrivalsContainer = document.querySelector('.new-arrivals-container');
const newArrivalsGrid = document.querySelector('.new-arrivals-grid');
const newArrivalsBtn = document.querySelector('#new-arrivals-btn');

const trendPickContainer = document.querySelector('.trend-pick-container');
const trendPickGrid = document.querySelector('.trend-pick-grid');
const trendPickBtn = document.querySelector('#trend-pick-btn');

const productGrid = document.querySelector('.product-list-grid');

function renderProductCards(products, container) {
   if (!container || !products) {
      if (container) container.innerHTML = '';
      return;
   }

   const productHtml = products
      .map(product => {
         let priceHtml = product.salePrice
            ? `<p class="product-price"><del>${formatCurrency(product.price)}</del> <span class="sale-price">${formatCurrency(product.salePrice)}</span></p>`
            : `<p class="product-price">${formatCurrency(product.price)}</p>`;

         return `
          <div class="product-card">
            <a href="/The-Select/pages/product-detail.html?id=${product.id}">
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
      .join('');

   container.innerHTML = productHtml;
}

function createNetflixStyleToggle(sectionContainer, gridContainer, viewMoreBtn, productList, itemsPerRow = 4) {
   if (!gridContainer || !viewMoreBtn || !sectionContainer) return;

   let isAnimating = false;
   renderProductCards(productList, gridContainer);

   const initialVisibleCount = itemsPerRow * 2;
   if (productList.length <= initialVisibleCount) {
      viewMoreBtn.style.display = 'none';
      return;
   }

   function toggleView() {
      if (isAnimating) return;
      isAnimating = true;

      gridContainer.classList.toggle('expanded');
      const isExpanded = gridContainer.classList.contains('expanded');
      viewMoreBtn.textContent = isExpanded ? 'Close' : 'View More';

      if (!isExpanded) {
         gsap.to(window, {
            duration: 0.7,
            scrollTo: sectionContainer,
            ease: 'power2.inOut',
         });
      }

      setTimeout(() => {
         isAnimating = false;
      }, 700);
   }

   viewMoreBtn.addEventListener('click', toggleView);
   viewMoreBtn.disabled = false;
}

function attachProductClickHandler(container, allProducts) {
   if (!container) return;

   container.addEventListener('click', async event => {
      const productCardLink = event.target.closest('.product-card a');
      if (!productCardLink) return;

      event.preventDefault();

      const productId = productCardLink.getAttribute('href').split('?id=')[1];

      try {
         const product = allProducts.find(p => p.id === parseInt(productId));
         if (product) {
            renderModalContent(product, formatCurrency);
            openModal();
         } else {
            console.error('상품을 찾을 수 없습니다:', productId);
         }
      } catch (error) {
         console.error('상품 상세 정보를 가져오는 중 오류 발생:', error);
      }
   });
}

async function initializePage() {
   try {
      const allProducts = await fetchProducts('/The-Select/data/products.json');
      if (!allProducts) {
         console.error('상품 데이터를 불러오는 데 실패했습니다.');
         return;
      }

      const allNewArrivals = allProducts.filter(product => product.isNew);
      createNetflixStyleToggle(newArrivalsContainer, newArrivalsGrid, newArrivalsBtn, allNewArrivals);

      const trendItems = allProducts.filter(p => p.isTrendPick);
      createNetflixStyleToggle(trendPickContainer, trendPickGrid, trendPickBtn, trendItems);

      attachProductClickHandler(productGrid, allProducts);
      attachProductClickHandler(newArrivalsGrid, allProducts);
      attachProductClickHandler(trendPickGrid, allProducts);
   } catch (error) {
      console.error('페이지 초기화 오류:', error);
   }
}

document.addEventListener('DOMContentLoaded', () => {
   initializePage();
   initializeModal();
});
