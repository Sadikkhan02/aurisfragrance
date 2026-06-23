# Auris Fragrance Monorepo

This repository contains three connected apps for the Auris Fragrance project:

- `backend`: Node.js/Express API
- `frontend`: customer-facing store
- `admin`: admin dashboard

## Project Structure

```text
aurisfragrance/
  backend/
  frontend/
  admin/
```

## Requirements

- Node.js 18+ recommended
- npm
- MongoDB
- Cloudinary account
- Gemini API key
- Stripe and Razorpay credentials if payment flows are enabled

## Setup

Install dependencies in each app folder:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install
```

## Environment Variables

Create a `.env` file in each app directory.

### `backend/.env`

Use the following variable names:

```env
MONGODB_URI=
PORT=4000
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
CLOUDINARY_NAME=
JWT_SECRET=
GEMINI_API_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
STRIPE_SECRET_KEY=
RAZORPAY_KEY_SECRET=
RAZORPAY_KEY_ID=
```

### `frontend/.env`

```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=
```

### `admin/.env`

```env
VITE_BACKEND_URL=http://localhost:4000
```

## Running the Apps

### Backend

```bash
cd backend
npm run start
```

For development:

```bash
npm run server
```

The API runs on `http://localhost:4000` by default.

### Frontend

```bash
cd frontend
npm run dev
```

### Admin

```bash
cd admin
npm run dev
```

## Build and Preview

For both `frontend` and `admin`:

```bash
npm run build
npm run preview
```

## API Overview

The backend exposes routes under:

- `/api/user`
- `/api/product`
- `/api/cart`
- `/api/order`
- `/api/ai`

The backend root route returns a simple health message at `/`.

## Notes

- Keep secrets out of version control.
- Use the backend URL consistently in both client apps.
- The existing `frontend/README.md` and `admin/README.md` are the default Vite starter docs; this root README is the main project guide.

