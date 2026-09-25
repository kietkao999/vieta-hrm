/**
 * Chuyển đổi số tiền thành chữ Tiếng Việt chuẩn xác trên Frontend
 * Ví dụ: 15500000 -> "Mười lăm triệu năm trăm nghìn đồng chẵn"
 */

const DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
const UNITS = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

function readThreeDigits(number, readFull = false) {
  let hundreds = Math.floor(number / 100);
  let tens = Math.floor((number % 100) / 10);
  let units = number % 10;
  let result = '';

  if (hundreds > 0 || readFull) {
    result += `${DIGITS[hundreds]} trăm `;
  }

  if (tens > 1) {
    result += `${DIGITS[tens]} mươi `;
    if (units === 1) {
      result += 'mốt ';
    } else if (units === 5) {
      result += 'lăm ';
    } else if (units === 4) {
      result += 'tư ';
    } else if (units > 0) {
      result += `${DIGITS[units]} `;
    }
  } else if (tens === 1) {
    result += 'mười ';
    if (units === 1) {
      result += 'một ';
    } else if (units === 5) {
      result += 'lăm ';
    } else if (units > 0) {
      result += `${DIGITS[units]} `;
    }
  } else {
    if (units > 0) {
      if (hundreds > 0 || readFull) {
        result += `lẻ ${DIGITS[units]} `;
      } else {
        result += `${DIGITS[units]} `;
      }
    }
  }

  return result.trim();
}

export function numberToVietnameseWords(amount) {
  if (amount === undefined || amount === null || amount === '' || isNaN(amount)) {
    return '';
  }

  let num = Math.round(Math.abs(Number(amount)));
  if (num === 0) {
    return 'Không đồng';
  }

  let groups = [];
  while (num > 0) {
    groups.push(num % 1000);
    num = Math.floor(num / 1000);
  }

  let words = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    let groupVal = groups[i];
    if (groupVal > 0) {
      let readFull = i < groups.length - 1;
      let groupWord = readThreeDigits(groupVal, readFull);
      let unit = UNITS[i] || '';
      words.push(`${groupWord} ${unit}`.trim());
    }
  }

  let finalStr = words.join(' ').replace(/\s+/g, ' ').trim();
  if (finalStr.length > 0) {
    finalStr = finalStr.charAt(0).toUpperCase() + finalStr.slice(1) + ' đồng chẵn';
  }

  return finalStr;
}

export default numberToVietnameseWords;
