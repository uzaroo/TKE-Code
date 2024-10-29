import { LightningElement, wire,api } from 'lwc';
import { gql, graphql } from "lightning/uiGraphQLApi";
import { CurrentPageReference } from 'lightning/navigation';
import LightningAlert from 'lightning/alert';
import { CloseActionScreenEvent } from 'lightning/actions';
import { getRecord ,createRecord,createContentDocumentAndVersion} from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
// Import fields from the PricebookEntry object
import NAME_FIELD from '@salesforce/schema/PricebookEntry.Name';
import PRODUCT_ID_FIELD from '@salesforce/schema/PricebookEntry.Product2Id';
import PRODUCT_DESCRIPTION_FIELD from '@salesforce/schema/PricebookEntry.SFS_Product_Description__c';
const fields = [NAME_FIELD, PRODUCT_ID_FIELD, PRODUCT_DESCRIPTION_FIELD];
const PRODUCT_CONSUMED_OBJECT = 'ProductConsumed';
const QUANTITY_CONSUMED_FIELD = 'QuantityConsumed';
const PRICEBOOK_ENTRY_FIELD = 'PricebookEntryId';
const WORK_ORDER_FIELD = 'WorkOrderId';
const WORK_ORDER_LINE_TIME_FIELD = 'WorkOrderLineItemId';
import {
    log,
    debug,
    IMAGE_EXT,
    isNullOrEmpty,
    ToastTypes,
    dataURLtoFile
  } from "c/sfs_utilsImageCapture";
export default class Sfs_newProductConsumed extends LightningElement {
    backclicked=false;
    currentWorkOrderId;
    pricebookdata;
    selectedPriceBookEntryId;
    selectedProductQuantity;
    showFirstScreen = true;
    showSecondScreen = false;
    isBackButtonVisible = false;
    showNextButton = true;
    selectedProductsCollection = [];
    productConsumedToggled = false;
    singleAssetWO = true;
    assetpicklistlabel='Asset';
    selectedAssetList = [];
    singleAssetName;

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        
        console.log('currentPageReference--'+this.currentPageReference);
        if (this.currentWorkOrderId==undefined) {
            if(currentPageReference.state.recordId==undefined)
            {
                this.currentWorkOrderId =currentPageReference.attributes.recordId;
            }
            else{
                this.currentWorkOrderId =currentPageReference.state.recordId;
            }
        }
    }
    renderedCallback(){
        
        if(this.selectedPriceBookEntryId && this.backclicked)
        {
        var sfsProductPicker = this.template.querySelector('c-sfs_product-picker');
        if(sfsProductPicker){
            sfsProductPicker.receiveDataOnBack(this.selectedProductQuantity, this.selectedPriceBookEntryId);
        }

        }
    }
    @wire(getRecord, {
        recordId: '$selectedPriceBookEntryId',
        fields
    })
    loadRecord({
        error,
        data
    }) {
        if (data) {
            console.log('data--'+JSON.stringify(data));
            this.pricebookdata = data;
            this.selectedPriceBookEntryName = data.fields.Name.value;
            this.selectedProductDescription = data.fields.SFS_Product_Description__c.value;
        } else if (error) {
            this.selectedPriceBookEntryName = 'Record not found';
        }
    }

    @wire(graphql, {
        query: '$workOrderLineItemQuery',
        variables: "$workorderparam"
      }) 
      wiredWorkOrderLineItems({ error, data }) {
        if (data) {
            this.options = data.uiapi.query.WorkOrderLineItem.edges.map(edge => {
                return {
                    label: edge.node.SFS_Asset_Label__c.value, 
                    value: edge.node.Id 
                };
            });
            console.log('this.options--'+JSON.stringify(this.options));
            if(this.options.length>1)
            {
                this.assetpicklistlabel=' Select one or more assets for the above product';
                this.singleAssetWO=false;
            
            }
            else if(this.options.length==1){
                this.assetpicklistlabel = 'Asset';
                this.singleAssetWO = true;
                console.log('this.options.label--'+this.options[0].label);
                this.selectedAssetList.push({
                    value: this.options[0].value,
                    label: this.options[0].label
                });
                this.singleAssetName = this.options[0].label;
                this.selectedAssetList= [...new Set(this.selectedAssetList)];
            }
        } else if (error) {
         
            console.error('Error fetching work order line items:', error);
        }
    }

    refreshPricebookData() {
        return refreshApex(this.pricebookdata);
    }

    get assetListString() {
        return this.selectedAssetList.map(asset => asset.label).join(', ');
    }

    handleProductChange(event) {
        
        this.selectedPriceBookEntryId = event.detail;
        this.refreshPricebookData();
    }

    validateComponents() {
        let areChildrenValid = true;
            const childComponents = [...this.template.querySelectorAll('c-sfs_product-picker, c-sfs_multi-select-picklist')];
            areChildrenValid = childComponents.reduce((validSoFar, child) => {
                var childLWCValid=child.validateFields();
                return validSoFar && childLWCValid; // Call validateFields on each child
            }, true);

            return areChildrenValid;
    }
    
    get workOrderLineItemQuery() {
        return gql`
        query getAllRecordsData($workOrderId: ID) {
            uiapi {
                query {
                    WorkOrderLineItem(where: { WorkOrderId: { eq: $workOrderId } }) {
                        edges {
                            node {
                                Id 
                                SFS_Asset_Label__c {value}
                            }
                        }
                    }
                }
            }
        }
        `;
    }
    get workorderparam()
    {
      return {
        workOrderId: this.currentWorkOrderId ? this.currentWorkOrderId : '',
      }
    }

    handleScreenNextClick(event) {
        
        this.backclicked=false;
        if (this.validateComponents()) {
                    if(this.showFirstScreen){
                        this.showFirstScreen = false;
                        this.showSecondScreen = true;
                        this.handleBackButtonVisibility();
                        var sfsProductPicker = this.template.querySelector('c-sfs_product-picker');
                        this.selectedProductQuantity = sfsProductPicker.selectedQuantity;
                        this.createProductConsumedList(this.selectedProductQuantity, this.selectedPriceBookEntryId);
                    }
                    else if (this.showSecondScreen) {

                        this.handleSubmit();
                    }
        }
    } 
    handleAddAnotherProductConsumed() {
        this.showSecondScreen = false;
        this.productConsumedToggled = false;
        this.showFirstScreen = true;
        this.handleBackButtonVisibility();
        if(!this.singleAssetWO)
            {
              this.selectedAssetList = [];
            }
    }

    handleScreenBackClick() {
        
        this.backclicked=true;
        this.showSecondScreen = false;
        this.productConsumedToggled = false;
        this.showFirstScreen = true;
        this.handleBackButtonVisibility();     
    }

    createProductConsumedList(quantity, selectedPriceBookEntryId) {
        this.selectedAssetList.forEach(lineItemId => {
            this.selectedProductsCollection.push({
             WorkOrderId   :this.currentWorkOrderId,
            WorkOrderLineItemId: lineItemId.value,
            PricebookEntryId: selectedPriceBookEntryId,
            quantity: quantity,
        });
    });
    }

    closeQuickAction() {
        this.dispatchEvent(new CloseActionScreenEvent());
    }

    async handleSubmit() {
        try {
            this.handleSuccessAlert('New Product Consumed creation in progress.').then(() => {
                this.closeQuickAction();
            });
            // this.closeQuickAction();
            await this.createProductConsumed();
          
        } catch (error) {
            this.handleErrorAlert('Some Error Occurred.');
        }
    }
    toastType;
    async createProductConsumed() {
        try {
            this.currentWorkOrderId = undefined;
            for (const currentRec of this.selectedProductsCollection) {
                let attempts = 0;
                const maxAttempts = 3;
                while (attempts < maxAttempts) {
                    try {
                        await this.buildProductConsumedFields(currentRec);
                        debugger;
                        //this.toastType = ToastTypes.Success;
                        break; // Exit the loop on success
                    } catch (innerError) {
                        if (innerError.message.includes("exclusive access")) {
                            attempts++;
                            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
                        } else {
                            console.error(`Error creating record for ${currentRec.WorkOrderId}:`, innerError);
                            break; // Exit on other errors
                        }
                    }
                }
            }
        } catch (error) {
            console.log('Error:', JSON.stringify(error));
        }
    }
    // async createProductConsumed() {
    //     try{
    //         
    //      this.currentWorkOrderId=undefined;
    //     const recordPromises = this.selectedProductsCollection.map(currentRec => this.buildProductConsumedFields(currentRec));
    //     await Promise.all(recordPromises);
    // } catch (error) {
    //     console.log('Error:', JSON.stringify(error));
    // }
    // }

     buildProductConsumedFields(currentRec) {
        const productConsumedFields = {
            [WORK_ORDER_FIELD]: currentRec.WorkOrderId,
            [WORK_ORDER_LINE_TIME_FIELD]: currentRec.WorkOrderLineItemId,
            [QUANTITY_CONSUMED_FIELD]: currentRec.quantity,
            [PRICEBOOK_ENTRY_FIELD]: currentRec.PricebookEntryId  
        };

        const productConsumedInput = {
            apiName: PRODUCT_CONSUMED_OBJECT,
            fields: productConsumedFields
        };
        
        return createRecord(productConsumedInput);
    }

    get shouldShowToast() {
        return this.toastType == null ? false : true;
      }
    
      hideToast() {
        this.toastType = null;
      }
    
      get toastMessage() {
        switch (this.toastType) {
          case ToastTypes.Success: {
            return `New Product Consumed Created`;
          }
          default: {
            return "";
          }
        }
      }

    get buttonClass() {
        return this.isBackButtonVisible==true ? 'visibility-visible' : 'visibility-hidden';
    }

    handleBackButtonVisibility() {
        this.isBackButtonVisible = !this.isBackButtonVisible;
    }

   // Handles error messages generated through the process
   async handleErrorAlert(msg) {
    await LightningAlert.open({
        message: msg,
        theme: 'error',
        label: 'Error!', // this is the header text
    });
}

// Handles success messages generated through the process
async handleSuccessAlert(msg) {
    await LightningAlert.open({
        message: msg,
        theme: 'success',
        label: 'Success!', // this is the header text
    });
}


handleSelectOptionList(event){
    const selectedValues = Array.isArray(event.detail)
        ? event.detail.flat()  
        : [event.detail];  
        selectedValues.forEach(selectedValue => {
            const trimmedValue = selectedValue.trim(); 
            const exists = this.selectedAssetList.some(asset => asset.value === trimmedValue);
            if (!exists) {
                this.selectedAssetList.push({
                    value: trimmedValue, 
                    label: ''
                });
            }
        });
        
        this.selectedAssetList = this.selectedAssetList.map(woli => {
            const option = this.options.find(option => option.value === woli.value);
            return {
                value: woli.value,
                label: option ? option.label : '' 
            };
        });
    
}

}