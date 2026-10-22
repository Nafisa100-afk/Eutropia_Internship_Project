# API (real backend: Eutropia ComplaintManagement)
Base: `/api` (Vite proxy -> http://127.0.0.1:8000). Auth: `Authorization: Bearer <access>`.

| Frontend use | Method + endpoint |
|---|---|
| Login | POST /api/token/ {username,password} -> {access,refresh} |
| Refresh | POST /api/token/refresh/ |
| Register (customer) | POST /api/accounts/register/ |
| Tickets list / detail | GET /api/tickets/tickets/ , /{id}/ |
| Submit ticket | POST /api/tickets/tickets/ {subject,description,priority} |
| Status / priority | PATCH /api/tickets/tickets/{id}/update_status/ , update_priority/ |
| Assign (admin) | PATCH /api/tickets/tickets/{id}/assign_agent/ {agent_id} |
| SLA deadlines | GET /api/sla/ |
| Dashboard KPIs | GET /api/dashboard/summary/ |
| Notifications | GET /api/notifications/ |
| Activity log | GET /api/logs/ |

Report fields (all endpoints that create/return a ticket): `category` (roads | drainage | waste | lighting | other), `category_display`, `location`, `road`, `ward`, `incident_date` (YYYY-MM-DD, not in the future). `location` and `ward` are required when a ticket is created (`POST /api/tickets/tickets/` and `POST /api/tickets/tickets/guest/`).

| Staff edit report details (agent/admin) | PATCH /api/tickets/tickets/{id}/update_details/ {category?,location?,road?,ward?,incident_date?} |

Role mapping: customer -> citizen, agent -> agent, admin -> admin, mayor -> mayor (view-only). Backend-e "me" endpoint nai, tai role `detectRole()` (src/lib/api.ts) diye probe kore bojha hoy.
