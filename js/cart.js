// js/cart.js
import { formatCurrency } from './utils.js';

const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const LOCAL_STORAGE_KEY = 'theSelectCartItems';

// --- Local Storage ---
function getCartItems() {
   const items = localStorage.getItem(LOCAL_STORAGE_KEY);
   if (!items) return [];
   try {
      return JSON.parse(items);
   } catch (e) {
      console.error('Local Storage 파싱 실패', e);
      return [];
   }
}

function saveCartItems(cartItems) {
   localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
}

// --- 화면 갱신 ---
function renderCartItems(cartItems) {
   if (!cartItemsList) return;

   if (cartItems.length === 0) {
      cartItemsList.innerHTML = '<p class="empty-cart-message">장바구니가 비어있습니다.</p>';
      if (cartTotalPrice) cartTotalPrice.textContent = formatCurrency(0);
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
   }

   cartItemsList.innerHTML = cartItems
      .map(item => {
         const price = item.salePrice || item.price;
         const total = price * item.quantity;
         return `
            <div class="cart-item">
                <div class="cart-item-image"><img src="${item.image}" alt="${item.name}"></div>
                <div class="cart-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.brand}</p>
                    ${item.size ? `<p>Size: ${item.size}</p>` : ''}
                </div>
                <div class="quantity-control">
                    <button class="btn-decrease" data-id="${item.id}" data-size="${item.size || ''}">-</button>
                    <input type="number" value="${item.quantity}" min="1" readonly>
                    <button class="btn-increase" data-id="${item.id}" data-size="${item.size || ''}">+</button>
                </div>
                <p class="cart-item-price">${formatCurrency(total)}</p>
                <button class="btn-remove" data-id="${item.id}" data-size="${item.size || ''}">X</button>
            </div>
        `;
      })
      .join('');

   if (checkoutBtn) checkoutBtn.disabled = false;
   updateCartTotal();
}

// --- 총액 계산 ---
function updateCartTotal() {
   const cartItems = getCartItems();
   const total = cartItems.reduce((sum, item) => {
      const price = item.salePrice || item.price;
      return sum + price * item.quantity;
   }, 0);
   if (cartTotalPrice) cartTotalPrice.textContent = formatCurrency(total);
}

// --- 화면 갱신 래퍼 ---
function updateCartDisplay() {
   const cartItems = getCartItems();
   renderCartItems(cartItems);
}

// --- 이벤트 위임 (수량, 삭제) ---
function setupCartEventDelegation() {
   if (!cartItemsList) return;

   cartItemsList.addEventListener('click', e => {
      const target = e.target;
      const cartItem = target.closest('.cart-item');
      if (!cartItem) return;

      const productId = target.dataset.id;
      const productSize = target.dataset.size || '';

      if (target.classList.contains('btn-decrease')) {
         const input = cartItem.querySelector('input[type="number"]');
         let qty = parseInt(input.value);
         if (qty > 1) updateCartItemQuantity(productId, productSize, qty - 1);
         else if (confirm(`'${cartItem.querySelector('h3').textContent}' 삭제하시겠습니까?`))
            removeProductFromCart(productId, productSize);
      }

      if (target.classList.contains('btn-increase')) {
         const input = cartItem.querySelector('input[type="number"]');
         let qty = parseInt(input.value);
         updateCartItemQuantity(productId, productSize, qty + 1);
      }

      if (target.classList.contains('btn-remove')) {
         if (confirm(`'${cartItem.querySelector('h3').textContent}' 삭제하시겠습니까?`))
            removeProductFromCart(productId, productSize);
      }
   });
}

// --- 장바구니 조작 ---
export function addProductToCart(product) {
   const productSize = product.size || ''; 
   const cartItems = getCartItems();

   const index = cartItems.findIndex(item => item.id == product.id && item.size == productSize);

   if (index > -1) cartItems[index].quantity++;
   else cartItems.push({ ...product, quantity: product.quantity || 1, size: productSize });

   saveCartItems(cartItems);
   updateCartDisplay();
   alert('장바구니에 담겼습니다!');
}

function updateCartItemQuantity(id, size, qty) {
   let cartItems = getCartItems();
   if (qty <= 0) cartItems = cartItems.filter(item => !(item.id == id && item.size == size));
   else {
      const index = cartItems.findIndex(item => item.id == id && item.size == size);
      if (index > -1) cartItems[index].quantity = qty;
   }
   saveCartItems(cartItems);
   updateCartDisplay();
}

function removeProductFromCart(id, size) {
   let cartItems = getCartItems();
   cartItems = cartItems.filter(item => !(item.id == id && item.size == size));
   saveCartItems(cartItems);
   updateCartDisplay();
}

// --- 장바구니 초기화 ---
export function clearCart() {
   localStorage.removeItem(LOCAL_STORAGE_KEY);
   updateCartDisplay();
   alert('장바구니가 초기화되었습니다!');
}

// --- 초기화 ---
function initializeCartPage() {
   updateCartDisplay();
   setupCartEventDelegation();

   if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
         const items = getCartItems();
         if (items.length > 0) alert('결제완료!');
         else alert('장바구니가 비어있습니다.');
      });
   }

   // 초기화 버튼 예시
   const clearBtn = document.getElementById('clear-cart-btn');
   if (clearBtn) clearBtn.addEventListener('click', clearCart);
}

// --- DOMContentLoaded ---
document.addEventListener('DOMContentLoaded', initializeCartPage);

// --- 모달 연동용 전역 함수 ---
window.addProductToCartGlobal = addProductToCart;
window.clearCartGlobal = clearCart;
