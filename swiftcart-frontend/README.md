# SwiftCart Frontend

React + TypeScript frontend application for the SwiftCart E-Commerce Platform.

## 🚀 Quick Start

### Installation

```bash
npm install
# or
pnpm install
```

### Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
```

Update `VITE_API_URL` to point to your backend API (default: `http://localhost:3000/api`)

### Development

```bash
npm run dev
# or
pnpm run dev
```

The frontend will start on http://localhost:8080

### Build

```bash
npm run build
# or
pnpm run build
```

### Preview Production Build

```bash
npm run preview
# or
pnpm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API client
│   ├── types/          # TypeScript type definitions
│   └── data/           # Static data (mock data)
├── public/             # Static assets
└── package.json
```

## 🔧 Configuration

### API URL

The frontend connects to the backend API. Configure the API URL in `.env`:

```env
VITE_API_URL=http://localhost:3000/api
```

### Path Aliases

The project uses path aliases configured in `tsconfig.json`:

- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/hooks` → `src/hooks`
- `@/types` → `src/types`

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Data fetching and caching
- **React Router** - Routing

## 📝 Notes

- Ensure the backend server is running before starting the frontend
- The frontend expects the backend API at the URL specified in `VITE_API_URL`
- CORS is configured on the backend to allow requests from `http://localhost:8080`

