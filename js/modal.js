// js/modal.js

// --- 모달 관련 DOM 요소 ---
// DOM 요소는 DOMContentLoaded 이후에 접근해야 안전하므로,
// 이 함수들은 DOMContentLoaded 이벤트 핸들러 내에서 호출될 때 DOM 요소가 존재한다고 가정합니다.
// 따라서 여기서 직접 선택해도 문제 없지만, 안전을 위해 함수 호출 시 확인하는 것이 좋습니다.

// --- 모달 열기 함수 ---
export function openModal() {
   const modal = document.getElementById('productDetailModal'); // 모달 요소를 함수 내에서 선택
   if (modal) {
      modal.style.display = 'flex';
   }
}

// --- 모달 닫기 함수 ---
export function closeProductModal() {
   const modal = document.getElementById('productDetailModal'); // 모달 요소를 함수 내에서 선택
   if (modal) {
      modal.style.display = 'none';
      // 모달을 닫을 때 내용을 비우거나 초기화하는 로직
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) modalContent.innerHTML = '';
   }
}

// --- 모달 외부 클릭 시 닫히도록 설정 ---
export function setupModalCloseOnClickOutside() {
   const modal = document.getElementById('productDetailModal'); // 모달 요소를 함수 내에서 선택
   if (modal) {
      modal.addEventListener('click', event => {
         // 클릭된 요소가 모달 배경 자체인 경우에만 닫기
         if (event.target === modal) {
            closeProductModal();
         }
      });
   }
}

// --- 모달 내용을 동적으로 생성하는 함수 ---
export function renderModalContent(product, formatCurrencyFunc) {
   const modalContent = document.querySelector('.modal-content');
   if (!modalContent) {
      console.error('renderModalContent: modalContent 요소를 찾을 수 없습니다.');
      return;
   }
   if (!product) {
      console.error('renderModalContent: product 정보가 없습니다.');
      return;
   }

   let priceHtml = `<p class="product-price">${formatCurrencyFunc(product.price)}</p>`;
   if (product.salePrice) {
      priceHtml = `<p class="product-price"><del>${formatCurrencyFunc(product.price)}</del> <span class="sale-price">${formatCurrencyFunc(product.salePrice)}</span></p>`;
   }

   let sizeOptionsHtml = '';
   let sizeSelectorHtml = '';

   if (product.category === 'Clothing' && Array.isArray(product.size) && product.size.length > 0) {
      const sizeItems = product.size.map(s => `<option value="${s}">${s}</option>`).join('');
      sizeOptionsHtml = sizeItems;
      sizeSelectorHtml = `
         <div class="size-selection">
            <label for="size">Size:</label>
            <select id="size" name="size">
               <option value="">Select Size</option>
               ${sizeOptionsHtml}
            </select>
         </div>
      `;
   } else if (product.category === 'Shoes') {
      const sizes = typeof product.size === 'number' ? [product.size] : Array.isArray(product.size) ? product.size : [];
      if (sizes.length > 0) {
         const sizeItems = sizes.map(s => `<option value="${s}">${s}</option>`).join('');
         sizeOptionsHtml = sizeItems;
         sizeSelectorHtml = `
            <div class="size-selection">
               <label for="size">Size:</label>
               <select id="size" name="size">
                  <option value="">Select Size</option>
                  ${sizeOptionsHtml}
               </select>
            </div>
         `;
      }
   }

   modalContent.innerHTML = `
      <span id="closeModal" class="close-modal">&times;</span>
      <div class="modal-product-image">
         <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="modal-product-details">
         <span class="product-brand">${product.brand}</span>
         <h3 class="product-name">${product.name}</h3>
         ${priceHtml}
         <p class="product-description">${product.description}</p>
         
         ${sizeSelectorHtml}
         
         <div class="modal-actions">
            <button class="btn-buy">
               <a href="../pages/cart.html">Buy Now</a>
            </button>
            <button class="btn-add-to-cart" data-id="${product.id}">
               장바구니 담기
            </button>
         </div>
      </div>
   `;

   const closeModalBtn = document.getElementById('closeModal');
   if (closeModalBtn) {
      closeModalBtn.addEventListener('click', closeProductModal);
   }

   // --- '장바구니 담기' 버튼 클릭 이벤트 핸들러 추가 ---
   const addToCartBtn = modalContent.querySelector('.btn-add-to-cart');
   if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
         const selectedSizeElement = modalContent.querySelector('#size');
         const selectedSize = selectedSizeElement ? selectedSizeElement.value : '';

         if ((product.category === 'Clothing' || product.category === 'Shoes') && !selectedSize) {
            alert('사이즈를 선택해주세요.');
            return;
         }

         const productToAdd = {
            ...product,
            size: selectedSize || product.size,
         };

         // cart.js의 addProductToCart 함수를 전역으로 노출된 함수를 통해 호출
         if (window.addProductToCartGlobal) {
            window.addProductToCartGlobal(productToAdd);
         } else {
            console.error(
               'addProductToCartGlobal 함수를 찾을 수 없습니다. cart.js가 올바르게 로드되었는지 확인하세요.',
            );
         }
      });
   }
}

// --- 공통 상품 카드 클릭 이벤트 연결 ---
export function setupProductCardClickEvents(products, formatCurrencyFunc) {
}

// --- 초기화 함수 ---
export function initializeModal() {
   setupModalCloseOnClickOutside();
}
