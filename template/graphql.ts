import {ApolloServer, gql, IResolvers} from './yc-apollo-server';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type Query {
        hello(name: String): String
    }
`;

// Provide resolver functions for your schema fields
const resolvers: IResolvers = {
    Query: {
        hello: (parent, args, context, info) => `Hello ${args.name || 'world'}!`,
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: true,
});

exports.graphqlHandler = server.createHandler();
