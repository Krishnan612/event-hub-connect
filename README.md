# CSE Department Events Portal

A dynamic events portal for Computer Science & Engineering departments. Replaces scattered Google Forms with a centralized registration hub.

## Features

- **Students**: Browse events, register with validation, view past events archive
- **Admins**: CRUD events, toggle registration, export CSV registrations
- **Department**: Digital archive for NAAC/NBA accreditation

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + TypeScript
- **Backend**: Lovable Cloud (PostgreSQL, Auth, Edge Functions)
- **For external backend**: See `docs/SPRING_BOOT_API_SPEC.md`

## Quick Start

```bash
bun install
bun run dev
```

## Database Schema

- `events` - Event details (title, type, date, deadline, venue, capacity)
- `registrations` - Student registrations (name, email, roll number)
- `profiles` - User profiles with admin/student roles

## Admin Access

To create an admin user, update a profile's role in the database:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/events` | GET | List all events |
| `/events/:id` | GET | Get event details |
| `/registrations` | POST | Register for event |
| `/functions/v1/export-registrations` | GET | Export CSV (admin) |

## Documentation

- [Spring Boot API Spec](./docs/SPRING_BOOT_API_SPEC.md) - For external Java backend implementation

---

Built with [Lovable](https://lovable.dev)
