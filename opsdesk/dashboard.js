function metric(l, v, f, tone = '', target = '', filterValue = 'All') {
  const clsName = `metric ${tone} ${target ? 'metric-action' : ''}`;
  const action = target ? ` data-shortcut="${target}" data-shortcut-filter="${filterValue}" aria-label="${l}: ${v}. ${f}. Open matching ${pageNames[target]} records."` : '';
  const tag = target ? 'button' : 'div';
  return `<${tag} class="${clsName}"${action}><div class="metric-label">${l}</div><div class="metric-value">${v}</div><div class="metric-foot ${tone === 'attention' ? 'down' : tone === 'good' ? 'up' : ''}">${f}</div>${target ? '<span class="metric-open" aria-hidden="true">View records →</span>' : ''}</${tag}>`;
}

function dashboard() {
  const open = db.tickets.filter(t => !['Resolved', 'Closed'].includes(t.status));
  const high = open.filter(t => ['High', 'Critical'].includes(t.priority)).length;
  const pending = db.requests.filter(r => r.status === 'Pending').length;
  const inService = db.assets.filter(a => a.status === 'In service').length;
  const maintenanceCount = db.maintenance.filter(m => m.status !== 'Completed').length;
  const alertCount = db.backups.filter(b => ['Warning', 'Failed'].includes(b.status)).length;
  const days = ['Thu 17 Sep', 'Fri 18 Sep', 'Sat 19 Sep', 'Sun 20 Sep', 'Mon 21 Sep', 'Tue 22 Sep', 'Wed 23 Sep'];
  const created = [1, 1, 2, 1, 2, 3, 2], resolved = [0, 1, 1, 0, 1, 1, 2];
  return `${heading('Operations overview', 'A quick view of the fictional service desk, systems, and equipment.', `<button class="btn primary" data-action="new-ticket">＋ New ticket</button>`)}
    <div class="demo-banner" role="note"><span>DEMO DATA</span><p>Every person, count, ticket, and backup shown here is fictional sample data. Actions stay in this browser.</p></div>
    <div class="metrics">
      ${metric('Open tickets', open.length, `${high} high priority · High means work is blocked or several people are affected`, 'attention', 'tickets', 'Active')}
      ${metric('Pending access', pending, 'Awaiting an admin decision', 'attention', 'access', 'Pending')}
      ${metric('Assets in service', inService, `${db.assets.length} total demo records`, 'routine', 'assets', 'In service')}
      ${metric('Open maintenance', maintenanceCount, 'Open work orders across tracked equipment', 'routine', 'maintenance', 'All')}
      ${metric('Backup alerts', alertCount, alertCount ? 'Warnings or failures need review' : 'No open warnings', 'attention', 'backups', 'Needs review')}
    </div>
    <div class="grid-2">
      <section class="chart-panel"><div class="panel-head"><div><h2>Service desk activity</h2><p>Illustrative demo records · 17–23 September 2026</p></div><button class="link-btn" data-view="reports">View report →</button></div>
        <div class="chart" role="group" aria-label="Illustrative ticket activity, 17 to 23 September 2026">
          ${created.map((n, i) => `<div class="bar-group" role="group" aria-label="${days[i]}: ${n} created and ${resolved[i]} resolved"><div class="bar" style="height:${Math.max(n * 12, 8)}%" title="${days[i]}: ${n} tickets created" tabindex="0" aria-label="${days[i]}: ${n} tickets created"><span class="bar-value">${n}</span></div><div class="bar alt" style="height:${Math.max(resolved[i] * 12, 4)}%" title="${days[i]}: ${resolved[i]} resolved" tabindex="0" aria-label="${days[i]}: ${resolved[i]} tickets resolved"><span class="bar-value">${resolved[i]}</span></div><span class="bar-label">${days[i]}</span></div>`).join('')}
        </div><div class="legend"><span><i></i> Created</span><span><i class="alt"></i> Resolved</span><span class="chart-note">Illustrative, not live operational reporting</span></div>
      </section>
      <section class="panel"><div class="panel-head"><div><h2>Backup operations</h2><p>Latest fictional database job runs · local demo time</p></div><button class="link-btn" data-view="backups">All jobs →</button></div>
        <div class="worklist">${db.backups.slice(0, 4).map(j => `<div class="workitem"><div class="workicon ${j.status === 'Success' ? 'green' : j.status === 'Failed' ? 'red' : 'amber'}">⟳</div><div><strong>${esc(j.system)}</strong><small>${j.id} · ${esc(j.scheduled)} · ${j.duration} · ${j.size}</small></div>${badge(j.status)}</div>`).join('')}</div>
      </section>
    </div>
    ${table('Priority queue', 'High means work is blocked or affects several people; critical incidents require the real escalation process.', ['Ticket', 'Priority', 'Requester', 'Assignee', 'Status', 'Opened'], open.filter(t => ['High', 'Critical'].includes(t.priority)).slice(0, 5).map(ticketRow).join(''), `<button class="link-btn" data-shortcut="tickets" data-shortcut-filter="High priority">View all high-priority tickets →</button>`)}
    <p class="footer-note">Demo environment · all operational data is fictional.</p>`;
}
views.dashboard = dashboard;
