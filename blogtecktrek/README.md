# Blog API — Node.js, Express, MongoDB, JWT, Joi (MVC)

A RESTful API for a Blog System & User Management, built with Express, Mongoose, JWT authentication, and Joi validation, following the MVC architecture.

## 1. Setup

```bash
cd blog-api
npm install
```

Edit `.env` and set a real `MONGO_URI` (local MongoDB or Atlas) and a strong `JWT_SECRET`:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/blog_api
JWT_SECRET=change_this_to_a_long_random_secret_string
JWT_EXPIRES_IN=7d
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX=10
```

## 2. Run

```bash
npm run dev     # nodemon (auto-restart)
# or
npm start       # plain node
```

Server starts on `http://localhost:5000`. Health check: `GET /`.

## 3. Project Structure

```
project-root/
├── config/db.js                 # MongoDB connection
├── controllers/                 # Business logic
├── middlewares/
│   ├── auth.middleware.js       # JWT verification -> req.user
│   ├── role.middleware.js       # restrictTo('admin') role guard
│   ├── validate.middleware.js   # Generic Joi validator
│   ├── error.middleware.js      # Centralized error handler
│   └── upload.middleware.js     # Multer image uploads
├── models/                      # Mongoose schemas (User, Post, Comment)
├── routes/                      # Route -> middleware -> controller wiring
├── validations/                 # Joi schemas
├── utils/AppError.js            # Operational error class
├── utils/asyncWrapper.js        # try/catch wrapper for async handlers
├── uploads/                     # Uploaded avatar/cover images (served at /uploads)
├── app.js                       # Express app & route mounting
└── server.js                    # Entry point (connect DB, start server)
```

## 4. Auth Flow

1. `POST /api/auth/register` → creates a user (`role: user` by default), returns a JWT.
2. `POST /api/auth/login` → verifies credentials (rate-limited), returns a JWT.
3. Send the token on protected routes: `Authorization: Bearer <token>`.
4. To test admin-only routes, register a normal user then manually flip their
   `role` to `"admin"` in MongoDB (no public "become admin" endpoint is exposed,
   by design — this must be done by a DB admin/seed script).

## 5. Endpoints

### Auth (`/api/auth`)
| Method | Path | Access |
|---|---|---|
| POST | `/register` | Public |
| POST | `/login` | Public (rate-limited) |

### Users (`/api/users`)
| Method | Path | Access |
|---|---|---|
| GET | `/` | Admin only |
| GET | `/:id` | Authenticated |
| PUT | `/:id` | Owner or Admin (multipart/form-data for `avatar` upload) |
| DELETE | `/:id` | Admin only |

### Posts (`/api/posts`)
| Method | Path | Access |
|---|---|---|
| GET | `/?page=&limit=&search=&category=&author=&sort=` | Public |
| GET | `/:id` | Public (returns post + populated author + comments) |
| POST | `/` | Authenticated (multipart/form-data for `coverImage` upload) |
| PUT | `/:id` | Owner or Admin |
| DELETE | `/:id` | Owner or Admin |

### Comments
| Method | Path | Access |
|---|---|---|
| POST | `/api/posts/:postId/comments` | Authenticated |
| DELETE | `/api/comments/:id` | Owner or Admin |

## 6. Example Requests

**Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@test.com","password":"password123"}'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@test.com","password":"password123"}'
```

**Create a post (with cover image)**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer <TOKEN>" \
  -F "title=My First Blog Post" \
  -F "content=This is the content of the post." \
  -F "category=tech" \
  -F "tags=node,express" \
  -F "coverImage=@/path/to/image.jpg"
```

**List posts with search + pagination**
```bash
curl "http://localhost:5000/api/posts?page=1&limit=5&search=node&category=tech&sort=-createdAt"
```

**Add a comment**
```bash
curl -X POST http://localhost:5000/api/posts/<POST_ID>/comments \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"text":"Great post!"}'
```

## 7. Notes

- Passwords are hashed with `bcryptjs` (12 salt rounds) and never returned in responses (`select: false` on the schema, plus explicit `-password` projections).
- All Joi validation runs through one generic `validate(schema, property)` middleware factory reused across routes.
- Ownership checks (post/comment update & delete) compare `req.user.id` against the resource's `author`/`user` field; admins bypass the check.
- The centralized error middleware distinguishes operational errors (`AppError`, safe to show) from programming errors (generic 500, details hidden) and never leaks passwords, the JWT secret, or DB connection strings.
- This was verified end-to-end with a local smoke test (register/login, validation failures, role checks 401/403, post CRUD, nested comments, ownership enforcement, 404 handler) before delivery — all passing.
