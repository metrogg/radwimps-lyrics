/* ============================================================
 *  tools/verify.js — 站点自检
 *  ------------------------------------------------------------
 *  用 jsdom 真的把 index.html 跑一遍（加载 data/ 与 songs/ 里的脚本），
 *  检查四个路由都能渲染、没有未捕获错误、关键结构都在。
 *
 *  用法：
 *    npm install jsdom          # 只需一次（装在哪里都行）
 *    node tools/verify.js
 *
 *  每写完一首新歌都可以跑一次，替代"手动刷新看看有没有崩"。
 * ============================================================ */

const fs = require('fs');
const path = require('path');

let JSDOM;
try {
  ({ JSDOM } = require('jsdom'));
} catch (e) {
  console.error('缺少 jsdom，请先运行：npm install jsdom');
  process.exit(2);
}

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const cases = [
  { name: '首页', hash: '', check: (d) => ({
      '专辑墙': d.querySelectorAll('.album-wall .album-tile').length,
      '歌曲卡': d.querySelectorAll('.cards .card').length,
      '封面(生成式)': d.querySelectorAll('.cover:not(.photo)').length
    }) },
  { name: '歌曲页 遠恋', hash: '#/song/enren', check: (d) => ({
      '舞台': d.querySelectorAll('.stage').length,
      '大封面': d.querySelectorAll('.stage .cover.l').length,
      '导读卡': d.querySelectorAll('.note-card').length,
      '逐句块': d.querySelectorAll('.line').length,
      '假名标注': d.querySelectorAll('.jp ruby rt').length,
      '批注卡': d.querySelectorAll('.an').length,
      '上下首导航': d.querySelectorAll('.songnav .nav').length
    }) },
  { name: '专辑页 RADWIMPS 4', hash: '#/album/radwimps4', check: (d) => ({
      '舞台': d.querySelectorAll('.stage').length,
      '曲目行': d.querySelectorAll('.track-row').length,
      '已解读标记': d.querySelectorAll('.badge').length
    }) },
  { name: '搜索「距離」', hash: '#/search?q=' + encodeURIComponent('距離'), check: (d) => ({
      '结果条': d.querySelectorAll('.result').length,
      '高亮': d.querySelectorAll('.result mark').length
    }) },
  { name: '歌曲页 ワールドエンドガールフレンド', hash: '#/song/worldendgirlfriend', check: (d) => ({
      '舞台': d.querySelectorAll('.stage').length,
      '逐句块': d.querySelectorAll('.line').length,
      '语言点': d.querySelectorAll('.point').length,
      '整体解读': d.querySelectorAll('.essay').length
    }) },
  { name: '歌曲页 25コ目の染色体', hash: '#/song/nijuugoko', check: (d) => ({
      '舞台': d.querySelectorAll('.stage').length,
      '逐句块': d.querySelectorAll('.line').length,
      '假名标注': d.querySelectorAll('.jp ruby rt').length,
      '批注卡': d.querySelectorAll('.an').length,
      '语言点': d.querySelectorAll('.point').length,
      '整体解读': d.querySelectorAll('.essay').length
    }) }
];

const run = (c) =>
  new Promise((resolve) => {
    const errors = [];
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true,
      url: 'file:///' + root.replace(/\\/g, '/') + '/index.html' + c.hash,
      beforeParse(win) {
        win.addEventListener('error', (e) => errors.push(String(e.error || e.message)));
        win.addEventListener('unhandledrejection', (e) => errors.push('unhandled: ' + e.reason));
      }
    });

    dom.window.addEventListener('load', () => {
      setTimeout(() => {
        let stats = {};
        try {
          stats = c.check(dom.window.document);
        } catch (e) {
          errors.push('检查失败: ' + e.message);
        }
        const title = dom.window.document.title;
        dom.window.close();
        resolve({ case: c.name, errors, stats, title });
      }, 300);
    });
  });

(async () => {
  const results = [];
  for (const c of cases) results.push(await run(c));

  const lines = [];
  let bad = 0;
  for (const r of results) {
    const empty = Object.values(r.stats).every((v) => v === 0);
    const ok = r.errors.length === 0 && !empty;
    if (!ok) bad++;
    lines.push(`${ok ? 'OK  ' : 'FAIL'}  ${r.case}   —   ${r.title}`);
    lines.push('      ' + Object.entries(r.stats).map(([k, v]) => `${k} ${v}`).join(' / '));
    r.errors.forEach((e) => lines.push('      错误: ' + e));
  }
  lines.push('');
  lines.push(bad === 0 ? `全部 ${results.length} 项通过` : `${bad} 项有问题`);
  const report = lines.join('\n');
  console.log(report);
  /* 同时写一份 UTF-8 报告，避免控制台编码把中文变成乱码 */
  fs.writeFileSync(path.join(root, 'verify-report.txt'), report + '\n', 'utf8');
  process.exit(bad === 0 ? 0 : 1);
})();
