import { LightningElement, api,track } from 'lwc';

export default class Sfs_newProductIdRequest extends LightningElement {
    @api productIdRequestDescription = '';
    @api productIdRequestUsageLocation = '';
    @api productIdRequestQuantity = '';
    @api productIdRequestVendorMarkings = '';
    @api productIdRequestManufacturer='';
    errorMessage='';
    handleQuantityValueInput(event) {

        this.productIdRequestQuantity= event.detail.value;
        if (this.productIdRequestQuantity <= 0) {
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

    handleProductDescriptionChange(event) {
        
        this.productIdRequestDescription = event.detail.value;
    }

    handleProductUsageLocationChange(event) {
        this.productIdRequestUsageLocation = event.detail.value;
    }

    handleIdentifyVendorMarkings(event) {
        this.productIdRequestVendorMarkings = event.detail.value;
    }
    handleManufacturerValueInput(event) {
        this.productIdRequestManufacturer = event.detail.value;
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

@api handleGetImageUploaded(event)
{
    this.dispatchEvent(
        new CustomEvent("allimagesdata", {
          detail: event.detail
        })
      );
}

}