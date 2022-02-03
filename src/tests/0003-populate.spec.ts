import { ObjectId } from 'bson';
import { expect } from 'chai';
import { CountryDocument } from './_libs/documents/country.document';
import { PeopleDocument } from './_libs/documents/people.document';
import { initConnection } from './_libs/init-connection';

describe('populate', () => {
    initConnection();

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

    it('with populate, refs should be instances of another documents', async () => {
        const country = await CountryDocument.findOne<CountryDocument>({}, {
            populate: [
                { path: 'leader' }
            ]
        });

        for (const item of Array(1).fill(0)) {
            const people = new PeopleDocument();
            people.name = Math.random().toString();
            await people.save();
            country.people.push(people);
        }

        for (const item of country.people) {
            const child = new PeopleDocument();
            child.name = 'Child';
            await child.save();
            item.children.push(child);
            await item.save();
        }

        await country.save();

        await country.populate([
            {
                path: 'people',
                populate: [
                    { path: 'children' }
                ]
            }
        ]);

        for (const peopleOfCountry of country.people) {
            expect(peopleOfCountry)
                .is.instanceof(PeopleDocument);

            for (const child of peopleOfCountry.children) {
                expect(child)
                    .is.instanceof(PeopleDocument);
            }
        }
    });

    it('deeply populated document should be populated after save', async () => {
        const country = await CountryDocument.findOne<CountryDocument>({}, {
            populate: [
                {
                    path: 'people',
                    populate: [
                        { path: 'children' }
                    ]
                }
            ]
        });

        for (const peopleOfCountry of country.people) {
            expect(peopleOfCountry)
                .is.instanceof(PeopleDocument);

            for (const child of peopleOfCountry.children) {
                expect(child)
                    .is.instanceof(PeopleDocument);
            }
        }

        await country.save();

        for (const peopleOfCountry of country.people) {
            expect(peopleOfCountry)
                .is.instanceof(PeopleDocument);

            for (const child of peopleOfCountry.children) {
                expect(child)
                    .is.instanceof(PeopleDocument);
            }
        }
    });
});
