const { DataSource } = require('apollo-datasource');
import {Db} from "../db/db";

export class BooksAPI extends DataSource {
    db: Db;
    constructor({ db }) {
        super();
        this.db = db;
    }

    /**
     * This is a function that gets called by ApolloServer when being setup.
     * This function gets called with the datasource config including things
     * like caches and context. We'll assign this.context to the request context
     * here, so we can know about the user making requests
     */
    initialize(config) {
        this.context = config.context;
    }

    async selectOne({ id }) {
        return await this.db.selectOneBook(id);
    }

    async selectAll() {
        return await this.db.selectAllBooks();
    }

    async selectByAuthor({ id }) {
        return await this.db.selectBooksByAuthorId(id);
    }
}

