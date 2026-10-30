const byId = (id) => document.getElementById(id);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#039;"}[char]));
const safeUrl = (value, allowLocal = false) => {
  try {
    const url = new URL(value, location.href);
    return ((allowLocal && url.origin === location.origin) || /^https?:$/.test(url.protocol)) ? url.href : "";
  } catch { return ""; }
};
let papers = [];
let activeTopic = "全部";
let activeTag = "";
function matches(paper) {
  const query = byId("paper-search").value.trim().toLowerCase();
  const haystack = [paper.title, paper.authors, paper.year, paper.topic, paper.status, paper.summary, ...(paper.tags || [])].join(" ").toLowerCase();
  return (!query || haystack.includes(query)) && (activeTopic === "全部" || paper.topic === activeTopic) && (!activeTag || (paper.tags || []).includes(activeTag));
}
function renderPapers() {
  const filtered = papers.filter(matches);
  byId("paper-count").textContent = `${filtered.length} / ${papers.length} 条匹配资料`;
  byId("active-filter").hidden = !activeTag;
  byId("active-filter").textContent = activeTag ? `标签：#${activeTag}（再次点击可取消）` : "";
  byId("paper-grid").innerHTML = filtered.length ? filtered.map((paper, index) => {
    const url = safeUrl(paper.url);
    const image = paper.image ? safeUrl(paper.image, true) : "";
    const cover = /^cover-[1-4]$/.test(paper.cover) ? paper.cover : `cover-${(index % 4) + 1}`;
    return `<article class="paper-card">
      <div class="card-cover ${cover}" aria-hidden="true">${image ? `<img src="${escapeHtml(image)}" alt="" loading="lazy">` : ""}</div>
      <div class="card-topline"><span>${escapeHtml(paper.topic)}</span><span>${escapeHtml([paper.year, paper.status].filter(Boolean).join(" / "))}${paper.demo ? " · 示例" : ""}</span></div>
      <h3 class="card-title">${url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(paper.title)}</a>` : escapeHtml(paper.title)}</h3>
      <p class="card-author">${escapeHtml(paper.authors)}</p>
      <p class="card-summary">${escapeHtml(paper.summary)}</p>
      <div class="card-footer"><div class="card-tags">${(paper.tags || []).map((tag) => `<button class="tag ${tag === activeTag ? "active" : ""}" type="button" aria-pressed="${tag === activeTag}" data-tag="${escapeHtml(tag)}">#${escapeHtml(tag)}</button>`).join("")}</div>${url ? `<a class="card-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="打开原文：${escapeHtml(paper.title)}">↗</a>` : ""}</div>
    </article>`;
  }).join("") : `<div class="empty-state">没有找到匹配的资料。可以调整关键词或清除筛选。</div>`;
}
function renderFilters() {
  const topics = ["全部", ...new Set(papers.map((paper) => paper.topic).filter(Boolean))];
  byId("paper-filters").innerHTML = topics.map((topic) => `<button class="filter-button ${topic === activeTopic ? "active" : ""}" aria-pressed="${topic === activeTopic}" data-topic="${escapeHtml(topic)}" type="button">${escapeHtml(topic)}</button>`).join("");
}
async function loadPapers() {
  try {
    const response = await fetch("data/papers.json");
    if (!response.ok) throw new Error("Unable to load papers");
    const data = await response.json();
    if (!Array.isArray(data) || data.some((paper) => !paper || typeof paper.title !== "string" || (paper.tags !== undefined && !Array.isArray(paper.tags)))) throw new Error("Invalid paper data");
    papers = data;
    renderFilters();
    renderPapers();
  } catch {
    byId("paper-count").textContent = "资料加载失败";
    byId("paper-grid").innerHTML = `<div class="empty-state">无法读取资料。请刷新页面；本地预览请使用静态服务器打开，详见项目 README。</div>`;
  }
}
byId("paper-grid").addEventListener("click", (event) => {
  const tag = event.target.closest("button[data-tag]");
  if (tag) {
    activeTag = tag.dataset.tag === activeTag ? "" : tag.dataset.tag;
    renderPapers();
    Array.from(byId("paper-grid").querySelectorAll("button[data-tag]")).find((button) => button.dataset.tag === tag.dataset.tag)?.focus();
    return;
  }
  if (event.target.closest("a, button") || window.getSelection()?.toString()) return;
  const link = event.target.closest(".paper-card")?.querySelector(".card-title a");
  link?.click();
});
byId("paper-filters").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-topic]");
  if (!button) return;
  activeTopic = button.dataset.topic;
  activeTag = "";
  renderFilters();
  renderPapers();
  Array.from(byId("paper-filters").querySelectorAll("button")).find((item) => item.dataset.topic === activeTopic)?.focus();
});
byId("clear-filters").addEventListener("click", () => {
  activeTopic = "全部";
  activeTag = "";
  byId("paper-search").value = "";
  renderFilters();
  renderPapers();
});
byId("paper-search").addEventListener("input", renderPapers);
loadPapers();
