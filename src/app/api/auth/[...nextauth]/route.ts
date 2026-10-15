import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// The Prisma adapter needs the Node.js runtime.
export const runtime = 'nodejs'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
