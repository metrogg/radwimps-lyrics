/* ============================================================
 *  albums.js — 专辑档案
 *  ------------------------------------------------------------
 *  kind   : 'album' 原创专辑 / 'ost' 影视原声 / 'single' 单曲·EP
 *  total  : 曲目总数（用于显示收录进度）。不确定就填 null。
 *  accent : 专辑色相。用于歌曲页"舞台"的底色、侧边栏色块、专辑墙进度条。
 *           真封面出现的大尺寸位置（舞台 / 专辑页 / 卡片）由 cover 图片主导，
 *           accent 退为衬托与点缀，所以这里统一取低饱和墨色系。
 *  mark   : 没有封面图时，生成式封面上显示的字符。
 *  cover  : 封面图路径。留空则用 accent + mark 生成极简封面。
 *           图片放在 assets/covers/（当前用的是 560px 缩略图，站点最大显示 148px）。
 *  tracks : 可选。填了才会在专辑页显示完整曲目表；
 *           某首歌写完解读后，在对应曲目上加 songId 即可点亮跳转。
 * ============================================================ */

window.RW_ALBUMS = [

  {
    id: 'radwimps1',
    title: 'RADWIMPS',
    kind: 'album',
    date: '2003.07.01',
    year: 2003,
    total: null,
    accent: '#6B7F95',
    mark: 'R',
    cover: 'assets/covers/radwimps1.jpg',
    note: '独立制作时期的第一张同名专辑。',
    tracks: []
  },

  {
    id: 'radwimps2',
    title: 'RADWIMPS 2 ～発展途上～',
    kind: 'album',
    date: '2005.03.09',
    year: 2005,
    total: null,
    accent: '#8A7F6B',
    mark: '2',
    cover: 'assets/covers/radwimps2.jpg',
    note: '第二张专辑，同年 11 月以《25コ目の染色体》主流出道。',
    tracks: []
  },

  {
    id: 'radwimps3',
    title: 'RADWIMPS 3 ～無人島に持っていき忘れた一枚～',
    kind: 'album',
    date: '2006.02.15',
    year: 2006,
    total: 12,
    accent: '#4A7F96',
    mark: '3',
    cover: 'assets/covers/radwimps3.jpg',
    note: '主流出道后第一张专辑，器乐全部现场同步录音。',
    tracks: []
  },

  {
    id: 'radwimps4',
    title: 'RADWIMPS 4 ～おかずのごはん～',
    kind: 'album',
    date: '2006.12.06',
    year: 2006,
    total: 14,
    accent: '#B04A3C',
    mark: '4',
    cover: 'assets/covers/radwimps4.jpg',
    note: '第四张专辑。CD 版收录 14 曲，2025 年黑胶再版为 13 曲。',
    tracks: [
      { no: 1,  title: 'ふたりごと（一生に一度のワープ ver.）' },
      { no: 2,  title: 'ギミギミック' },
      { no: 3,  title: 'おこして' },
      { no: 4,  title: 'me me she' },
      { no: 5,  title: '有心論' },
      { no: 6,  title: '遠恋', songId: 'enren' },
      { no: 7,  title: 'セツナレンサ' },
      { no: 8,  title: 'いいんですか?', songId: 'iindesuka' },
      { no: 9,  title: '指切りげんまん' },
      { no: 10, title: '三拍子' },
      { no: 11, title: 'ますまる' },
      { no: 12, title: '夢番地' },
      { no: 13, title: 'バグッバイ' },
      { no: 14, title: '泣きたい夜ってこんな感じ' }
    ]
  },

  {
    id: 'altocolony',
    title: 'アルトコロニーの定理',
    kind: 'album',
    date: '2009.03.11',
    year: 2009,
    total: 13,
    accent: '#4A5B8C',
    mark: 'ア',
    cover: 'assets/covers/altocolony.jpg',
    note: '',
    tracks: []
  },

  {
    id: 'zettaizetsumei',
    title: '絶体絶命',
    kind: 'album',
    date: '2011.03.09',
    year: 2011,
    total: 14,
    accent: '#8F3A35',
    mark: '絶',
    cover: 'assets/covers/zettaizetsumei.jpg',
    note: '',
    tracks: []
  },

  {
    id: 'batsutomaru',
    title: '×と○と罪と',
    kind: 'album',
    date: '2013.12.11',
    year: 2013,
    total: 15,
    accent: '#44403C',
    mark: '×',
    cover: 'assets/covers/batsutomaru.jpg',
    note: '封面为竖版。',
    tracks: []
  },

  {
    id: 'ningenkaika',
    title: '人間開花',
    kind: 'album',
    date: '2016.11.23',
    year: 2016,
    total: 15,
    accent: '#6F8F5A',
    mark: '人',
    cover: 'assets/covers/ningenkaika.jpg',
    note: '',
    tracks: []
  },

  {
    id: 'antianti',
    title: 'ANTI ANTI GENERATION',
    kind: 'album',
    date: '2018.12.12',
    year: 2018,
    total: 17,
    accent: '#6B5B8F',
    mark: 'A',
    cover: 'assets/covers/antianti.jpg',
    note: '',
    tracks: []
  },

  {
    id: 'foreverdaze',
    title: 'FOREVER DAZE',
    kind: 'album',
    date: '2021.11.23',
    year: 2021,
    total: 14,
    accent: '#3D7F8F',
    mark: 'F',
    cover: 'assets/covers/foreverdaze.jpg',
    note: '',
    tracks: []
  },

  {
    id: 'anew',
    title: 'Anew',
    kind: 'album',
    date: '2025.10.08',
    year: 2025,
    total: 13,
    accent: '#3A4A7F',
    mark: 'N',
    cover: 'assets/covers/anew.jpg',
    note: '日文标题《あにゅー》。时隔前作《FOREVER DAZE》约四年的原创专辑。曲目表待补充（已录入 Track 3）。',
    tracks: []
  },

  /* ---------- サウンドトラック ---------- */
  {
    id: 'kiminonawa',
    title: '君の名は。',
    kind: 'ost',
    date: '2016.08.24',
    year: 2016,
    total: 27,
    accent: '#6F8FB0',
    mark: '名',
    cover: 'assets/covers/kiminonawa.jpg',
    note: '新海誠監督《你的名字。》原声。',
    tracks: []
  },
  {
    id: 'tenkinoko',
    title: '天気の子',
    kind: 'ost',
    date: '2019.07.19',
    year: 2019,
    total: 31,
    accent: '#4A8FB0',
    mark: '天',
    cover: 'assets/covers/tenkinoko.jpg',
    note: '新海誠監督《天气之子》原声。',
    tracks: []
  },
  {
    id: 'yomei10',
    title: '余命10年 〜Original Soundtrack〜',
    kind: 'ost',
    date: '2022.03.04',
    year: 2022,
    total: 30,
    accent: '#8F7F8A',
    mark: '余',
    cover: 'assets/covers/yomei10.jpg',
    note: '',
    tracks: []
  },
  {
    id: 'suzume',
    title: 'すずめの戸締まり',
    kind: 'ost',
    date: '2022.11.11',
    year: 2022,
    total: 29,
    accent: '#8F5A4A',
    mark: 'す',
    cover: 'assets/covers/suzume.jpg',
    note: '新海誠監督《铃芽之旅》原声。',
    tracks: []
  },

  /* ---------- シングル（早期） ---------- */
  {
    id: 'kiseki',
    title: '祈跡',
    kind: 'single',
    date: '2004.07.22',
    year: 2004,
    total: null,
    accent: '#7D8A72',
    mark: '祈',
    cover: '',
    note: '独立时期第 2 张单曲（品番 YYCM-104）。《僕チン》为其中收录曲，写于野田十几岁时。此张暂无封面图，使用生成式封面。',
    tracks: [
      { no: 1, title: '祈跡' },
      { no: 2, title: '僕チン', songId: 'bokuchin' }
    ]
  }
];
