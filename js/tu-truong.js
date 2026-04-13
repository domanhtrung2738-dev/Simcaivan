/**
 * ============================================================
 *  Sim Cài Vận – Từ Trường Module
 * ============================================================
 */

function analyzePairBase(d1, d2) {
  const n1 = Number(d1);
  const n2 = Number(d2);
  const grid = DU_NIEN_GRID[n1];
  if (!grid) return null;
  const code = grid[n2];
  if (!code) return null;

  const info = TU_TRUONG_INFO[code];
  return {
    pair: `${d1}${d2}`,
    code: code,
    name: info.name,
    type: info.type,
    level: info.level,
    icon: info.icon,
    color: info.color,
    meaning: info.meaning,
    isSpecial: false,
  };
}

function analyzeTuTruong(digits) {
  const results = [];
  const chars = digits.split('');
  
  const nonOps = [];
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== '0' && chars[i] !== '5') {
      nonOps.push(i);
    }
  }

  for (let i = 0; i < nonOps.length - 1; i++) {
    const startIdx = nonOps[i];
    const endIdx = nonOps[i+1];
    const segment = digits.substring(startIdx, endIdx + 1);
    const has0 = segment.includes('0');
    const has5 = segment.includes('5');
    
    const d1 = digits[startIdx];
    const d2 = digits[endIdx];
    
    let pairObj = analyzePairBase(d1, d2); 
    if (pairObj) {
      pairObj.pairStr = segment; 
      pairObj.position = startIdx; 
      
      if (has0 || has5) {
        let modifier = [];
        if (has0) modifier.push('Ẩn');
        if (has5) modifier.push('Hiển');
        pairObj.name = `${pairObj.name} (${modifier.join('/')})`;
        pairObj.meaning = `[${modifier.join('/')}] ${pairObj.meaning}`;
      }
      
      if (pairObj.code && typeof TU_TRUONG_INFO !== 'undefined' && TU_TRUONG_INFO[pairObj.code]) {
         const info = TU_TRUONG_INFO[pairObj.code];
         if (info.pairs) {
           const idx = info.pairs.indexOf(`${d1}${d2}`);
           if (idx >= 0) {
             const bac = Math.floor(idx / 2) + 1;
             if (bac <= 2) pairObj.icon = pairObj.icon + pairObj.icon;
           }
         }
      }
      
      results.push(pairObj);
    }
  }

  if (nonOps.length > 0) {
    const firstIdx = nonOps[0];
    const lastIdx = nonOps[nonOps.length - 1];
    
    if (firstIdx > 0) {
      const segment = digits.substring(0, firstIdx + 1);
      const has0 = segment.includes('0');
      const has5 = segment.includes('5');
      const d = digits[firstIdx];
      const normalQuai = LAC_THU_MAP[d];
      
      let modifier = [];
      if (has0) modifier.push('Ẩn tàng');
      if (has5) modifier.push('Hiển lộ');
      
      results.push({
        pair: d,
        pairStr: segment,
        code: 'prefix_special',
        name: `${normalQuai ? normalQuai.name : d} (${modifier.join('/')})`,
        type: 'neutral',
        icon: '🔄',
        color: '#607d8b',
        meaning: `Số đơn ${d} bị tác động bởi ${digits.substring(0, firstIdx)} làm ${modifier.join('/')}.`,
        isSpecial: true,
        position: -1
      });
    }
    
    if (lastIdx < digits.length - 1) {
      const segment = digits.substring(lastIdx, digits.length);
      const has0 = segment.includes('0');
      const has5 = segment.includes('5');
      const d = digits[lastIdx];
      const normalQuai = LAC_THU_MAP[d];
      
      let modifier = [];
      if (has0) modifier.push('Ẩn tàng');
      if (has5) modifier.push('Hiển lộ');
      
      results.push({
        pair: d,
        pairStr: segment,
        code: 'suffix_special',
        name: `${normalQuai ? normalQuai.name : d} (${modifier.join('/')})`,
        type: 'neutral',
        icon: '🔄',
        color: '#607d8b',
        meaning: `Số đơn ${d} bị tác động bởi ${digits.substring(lastIdx + 1)} làm ${modifier.join('/')}.`,
        isSpecial: true,
        position: digits.length
      });
    }
  }

  results.sort((a, b) => a.position - b.position);
  return results;
}

function summarizeTuTruong(tuTruongList) {
  const summary = {
    totalCat: 0,
    totalHung: 0,
    totalSpecial: 0,
    breakdown: {},
  };

  tuTruongList.forEach(tt => {
    if (tt.isSpecial) {
      summary.totalSpecial++;
    } else if (tt.type === 'cat') {
      summary.totalCat++;
    } else {
      summary.totalHung++;
    }

    const key = tt.name;
    if (!summary.breakdown[key]) {
      summary.breakdown[key] = { count: 0, ...tt };
    }
    summary.breakdown[key].count++;
  });

  return summary;
}
