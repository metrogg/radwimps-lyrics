/* ============================================================
 *  新歌模板
 *  ------------------------------------------------------------
 *  用法：
 *    1. 复制本文件，改名为  <专辑id>-<曲号>-<曲名>.js
 *       例：radwimps4-07-setsunarensa.js
 *    2. 按注释填内容（假名用简写语法，不要手写 ruby 标签）
 *    3. 在 data/manifest.js 里加上这个文件的路径
 *    4. 在 data/albums.js 里给对应曲目加 songId: '这首歌的 id'
 *    5. 刷新页面
 * ============================================================ */

window.RW_SONGS = window.RW_SONGS || [];
window.RW_SONGS.push({

  /* ---- 基本信息 ---- */
  id: 'setsunarensa',                 // 必填，英文 id，URL 里用，必须唯一
  title: 'セツナレンサ',               // 曲名原文
  kana: 'せつなれんさ',               // 假名读法（可留空）
  romaji: 'Setsunarensa',             // 罗马字（可留空）
  album: 'radwimps4',                 // data/albums.js 里的专辑 id
  trackNo: 7,                         // 曲号（没有就填 null）
  year: 2006,
  tags: ['关键词1', '关键词2'],        // 首页卡片上的小标签

  /* ---- 导语（可用简单 html：<b>加粗</b>） ---- */
  lead: '一句话讲清这首歌最妙的地方。',

  /* ---- 逐句解读 ---- */
  sections: [
    {
      name: '第一段：场景',            // 段落标题
      note: '这一段在讲什么、怎么听',   // 段落说明（可留空 ''）
      lines: [
        {
          /* male=他 / female=她 / chorus=副歌 / solo=独白 / note=注 */
          speaker: 'male',
          /* 假名简写：汉字后面紧跟 (假名)，渲染时自动变成 ruby 标注。
             一句被旋律切成两行时，jp 就写成数组的两项。 */
          jp: ['日本語(にほんご)の歌詞(かし)をここに書(か)く'],
          ro: 'nihongo no kashi wo koko ni kaku',
          zh: '中文直译',
          /* 解读：支持 html，常用：
               <b>加粗</b>
               <span class="tag">语法</span>   （红）
               <span class="tag b">深读</span> （蓝）
               <span class="tag g">结构</span> （黄） */
          an: '<span class="tag">语法</span>这里写这句里的词法 / 修辞 / 情绪。'
        },
        {
          speaker: 'chorus',
          jp: ['二行目(にぎょうめ)'],
          ro: 'nigyoume',
          zh: '第二行',
          an: ''
        }
      ]
    }
  ],

  /* ---- 语言点（可选）---- */
  points: [
    { h: '「～たって」＝ 即使…也', p: '说明与例句。' }
  ],

  /* ---- 整体解读（可选，直接写 html）---- */
  essay: '<h3>小标题</h3><p>这首歌的整体结构、主题、与其他歌的呼应……</p>',

  added: '2026-09-30'
});
