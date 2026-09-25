# OpsDesk — IT Operations Console

A fictional, portfolio-ready IT service and operations demonstration with connected support tickets, equipment, maintenance, access requests, simulated backups, knowledge articles, reporting, and activity history.

## Run locally
Open `index.html` in a modern browser. It is a client-side demonstration that persists changes in the browser using localStorage. `dashboard.js` powers the demo-labelled activity chart and clickable metric shortcuts; `flows.js` contains the validated record creation, dialogs, simulated backup, and CSV flows. Internet access is only needed for the optional Google Fonts.

## Demo workflows
- Switch between Admin, Technician, and Requester demo roles.
- Create tickets and assets, connect tickets to devices, and update ticket status with an activity record.
- Schedule maintenance against an asset and progress or complete the work order.
- Submit access requests and approve or reject them as Admin.
- Record a simulated backup job and review its demo status.
- Add knowledge articles, search all sections, and export ticket or activity data to CSV.
- Use the `?` help button to reset fictional seed data.

## Safety and scope
All people, organizations, equipment, tickets, and backup events are fictional. The app has no server, production authentication, external integrations, or real database backup execution. Role switching is an illustrative UI feature, not a security boundary. Do not enter real company information or credentials.

## Production extension path
A production-oriented implementation would move persistence to a server API and relational database, enforce identity and role permissions server-side, add migrations and durable audit storage, and only then configure any approved integrations.
