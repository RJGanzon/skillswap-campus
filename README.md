# SkillSwap Campus

A modern peer-to-peer skill exchange platform for campus communities. Students can offer and request skills, schedule learning sessions, and build reputation through ratings.

## Features

- **Skill Marketplace**: Browse, offer, and request skills across multiple categories (Academic, Tech, Creative, Sports, Language)
- **Session Management**: Request skills, accept/decline requests, track session status
- **Rating System**: Rate completed sessions with star ratings and comments
- **User Reputation**: Dynamic reputation scores calculated from session ratings using Bayesian averaging
- **Real-time Notifications**: Get notified about session requests, acceptances, and ratings
- **Direct Messaging**: Message other users about skills and sessions
- **Advanced Filtering**: Filter skills by type, category, and availability
- **Pagination**: Browse skills with efficient pagination

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Database**: PostgreSQL with [Prisma ORM](https://prisma.io)
- **Authentication**: [NextAuth.js v5](https://authjs.dev) with credentials provider
- **UI Components**: Shadcn/ui + Radix UI + Tailwind CSS
- **Styling**: Tailwind CSS v4 with custom configurations
- **Icons**: Lucide React
- **Security**: bcryptjs for password hashing, rate limiting, input validation

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Environment variables configured (see `.env.example`)

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd skillswap-campus
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values
# - DATABASE_URL: Your PostgreSQL connection string
# - NEXTAUTH_URL: http://localhost:3000 (for development)
# - NEXTAUTH_SECRET: Generate with: openssl rand -base64 32
```

### 3. Set Up Database

```bash
# Run Prisma migrations
npx prisma migrate dev

# Optional: Seed database with sample data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

```bash
# Development
npm run dev              # Start dev server (with hot reload)

# Production
npm run build           # Build for production
npm start              # Start production server

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier (if configured)

# Database
npx prisma studio    # Open Prisma Studio UI for database management
npx prisma migrate dev  # Create and run migrations
```

## Project Structure

```
src/
├── app/                 # Next.js App Router pages and layouts
│   ├── api/            # API routes (auth, webhooks)
│   ├── auth/           # Authentication pages
│   ├── dashboard/      # Dashboard
│   ├── skills/         # Skills marketplace
│   ├── sessions/       # Session management
│   ├── messages/       # Direct messaging
│   ├── profile/        # User profiles
│   └── ...
├── components/         # Reusable React components
│   ├── ui/            # Shadcn/ui components
│   └── ...
├── lib/               # Utilities and helpers
│   ├── validation.ts  # Input validation functions
│   ├── rate-limiter.ts # Rate limiting
│   ├── errors.ts      # Error handling
│   ├── notifications.ts # Notification logic
│   └── prisma.ts      # Prisma client instance
└── auth.ts            # NextAuth configuration
```

## Key Features & Recent Improvements

### Security Enhancements ✅
- **Email Validation**: Proper email format validation in registration
- **Strong Passwords**: Required passwords with uppercase, lowercase, numbers
- **Rate Limiting**: Throttle registration (3 attempts/hour) and auth endpoints
- **Input Sanitization**: Trim and validate all user inputs
- **Error Handling**: Proper error messages without stack trace exposure

### Data Integrity ✅
- **Session State Validation**: Enforce valid status transitions (PENDING → ACCEPTED → ONGOING → COMPLETED)
- **Atomic Transactions**: Rating creation and reputation updates use database transactions
- **Bayesian Reputation**: Improved reputation calculation to prevent extreme ratings

### Performance Optimizations ✅
- **Pagination**: 20 skills per page with next/previous navigation
- **Query Optimization**: Use Promise.all() for parallel queries
- **Efficient Includes**: Selective field fetching with Prisma

### User Experience ✅
- **Pagination Controls**: Browse skills with intuitive pagination
- **Error Boundaries**: Graceful error handling in server actions
- **Loading States**: Skeleton screens for all list pages
- **Form Validation**: Client-side validation on all forms

## Security Considerations

- Passwords are hashed with bcryptjs (12 rounds)
- Session tokens are validated on every request
- Rate limiting prevents brute force attacks
- SQL injection is prevented by Prisma parameterized queries
- CSRF protection via NextAuth session validation
- User IDs are validated for authorization checks

## Database Schema Highlights

- **Users**: Store profile, reputation, skills
- **Skills**: OFFER or REQUEST type, categorized, searchable
- **Sessions**: Track learning matches with status transitions
- **Ratings**: Peer-to-peer skill ratings with comments
- **Conversations**: 1:1 messaging between users
- **Notifications**: Event-driven notifications with read status

## Common Tasks

### Add a New Skill Category

1. Update Prisma schema (`prisma/schema.prisma`):
```prisma
enum Category {
  ACADEMIC
  TECH
  CREATIVE
  SPORTS
  LANGUAGE
  MUSIC      // New
  OTHER
}
```

2. Run migration: `npx prisma migrate dev --name add_music_category`

3. Update UI constants in `src/app/skills/page.tsx`

### Debug Database Issues

```bash
# Open interactive database explorer
npx prisma studio

# View current schema
npx prisma db push --skip-generate

# Reset database (development only!)
npx prisma migrate reset
```

## Troubleshooting

### "Database connection error"
- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Ensure database exists and is accessible

### "NEXTAUTH_SECRET is missing"
- Generate a new secret: `openssl rand -base64 32`
- Add to `.env.local`: `NEXTAUTH_SECRET=<generated-value>`

### "Prisma Client is not installed"
- Run: `npm install @prisma/client`
- Run: `npx prisma generate`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## Future Enhancements

- [ ] Email verification for signups
- [ ] Password reset functionality
- [ ] Real-time messaging with WebSockets
- [ ] Skill verification/endorsement system
- [ ] Calendar integration for session scheduling
- [ ] Payment system for premium tutoring
- [ ] Mobile app (React Native)
- [ ] Video call integration

## License

MIT - See LICENSE file for details

## Support

For issues or questions, please open a GitHub issue or contact the maintainers.
