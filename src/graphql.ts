import {ApolloServer, gql} from './yc-apollo-server';
import {resolvers} from './resolvers';
import {AuthorsAPI, BooksAPI} from './datasources';
import {Db} from './db/db';
import fs from 'fs';

const process = require('process');


// Construct a schema, using GraphQL schema language
const typeDefs = gql`
    type Info {
        note: String
    }
    type Book {
        id: Int!
        title: String
        releaseDate: String
        info: Info
    }

    type Author {
        id: Int!
        name: String
        books: [Book]
    }

    type Query {
        books: [Book]!
        book(id: Int!): Book
        author(id: Int!): Author
    }
`;
// The right way to pass env variables would be through function env.
// But for now Yandex Cloud plugin for serverless framework does not support it.
// So we have to invent some other way to pass vars.
// const {ENTRYPOINT, DB} = process.env;
const env = fs.readFileSync('/function/code/env.json').toString();
const envObj = JSON.parse(env);
const {ENTRYPOINT, DB} = envObj;

// Unfortunately Plugin for now does not support creating function versions with Service Account attached.
// So we have to pass Service Account auth json file along with function code
// To generate it you have to run this command
// `yc iam key create --service-account-name $SA_NAME -o sa.json`
process.env.SA_JSON_FILE = '/function/code/sa.json';
const db = new Db(ENTRYPOINT, DB);
const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
        bookAPI: new BooksAPI({db}),
        authorAPI: new AuthorsAPI({db})
    }),
    playground: true,
});

exports.graphqlHandler = server.createHandler();
