import * as assert from "assert";
import { expect } from 'chai';
import { Connection } from "../core/connection/connection";
import { CountryDocument } from './_libs/country.document';

describe('document as repository', () => {
    const db = 'monsel';
    const connection = new Connection({
        uri: `mongodb://localhost:27017/${db}`,
        documents: [
            CountryDocument
        ]
    });

    before(async () => {
        await connection.connect();
    });

    after(async () => {
        await connection.disconnect();
    });

    describe('empty database', () => {
        it('#findOne should null', async () => {
            const response = await CountryDocument.findOne();

            assert.equal(response, null);
        });

        it('#find should be an empty array', async () => {
            const response = await CountryDocument.find();

            expect(response)
                .is.an('array')
                .that.length(0);
        });

        it('#findMany should be an empty array', async () => {
            const response = await CountryDocument.findMany();

            expect(response)
                .is.an('array')
                .that.length(0);
        });

        it('#count should be 0', async () => {
            const response = await CountryDocument.count();

            expect(response)
                .is.a('number')
                .and.eq(0);
        });

        it('#paginate should be empty paginated list', async () => {
            const response = await CountryDocument.paginate();

            expect(response)
                .is.a('object');

            expect(response.limit)
                .is.a('number')
                .and.eq(0);

            expect(response.total)
                .is.a('number')
                .and.eq(0);

            expect(response.current)
                .is.a('number')
                .and.eq(0);

            expect(response.page)
                .is.a('number')
                .and.eq(0);

            expect(response.skip)
                .is.a('number')
                .and.eq(0);

            expect(response.items)
                .is.a('array')
                .and.length(0);
        });
    });
});
