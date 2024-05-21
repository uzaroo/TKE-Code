import { LightningElement,api,wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';

import RecordFormModal from './slsObjectAwareModalPoc.js';


export default class SlsObjectAwareDataTablePoc extends LightningElement {

    @api recordId;
    @api fieldNames;
    @api objectName;


    _tableData = [];
    _tableColumns = [];
    _recordData = [];
    _error = [];
    _sobjectName = [];
    _fieldApiNames = [];
    _spinner = true;
    _creatable = false;
    _requiredFields = [];


    @wire(getObjectInfo, {
        objectApiName: '$objectName'
    })wiredObject ({error,data}){
        if (data) {
            let result = JSON.parse(JSON.stringify(data));
            this._creatable = result.createable;
            this.generateTableColumns(this.fieldNames,result.fields);
            this._error = undefined;
            this._spinner = false;
        } else if (error) {
            this._error = error;
            this._spinner = false;
        }
    }

    generateTableColumns(data, fields){
        if(data.length){
            data.split(',').forEach(element => {
                let foundField = Object.keys(fields)
                                .find( item => item.toLowerCase() === element.toLowerCase());
                if(foundField.length){
                    this._tableColumns.push(
                      {
                        label: fields[foundField].label,
                        fieldName: fields[foundField].apiName,
                        type: 'text' //Need to handle this through a metadata - mapping field data types to columns type
                      }  
                    );
                }
            });
            Object.values(fields).filter(
                item => item.createable && item.required
            ).forEach(elem => {
                this._requiredFields.push(elem.apiName);
            });
        }
    }

    async openNew(){
         const result = await RecordFormModal.open({
            size: 'large',
            description: 'Accessible description of modal\'s purpose',
            _objectApiName: this.objectName,
            _requiredFields: this._requiredFields
        });
    }
}