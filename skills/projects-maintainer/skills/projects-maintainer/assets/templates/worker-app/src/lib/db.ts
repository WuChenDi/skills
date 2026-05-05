import { createClient } from '@libsql/client'
import { drizzle as drizzleD1 } from 'drizzle-orm/d1'
import { drizzle as drizzleLibSql } from 'drizzle-orm/libsql'
import * as schema from '@/database/schema'

type Env = {
  DB_TYPE?: 'libsql' | 'd1'
  LIBSQL_URL?: string
  LIBSQL_AUTH_TOKEN?: string
  DB?: D1Database
}

export const useDrizzle = (env: Env) => {
  const dbType = env.DB_TYPE ?? 'libsql'

  if (dbType === 'd1') {
    if (!env.DB) {
      throw new Error('Missing D1 binding `DB` while DB_TYPE=d1')
    }
    return drizzleD1(env.DB, { schema })
  }

  const client = createClient({
    url: env.LIBSQL_URL ?? 'file:./src/database/data.db',
    authToken: env.LIBSQL_AUTH_TOKEN,
  })
  return drizzleLibSql(client, { schema })
}

export type Database = ReturnType<typeof useDrizzle>
