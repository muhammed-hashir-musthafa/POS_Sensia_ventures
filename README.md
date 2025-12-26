# Sensia Ventures - Full Stack Application

A complete full-stack application built with Next.js (TypeScript), Node.js/Express, and PostgreSQL featuring role-based authentication, product management, client management, order processing with dual payment methods, and comment system.

## Features

### Core Features
- **Advanced Authorization System**: Granular permission control where each user can have different permissions for each feature/page
- **Authentication & Authorization**: JWT-based auth with role-based and direct permission assignment
- **Product Management**: Full CRUD operations for products with permission checks
- **Client Management**: Complete client information management with role-based access
- **Order System**: Advanced order processing where users place orders for clients (clients don't order directly)
- **Comment System**: Permission-based comment management with granular access control
- **User Management**: Admin interface for managing users and their specific permissions
- **Permission Management**: Flexible system allowing admins to grant/revoke specific permissions to users

### Technical Features
- **Backend**: Node.js, Express, TypeScript, Sequelize ORM
- **Frontend**: Next.js 14, TypeScript, Redux Toolkit, Tailwind CSS
- **Database**: PostgreSQL with proper relationships and constraints
- **Authentication**: JWT tokens with refresh mechanism
- **Validation**: Server-side validation with express-validator
- **UI/UX**: Responsive design with Tailwind CSS and Lucide icons

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/muhammed-hashir-musthafa/POS_Sensia_ventures
cd sensia-ventures
```

### 2. Database Setup

#### Install PostgreSQL
- Download and install PostgreSQL from https://www.postgresql.org/download/
- Create a database named `sensia_ventures`

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sensia_ventures;

# Exit psql
\q
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Update .env file with your database credentials
# The .env file is already configured with default values:
# NODE_ENV=development
# PORT=5000
# JWT_SECRET=jwt_secret-oxyfinz
# JWT_EXPIRES_IN=7d
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sensia_ventures
# DB_USER=postgres
# DB_PASSWORD=password

# Start the server
npm run dev
```

The server will:
- Connect to PostgreSQL
- Create all necessary tables
- Seed initial data (roles, permissions, admin user)
- Start on http://localhost:5000

### 4. Frontend Setup

```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on http://localhost:3000

## Advanced Authorization System

### Permission Structure
The system uses a granular permission model where each user (except admins) can have different permissions on each page/feature:

- **Resources**: products, clients, orders, comments, users, payments, reports, system
- **Actions**: view, create, update, delete, permissions, settings,
- **Permission Format**: `resource:action` (e.g., `comments:view`, `orders:create`)

### User Roles & Default Permissions

#### Super Admin
- **Email**: superadmin@example.com
- **Password**: superadmin123
- **Permissions**: ALL permissions on ALL resources

#### Admin
- **Email**: admin@example.com
- **Password**: admin123
- **Permissions**: Most permissions (excluding system-level and user deletion)

#### Manager
- **Email**: manager@example.com
- **Password**: manager123
- **Permissions**: Operational permissions (products: view/update, orders: view/create/update, etc.)

#### Supervisor
- **Email**: supervisor@example.com
- **Password**: supervisor123
- **Permissions**: Limited permissions (products: view, orders: view/create, payments: process)

#### Cashier
- **Email**: cashier@example.com
- **Password**: cashier123
- **Permissions**: Basic permissions (products: view, orders: view/create, payments: process)

### Custom Permission Examples

**Example 1**: User who can view and delete comments, but not update:
- `comments:view` ✅
- `comments:delete` ✅
- `comments:update` ❌

**Example 2**: User who can only view comments and place orders:
- `comments:view` ✅
- `comments:create` ❌
- `orders:create` ✅

### Key Authorization Features

1. **Role-Based Permissions**: Users inherit permissions from their roles
2. **Direct Permissions**: Admins can grant/revoke specific permissions to individual users
3. **Permission Hierarchy**: Direct permissions override role permissions
4. **Expiring Permissions**: Permissions can have expiration dates
5. **Conditional Permissions**: Permissions can have conditions
6. **Audit Logging**: All permission changes and access attempts are logged

### Order Management Flow
- **Clients cannot place orders directly**
- **Users search for clients and place orders for them**
- This ensures proper oversight and control over the ordering process

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/:id` - Get single client
- `POST /api/clients` - Create client (Admin only)
- `PUT /api/clients/:id` - Update client (Admin only)
- `DELETE /api/clients/:id` - Delete client (Admin only)

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order (Admin/User)
- `PUT /api/orders/:id` - Update order (Admin only)
- `DELETE /api/orders/:id` - Delete order (Admin only)

### Comments
- `GET /api/comments` - Get all comments
- `GET /api/comments/:id` - Get single comment
- `POST /api/comments` - Create comment (Authenticated users)
- `PUT /api/comments/:id` - Update comment (Owner/Admin only)
- `DELETE /api/comments/:id` - Delete comment (Owner/Admin only)

## Database Schema

### Tables
1. **roles** - User roles (admin, Manager, supervisor..)
2. **permissions** - System permissions
3. **role_permissions** - Role-permission mapping
4. **users** - User accounts with role assignment
5. **products** - Product catalog
6. **clients** - Client information
7. **orders** - Order records with dual payment support
8. **order_items** - Order line items
9. **comments** - User comments

### Key Relationships
- Users belong to Roles
- Roles have many Permissions (many-to-many)
- Orders belong to Clients
- Orders have many OrderItems
- OrderItems belong to Products
- Comments belong to Users

## Permission System

### Admin Role
- Full access to all resources
- Can create, read, update, delete all entities
- Can manage users and roles

### User Role
- Can view products, clients, orders
- Can create orders and comments
- Can only edit/delete own comments


## Dual Payment System

Orders support two payment methods simultaneously:
- **Payment Method 1**: Cash, Card, Bank Transfer
- **Payment Method 2**: Cash, Card, Bank Transfer
- **Validation**: Total of both payments must equal order amount
- **Use Case**: Split payments (e.g., partial cash + partial card)

## Development Commands

### Backend
```bash
cd server
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Frontend
```bash
cd client
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
sensia-ventures/
├── server/                 # Backend application
│   ├── src/
│   │   ├── config/        # Database and environment config
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Authentication middleware
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # API routes
│   │   ├── seeders/       # Database seeders
│   │   └── server.ts      # Main server file
│   ├── .env               # Environment variables
│   └── package.json
├── client/                # Frontend application
│   ├── src/
│   │   ├── app/          # Next.js app directory
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and API config
│   │   └── store/        # Redux store and slices
│   ├── .env.local        # Environment variables
│   └── package.json
└── README.md
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Sequelize** - ORM for PostgreSQL
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **express-validator** - Input validation

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Hook Form** - Form handling
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

### Database
- **PostgreSQL** - Primary database
- **Sequelize** - ORM and migrations

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- SQL injection prevention through ORM

## Production Deployment

### Environment Variables
Update the following for production:

**Backend (.env)**
```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### Build Commands
```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd client
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.