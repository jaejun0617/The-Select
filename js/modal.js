// js/modal.js

// --- 모달 열기 함수 ---
export function openModal() {
   const modal = document.getElementById('productDetailModal');
   if (modal) {
      modal.style.display = 'flex';
   }
}

// --- 모달 닫기 함수 ---
export function closeProductModal() {
   const modal = document.getElementById('productDetailModal');
   if (modal) {
      modal.style.display = 'none';
      const modalContent = document.querySelector('.modal-content');
      if (modalContent) modalContent.innerHTML = '';
   }
}

// --- 모달 외부 클릭 시 닫기 ---
export function setupModalCloseOnClickOutside() {
   const modal = document.getElementById('productDetailModal');
   if (modal) {
      modal.addEventListener('click', event => {
         if (event.target === modal) {
            closeProductModal();
         }
      });
   }
}

// --- 모달 내용 동적 생성 ---
export function renderModalContent(product, formatCurrencyFunc) {
   const modalContent = document.querySelector('.modal-content');
   if (!modalContent) return;

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
               <a href="/The-Select/pages/cart.html">Buy Now</a>
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

         if (window.addProductToCartGlobal) {
            window.addProductToCartGlobal(productToAdd);
         } else {
            console.error('addProductToCartGlobal 함수를 찾을 수 없습니다.');
         }
      });
   }
}

// --- 초기화 함수 ---
export function initializeModal() {
   setupModalCloseOnClickOutside();
}
