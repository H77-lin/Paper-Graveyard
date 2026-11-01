# Paper-Graveyard · 文献导入试运行版

极简冷灰文献归档网站。当前版本将用户提供的参考文献整理为可搜索、可筛选的卡片。

- 网站：https://h77-lin.github.io/Paper-Graveyard/
- 源码：https://github.com/H77-lin/Paper-Graveyard

## 这次导入了什么

从 `参考-国际.rar` 中检查 30 份 PDF，导入 29 条文献，跳过 1 份期刊目录/编委资料。其中包含期刊论文、1 篇社论、1 篇预印本和 1 篇书籍章节。

27 条使用从 PDF 内提取的 DOI，1 条使用 arXiv 入口，1 条书籍章节使用明确标识的标题检索入口。标题、署名与年份根据 PDF 提取或核对。中文概述依据各条记录注明的摘要或导言整理，标记为 AI 整理、待核对；不等同于全文评审。个人阅读状态均留空。

文献按年份从新到旧排列，同年按标题排序。卡片的“来源与校核”包含来源文件名、概述依据与 DOI。网站不附原 PDF，封面由书目信息生成。

## 上传：所有文件都放在根目录

本包采用平铺结构，解决之前 `data/papers.json` 与根目录 `papers.json` 不一致的问题。

1. 解压下载包，打开解压后的目录。
2. 在仓库 `H77-lin/Paper-Graveyard` 中选择 **Add file → Upload files**。
3. 选中解压出来的全部文件，一起上传并提交（不要上传 ZIP 本身，也不要上传最外层文件夹）。
4. 更新后根目录应直接有 `index.html`、`script.js`、`styles.css`、`papers.json` 与 `cover-001.svg` 等封面文件。本版不需要上传 `data/` 或 `images/` 文件夹。
5. 等待 Pages 自动部署完成，再打开网站并按 **Ctrl+F5** 刷新。

这次 `script.js`、`papers.json`、`index.html`、`styles.css` 必须一起更新；只传 papers.json，旧脚本仍会访问错误的 data/ 路径。

已有 Pages 来源是 **main / (root)**，无需再次设置。

## 本地预览

在解压后的目录中打开终端：

```sh
python -m http.server 8080 --bind 127.0.0.1
```

然后访问 http://127.0.0.1:8080/ 。不要直接双击 HTML 预览 JSON 数据。

## 后续添加文献

编辑根目录的 `papers.json`，在数组内追加对象并保留合法 JSON：

```json
{
  "id": "my-next-reference",
  "title": "文献标题",
  "authors": "作者",
  "year": "",
  "journal": "期刊或来源",
  "type": "期刊论文",
  "topic": "研究主题",
  "status": "",
  "summary": "自己的概述，或明确标注 AI 整理。",
  "summary_label": "中文概述 · 待核对",
  "tags": ["标签一", "标签二"],
  "url": "https://doi.org/填入真实DOI",
  "url_kind": "source",
  "image": "自己上传的封面文件名.svg",
  "demo": false
}
```

未知年份和阅读状态留空；没有图片可省略 image。请保留已有条目后再追加，避免覆盖已收录的资料。编辑数组顺序可调整展示顺序。

## 文件清单

```text
index.html         页面入口
styles.css         冷灰视觉与卡片样式
script.js          读取根目录 papers.json，提供搜索和筛选
papers.json        本次 29 条文献（包含来源记录）
cover-001.svg ...  为各文献生成的封面
icon.svg           网站图标
.nojekyll          Pages 静态托管标记
README.md          本说明
```

源 PDF、压缩包和本地提取文本均未装入上传包。旅行网站保持独立。
