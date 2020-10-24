import {declareType, TypedData, Ydb} from 'ydb-sdk';
import Type = Ydb.Type;

interface IBook {
    id: number,
    authorId: number,
    title: string,
    releaseDate: string,
    info: string
}

type IBookInfo = { [key: string]: any };

export class Book extends TypedData {
    @declareType({typeId: Type.PrimitiveTypeId.UINT64})
    public id: number;

    @declareType({typeId: Type.PrimitiveTypeId.UINT64})
    public authorId: number;

    @declareType({typeId: Type.PrimitiveTypeId.UTF8})
    public title: string;

    @declareType({typeId: Type.PrimitiveTypeId.DATE})
    public releaseDate: string;

    @declareType({typeId: Type.PrimitiveTypeId.JSON})
    public info: IBookInfo;

    static create(id: number, authorId: number, title: string, releaseDate: string, info: string = '{}'): Book {
        return new this({id, authorId, title, releaseDate, info});
    }

    constructor(data: IBook) {
        super(data);
        this.id = data.id;
        this.authorId = data.authorId;
        this.title = data.title;
        this.releaseDate = data.releaseDate;
        try {
            this.info = JSON.parse(data.info);
        } catch (e) {
            this.info = {};
        }
    }
}

interface IAuthor {
    id: number,
    name: string,
}

export class Author extends TypedData {
    @declareType({typeId: Type.PrimitiveTypeId.UINT64})
    public id: number;

    @declareType({typeId: Type.PrimitiveTypeId.UTF8})
    public name: string;

    static create(id: number, name: string): Author {
        return new this({id, name});
    }

    constructor(data: IAuthor) {
        super(data);
        this.id = data.id;
        this.name = data.name;
    }
}
