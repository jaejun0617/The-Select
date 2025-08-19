// js/utils.js

/**
 * 서버에서 상품 데이터를 가져오는 범용 함수
 */
export async function fetchProducts() {
   try {
      const response = await fetch('/The-Select/data/products.json'); // 절대경로
      if (!response.ok) {
         throw new Error('네트워크 응답에 문제가 있습니다.');
      }
      const products = await response.json();
      return products;
   } catch (error) {
      console.error('상품 데이터를 불러오는 중 오류 발생:', error);
      return null;
   }
}

/**
 * 숫자를 통화 형식으로 변환하는 범용 함수
 * @param {number} price - 변환할 가격
 * @returns {string} - 포맷팅된 문자열 (예: "29,000원")
 */
export function formatCurrency(price) {
   return price.toLocaleString('ko-KR') + '원';
}
