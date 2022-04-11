import { IsDate, IsDefined, validate } from 'class-validator';
import { AbstractDocument, LifecycleCallbackOptions } from '../core/document/abstract.document';
import { document } from '../core/document/decorators/document';
import { afterBeforeCreate, afterBeforeUpdate, beforeCreate, beforeUpdate } from '../core/document/decorators/lifecycle-callback';
import { property } from '../core/document/decorators/property';
import { ValidationErrors } from './validation.errors';

@document()
export class BaseDocument extends AbstractDocument {
    @IsDefined()
    @IsDate()
    @property()
    public createdAt: Date;

    @IsDefined()
    @IsDate()
    @property()
    public updatedAt: Date;

    @beforeCreate()
    @beforeUpdate()
    private initTimestamps() {
        const now = new Date();

        this.updatedAt = now;
        this.createdAt = this.createdAt || now;
    }

    @afterBeforeCreate()
    @afterBeforeUpdate()
    private async runValidators(options: LifecycleCallbackOptions) {
        const skip = options?.validatorOptions?.skipValidation;

        if (skip) {
            return;
        }

        const results = await validate(this, options?.validatorOptions || {});

        if (!results.length) {
            return;
        }

        throw new ValidationErrors(results);
    }
}
