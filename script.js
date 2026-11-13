import {createPageTransitions} from './page-motion.js';

const $ = (id) => document.getElementById(id);
const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href = (v) => { try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch { return ''; } };
// Display translations leave imported source metadata and original abstracts intact.
const translations = {
  '国际期刊':'International Journals','深圳':'Shenzhen','其他地区与综合研究':'Other Regions & Cross-regional Studies','预印本':'Preprints','书籍与章节':'Books & Chapters',
  '城市内涝与遥感':'Urban Flooding & Remote Sensing','土地与生态系统':'Land & Ecosystems','城市系统与空间尺度':'Urban Systems & Spatial Scales','气候与碳排放':'Climate & Carbon Emissions','水资源与农业':'Water & Agriculture','环境治理与政策':'Environmental Governance & Policy','脆弱性与适应':'Vulnerability & Adaptation','韧性与社会脆弱性':'Resilience & Social Vulnerability',
  '期刊论文':'Journal article','书籍章节':'Book chapter','社论':'Editorial','待读':'To read','阅读中':'Reading','已读':'Read','中文概述 · AI整理，待核对':'AI summary · Chinese · verify against source',
  'DROP模型':'DROP model','不确定性':'Uncertainty','中国':'China','中国碳排放':'China carbon emissions','主体模型':'Agent-based model','交通税':'Transport tax','住房':'Housing','供水制度':'Water supply institutions','全球贸易':'Global trade','公共政策':'Public policy','公平':'Equity','共有牧场':'Communal rangelands','农业影响':'Agricultural impacts','农业生计':'Agricultural livelihoods','农业经济':'Agricultural economics','农户适应':'Farmer adaptation','农户韧性':'Farmer resilience','农村生计':'Rural livelihoods','农药风险':'Pesticide risk','加纳':'Ghana','南非':'South Africa','印度':'India','参与式研究':'Participatory research','参与式评估':'Participatory assessment','发展中国家':'Developing countries','可持续性':'Sustainability','哥斯达黎加':'Costa Rica','土地权属':'Land tenure','地方证据':'Local evidence','地理空间建模':'Geospatial modeling','坦桑尼亚':'Tanzania','垂直形态':'Vertical morphology','埃塞俄比亚':'Ethiopia','城市供水':'Urban water supply','城市内涝':'Urban waterlogging','城市增长':'Urban growth','城市转型':'Urban transitions','墨西哥':'Mexico','尺度效应':'Scale effects','尺度错配':'Scale mismatch','巴西':'Brazil','干旱':'Drought','干旱脆弱性':'Drought vulnerability','平衡计分卡':'Balanced scorecard','应对策略':'Coping strategies','开曼群岛':'Cayman Islands','性别':'Gender','投入产出':'Input–output','指标':'Indicators','排放情景':'Emission scenarios','时间维度':'Temporal dimensions','景观异质性':'Landscape heterogeneity','李嘉图模型':'Ricardian model','概念框架':'Conceptual framework','概率分析':'Probabilistic analysis','气候情景':'Climate scenarios','气候适应':'Climate adaptation','水压力':'Water stress','洪水制图':'Flood mapping','流域':'River basin','消费':'Consumption','灌溉':'Irrigation','灌溉水价':'Irrigation pricing','灾害风险治理':'Disaster risk governance','热带森林':'Tropical forests','环境变化':'Environmental change','环境影响':'Environmental impacts','生态系统服务':'Ecosystem services','生态补偿':'Ecological compensation','生态适应':'Ecological adaptation','生计策略':'Livelihood strategies','碳储存':'Carbon storage','碳汇':'Carbon sinks','社会脆弱性':'Social vulnerability','社区韧性':'Community resilience','种子援助':'Seed aid','空间不平等':'Spatial inequality','空间模型':'Spatial model','系统动力学':'System dynamics','结构分解':'Structural decomposition','缺水':'Water scarcity','自然灾害':'Natural hazards','草地破碎化':'Rangeland fragmentation','菲律宾':'Philippines','贫困陷阱':'Poverty traps','适应决策':'Adaptation decisions','适应性管理':'Adaptive management','适应政策':'Adaptation policy','适应能力':'Adaptive capacity','造林':'Afforestation','遥感融合':'Remote sensing fusion','随机森林':'Random forest','非洲':'Africa','韧性指标':'Resilience indicators','项目评估':'Project evaluation','风险评估':'Risk assessment','风险转移':'Risk transfer','飓风桑迪':'Hurricane Sandy','黄河':'Yellow River'
};
const en = value => translations[value] || value || '';
const insightFields = [
  ['referenceSections', 'Useful sections / pages'],
  ['researchDirections', 'Research directions'],
  ['researchApplication', 'How I can use this'],
  ['notes', 'Reading notes']
];
const hasInsights = paper => insightFields.some(([key]) => typeof paper[key] === 'string' && paper[key].trim());
function privateInsightsHTML(paper) {
  if (!local || !hasInsights(paper)) return '';
  const entries = insightFields.filter(([key]) => typeof paper[key] === 'string' && paper[key].trim());
  return `<section class="private-insights" aria-label="My research connections"><header><h4>My research connections</h4><span>Private</span></header><dl>${entries.map(([key,label]) => `<div><dt>${label}</dt><dd dir="auto">${esc(paper[key])}</dd></div>`).join('')}</dl></section>`;
}
let library = { categories: [], papers: [] }, local = false, token = '', revision = '', currentId = null, activeTag = '', editing = null, toastTimer;
const category = id => library.categories.find(c => c.id === id);
const pathTo = id => { const result = [], seen = new Set(); while (id && category(id) && !seen.has(id)) { seen.add(id); result.unshift(category(id)); id = category(id).parentId; } return result; };
function subtree(id) { const ids = new Set(id ? [id] : []); if (!id) return new Set(library.categories.map(c => c.id)); let added; do { added = false; for (const c of library.categories) if (ids.has(c.parentId) && !ids.has(c.id)) { ids.add(c.id); added = true; } } while (added); return ids; }
const routeFor = id => '#library' + (id ? '/' + encodeURIComponent(id) : '');
function foldersHTML(parentId) {
  return library.categories.filter(c => (c.parentId || null) === parentId).map((c, i) => {
    const ids = subtree(c.id), count = library.papers.filter(p => ids.has(p.categoryId)).length;
    return `<a class="folder-row ${c.parentId ? 'secondary' : ''}" href="${routeFor(c.id)}"><span class="folder-no mono">${String(i+1).padStart(2,'0')}</span><span class="folder-name">${esc(en(c.name))}${c.description ? `<span class="folder-subtitle">${esc(c.description)}</span>` : ''}</span><span class="folder-count pill">${count} ${count === 1 ? 'paper' : 'papers'}</span><span class="folder-arrow" aria-hidden="true">↗</span></a>`;
  }).join('');
}
function render() {
  const view = location.hash.startsWith('#library') ? 'library' : location.hash === '#guide' ? 'guide' : 'home';
  for (const name of ['home','library','guide']) $(name+'-view').hidden = name !== view;
  document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === view) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current'); });
  $('home-stats').textContent = `${library.papers.length} PAPERS / ${library.categories.filter(c=>!c.parentId).length} STARTING POINTS`;
  $('home-folders').innerHTML = foldersHTML(null);
  if (view !== 'library') { requestAnimationFrame(drawThreads); return; }
  let id; try { id = decodeURIComponent(location.hash.slice('#library/'.length)); } catch { id = ''; }
  currentId = location.hash.startsWith('#library/') && category(id) ? id : null;
  const folder = category(currentId), path = pathTo(currentId);
  $('library-view').classList.toggle('is-sub', path.length > 1);
  $('breadcrumbs').innerHTML = `<a href="#home">Home</a><span>/</span>${currentId ? '<a href="#library">Index</a>' : '<span aria-current="page">Index</span>'}` + path.map((c,i) => `<span>/</span>${i === path.length-1 ? `<span aria-current="page">${esc(en(c.name))}</span>` : `<a href="${routeFor(c.id)}">${esc(en(c.name))}</a>`}`).join('');
  $('folder-title').textContent = folder ? en(folder.name) : 'The research index.';
  $('level-label').textContent = folder ? `RESEARCH DIRECTORY / LEVEL ${String(path.length).padStart(2,'0')}` : 'YOUR STARTING POINT / BROWSE BY CATEGORY';
  $('folder-description').textContent = folder?.description || (folder ? '' : 'Follow a question. Find a place for what comes next.');
  $('folder-badge').textContent = folder ? `Level ${String(path.length).padStart(2,'0')}` : 'Independent thinking';
  $('edit-category').hidden = !currentId;
  $('folders').innerHTML = foldersHTML(currentId);
  $('folders').hidden = !$('folders').children.length;
  const oldTopic = $('topic-filter').value;
  const scope = subtree(currentId);
  const branchPapers = library.papers.filter(p => scope.has(p.categoryId));
  $('category-overview').hidden = !local;
  $('category-overview').innerHTML = local ? `<div class="overview-heading"><h2>Research overview</h2><span>In this branch, including subcategories</span></div><div class="overview-stats"><div><strong>${branchPapers.length}</strong><span>Papers</span></div><div><strong>${branchPapers.filter(hasInsights).length}</strong><span>With my notes</span></div><div><strong>${new Set(branchPapers.map(p=>p.topic).filter(Boolean)).size}</strong><span>Research topics</span></div></div><p>Your research connections appear below each paper’s abstract. Use “Edit notes” to record useful sections, research directions and ideas for your own work.</p>` : '';
  const topics = [...new Set(library.papers.filter(p=>scope.has(p.categoryId)).map(p=>p.topic).filter(Boolean))];
  $('topic-filter').innerHTML = '<option value="">All topics</option>' + topics.map(t=>`<option value="${esc(t)}">${esc(en(t))}</option>`).join('');
  $('topic-filter').value = topics.includes(oldTopic) ? oldTopic : '';
  renderPapers();
}
function renderPapers() {
  const query = $('paper-search').value.trim().toLowerCase(), topic = $('topic-filter').value;
  const notesOnly = local && $('notes-only').checked;
  const all = $('include-children').checked || query || topic || activeTag || notesOnly;
  const ids = subtree(currentId);
  const scoped = library.papers.filter(p => all ? ids.has(p.categoryId) : p.categoryId === currentId);
  const filtered = scoped.filter(p => (!notesOnly || hasInsights(p)) && (!topic || p.topic === topic) && (!activeTag || (p.tags||[]).includes(activeTag)) && (!query || [p.title,p.authors,p.year,p.journal,p.doi,p.topic,en(p.topic),p.summary,...(local ? insightFields.map(([key])=>p[key]||'') : []),...(p.tags||[]),...(p.tags||[]).map(en)].join(' ').toLowerCase().includes(query)));
  $('paper-count').textContent = `${filtered.length} / ${scoped.length} papers · ${all ? 'including subcategories' : 'this category only'}`;
  $('tag-filter').textContent = activeTag ? `TAG / ${en(activeTag)}` : '';
  $('paper-grid').innerHTML = filtered.length ? filtered.map(p => {
    const url = href(p.url), image = href(p.image);
    return `<article class="paper-card"><div class="paper-cover"><svg viewBox="0 0 250 70" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 65C70-30 80 110 170 0M20 80C80-25 110 100 210-15M70 85C60-25 190 110 250-10M120 90C110-35 240 100 280-5"/></svg><span class="paper-year">${esc(p.year || '—')}</span><span class="paper-no mono">${esc(p.id)}</span></div>${image ? `<img class="source-image" src="${esc(image)}" alt="Reference image for ${esc(p.title)}" loading="lazy" referrerpolicy="no-referrer">` : ''}<div class="card-body"><div class="card-topline"><span>${esc(en(p.type))}</span><span>${esc(local ? en(p.status) : '')}</span></div><h3 class="card-title">${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(p.title)}</a>` : esc(p.title)}</h3><p class="card-author">${esc(p.authors)}</p><p class="card-journal">${esc(p.journal)}</p>${p.summary_label ? `<p class="summary-label">${esc(en(p.summary_label))}</p>` : ''}<p class="card-summary" dir="auto">${esc(p.summary)}</p>${privateInsightsHTML(p)}<details class="source-note"><summary>Source & verification</summary>${p.doi ? `<p>DOI: ${esc(p.doi)}</p>` : ''}${local && p.source ? `<p>Original file: ${esc(p.source.filename)}</p><p dir="auto">Summary basis: ${esc(p.source.summary_basis)}</p>` : ''}<p>Check imported AI summaries against the original source. A summary does not indicate that a paper has been read.</p></details><div class="card-tags">${(p.tags||[]).map(t=>`<button type="button" class="tag ${activeTag === t ? 'active' : ''}" data-tag="${esc(t)}" aria-pressed="${activeTag === t}">${esc(en(t))}</button>`).join('')}</div><div class="card-footer">${url ? `<a class="card-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${p.url_kind === 'search' ? 'Find paper' : 'Source'} ↗<span class="sr-only">: ${esc(p.title)}</span></a>` : '<span>No source link yet</span>'}${local ? `<div class="card-edit-actions"><button type="button" data-edit-paper="${esc(p.id)}" data-focus-field="referenceSections" aria-label="Edit research notes for ${esc(p.title)}">${hasInsights(p) ? 'Edit notes' : 'Add notes'}</button><button type="button" data-edit-paper="${esc(p.id)}" aria-label="Edit ${esc(p.title)}">Edit paper</button></div>` : ''}</div></div></article>`;
  }).join('') : `<div class="empty-state">${query || topic || activeTag || notesOnly ? 'No matching papers. Try a different keyword or reset the filters.' : $('folders').children.length ? 'Choose a category above to continue. To browse every paper here, select “Include subcategories”.' : 'No papers here yet.'}</div>`;
}
function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(()=>$('toast').hidden=true,6000); }
function field(name,label,value='',type='text',wide=false) { return `<label class="field ${wide?'wide':''}">${label}${type === 'textarea' ? `<textarea name="${name}" rows="4">${esc(value)}</textarea>` : `<input name="${name}" type="${type}" value="${esc(value)}" ${name==='title'||name==='name'?'required':''}>`}</label>`; }
function categoryOptions(selected, excluded = new Set(), root = false) {
  const list = root ? '<option value="">Top level</option>' : '<option value="">Choose a category…</option>';
  return list + library.categories.filter(c=>!excluded.has(c.id)).map(c=>`<option value="${esc(c.id)}" ${c.id===selected?'selected':''}>${esc(pathTo(c.id).map(n=>en(n.name)).join(' / '))}</option>`).join('');
}
function openEditor(kind, id) {
  if (!local) return;
  editing = {kind, id, focusField: document.activeElement?.dataset.focusField || ''};
  $('form-error').textContent = '';
  if (kind === 'category') {
    const c = category(id) || {};
    $('editor-title').textContent = id ? 'Edit category' : 'New category';
    $('editor-fields').innerHTML = `<div class="form-grid">${field('name','Category name',en(c.name),'text',true)}<label class="field wide">Parent category<select name="parentId">${categoryOptions(id ? c.parentId : currentId,id?subtree(id):new Set(),true)}</select></label>${field('description','Description',c.description,'textarea',true)}</div>`;
  } else {
    const p = library.papers.find(p=>p.id===id) || {};
    $('editor-title').textContent = id ? 'Edit paper' : 'Add a paper';
    const statusOptions = [['','Not recorded'],['to-read','To read'],['reading','Reading'],['read','Read']];
    const currentStatus = ({'待读':'to-read','阅读中':'reading','已读':'read'})[p.status] || p.status || '';
    $('editor-fields').innerHTML = `<div class="form-grid">${field('title','Full paper title',p.title,'text',true)}${field('authors','Authors',p.authors,'text',true)}${field('year','Publication year',p.year)}${field('journal','Journal / publisher',p.journal)}${field('type','Publication type',en(p.type))}<label class="field">Category<select name="categoryId" required>${categoryOptions(p.categoryId || currentId)}</select></label>${field('topic','Topic',en(p.topic))}${field('tags','Tags (separate with commas)',(p.tags||[]).map(en).join(', '))}${field('url','Source URL',p.url,'url',true)}${field('doi','DOI',p.doi)}<label class="field">Reading status<select name="status">${statusOptions.map(([v,t])=>`<option value="${v}" ${currentStatus===v?'selected':''}>${t}</option>`).join('')}</select></label>${field('image','Image URL (optional)',href(p.image),'url',true)}${field('summary','Abstract / summary',p.summary,'textarea',true)}${field('summary_label','Summary provenance (keep AI labels until verified)',en(p.summary_label),'text',true)}<div class="form-section-heading"><h3>My research connections</h3><p>Optional, private. Anything you add here is shown below the paper’s abstract in your local library.</p></div>${field('referenceSections','Useful sections / pages',p.referenceSections,'textarea',true)}${field('researchDirections','Research directions',p.researchDirections,'textarea',true)}${field('researchApplication','How I can use this',p.researchApplication,'textarea',true)}${field('notes','Private reading notes',p.notes,'textarea',true)}<label class="checkbox-field"><input type="checkbox" name="allowPublicExport" ${p.allowPublicExport?'checked':''}><span>Allow this paper in public exports. Private reading notes, research connections, reading status and source filenames are always excluded. Abstracts and tags on approved papers will be public.</span></label></div>`;
  }
  $('editor').showModal();
}
async function saveEditor(event) {
  event.preventDefault();
  if (!local || !editing) return;
  const form = new FormData($('editor-form')), next = structuredClone(library), id = editing.id || crypto.randomUUID();
  const value = name => String(form.get(name) || '').trim();
  const list = editing.kind === 'category' ? next.categories : next.papers;
  const index = list.findIndex(r=>r.id===id), old = index >= 0 ? list[index] : {};
  let record;
  if (editing.kind === 'category') record = {...old,id,name:value('name'),description:value('description'),parentId:value('parentId')||null};
  else {
    record = {...old,id};
    for (const key of ['title','authors','year','journal','type','categoryId','topic','url','doi','status','summary','summary_label','image']) record[key]=value(key);
    for (const [key] of insightFields) record[key]=String(form.get(key)||'');
    // Preserve source values if their displayed translation was not changed.
    for (const key of ['type','topic','summary_label']) if (old[key] && value(key) === en(old[key])) record[key]=old[key];
    const tags = value('tags').split(/[,，]/).map(t=>t.trim()).filter(Boolean);
    record.tags = [...new Set(tags.map(t=>(old.tags||[]).find(o=>en(o)===t)||t))];
    if (old.image && !href(old.image) && !value('image')) record.image = old.image;
    record.allowPublicExport = form.has('allowPublicExport');
  }
  if (index >= 0) list[index] = record; else list.push(record);
  $('save-button').disabled = true;
  $('form-error').textContent = '';
  try {
    const response = await fetch('/api/library',{method:'PUT',headers:{'Content-Type':'application/json','X-Library-Token':token},body:JSON.stringify({data:next,revision})});
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not save.');
    library = result.data; revision = result.revision;
    $('editor').close(); render();
    const returnFocus = editing.kind === 'paper'
      ? [...document.querySelectorAll('[data-edit-paper]')].find(button => button.dataset.editPaper === id && (button.dataset.focusField || '') === editing.focusField)
      : document.querySelector(`[data-action="${editing.id ? 'edit-category' : 'add-category'}"]`);
    (returnFocus || $('main')).focus({preventScroll: true});
    toast('Saved to this computer. A previous-version backup was kept.');
  } catch(error) { $('form-error').textContent = error.message; }
  finally { $('save-button').disabled=false; }
}
async function download(kind) {
  if (!local) return;
  try {
    const response = await fetch('/api/'+kind,{headers:{'X-Library-Token':token}});
    if (!response.ok) { const result = await response.json(); throw new Error(result.error); }
    const url = URL.createObjectURL(await response.blob()), a=document.createElement('a');
    a.href=url; a.download=kind === 'export' ? 'Paper-Graveyard-public.zip' : 'Paper-Graveyard-private-backup.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast(kind === 'export' ? 'Public ZIP downloaded. Review it before uploading.' : 'Private backup downloaded. Keep it in a safe place.');
  } catch(error) { toast(error.message); }
}
document.addEventListener('click',event=>{
  const button = event.target.closest('[data-action], [data-edit-paper], [data-tag]');
  if (!button) return;
  if (button.dataset.editPaper) {
    openEditor('paper',button.dataset.editPaper);
    if (button.dataset.focusField) $('editor-form').elements.namedItem(button.dataset.focusField)?.focus();
    return;
  }
  if (button.dataset.tag) { const tag=button.dataset.tag; activeTag=activeTag===tag?'':tag; renderPapers(); [...$('paper-grid').querySelectorAll('[data-tag]')].find(b=>b.dataset.tag===tag)?.focus(); return; }
  const action=button.dataset.action;
  if (action==='add-category') openEditor('category');
  if (action==='edit-category') openEditor('category',currentId);
  if (action==='add-paper') openEditor('paper');
  if (action==='close-editor') $('editor').close();
  if (action==='backup') download('backup');
  if (action==='export') download('export');
});
$('editor-form').addEventListener('submit',saveEditor);
$('paper-search').addEventListener('input',renderPapers);
$('topic-filter').addEventListener('change',renderPapers);
$('include-children').addEventListener('change',renderPapers);
$('notes-only').addEventListener('change',renderPapers);
function resetFilters() { activeTag=''; $('paper-search').value=''; $('topic-filter').value=''; $('include-children').checked=false; $('notes-only').checked=false; }
$('clear-filters').addEventListener('click',()=>{resetFilters();renderPapers();});
async function init() {
  try {
    if (['127.0.0.1','localhost'].includes(location.hostname)) {
      const response = await fetch('/api/library');
      if (response.ok) { const result=await response.json(); if (result.data && result.token) { library=result.data;token=result.token;revision=result.revision;local=true; } }
    }
    if (!local) {
      const results = await Promise.all(['categories.json','papers.json'].map(async name=>{const r=await fetch(name);if(!r.ok)throw new Error('Library data unavailable.');return r.json();}));
      library={categories:results[0],papers:results[1]};
    }
    if (!Array.isArray(library.categories) || !Array.isArray(library.papers)) throw new Error('Invalid library data.');
    $('mode').textContent=local?'LOCAL / EDITABLE':'PUBLIC / READ ONLY';
    document.querySelectorAll('.local-only').forEach(e=>e.hidden=!local);
    render();
    createPageTransitions({main: $('main'), render: () => {resetFilters(); render();}, depth: hash => {
      if (!hash.startsWith('#library')) return 0;
      let id; try {id = decodeURIComponent(hash.slice('#library/'.length));} catch {id = '';}
      return 1 + (hash.startsWith('#library/') ? pathTo(id).length : 0);
    }});
  } catch(error) { $('load-error').hidden=false; $('load-error').textContent='Unable to open the library. Start the local launcher, or check that papers.json and categories.json are present in the public site. '+error.message; $('mode').textContent='UNAVAILABLE'; }
}
// Original generative thread illustration: pointer response, no external assets.
const canvas=$('thread-canvas'), context=canvas.getContext('2d'), reduced=matchMedia('(prefers-reduced-motion: reduce)'), pointer={x:0,y:0};
let frame=0, phase=0;
function drawThreads() {
  if ($('home-view').hidden || !context) return;
  const box=canvas.getBoundingClientRect();if(!box.width || !box.height)return;
  const dpr=Math.min(devicePixelRatio||1,2);canvas.width=box.width*dpr;canvas.height=box.height*dpr;context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,box.width,box.height);
  const w=box.width,h=box.height,scale=Math.min(w,h)*.38,cx=w*.5,cy=h*.49;
  context.lineWidth=.65;
  for(let strand=0;strand<44;strand++) {
    context.beginPath();context.strokeStyle=`rgba(20,22,21,${.22+(strand%5)*.08})`;
    for(let step=0;step<130;step++) {
      const t=step/129*Math.PI*2,offset=strand*.137;
      const radius=1+.14*Math.sin(t*5+offset*2)+.07*Math.cos(t*11-offset);
      const x=cx+scale*(Math.cos(t+offset*.12)*radius*.82+.18*Math.sin(t*3+offset+phase)) + pointer.x*Math.sin(t+offset)*14;
      const y=cy+scale*(Math.sin(t)*radius+.15*Math.cos(t*4+offset-phase)) + pointer.y*Math.cos(t-offset)*14;
      step?context.lineTo(x,y):context.moveTo(x,y);
    }context.closePath();context.stroke();
  }
  context.beginPath();context.fillStyle='#47f514';context.arc(cx+scale*.66,cy-scale*.25,5,0,Math.PI*2);context.fill();
}
function scheduleDraw() {if(frame)return;frame=requestAnimationFrame(()=>{frame=0;drawThreads();});}
canvas.addEventListener('pointermove',event=>{if(reduced.matches)return;const box=canvas.getBoundingClientRect();pointer.x=(event.clientX-box.left)/box.width-.5;pointer.y=(event.clientY-box.top)/box.height-.5;phase=pointer.x*.5;scheduleDraw();});
canvas.addEventListener('pointerleave',()=>{pointer.x=pointer.y=phase=0;scheduleDraw();});
new ResizeObserver(scheduleDraw).observe(canvas);
init();
