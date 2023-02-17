
const { ApolloServer } = require('apollo-server')

const server = new ApolloServer({
  mockEntireSchema: false,
})

type options = {
  url: string
}

server.listen(4001).then((params: options) => {
  console.log(`🚀 Server ready at ${params.url}`)
})
