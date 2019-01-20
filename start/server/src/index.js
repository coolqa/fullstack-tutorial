require('dotenv').config()

const { ApolloServer } = require('apollo-server')
const isEmail = require('isEmail')
const typeDefs = require('./schema')

const { createStore } = require('./utils')

const LaunchAPI = require('./datasources/launch')
const UserAPI = require('./datasources/user')
const resolvers = require('./resolvers')

const store = createStore()

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    // simple auth check on every request
    const auth = (req.headers && req.headers.authorization) || ''
    const email = Buffer.from(auth, 'base64').toString('ascii')

    // if the email isn't formatted validly, return null for user
    if (!isEmail.validate(email)) return { user: null }
    // TODO: security, doesn't actually do password validation
    // find a user by their email
    const users = await store.users.findOrCreate({ where: { email } })
    const user = users && users[0] ? users[0] : null

    return { user: { ...user.dataValues } }
  },
  dataSources: () => ({
    launchAPI: new LaunchAPI(),
    userAPI: new UserAPI({ store })
  }),
  engine: {
    apiKey: process.env.ENGINE_API_KEY
  }
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
