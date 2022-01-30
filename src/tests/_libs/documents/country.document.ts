import { AbstractDocument } from '../../../core/document/abstract.document';
import { document } from '../../../core/document/decorators/document';
import { property } from '../../../core/document/decorators/property';
import { ref } from '../../../core/document/decorators/ref';
import { refs } from '../../../core/document/decorators/refs';
import { PeopleDocument } from './people.document';

@document({
    collection: 'country',
    indexes: [
        { fields: { name: -1 } },
        { fields: { leader: -1 } },
        { fields: { people: -1 } },
    ]
})
export class CountryDocument extends AbstractDocument {
    @property()
    public name: string;

    @ref(() => PeopleDocument)
    public leader: PeopleDocument;

    @refs(() => PeopleDocument)
    public people: PeopleDocument[] = [];
}