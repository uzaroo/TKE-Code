import { LightningElement, wire, api } from "lwc";
import { getObjectInfo, getPicklistValues } from "lightning/uiObjectInfoApi";
import LightningAlert from 'lightning/alert';
import WorkOrder from "@salesforce/schema/WorkOrder";
import StateCode from "@salesforce/schema/WorkOrder.StateCode";
import CountryCode from "@salesforce/schema/WorkOrder.CountryCode";
const DefaultCountryCode = "US";

export default class Sfs_addressSelector extends LightningElement {
    @api countryCode;
    @api countryLabel;
    @api street;
    @api city;
    @api stateCode;
    @api stateLabel;
    @api zipPostalCode;
    
    generalZipCodeRegex = /^[A-Za-z0-9- ]{1,12}$/;

    @api addressheader;

    @wire(getObjectInfo, { objectApiName: WorkOrder })
    workOrderObject;

    @wire(getPicklistValues, {
        recordTypeId: "$workOrderObject.data.defaultRecordTypeId",
        fieldApiName: CountryCode
    })

    countryCodesWire({ data, error }) {
        
        if (data) {
        this.countryCode=DefaultCountryCode;
        
        this.countryCodes = [...data.values];
        this.countryCodes = this.countryCodes.map(country => {
            return { label: country.label, value: country.value };
        });
        this.countryLabel=this.countryCodes.find(option => option.value ===  this.countryCode).label;
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: "$workOrderObject.data.defaultRecordTypeId",
        fieldApiName: StateCode
    })
    stateCodes;
    /**
     * Show/Hide state picklist based on options and selected country.
     * @returns {boolean}
     */
    get showStates() {
        
        return !!(
        this.stateCodeOptions &&
        this.stateCodeOptions.length > 0 &&
        this.countryCode
        );
    }
    /**
     * Get dependent state picklist values when country is selected.
     * @returns {Array}
     */
    get stateCodeOptions() {
        
        if (this.stateCodes && this.stateCodes.data && this.countryCode) {
        var stateCodesFormatted= this.setDependentPicklist(this.stateCodes.data, this.countryCode);
        stateCodesFormatted=stateCodesFormatted.map(state => {
            return { label: state.label, value: state.value };
        });
        return stateCodesFormatted;
        }
    }
    /**
     * Get values for dependent picklists
     * @param {Object} data - Wire data
     * @param controllerValue - Value from controlling picklist.
     * @returns {Array}
     */
    setDependentPicklist(data, controllerValue) {
        
        const key = data.controllerValues[controllerValue];
        return data.values.filter((opt) => opt.validFor.includes(key));
        
    }

    handleFieldChange(event) {
        
        if(event.target.name == "country"){
            this.countryCode = event.target.value;
            this.countryLabel=this.countryCodes.find(option => option.value === event.detail.value).label;
            this.stateCode = undefined;
        }
        else if(event.target.name == "street"){
            this.street = event.target.value;
        }
        else if(event.target.name == "city"){
            this.city = event.target.value;
        }
        
        else if(event.target.name == "state"){
            this.stateCode = event.target.value;
            this.stateLabel=this.stateCodeOptions.find(option => option.value === event.detail.value).label;
        }
        else if(event.target.name == "zipPostalCode"){
            this.zipPostalCode = event.target.value;
            // Validate the ZIP code based on the general regex
        if (!this.generalZipCodeRegex.test(this.zipPostalCode)) {
            // If the ZIP code is invalid, show an error
            event.target.setCustomValidity('Please enter a valid ZIP code.');
        } else {
            // Clear any existing errors
            event.target.setCustomValidity('');
        }
        // Report the validity of the input field
        event.target.reportValidity();
        }
    }

    async handleErrorAlert(msg) {
        await LightningAlert.open({
            message: msg,
            theme: 'error',
            label: 'Error!', // this is the header text
        });
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
}