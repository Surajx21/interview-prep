# Interview Prep App

An AI-powered interview preparation application built with the [T3 Stack](https://create.t3.gg/).

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Authentication:** [Better Auth](https://www.better-auth.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team)
- **API:** [tRPC](https://trpc.io)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **AI:** [Vercel AI SDK](https://sdk.vercel.ai/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/) (recommended) or npm/pnpm/yarn
- [PostgreSQL](https://www.postgresql.org/) database

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd interview-prep
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env  # if you have .env.example
# or create .env manually
```

Add the following environment variables to your `.env` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/interview_prep"

# Authentication
BETTER_AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"

# AI
AI_GATEWAY_API_KEY="your-ai-gateway-api-key"
```

### 4. Set Up the Database

Push the database schema:
```bash
bun run db:push
```

Or run migrations:
```bash
bun run db:generate  # Generate migrations
bun run db:migrate   # Run migrations
```

To open Drizzle Studio (database GUI):
```bash
bun run db:studio
```

### 5. Run the Development Server

```bash
bun run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `bun run dev` - Start development server with Turbopack
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Fix ESLint errors
- `bun run format:check` - Check code formatting
- `bun run format:write` - Format code with Prettier
- `bun run typecheck` - Run TypeScript type checking
- `bun run check` - Run lint and typecheck
- `bun run db:push` - Push schema changes to database
- `bun run db:generate` - Generate migrations
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio

## Project Structure

```
interview-prep/
├── drizzle/              # Database migrations
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (auth)/       # Authentication pages
│   │   ├── (dashboard)/  # Dashboard pages
│   │   └── api/          # API routes
│   ├── components/       # React components
│   │   ├── ai-elements/  # AI-specific components
│   │   ├── chat/         # Chat components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components (shadcn)
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── server/           # Server-side code
│   │   ├── api/          # tRPC routers
│   │   └── db/           # Database schema and client
│   ├── styles/           # Global styles
│   ├── trpc/             # tRPC client setup
│   └── types/            # TypeScript types
├── drizzle.config.ts     # Drizzle configuration
└── package.json
```

## Features

- 🔐 **Authentication** - Sign up, sign in, and user management with Better Auth
- 💬 **AI Chat** - Interactive interview preparation with AI
- 📊 **Interview Tracking** - Track your interview preparation progress
- 🎨 **Modern UI** - Beautiful and responsive design with shadcn/ui
- 🌙 **Dark Mode** - Built-in theme switching
- 📱 **Responsive** - Works on desktop and mobile devices

## Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add your environment variables in Vercel project settings
4. Deploy!

### Database Setup for Production

Make sure to set up a PostgreSQL database for production. Options include:

- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Neon](https://neon.tech/)
- [Supabase](https://supabase.com/)
- [Railway](https://railway.app/)

## Learn More

- [T3 Stack Documentation](https://create.t3.gg/)
- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Better Auth Documentation](https://www.better-auth.com/docs)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to Make a Pull Request

Follow these steps to contribute to the project:

#### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page to create your own copy.

#### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/interview-prep.git
cd interview-prep
```

#### 3. Create a New Branch

Always create a new branch for your changes:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation changes
- `refactor/` - for code refactoring

#### 4. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add comments where necessary
- Update documentation if needed

#### 5. Test Your Changes

Before committing, make sure everything works:

```bash
# Type check
bun run typecheck

# Lint your code
bun run lint

# Format your code
bun run format:write

# Run all checks
bun run check

# Test the app locally
bun run dev
```

#### 6. Commit Your Changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add new feature"
# or
git commit -m "fix: resolve issue with login"
```

Commit message conventions:
- `feat:` - new feature
- `fix:` - bug fix
- `docs:` - documentation changes
- `style:` - formatting, missing semicolons, etc.
- `refactor:` - code refactoring
- `test:` - adding tests
- `chore:` - maintenance tasks

#### 7. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

#### 8. Create a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template with:
   - **Title:** Clear, concise description of changes
   - **Description:** What changes you made and why
   - **Screenshots:** If UI changes are involved
   - **Testing:** How you tested your changes
4. Click "Create pull request"

#### 9. Respond to Feedback

- Be responsive to review comments
- Make requested changes promptly
- Push new commits to the same branch (they'll automatically appear in the PR)

#### 10. After Your PR is Merged

Once your PR is merged:

```bash
# Switch back to main branch
git checkout main

# Pull the latest changes
git pull upstream main

# Delete your feature branch (optional)
git branch -d feature/your-feature-name
```

### Pull Request Guidelines

- ✅ Keep PRs focused on a single feature or fix
- ✅ Write clear descriptions and commit messages
- ✅ Test your changes thoroughly
- ✅ Update documentation if needed
- ✅ Follow the existing code style
- ❌ Don't commit `.env` files or sensitive data
- ❌ Don't include unrelated changes
- ❌ Don't submit large PRs without prior discussion

### Need Help?

If you're new to contributing or have questions, feel free to:
- Open an issue to discuss your changes before starting
- Ask questions in the PR comments
- Reach out to maintainers
