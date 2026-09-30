# RADWIMPS 詞解

一个**纯静态、零依赖**的个人歌词解读站：按专辑归档，逐句标注假名与罗马音，配中文直译和写法解读。
没有构建步骤、没有 npm、没有后端 —— 新增一首歌只是新增一个数据文件。

---

## 怎么打开

**方式一（最简单）**：双击 `index.html` 直接用浏览器打开。

**方式二（推荐，避免个别浏览器的本地文件限制）**：在站点根目录起一个静态服务

```bash
python -m http.server 8765
# 然后访问 http://127.0.0.1:8765
```

---

## 目录结构

```
radwimps-lyrics/
├── index.html              站点页面（唯一的一个页面，内容由 JS 渲染）
├── assets/
│   ├── app.css             样式
│   └── app.js              路由 / 渲染 / 搜索 / 显示开关
├── data/
│   ├── albums.js           专辑档案（名称、年份、曲目表、收录进度）
│   └── manifest.js         歌曲文件索引 —— 新增歌曲要在这里登记
├── songs/                  每首歌一个文件
│   ├── _template.js        新歌模板，复制它开始写
│   └── radwimps4-06-enren.js
├── tools/
│   └── import-from-html.js 把一份手写解读 HTML 转成歌曲数据文件
└── README.md
```

**数据文件和展示完全分离**：页面只负责渲染，`songs/` 里放的是内容。
所以样式或功能改动永远不会弄坏已经写好的歌词。

---

## 新增一首歌（三步）

### 1. 复制模板

```bash
cp songs/_template.js songs/radwimps4-07-setsunarensa.js
```

命名建议：`<专辑id>-<曲号>-<曲名>.js`

### 2. 填内容

关键是 `id`（英文、唯一）、`album`（对应 `data/albums.js` 里的专辑 id）、`sections`。

**假名用简写语法，不要手写 ruby 标签：**

```js
jp: ['遠(とお)い距離(きょり)が二人(ふたり)近(ちか)づけてく']
```

渲染时会自动变成 `遠` 上面标注 `とお` 的 ruby。
一句被旋律切成多行时，`jp` 写成数组的多项。

说话人 `speaker` 决定卡片左侧的颜色条：

| 值 | 用途 | 颜色 |
|---|---|---|
| `male` | 他的台词 | 蓝 |
| `female` | 她的台词 | 粉 |
| `chorus` | 副歌 / 两人共同 | 红 |
| `solo` | 独白 | 黄 |
| `note` | 旁注、P.S. | 灰 |

解读 `an` 支持少量 html：

```js
an: '<span class="tag">语法</span><b>「～たって」</b>＝即使…也。<br>换个话题。'
```

`tag` 有三种配色：`tag`（红）、`tag b`（蓝）、`tag g`（黄）。

### 3. 登记

**`data/manifest.js`** —— 加一行文件路径：

```js
window.RW_FILES = [
  'songs/radwimps4-06-enren.js',
  'songs/radwimps4-07-setsunarensa.js'   // ← 新增
];
```

**`data/albums.js`** —— 给这张专辑的对应曲目加上 `songId`，它就会在曲目表里点亮、可点击：

```js
{ no: 7, title: 'セツナレンサ', songId: 'setsunarensa' }
```

刷新页面即可。

---

## 新增一张专辑

在 `data/albums.js` 的数组里加一项：

```js
{
  id: 'altocolony',                    // 英文 id，歌曲通过它挂靠
  title: 'アルトコロニーの定理',
  kind: 'album',                       // album / ost / single
  date: '2009.03.11',
  year: 2009,
  total: 13,                           // 曲目总数，用于显示进度；不确定填 null
  note: '一句备注',
  tracks: [                            // 可选。填了才显示完整曲目表
    { no: 1, title: '曲名' },
    { no: 2, title: '曲名', songId: 'xxx' }
  ]
}
```

`tracks` 暂时不知道也没关系，留空数组即可；写了歌之后，歌曲仍会以"已解读"的形式挂在专辑页下面。

---

## 从写好的 HTML 导入

如果你像我一样，先在单篇 HTML 里把解读写好了，可以用导入脚本把它转成数据文件，
省掉手抄 ruby 标签的功夫：

```bash
node tools/import-from-html.js <源HTML路径> <输出.js> <songId>

# 例
node tools/import-from-html.js ../radwimps-enren-analysis.html songs/radwimps4-07-setsunarensa.js setsunarensa
```

它会识别 `.intro / h2 / .sec-note / .line / .jp / .ro / .zh / .an / .point / .essay`
这些结构，并把 `<ruby>漢<rt>かな</rt></ruby>` 自动转成 `漢(かな)`。
导入后记得手工补上 `kana / romaji / album / trackNo / year / tags` 这几个字段。

---

## 站点功能

- **假名 / 罗马音 / 中文 / 解读** 四档显示开关，另有一个「只看日文」自测模式
- **全站搜索**：歌词、罗马音、译文、解读、语言点、总评一起搜，命中处高亮
- **收录进度**：侧边栏按专辑显示 `已解读 / 总曲数`
- **上一首 / 下一首**：读完一首可以直接翻下去
- **浏览器标签跟着走**：切到哪首歌，标签页标题就是哪首歌
- **深浅色**：右上角切换，记在 localStorage 里
- **URL 直达**：`#/song/enren`、`#/album/radwimps4`、`#/search?q=距離`，可以直接分享某一首
- **零依赖**：没有 npm、没有构建、没有框架，改完刷新就是最新

---

## 建议

- 用 git 管起来：`git init` 之后每写完一首歌提交一次，内容永远不会丢。
- 写作顺序建议按专辑曲序来，侧边栏的进度条会给你正反馈。
- 不确定的歌词读音先空着（写 `jp: ['漢字']`），回头再补；不影响渲染。

---

## 部署到 GitHub Pages

这个站是纯静态的，可以直接用 GitHub Pages 托管（和上面那个在线分享链接互不影响）：

1. 把仓库推上 GitHub
2. 仓库 **Settings → Pages → Source** 选 `Deploy from a branch`，分支选 `main`，目录选 `/ (root)`
3. 等一两分钟，访问 `https://<用户名>.github.io/<仓库名>/`

hash 路由（`#/song/...`）在 Pages 上完全可用，不需要任何额外配置，也不需要 404 页。

---

## 许可

- **代码**（`index.html`、`assets/`、`data/`、`tools/`、文档）：MIT，见 `LICENSE`
- **`songs/` 里的歌词原文**：版权归野田洋次郎 / RADWIMPS 及唱片公司所有，
  此处仅作学习用途的引用与评论；中文翻译与解读为本项目所写，请勿用于商业用途

---

歌词与译文为学习用途的引用与解读，版权归野田洋次郎 / RADWIMPS 及唱片公司所有。
本站为个人学习笔记，不提供音频与歌词全文下载。
