/* Interaction flows for the fictional, browser-only OpsDesk demonstration. */
let modalReturnFocus = null;
function showModal(title, body) {
  modalReturnFocus = document.activeElement;
  $('#modalRoot').innerHTML = `<div class="modal-backdrop" data-close="1"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><header class="modal-head"><h2 id="modalTitle">${esc(title)}</h2><button class="modal-close" type="button" aria-label="Close dialog" data-close="1">×</button></header><div class="modal-body">${body}</div></section></div>`;
  $('#modalRoot').querySelector('.modal-close').focus();
}

function formModal(title, form, submitLabel = 'Save demo record') {
  showModal(title, `<form data-form="${form}" novalidate>${form === 'ticket' ? `
    <div class="form-grid">
      <div class="field full"><label for="ticketTitle">What do you need help with?</label><input id="ticketTitle" name="title" maxlength="100" required placeholder="For example, laptop won’t connect to Wi-Fi"></div>
      <div class="field"><label for="ticketCategory">Category</label><select id="ticketCategory" name="category"><option>Hardware</option><option>Business application</option><option>Account</option><option>Access</option><option>Database</option><option>Network</option><option>Other</option></select></div>
      <div class="field"><label for="ticketPriority">Priority</label><select id="ticketPriority" name="priority"><option>Low</option><option selected>Medium</option><option>High</option></select><small class="field-hint">High: work is blocked or affects several people. Critical: use the emergency process (not represented in this demo).</small></div>
      <div class="field full"><label for="ticketDescription">Details</label><textarea id="ticketDescription" name="description" maxlength="800" required placeholder="Describe what happened and what you have already tried."></textarea></div>
    </div>` : form === 'asset' ? `
    <div class="form-grid"><div class="field"><label for="assetTag">Asset tag</label><input id="assetTag" name="tag" required placeholder="DEMO-001"></div><div class="field"><label for="assetName">Device name</label><input id="assetName" name="name" required placeholder="Laptop or monitor"></div><div class="field"><label for="assetType">Type</label><select id="assetType" name="type"><option>Laptop</option><option>Monitor</option><option>Printer</option><option>Dock</option><option>Network</option><option>Other</option></select></div><div class="field"><label for="assetUser">Assigned user</label><input id="assetUser" name="user" value="Unassigned"></div></div>` : form === 'maintenance' ? `
    <div class="form-grid"><div class="field"><label for="maintenanceAsset">Asset</label><select id="maintenanceAsset" name="asset">${db.assets.map(a=>`<option value="${esc(a.tag)}">${esc(a.tag)} — ${esc(a.name)}</option>`).join('')}</select></div><div class="field"><label for="maintenanceDue">Due date</label><input id="maintenanceDue" name="due" type="date" required></div><div class="field full"><label for="maintenanceTask">Work to perform</label><input id="maintenanceTask" name="task" required maxlength="100"></div></div>` : form === 'access' ? `
    <div class="form-grid"><div class="field"><label for="accessApp">Application</label><select id="accessApp" name="app">${db.apps.map(a=>`<option>${esc(a.name)}</option>`).join('')}</select></div><div class="field"><label for="accessLevel">Access requested</label><select id="accessLevel" name="access"><option>Read-only</option><option>Standard access</option><option>Report viewer</option></select></div><div class="field full"><label for="accessReason">Business reason</label><textarea id="accessReason" name="reason" required maxlength="400"></textarea></div></div>` : `
    <div class="form-grid"><div class="field"><label for="articleType">Topic</label><input id="articleType" name="type" required></div><div class="field"><label for="articleTitle">Title</label><input id="articleTitle" name="title" required maxlength="100"></div><div class="field full"><label for="articleSummary">Guidance summary</label><textarea id="articleSummary" name="summary" required maxlength="800"></textarea></div></div>`}
    <p class="form-error" role="alert" hidden></p><div class="modal-actions"><button class="btn" type="button" data-close="1">Cancel</button><button class="btn primary" type="submit">${esc(submitLabel)}</button></div></form>`);
  const first = $('#modalRoot').querySelector('input,select,textarea');
  if (first) first.focus();
}

function openTicket() { formModal('Create a support ticket', 'ticket', 'Create ticket'); }
function openAsset(id) {
  if (id) return assetDetail(id);
  formModal('Register a demo asset', 'asset');
}
function openMaintenance() { formModal('Schedule maintenance', 'maintenance'); }
function openAccess() { formModal('Request demo access', 'access', 'Submit request'); }
function openArticle() { formModal('Add a knowledge article', 'article'); }

function nextId(prefix, rows, start) {
  const max = rows.reduce((n, row) => Math.max(n, Number(String(row.id || row.tag).match(/\d+$/)?.[0] || 0)), start - 1);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

function submitForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const error = form.querySelector('.form-error');
  const required = [...form.querySelectorAll('[required]')];
  const invalid = required.find(field => !field.value.trim());
  if (invalid) {
    error.textContent = 'Please complete the required fields before saving.';
    error.hidden = false;
    invalid.focus();
    return;
  }
  const kind = form.dataset.form;
  if (kind === 'ticket') {
    if (db.tickets.some(t => t.title.toLowerCase() === data.title.trim().toLowerCase())) {
      error.textContent = 'A ticket with this title already exists in the demo. Add a little more detail to distinguish it.';
      error.hidden = false;
      form.elements.title.focus();
      return;
    }
    const id = nextId('HD-', db.tickets, 2842);
    db.tickets.unshift({ id, title: data.title.trim(), category: data.category, priority: data.priority, status: 'New', requester: name(), assignee: 'Unassigned', asset: '', created: new Date().toISOString(), description: data.description.trim(), comments: [] });
    log(`Created ticket ${id}`, data.title.trim());
    view = 'tickets'; filter = 'All'; query = '';
  } else if (kind === 'asset') {
    const tag = data.tag.trim().toUpperCase();
    if (db.assets.some(a => a.tag.toLowerCase() === tag.toLowerCase())) { error.textContent = 'That asset tag is already in use. Choose a unique demo tag.'; error.hidden = false; form.elements.tag.focus(); return; }
    db.assets.unshift({ tag, name: data.name.trim(), type: data.type, serial: `DEMO-${tag}`, status: 'In service', user: data.user.trim() || 'Unassigned', location: 'Demo location', purchase: new Date().toISOString().slice(0,10), warranty: new Date(Date.now()+365*86400000).toISOString().slice(0,10) });
    log(`Registered asset ${tag}`, data.name.trim()); view='assets'; filter='All'; query='';
  } else if (kind === 'maintenance') {
    const id = nextId('MN-', db.maintenance, 105);
    db.maintenance.unshift({ id, asset:data.asset, task:data.task.trim(), assignee:name(), due:data.due, status:'Scheduled', notes:'Created in the fictional demo.' });
    log(`Scheduled maintenance ${id}`, `${data.task.trim()} · ${data.asset}`); view='maintenance'; filter='All'; query='';
  } else if (kind === 'access') {
    const id = nextId('AR-', db.requests, 92);
    db.requests.unshift({ id, user:name(), app:data.app, access:data.access, reason:data.reason.trim(), status:'Pending', submitted:new Date().toISOString().slice(0,10) });
    log(`Submitted access request ${id}`, `${data.app} · ${data.access}`); view='access'; filter='All'; query='';
  } else {
    const id = nextId('KB-', db.articles, 15);
    db.articles.unshift({ id, type:data.type.trim(), title:data.title.trim(), summary:data.summary.trim() });
    log(`Added knowledge article ${id}`, data.title.trim()); view='knowledge'; query='';
  }
  $('#modalRoot').innerHTML = '';
  save();
  $('#main').focus({preventScroll:true});
  toast(kind === 'ticket' ? 'Ticket created in the demo queue' : 'Demo record saved');
}

function runBackup() {
  const now = new Date();
  const id = nextId('BK-', db.backups, 523);
  const system = ['Finance Demo DB','Operations Demo DB','Reporting Demo DB'][db.backups.length % 3];
  const scheduled = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  db.backups.unshift({ id, system, scheduled, status:'Success', duration:'00m 04s', size:'Demo only', summary:'Simulated run completed. No database was accessed or copied.' });
  log(`Simulated backup ${id}`, `${system} · completed successfully (demo only)`);
  filter='All'; view='backups'; save(); $('#main').focus({preventScroll:true}); toast('Simulated backup completed; no database was accessed');
}

function ticketDetail(id) {
  const ticket = db.tickets.find(t => t.id === id); if (!ticket) return toast('Ticket not found in this demo view');
  showModal(`${ticket.id} · ${ticket.title}`, `<p class="detail-description">${esc(ticket.description || 'No description was provided.')}</p><dl class="detail-grid"><div class="detail-field"><span>Priority</span><strong>${esc(ticket.priority)}${['High','Critical'].includes(ticket.priority)?' — blocks work or affects multiple people':''}</strong></div><div class="detail-field"><span>Status</span><strong>${esc(ticket.status)}</strong></div><div class="detail-field"><span>Requester</span><strong>${esc(ticket.requester)}</strong></div><div class="detail-field"><span>Assignee</span><strong>${esc(ticket.assignee)}</strong></div></dl><h3>Activity</h3>${ticket.comments?.length ? ticket.comments.map(c=>`<div class="comment"><strong>${esc(c.by)} · ${timeDate(c.at)}</strong>${esc(c.text)}</div>`).join('') : '<p class="empty">No updates yet. Changes will appear here.</p>'}<div class="modal-actions"><button class="btn primary" data-close="1">Done</button></div>`);
}
function assetDetail(tag) {
  const a=db.assets.find(x=>x.tag===tag); if(!a) return toast('Asset not found in this demo view');
  showModal(`${esc(a.tag)} · ${esc(a.name)}`, `<dl class="detail-grid"><div class="detail-field"><span>Type</span><strong>${esc(a.type)}</strong></div><div class="detail-field"><span>Status</span><strong>${esc(a.status)}</strong></div><div class="detail-field"><span>Assigned to</span><strong>${esc(a.user)}</strong></div><div class="detail-field"><span>Location</span><strong>${esc(a.location)}</strong></div><div class="detail-field"><span>Serial</span><strong>${esc(a.serial)}</strong></div><div class="detail-field"><span>Linked tickets</span><strong>${db.tickets.filter(t=>t.asset===tag).length}</strong></div></dl><div class="modal-actions"><button class="btn" data-action="asset-retire" data-id="${esc(tag)}">${a.status==='Retired'?'Restore asset':'Retire asset'}</button><button class="btn primary" data-close="1">Close</button></div>`);
}
function articleDetail(id) {
  const a=db.articles.find(x=>x.id===id); if(!a) return toast('Article not found in this demo view');
  showModal(`${a.id} · ${a.title}`, `<p class="article-type">${esc(a.type)}</p><p class="detail-description">${esc(a.summary)}</p><p class="footer-note">Fictional guidance for this portfolio demonstration.</p><div class="modal-actions"><button class="btn primary" data-close="1">Close</button></div>`);
}
function csv(filename, headers, rows) {
  const quote = value => `"${String(value ?? '').replaceAll('"','""')}"`;
  const content = [headers, ...rows].map(row=>row.map(quote).join(',')).join('\r\n');
  const link=document.createElement('a'); link.href=URL.createObjectURL(new Blob([content],{type:'text/csv;charset=utf-8'})); link.download=filename; link.click(); URL.revokeObjectURL(link.href); toast('CSV export downloaded');
}
