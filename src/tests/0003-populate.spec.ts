import { ObjectId } from 'bson';
import { expect } from 'chai';
import { CountryDocument } from './_libs/documents/country.document';
import { PeopleDocument } from './_libs/documents/people.document';
import { initConnection } from './_libs/init-connection';

describe('populate', () => {
    const connection = initConnection();

    it('empty state, single ref should be null, multi should be empty array', async () => {
        const country = new CountryDocument();

        country.name = 'Hello World';

        await country.save();

        expect(country)
            .has.a.property('leader')
            .that.is.eq(null);

        expect(country)
            .has.a.property('people')
            .that.is.an('array')
            .and.length(0);
    });

    it('without populate, a ref should be saved as ObjectId', async () => {
        const country = await CountryDocument.findOne<CountryDocument>();

        const people = new PeopleDocument();

        people.name = 'John Doe';

        await people.save();

        country.leader = people;

        await country.save();

        expect(country)
            .has.a.property('leader')
            .that.is.instanceof(ObjectId);
    });

    it('with populate, a ref should be instance of another document', async () => {
        const country = await CountryDocument.findOne<CountryDocument>({}, {
            populate: [
                { path: 'leader' }
            ]
        });

        expect(country)
            .has.a.property('leader')
            .that.is.instanceof(PeopleDocument);

        expect(country)
            .has.a.property('leader')
            .has.a.property('_id')
            .that.is.instanceof(ObjectId);
    });
});
