import { api, LightningElement } from 'lwc';
import LightningAlert from 'lightning/alert';


export default class sfs_productPicker extends LightningElement {
@api selectedProductRequestId;
@api selectedQuantity;
errorMessage='';

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
        },
        {
            fieldPath: 'IsActive',
            operator: 'eq',
            value: true,
        }
    ],
    filterLogic: '(1 AND 2 AND 3 AND 4)',
};
matchingInfo = {
  primaryField: { fieldPath: 'Name' },
  additionalFields: [{ fieldPath: 'SFS_Product_Description__c' }],
}
displayInfo = {
    primaryField: 'Name',
    additionalFields: ['SFS_Product_Description__c'],
};

handleProductRequestSelection(event)
{
this.selectedProductRequestId = event.detail.recordId;
this.fireCustomEvent('productrequestchange',this.selectedProductRequestId);
}

@api receiveDataOnBack(quantity, priceBookEntryId) {
    this.selectedQuantity = quantity;
    this.selectedProductRequestId = priceBookEntryId;
}

fireCustomEvent(eventname, detailvalue) {

    const objEvent = new CustomEvent(eventname, {
        detail: detailvalue
    });

    // Dispatches the event.
    this.dispatchEvent(objEvent);
}

async handleSuccessAlert(msg) {
    await LightningAlert.open({
        message: msg,
        theme: 'success',
        label: 'Success!', // this is the header text
    });
}

    
handleQuantityValueInput(event){
    
    this.selectedQuantity=event.target.value;
    if (this.selectedQuantity <= 0) {
        this.errorMessage = 'Quantity must be greater than 0';
        // Optionally, you can set a custom validity state
        event.target.setCustomValidity(this.errorMessage);
    } else {
        this.errorMessage = '';
        event.target.setCustomValidity(''); // Clear any previous error message
    }
    // Report validity to the form
    event.target.reportValidity();
}

@api
    validateFields() {
        const fields = [...this.template.querySelectorAll('.requiredvalidation')];
        const allValid = fields.reduce((validSoFar, input) => {
            input.reportValidity();
            return validSoFar && input.checkValidity();
        }, true);
        return allValid;
    }
    
    async createCdl(recordId, contentDocumentId) {
        debug("Creating a CDL...");
    
        await createRecord({
          apiName: "ContentDocumentLink",
          fields: {
            LinkedEntityId: recordId,
            ContentDocumentId: contentDocumentId,
            ShareType: "V"
          }
        })
          .then(() => {
            debug("Successfully created a CDL!");
          })
          .catch((e) => {
            log(`Failed to create a CDL: ${JSON.stringify(e)}`);
            throw e;
          });
      }

}