export const resolvers = {
    Query: {
        books: async (_, __, {dataSources}) => dataSources.bookAPI.selectAll(),
        book: async (_, {id}, {dataSources}) => dataSources.bookAPI.selectOne({id}),
        author: async (_, {id}, {dataSources}) => dataSources.authorAPI.selectOne({id}),
    },
    Author: {
        books: async (author, __, {dataSources}) => dataSources.bookAPI.selectByAuthor({id: author.id}),
    }
};
