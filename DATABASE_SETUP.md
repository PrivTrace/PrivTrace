# Database Setup Guide

## MongoDB with Docker

This project uses MongoDB as the database, running in a Docker container for easy setup and management.

### Prerequisites

- Docker and Docker Compose installed on your system
- Node.js and npm/pnpm/yarn installed

### Quick Start

1. **Start the MongoDB server:**

    ```bash
    npm run db:up
    ```

    This will start MongoDB on `localhost:27017`

2. **Start your Next.js application:**

    ```bash
    npm run dev
    ```

3. **Test the database connection:**
   Visit `http://localhost:3000/api/db-test` to verify the database connection.

### Database Management

#### Available Scripts

- `npm run db:up` - Start MongoDB container
- `npm run db:down` - Stop and remove containers
- `npm run db:logs` - View MongoDB logs
- `npm run db:reset` - Reset database (removes all data)

#### Mongo Express UI

Access the database management interface at `http://localhost:8081`

- Username: `admin`
- Password: `admin123`

### Database Configuration

The MongoDB setup includes:

- **Database Name:** `dsr_management`
- **Application User:** `dsr_user` / `dsr_password123`
- **Admin User:** `admin` / `password123`

### Environment Variables

The following environment variables are configured in `.env.local`:

```env
MONGODB_URI=mongodb://dsr_user:dsr_password123@localhost:27017/dsr_management
MONGODB_DB=dsr_management
```

### Database Schema

#### Collections

1. **companies** - Company information and details
2. **dsrs** - Daily Sales Reports and related data
3. **users** - User accounts and authentication

#### Sample Operations

The database operations are abstracted in `lib/db-operations.ts`:

```typescript
import { createCompany, getDSRsByCompany } from "@/lib/db-operations";

// Create a new company
await createCompany({
    name: "Acme Corp",
    identifier: "acme-corp",
    address: "123 Business St",
    contactEmail: "contact@acme.com",
});

// Get DSRs for a company
const dsrs = await getDSRsByCompany("company-id");
```

### Troubleshooting

1. **Connection Issues:**

    - Ensure Docker is running
    - Check if port 27017 is available
    - Verify environment variables in `.env.local`

2. **Reset Database:**

    ```bash
    npm run db:reset
    ```

3. **View Logs:**

    ```bash
    npm run db:logs
    ```

### Production Considerations

For production deployment:

1. Change default passwords in `docker-compose.yml`
2. Use environment variables for sensitive data
3. Consider using a managed MongoDB service (MongoDB Atlas)
4. Enable authentication and SSL/TLS
5. Set up regular backups
