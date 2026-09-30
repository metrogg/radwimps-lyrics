/* ============================================================
 *  import-from-html.js
 *  把一份"手写好的解读 HTML"转换成本站的歌曲数据文件。
 *
 *  用法：
 *    node tools/import-from-html.js <源HTML路径> <输出歌曲文件> <songId>
 *
 *  例：
 *    node tools/import-from-html.js ../radwimps-enren-analysis.html songs/radwimps4-06-enren.js enren
 *
 *  它假定源 HTML 里有这样的结构（本站第一版单曲页就是这么写的）：
 *    <p class="intro">…</p>
 *    <h2><span class="num">SECTION 01</span>标题</h2>
 *    <p class="sec-note">…</p>
 *    <div class="line male|female|chorus|solo">
 *      <div class="jp">…（可多行）</div>
 *      <div class="ro">…</div>
 *      <div class="zh">…</div>
 *      <div class="an">…</div>
 *    </div>
 *    <div class="point"><h4>..</h4><p>..</p></div>
 *    <div class="essay">…</div>
 *  <ruby>漢<rt>かな</rt></ruby> 会被自动转成简写语法 漢(かな)。
 * ============================================================ */

const fs = require('fs');
const path = require('path');

const srcPath = process.argv[2];
const outPath = process.argv[3];
const songId = process.argv[4] || path.basename(outPath, '.js');

if (!srcPath || !outPath) {
  console.error('用法: node tools/import-from-html.js <源HTML> <输出.js> <songId>');
  process.exit(1);
}

const html = fs.readFileSync(srcPath, 'utf8');

/* ---- 工具：按 class 提取完整 div 块（带嵌套平衡） ---- */
function extractBlocks(source, clsPrefix) {
  const openRe = new RegExp('<div class="' + clsPrefix, 'g');
  const blocks = [];
  let m;
  while ((m = openRe.exec(source))) {
    const start = m.index;
    const tagRe = /<div\b|<\/div>/g;
    tagRe.lastIndex = start;
    let depth = 0, t, end = -1;
    while ((t = tagRe.exec(source))) {
      if (t[0] === '<div') depth++;
      else {
        depth--;
        if (depth === 0) { end = t.index + t[0].length; break; }
      }
    }
    if (end > 0) blocks.push({ index: start, html: source.slice(start, end) });
    openRe.lastIndex = start + 1;
  }
  return blocks;
}

function inner(htmlStr, cls) {
  const re = new RegExp('<div class="' + cls + '"[^>]*>([\\s\\S]*?)</div>');
  const m = htmlStr.match(re);
  return m ? m[1].trim() : '';
}

function innerAll(htmlStr, cls) {
  const re = new RegExp('<div class="' + cls + '"[^>]*>([\\s\\S]*?)</div>', 'g');
  const out = [];
  let m;
  while ((m = re.exec(htmlStr))) out.push(m[1].trim());
  return out;
}

const stripTags = (s) =>
  s.replace(/<span class="num">[\s\S]*?<\/span>/g, '') // 去掉小标题编号
   .replace(/<[^>]+>/g, '')
   .trim();

/* ruby → 简写：漢(かな) */
const rubyToShort = (s) =>
  s.replace(/<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g, '$1($2)');

/* ---- intro ---- */
const introM = html.match(/<p class="intro">([\s\S]*?)<\/p>/);
const lead = introM ? introM[1].replace(/\s+/g, ' ').trim() : '';

/* ---- 标题 ---- */
const titleM = html.match(/<h1>([\s\S]*?)<\/h1>/);
const title = titleM ? stripTags(titleM[1]) : songId;

/* ---- h2 分区 ---- */
const heads = [];
const headRe = /<h2>([\s\S]*?)<\/h2>/g;
let hm;
while ((hm = headRe.exec(html))) {
  heads.push({ index: hm.index, text: stripTags(hm[1]) });
}

/* ---- line blocks ---- */
/* `<div class="line male">` 和 `<div class="line" style="…">` 都会被前缀 'line' 命中，
   再用「包含 class="jp"」过滤掉误匹配。 */
const linesRaw = extractBlocks(html, 'line')
  .filter((b) => b.html.includes('class="jp"'))
  .sort((a, b) => a.index - b.index);

const lines = linesRaw.map((b) => {
  const clsM = b.html.match(/<div class="line\s+([a-z]+)"/);
  const speaker = clsM ? clsM[1] : 'note';
  return {
    index: b.index,
    speaker,
    jp: innerAll(b.html, 'jp').map(rubyToShort),
    ro: inner(b.html, 'ro'),
    zh: inner(b.html, 'zh'),
    an: rubyToShort(inner(b.html, 'an')).replace(/\s*\n\s*/g, ' ').trim()
  };
});

/* ---- 把 line 分配到 section ---- */
const sections = [];
let cur = null;
const allItems = heads
  .map((h) => ({ type: 'head', ...h }))
  .concat(lines.map((l) => ({ type: 'line', ...l })))
  .sort((a, b) => a.index - b.index);

for (const item of allItems) {
  if (item.type === 'head') {
    if (/LANGUAGE POINTS|ANALYSIS/i.test(item.text)) break; // 后面是要点与总评
    cur = { name: item.text, note: '', lines: [] };
    sections.push(cur);
  } else if (cur) {
    cur.lines.push({ speaker: item.speaker, jp: item.jp, ro: item.ro, zh: item.zh, an: item.an });
  }
}

/* ---- sec-note 回填 ---- */
heads.forEach((h, i) => {
  const after = html.slice(h.index, h.index + 800);
  const nm = after.match(/<p class="sec-note">([\s\S]*?)<\/p>/);
  if (nm && sections[i]) sections[i].note = nm[1].trim();
});

/* ---- 语言点 ---- */
const points = extractBlocks(html, 'point').map((b) => ({
  h: stripTags(inner(b.html, 'h4') || b.html.match(/<h4>([\s\S]*?)<\/h4>/)[1]),
  p: (b.html.match(/<p>([\s\S]*?)<\/p>/) || ['', ''])[1]
    .replace(/\s+/g, ' ')
    .trim()
}));

/* ---- 总评 ---- */
const essayBlock = extractBlocks(html, 'essay')[0];
let essay = '';
if (essayBlock) {
  essay = essayBlock.html
    .replace(/^<div class="essay">/, '')
    .replace(/<\/div>$/, '')
    .replace(/\s*\n\s+/g, '\n')
    .trim();
}

/* ---- 组装 ---- */
const data = {
  id: songId,
  title,
  kana: '',
  romaji: '',
  album: '',
  trackNo: null,
  year: null,
  tags: [],
  lead,
  sections: sections.filter((s) => s.lines.length),
  points,
  essay,
  added: new Date().toISOString().slice(0, 10)
};

const banner = `/* ============================================================
 *  ${data.title} — 歌词解读数据
 *  自动生成自：${path.basename(srcPath)}
 *  生成时间：${new Date().toISOString().slice(0, 10)}
 *
 *  假名简写语法：漢字(かな)  → 渲染时自动变成 ruby 标注
 *   例：遠(とお)い距離(きょり)が二人(ふたり)近(ちか)づけてく
 * ============================================================ */

`;

const body = `window.RW_SONGS = window.RW_SONGS || [];\nwindow.RW_SONGS.push(${JSON.stringify(
  data,
  null,
  2
)});\n`;

fs.writeFileSync(outPath, banner + body, 'utf8');

console.log(`✓ 已生成 ${outPath}`);
console.log(`  分区 ${sections.length} 个 / 句子 ${lines.length} 句 / 语言点 ${points.length} 条`);
