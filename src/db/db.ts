import {Driver, getCredentialsFromEnv, getLogger, Logger, withRetries, Ydb} from 'ydb-sdk';
import {Author, Book} from "./data-helpers";
import Long from 'long';

export class Db {
    driver: Driver;
    tablePathPrefix: string;
    logger: Logger;

    queries = {
        selectOneBook: (tablePathPrefix) => `
            PRAGMA TablePathPrefix("${tablePathPrefix}");
        
            DECLARE $bookId AS Uint64;
        
            SELECT id, author_id, title, info, cast(release_date as string) as release_date
            FROM books
            WHERE id = $bookId;`,
        selectAuthor: (tablePathPrefix) => `
            PRAGMA TablePathPrefix("${tablePathPrefix}");
        
            DECLARE $authorId AS Uint64;
        
            SELECT *
            FROM authors
            WHERE id = $authorId;`,

        selectBooksByAuthor: (tablePathPrefix) => `
            PRAGMA TablePathPrefix("${tablePathPrefix}");
        
            DECLARE $authorId AS Uint64;
        
            SELECT id, author_id, title, info, cast(release_date as string) as release_date
            FROM books VIEW books_author_id
            WHERE author_id = $authorId
            ORDER BY release_date;`,

        selectAllBooks: (tablePathPrefix) => `
            PRAGMA TablePathPrefix("${tablePathPrefix}");
        
            SELECT id, author_id, title, info, cast(release_date as string) as release_date
            FROM books;`
    }

    constructor(entryPoint, dbName) {
        const logger = getLogger({level: 'debug'});
        const authService = getCredentialsFromEnv(entryPoint, dbName, logger);
        this.driver = new Driver(entryPoint, dbName, authService);
        this.tablePathPrefix = dbName;
        this.logger = logger
    }

    async selectOneBook(id: number): Promise<Book> {
        let result: Book = null;
        await this.driver.tableClient.withSession(async (session) => {
            const select = async () => {
                const preparedQuery = await session.prepareQuery(this.queries.selectOneBook(this.tablePathPrefix));
                const {resultSets} = await session.executeQuery(preparedQuery, {
                    '$bookId': typedLong(id),
                });
                return Book.createNativeObjects(resultSets[0])
            }
            const data = await withRetries(select) as Book[];
            result = data[0]
        });
        return result;
    }

    async selectBooksByAuthorId(authorId: number): Promise<Book[]> {
        let result: Book[] = [];
        this.logger.info({authorId: authorId}, 'author id');
        await this.driver.tableClient.withSession(async (session) => {
            const select = async () => {
                const preparedQuery = await session.prepareQuery(this.queries.selectBooksByAuthor(this.tablePathPrefix));
                const {resultSets} = await session.executeQuery(preparedQuery, {
                    '$authorId': typedLong(authorId),
                });

                return Book.createNativeObjects(resultSets[0])
            }
            result = await withRetries(select) as Book[];
        });
        return result;
    }

    async selectAllBooks(): Promise<Book[]> {
        let result: Book[] = [];
        await this.driver.tableClient.withSession(async (session) => {
            const select = async () => {
                const preparedQuery = await session.prepareQuery(this.queries.selectAllBooks(this.tablePathPrefix));
                const {resultSets} = await session.executeQuery(preparedQuery, {});
                return Book.createNativeObjects(resultSets[0]);
            }

            result = await withRetries(select) as Book[];
        });
        return result;
    }

    async selectAuthor(authorId: number): Promise<Author> {
        let result: Author = null;
        await this.driver.tableClient.withSession(async (session) => {
            const select = async () => {
                const preparedQuery = await session.prepareQuery(this.queries.selectAuthor(this.tablePathPrefix));
                const {resultSets} = await session.executeQuery(preparedQuery, {
                    '$authorId': typedLong(authorId),
                });
                return Author.createNativeObjects(resultSets[0]);
            }

            const data = await withRetries(select) as Author[];
            result = data[0];
        });
        return result;
    }
}

function typedLong(authorId: number) {
    return Ydb.TypedValue.create({
        type: {typeId: Ydb.Type.PrimitiveTypeId.UINT64},
        value: {uint64Value: Long.fromNumber(authorId)}
    });
}
