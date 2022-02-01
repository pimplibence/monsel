import { document } from '../../../core/document/decorators/document';
import { afterLoad, beforeCreate, beforeUpdate } from '../../../core/document/decorators/lifecycle-callback';
import { property } from '../../../core/document/decorators/property';
import { refs } from '../../../core/document/decorators/refs';
import { HumanDocument } from './human.document';

@document({
    collection: 'people'
})
export class PeopleDocument extends HumanDocument {
    @property()
    public name: string;

    @refs(() => PeopleDocument)
    public children: PeopleDocument[] = [];

    @refs(() => PeopleDocument)
    public siblings: PeopleDocument[] = [];

    @beforeCreate()
    @beforeUpdate()
    @afterLoad()
    public bbbbb() {
        this.name = Math.random().toString();
    }
}
