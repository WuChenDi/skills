import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { logger as accesslog } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { requestId } from 'hono/request-id'
import { routes } from '@/routes'
import './global'

const app = new Hono()

const customLogger = (message: string, ...rest: string[]) => {
  logger.info(`[ACCESS] ${message}`, ...rest)
}

app.use(accesslog(customLogger))
app.use('*', prettyJSON())
app.use('*', requestId())
app.use(
  '*',
  cors({
    origin: '*',
    credentials: true,
  }),
)

app.route('/', routes)

app.get('/', (c) => {
  return c.json({
    status: 'ok',
    platform: 'cloudflare-workers',
    version: '0.1.0',
    message: '__APP_DESCRIPTION__',
    timestamp: new Date().toISOString(),
  })
})

app.onError((err, c) => {
  logger.error('Global error handler invoked', {
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  })

  if (err instanceof HTTPException) {
    return c.json(
      {
        statusCode: err.status,
        message: err.message,
        stack: isDebug ? err.stack?.split('\n') : undefined,
      },
      err.status,
    )
  }

  return c.json(
    {
      statusCode: 500,
      message: 'Internal Server Error',
      stack: isDebug ? err.stack?.split('\n') : undefined,
    },
    500,
  )
})

app.notFound((c) => {
  return c.json(
    {
      statusCode: 404,
      message: 'Not Found',
    },
    404,
  )
})

export default {
  fetch: app.fetch,
}
