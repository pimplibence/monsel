import * as assert from "assert";
import { ObjectId } from 'bson';
import { expect } from 'chai';
import { CountryDocument } from './_libs/documents/country.document';
import { PeopleDocument } from './_libs/documents/people.document';
import { initConnection } from './_libs/init-connection';
import { seedRepositoryTests } from './_libs/seed-repository-tests';

describe('document as repository', async () => {
    initConnection();

    describe('empty database', () => {
        it('findOne should null', async () => {
            const response = await CountryDocument.findOne();

            assert.equal(response, null);
        });

        it('find should be an empty array', async () => {
            const response = await CountryDocument.findMany();

            expect(response)
                .is.an('array')
                .that.length(0);
        });

        it('findMany should be an empty array', async () => {
            const response = await CountryDocument.findMany();

            expect(response)
                .is.an('array')
                .that.length(0);
        });

        it('count should be 0', async () => {
            const response = await CountryDocument.count();

            expect(response)
                .is.a('number')
                .and.eq(0);
        });

        it('paginate should be empty paginated list', async () => {
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

    describe('basic cases with data', async () => {
        const seed = seedRepositoryTests();

        it('count', async () => {
            const cCount = await CountryDocument.count();

            expect(cCount)
                .is.a('number')
                .and.eq(seed.numberOfCountry);

            const pCount = await PeopleDocument.count();

            expect(pCount)
                .is.a('number')
                .and.eq(seed.numberOfPeople);
        });

        it('findMany', async () => {
            const items = await CountryDocument.findMany();

            expect(items)
                .is.an('array')
                .and.length(seed.numberOfCountry);

            for (const item of items) {
                expect(item)
                    .is.instanceof(CountryDocument)
                    .and.has.property('_id')
                    .that.is.instanceof(ObjectId);
            }
        });

        it('findOne', async () => {
            const item = await CountryDocument.findOne();

            expect(item)
                .is.instanceof(CountryDocument)
                .and.has.property('_id')
                .that.is.instanceof(ObjectId);
        });

        it('updateMany', async () => {
            const items = await CountryDocument.findMany();

            for (const item of items) {
                expect(item)
                    .and.has.property('name')
                    .that
                    .is.not.eq('updated')
                    .and.is.not.eq(null)
                    .and.is.not.eq(undefined);

                expect(item)
                    .and.has.property('code')
                    .that
                    .is.not.eq('updated')
                    .and.is.not.eq(null)
                    .and.is.not.eq(undefined);
            }

            await CountryDocument.updateMany({}, { name: 'updated' });

            const updatedItems = await CountryDocument.findMany();

            for (const item of updatedItems) {
                expect(item)
                    .and.has.property('name')
                    .that
                    .is.eq('updated');

                expect(item)
                    .and.has.property('code')
                    .that
                    .is.not.eq('updated')
                    .and.is.not.eq(null)
                    .and.is.not.eq(undefined);
            }
        });
    });
});
