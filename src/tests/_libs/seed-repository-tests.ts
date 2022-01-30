import { CountryDocument } from './documents/country.document';
import { PeopleDocument } from './documents/people.document';

const numberOfCountry = 10;
const numberOfPeople = 10;

export const seedRepositoryTests = () => {
    after(async () => {
        await CountryDocument.deleteMany();
        await PeopleDocument.deleteMany();
    });

    before(async () => {
        for (const cIndex in Array(numberOfCountry).fill(0)) {
            const cInstance = new CountryDocument();

            cInstance.name = `country-${cIndex}`;
            cInstance.code = `country-code-${cIndex}`;

            for (const pIndex of Array(numberOfPeople).fill(0)) {
                const pInstance = new PeopleDocument();

                pInstance.name = `people-${pIndex}`;
                await pInstance.save();

                cInstance.people.push(pInstance);
            }

            await cInstance.save();
        }
    });

    return {
        numberOfCountry: numberOfCountry,
        numberOfPeoplePerCountry: numberOfPeople,
        numberOfPeople: numberOfPeople * numberOfCountry
    };
};