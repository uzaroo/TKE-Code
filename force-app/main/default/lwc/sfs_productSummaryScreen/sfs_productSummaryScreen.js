import { LightningElement, track, api } from 'lwc';

export default class Sfs_productSummaryScreen extends LightningElement {
@api selectedPriceBookEntryName;
@api selectedProductDescription;
@api assetListString;
@api selectedProductQuantity;

   handleAddAnotherProduct(event)
     {
      this.fireCustomEvent('newproducttoggle');
     }   

     fireCustomEvent(eventname) {

        const objEvent = new CustomEvent(eventname, {});
        this.dispatchEvent(objEvent);
    }
}