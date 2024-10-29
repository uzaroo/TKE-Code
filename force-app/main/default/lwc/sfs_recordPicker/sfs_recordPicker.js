import { LightningElement } from 'lwc';

export default class sfs_recordPicker extends LightningElement {

  filter = {
    criteria: [
        {
            fieldPath: 'SFS_Price_Book_Name__c',
            operator: 'eq',
            value: 'SBC',
        },
        {
            fieldPath: 'Name',
            operator: 'ne',
            value: null,
        },
        {
            fieldPath: 'SFS_Product_Description__c',
            operator: 'ne',
            value: null,
        }
    ],
    filterLogic: '(1 AND 2 AND 3)',
};
matchingInfo = {
  primaryField: { fieldPath: 'Name' },
  additionalFields: [{ fieldPath: 'SFS_Product_Description__c' }],
}
displayInfo = {
    primaryField: 'Name',
    additionalFields: ['SFS_Product_Description__c'],
};
}