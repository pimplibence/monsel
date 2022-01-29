import { AbstractDocument } from '../../../core/document/abstract.document';
import { document } from '../../../core/document/decorators/document';
import { property } from '../../../core/document/decorators/property';
import { refs } from '../../../core/document/decorators/refs';

@document({
    collection: 'people'
})
export class PeopleDocument extends AbstractDocument {
    @property()
    public name: string;

    @refs(() => PeopleDocument)
    public children: PeopleDocument;

    @refs(() => PeopleDocument)
    public siblings: PeopleDocument;
}