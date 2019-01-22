import * as colors from 'config/console_colors'
import * as express from 'express'
import * as fs from 'fs'
import * as http from 'http'
import * as https from 'https'
import ApolloServer from './apollo'

// tslint:disable-next-line no-any
const SUCCESS_MESSAGE = (config: any) => {
  const {
    GRAPHQL_REST: REST,
    GRAPHQL_EXPLORE: EXPLORE,
    // GRAPHQL_WS: WS,
    HOST_PATH
  } = config
  // EVERYTHING BOOTED SUCCESFULLY
  const SE = (t = '') => t.toUpperCase().substr(0, 4)
  const onlineTitle = `${SE(process.env.NODE_PLATFORM)} Online (${SE(process.env.NODE_ENV)})`

  const combo = (a: string, b: string) => [a, b].join('')

  return colors.msg(`\n\n
  🌐    ${onlineTitle}    🌐
  -------------------------------------------------------
  📡    endpoint    ${combo(HOST_PATH, REST)}
  🎮    explorer    ${combo(HOST_PATH, EXPLORE)}
  -------------------------------------------------------`)
  // ➿    websocket   ${combo(HOST_PATH, WS)}
}

export default class Express {
  app: express.Express
  config: any                     // tslint:disable-line no-any
  server: any                     // tslint:disable-line no-any
  serverConfig: any[]             // tslint:disable-line no-any
  successMessage: string
  middleware: any                 // tslint:disable-line no-any

  constructor({
    config,
    middleware,
  }: {
    config: any, middleware: any, // tslint:disable-line no-any
  }) {
    this.app = express()
    this.config = config
    this.server = config.SSL ? https : http
    this.serverConfig = []
    this.middleware = middleware
    this.successMessage = SUCCESS_MESSAGE(config)

    this.setup()
  }

  setup() {
    const {app, config, middleware, } = this

    this.serverConfig = this.setupConfig()

    // Express
    middleware.expressSecurity(app)
    middleware.expressLogger(app)

    // Apollo
    ApolloServer.applyMiddleware({
      app,
      path: config.GRAPHQL_REST,
    })
  }
  setupConfig() {
    const {app, config: {SSL, SSL_KEY, SSL_CRT}} = this

    const sslConfig = (() => {
      const res: {key?: Buffer, cert?: Buffer} = {}
      if (SSL) {
        res.key = fs.readFileSync(SSL_KEY)
        res.cert = fs.readFileSync(SSL_CRT)
      }

      return res
    })()

    return [sslConfig, app].filter(el =>
      typeof el !== 'object'
      || Array.isArray(el)
      || Object.keys(el).length > 0
    )
  }

  start() {
    const {config, server, serverConfig} = this

    // Create a http/ws listener for our express app.
    const ws = server.createServer(...serverConfig)
    const listener = ws.listen({port: config.PORT}, () => {
      // middleware.graphqlWs(ws)

      // tslint:disable-next-line no-console
      console.log(this.successMessage)
    })
    return listener
  }
}
