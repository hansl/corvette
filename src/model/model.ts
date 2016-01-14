import knex = require('knex');

import {EventEmitter} from './event';
import {Field} from './field';
import {FieldDescriptor} from './field';


export interface ModelOptions {
  tableName: string,
  useAutoId?: boolean,
}


export abstract class Model extends EventEmitter {
  private _knex: knex;
  private _fields: { [name: string]: Field<any> };

  private static _descriptors: { [name: string]: FieldDescriptor<any> } = null;
  protected static options: ModelOptions;

  private static _createIdField(): void {
    const descriptor = new FieldDescriptor<Number>({
      factory: () => null,
      converter: function(_: any): Number {
        throw new Error('ID fields cannot be converted.');
      },
      name: 'id'
    });

    this._descriptors['id'] = descriptor;
  }
  private static createDescriptors() {
    this._descriptors = Object.create(null);
    if (this.options.useAutoId) {
      this._createIdField();
    }
  }

  constructor(knex?: knex, values?: { [name: string]: Field<any> }) {
    super();
    this._knex = knex;
    this._fields = Object.create(null);
    for (const fieldName of Object.keys(this.descriptors)) {
      this._fields[fieldName] = this.descriptors[fieldName].create(this, values && values[fieldName]);
    }
  }

  get descriptors(): { [name: string]: FieldDescriptor<any> } {
    const Klass: any = this.constructor;
    if (!Klass._descriptors) {
      Klass.createDescriptors();
    }
    return Klass._descriptors;
  }
  get options(): ModelOptions {
    return (<any>this.constructor).options;
  }

  toJson(): any {
    const result = Object.create(null);
    for (const fieldName of Object.keys(this._fields)) {
      result[fieldName] = this._fields[fieldName].asJson();
    }
    return result;
  }

  static createTable(knex: knex) {
    // knex.schema.createTable(this.options)
  }
}
