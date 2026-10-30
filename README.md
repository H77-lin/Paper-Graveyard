# Paper-Graveyard

一个独立的极简研究资料归档网站，收录文献图片、原文链接、摘要与主题标签。

- **源代码**：[H77-lin/Paper-Graveyard](https://github.com/H77-lin/Paper-Graveyard)
- **网站入口（部署目标）**：[https://h77-lin.github.io/Paper-Graveyard/](https://h77-lin.github.io/Paper-Graveyard/)

> 网站入口在代码上传并成功开启 GitHub Pages 后生效。本地准备完成不代表已经上线。

## 已实现

黑白灰界面、文献卡片、关键词搜索、实时匹配计数、主题筛选、标签筛选、清除筛选与移动端布局。卡片标题及右下角箭头可打开来源。

当前三条内容均为界面演示，摘要为演示概述，不是文献原始摘要；不代表个人研究方向或真实阅读状态。未知阅读状态留空。

## 本地运行

无需 npm、数据库或构建步骤。在此目录打开终端：

```sh
python -m http.server 8080 --bind 127.0.0.1
```

打开 <http://127.0.0.1:8080/>。如 Windows 使用 Python Launcher，也可运行 `py -m http.server 8080 --bind 127.0.0.1`。
请通过本地服务器预览；直接双击 HTML 会受到浏览器读取 JSON 的限制。

## GitHub Pages 部署

1. 将本项目中的文件放到 `H77-lin/Paper-Graveyard` 仓库的根目录，确保根目录直接存在 `index.html`，并保留 `data/`、`images/` 的目录层级。
2. 在仓库中打开 **Settings → Pages**。
3. Source 选择 **Deploy from a branch**，Branch 选择 **main**，目录选择 **/ (root)**，点击 Save。
4. 等待 GitHub Pages 的构建部署成功，访问上方网站入口。
5. 在仓库首页 **About → 齿轮 → Website** 填写网站入口，并在 README 保留入口链接。

后续修改代码或资料并提交到 main，GitHub Pages 会再次部署。不要把压缩包直接提交为网页文件；请先解压后上传其中内容。

## 内容更新

编辑 `data/papers.json`，在数组中追加对象。它是唯一的资料数据源，无需改页面代码。

```json
{
  "title": "论文标题",
  "authors": "作者",
  "year": "",
  "topic": "研究主题",
  "status": "",
  "summary": "自行填写的摘要概述；与原始摘要区分。",
  "tags": ["标签一", "标签二"],
  "url": "https://example.org/paper",
  "image": "images/paper-cover.svg",
  "cover": "cover-1",
  "demo": false
}
```

未知年份和阅读状态留空；`image` 可选，填写后使用真实图片，否则显示灰色占位封面。请把有权发布的封面放入 `images/`，使用相对路径。条目顺序与 JSON 数组顺序一致，可将新条目放在最前面。

GitHub Pages 托管公开静态内容；当前版本通过编辑文件持续更新，不提供在线保存表单。旅行网站另行构建为独立项目。

## 文件结构

```text
index.html         页面入口
styles.css         深色视觉样式
script.js          数据读取、搜索与筛选
icon.svg           网站图标
data/papers.json   文献数据
images/            封面图片
.nojekyll          静态文件托管标记
```
