import { AbstractDocument } from '../core/document/abstract.document';
import { document } from '../core/document/decorators/document';
import { beforeCreate, beforeUpdate } from '../core/document/decorators/lifecycle-callback';
import { property } from '../core/document/decorators/property';

@document()
export class BaseDocument extends AbstractDocument {
    @property()
    public createdAt: Date;

    @property()
    public updatedAt: Date;

    @beforeCreate()
    @beforeUpdate()
    private initTimestamps() {
        const now = new Date();

        this.updatedAt = now;
        this.createdAt = this.createdAt || now;
    }
}
