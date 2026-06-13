# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Supabase setup

1. Create a Supabase project at https://app.supabase.com
2. Create a table named `inventory`
   - `code` — type `text`, primary key
   - `name` — type `text`
   - `sector` — type `text`
   - `location` — type `text`
   - `status` — type `text`
   - `quantity` — type `text`
3. In Supabase, open **Settings → API** and copy:
   - `API URL`
   - `anon public` key
4. Create a `.env` file in the project root with:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

5. Install dependencies if needed:

```bash
npm install
```

6. Start the app:

```bash
npm run dev
```

## How the app works

- Reads inventory from the Supabase `inventory` table
- Uses Supabase Realtime (`postgres_changes`) to refresh the UI automatically
- Supports adding, updating, and deleting items
- Falls back to local sample data when Supabase env vars are not set

## Notes

- Never commit `.env`.
- `.env.example` shows the required public Supabase variables.
- `code` is the unique item key used for upsert, updates, and deletions.

## ESLint

If you want stronger typing and linting, consider migrating to TypeScript with `typescript-eslint`.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
