import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import type { Provider } from 'next-auth/providers/index'
import DiscordProvider from 'next-auth/providers/discord'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import prisma from '@/lib/prisma'

// A provider is enabled only when the owner has configured its credentials,
// so a build or preview without secrets simply offers fewer sign-in options.
function configuredProviders(): Provider[] {
  const env = process.env
  const providers: Provider[] = []

  if (env.NEXTAUTH_GOOGLE_CLIENT_ID && env.NEXTAUTH_GOOGLE_CLIENT_SECRET) {
    providers.push(GoogleProvider({
      clientId: env.NEXTAUTH_GOOGLE_CLIENT_ID,
      clientSecret: env.NEXTAUTH_GOOGLE_CLIENT_SECRET,
    }))
  }
  if (env.NEXTAUTH_GITHUB_CLIENT_ID && env.NEXTAUTH_GITHUB_CLIENT_SECRET) {
    providers.push(GitHubProvider({
      clientId: env.NEXTAUTH_GITHUB_CLIENT_ID,
      clientSecret: env.NEXTAUTH_GITHUB_CLIENT_SECRET,
    }))
  }
  if (env.NEXTAUTH_DISCORD_CLIENT_ID && env.NEXTAUTH_DISCORD_CLIENT_SECRET) {
    providers.push(DiscordProvider({
      clientId: env.NEXTAUTH_DISCORD_CLIENT_ID,
      clientSecret: env.NEXTAUTH_DISCORD_CLIENT_SECRET,
    }))
  }
  if (env.EMAIL_SERVER && env.EMAIL_FROM) {
    providers.push(EmailProvider({ server: env.EMAIL_SERVER, from: env.EMAIL_FROM }))
  }

  return providers
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // Database sessions: the cookie holds only an opaque token, and deleting the
  // Session row revokes it immediately.
  session: { strategy: 'database' },
  providers: configuredProviders(),
  callbacks: {
    // Expose the database user id so server routes can scope reads to it.
    session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    },
  },
}
