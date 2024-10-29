import { LightningElement, wire,api } from 'lwc';
import { gql, graphql,refreshGraphQL } from "lightning/uiGraphQLApi";
import { CurrentPageReference } from 'lightning/navigation';
import LightningAlert from 'lightning/alert';
import { CloseActionScreenEvent } from 'lightning/actions';
import { getRecord ,createRecord,createContentDocumentAndVersion} from 'lightning/uiRecordApi';
import { refreshApex } from "@salesforce/apex";
import userId from '@salesforce/user/Id';
// Import fields from the PricebookEntry object
import NAME_FIELD from '@salesforce/schema/PricebookEntry.Name';
import PRODUCT_ID_FIELD from '@salesforce/schema/PricebookEntry.Product2Id';

// Define fields in an array
const fields = [NAME_FIELD, PRODUCT_ID_FIELD];
const textHomeAddress = 'My Home Address';
const textCustomerLocation = 'Customer Location';
const textofficeLocation = 'Office Location';
const textDropShipLocation = 'Drop Ship Location';
const textShiptoAddress='Ship To Address';

// API object and field imports for Product Request and Line Items
const PRODUCT_REQUEST_OBJECT = 'ProductRequest';
const WORK_ORDER_FIELD = 'WorkOrderId'; // Field on Product Request to link it to Work Order
const WORK_ORDER_LINEITEM_FIELD = 'WorkOrderLineItemId';
const ShipToCity_FIELD = 'ShipToCity';
const ShipToCountryCode_FIELD = 'ShipToCountryCode';
const ShipToPostalCode_FIELD = 'ShipToPostalCode';
const ShipToStateCode_FIELD = 'ShipToStateCode';
const ShipToStreet_FIELD = 'ShipToStreet';
const DestinationLocationId_FIELD = 'DestinationLocationId';
const NeedByDate_FIELD = 'NeedByDate';
const SHIPMENT_TYPE_FIELD = 'ShipmentType';
const QuantityUnitOfMeasure_FIELD='QuantityUnitOfMeasure';

const PRODUCT_REQUEST_LINE_ITEM_OBJECT = 'ProductRequestLineItem';
const PRODUCT_ID_REQUEST_OBJECT='SFS_Product_ID_Request__c';
const PRODUCT_FIELD = 'Product2Id';
const QUANTITY_FIELD = 'QuantityRequested';
const PRODUCT_REQUEST_FIELD = 'ParentId'; 
const WORK_ORDER_ID='WorkOrderId';

const SFS_Manufacturer__c='SFS_Manufacturer__c';
const SFS_Product_Description__c='SFS_Product_Description__c';
const SFS_Product_Request__c='SFS_Product_Request__c';
const SFS_Product_Usage_Location__c='SFS_Product_Usage_Location__c';
const SFS_Quantity__c='SFS_Quantity__c';
const SFS_Identifying_Vendor_Markings='SFS_Identifying_Vendor_Markings_on_Part__c';
import {
    log,
    debug,
    IMAGE_EXT,
    isNullOrEmpty,
    ToastTypes,
    dataURLtoFile
  } from "c/sfs_utilsImageCapture";

export default class Sfs_newProductRequest extends LightningElement {

    officeData=[];
    @api objectApiName;
    allImagesData = [];

    numPhotosToUpload = 0;
    numSuccessfullyUploadedPhotos = 0;

    createImageCollection = [];
    finalImageCollection = [];
    idIndex = 0;
    mobileview = true;
    needByDateValue;
    // Screen Booleans
    showFirstScreen = true;
    showSecondScreen = false;
    showThirdScreen = false;
    showFourthScreen = false;
    productIndex = 0;
    selectedProductRequestId;
    selectedProductRequestQuantity;
    userId = userId; //'005U7000006UUJlIAO';//userId;//'005TH000004p4GzYAI';//
    currentWorkOrderId; // Workorder id fetched from page reference
    isVisible = false;
    showNextButton = true;
    showFirstScreenError = false;
    selectedProductsCollection = [];
    productIdRequestCollection = [];
    // Address variables
    srPersonalAddress;
    srDropShipAddress;
    woCustomerLocation;
    woOfficeLocation;
    myHomeAddress = false;
    customerLocation = false;
    officeLocation = false;
    dropShipLocation = false;
    RelatedRecordId;
    adHocLocationToggled = false;
    adHocCountryCode;
    adHocCountry;
    adHocState;
    adHocStateCode;
    adHocCity;
    adHocStreet;
    adHocZipPostalCode;

    selectedShipmentType;
    selectedNeedByDate;
    selectedAddress = null;
    selectedAddressLocation;
    addressData;
    destinationLocationId;
    errors = false;
    pricebookdata;
    workOrderoffice;

    productIdRequestToggled = false;
    productIdRequestDescription = '';
    productIdRequestUsageLocation = '';
    productIdRequestQuantity = '';
    productIdRequestVendorMarkings = '';
    productIdRequestManufacturer = '';


    @wire(getRecord, { recordId: '$selectedProductRequestId',fields })
    loadRecord({ error, data }) {
        
       
        if (data) {
            this.pricebookdata = data;
            this.selectedRecordName = data.fields.Name.value;
            this.product2IdValue= data.fields.Product2Id.value;  // Fetching Name field
        } else if (error) {
            this.selectedRecordName = 'Record not found';
        }
    }

    async refreshofficeData() {
      return refreshGraphQL(this.officeData);
    }
    refreshPricebookData() {
        return refreshApex(this.pricebookdata);
    }

    @wire(CurrentPageReference)
    getStateParameters(currentPageReference) {
        

        if (this.currentWorkOrderId==undefined) {
            if(currentPageReference.state.recordId==undefined)
            {
                this.mobileview=false;
                this.currentWorkOrderId =currentPageReference.attributes.recordId;//"0WOTH000003AeDl4AK";//
            }
            else{
                this.mobileview=true;
            this.currentWorkOrderId =currentPageReference.state.recordId;//"0WOTH000003AeDl4AK";// currentPageReference.state.recordId;
            }
        }
    }

    @wire(graphql, {
        query: '$getallrecordquery',
        variables: '$alllocationparam'
      }) 
      wiredValue(result) {
        
        this.srPersonalAddress = undefined;
        this.srDropShipAddress = undefined;
        this.errors = undefined;
        const { errors, data } = result;
        if (data) {
            
            const serviceResourcePersonalAddress = data.uiapi.query.ServiceResource.edges.map((edge) => ({
                Id: edge.node.Id,
                RelatedRecordId:edge.node.RelatedRecordId,
                UserCity:edge.node.RelatedRecord?.City.value,
                UserState:edge.node.RelatedRecord?.State.value,
                UserStateCode:edge.node.RelatedRecord?.StateCode.value,
                UserCountry:edge.node.RelatedRecord?.Country.value,
                UserCountryCode:edge.node.RelatedRecord?.CountryCode.value,
                UserStreet:edge.node.RelatedRecord?.Street.value,
                UserPostalCode:edge.node.RelatedRecord?.PostalCode.value,
                Personal_Address__c: edge.node.Personal_Address__c.value,
                DropShipLocationId: edge.node.SFS_Parts_DropShip_Location__c?.value,
                DropShipStreet: edge.node.SFS_Parts_DropShip_Location__r?.Parts_Delivery_Address__Street__s.value,
                DropShipCity: edge.node.SFS_Parts_DropShip_Location__r?.Parts_Delivery_Address__City__s.value,
                DropShipCountryCode: edge.node.SFS_Parts_DropShip_Location__r?.Parts_Delivery_Address__CountryCode__s.value,
                DropShipPostalCode: edge.node.SFS_Parts_DropShip_Location__r?.Parts_Delivery_Address__PostalCode__s.value,
                DropShipStateCode: edge.node.SFS_Parts_DropShip_Location__r?.Parts_Delivery_Address__StateCode__s.value,
            }));
            
            if (serviceResourcePersonalAddress.length === 0) {
                this.errors = [`Couldn't find ServiceResource.`];
            } else {
                
                this.srPersonalAddress = serviceResourcePersonalAddress[0];
                this.RelatedRecordId=this.srPersonalAddress.RelatedRecordId;
                this.srPersonalAddress.Personal_Address__c=this.srPersonalAddress.Personal_Address__c;
                
            }
            const workOrderLocation = data.uiapi.query.WorkOrder.edges.map((edge) => ({
                Id: edge.node.Id,
                CustomerLocationId: edge.node.LocationId.value,
                CustomerLocationStreet: edge.node.Location?.Location_Address_CPQ__Street__s.value,
                CustomerLocationCity: edge.node.Location?.Location_Address_CPQ__City__s.value,
                CustomerLocationStateCode: edge.node.Location?.Location_Address_CPQ__StateCode__s.value,
                CustomerLocationPostalCode: edge.node.Location?.Location_Address_CPQ__PostalCode__s.value,
                CustomerLocationCountryCode: edge.node.Location?.Location_Address_CPQ__CountryCode__s.value,
                Office: edge.node.SFS_Office__c.value
            }));
            //try setting the office work order.
            if (workOrderLocation.length === 0) {
                this.errors = [`Couldn't find work order location.`];
            } else {
                this.woCustomerLocation = workOrderLocation[0];
                this.workOrderoffice = this.woCustomerLocation.Office;
               
            }
        }
        if (errors) {
            
            this.errors = errors;
        }
    }
      
      get getallrecordquery() {
        
         return gql`
         query getAllRecordsData($technicianUserId: ID, $workOrderId: ID) {
             uiapi {
                 query {
                     ServiceResource(where: { RelatedRecordId: { eq: $technicianUserId } }
                         first: 1) {
                         edges {
                             node {
                                 Id
                                 RelatedRecordId { value }
                                 Personal_Address__c { value }
                                 SFS_Parts_DropShip_Location__c{value}
                                 SFS_Parts_DropShip_Location__r {

                               
                                Parts_Delivery_Address__City__s { value }
                            Parts_Delivery_Address__CountryCode__s { value }
                            Parts_Delivery_Address__PostalCode__s { value }
                            Parts_Delivery_Address__StateCode__s { value }
                            Parts_Delivery_Address__Street__s { value }
    
      }
                                 RelatedRecord{
                                  Name { value }
                                    Street { value }
                                    City { value }
                                    CountryCode { value }
                                    PostalCode { value }
                                    StateCode{ value }
                                    State{value}
                                    Country{value}
                                 }
                                 
                             }
                         }
                     }
                     WorkOrder(where: { Id: { eq: $workOrderId } }
                         first: 1) {
                         edges {
                             node {
                                 Id
                                 SFS_Office__c { value }
                                 LocationId{value}
                                 Location {
                                     Id
                                     Location_Address_CPQ__City__s { value }
                                     Location_Address_CPQ__CountryCode__s { value }
                                     Location_Address_CPQ__PostalCode__s { value }
                                     Location_Address_CPQ__StateCode__s { value }
                                     Location_Address_CPQ__Street__s { value }
                                 }
                             }
                         }
                     }
                 }
             }
         }
     `; 
      }

    @wire(graphql, {
        query: gql`
            query getLocationBasedOnOffice($officeName: Picklist) {
                uiapi {
                    query {
                     Location(
                     
                      where: {
                    Office__c: { eq: $officeName }
                    Record_Type_Name__c: { eq: "TKE_Location" }
                            }
                            first: 1) {
                            edges {
                                node {
                                    Id
                                   VisitorAddress{ 
                                    Street { value }
                                    City { value }
                                    CountryCode { value }
                                    PostalCode { value }
                                    StateCode{ value }
                                    State{value}
                                    Country{value}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `,
        variables: "$locationparam"
    })
    wiredValueOffice(result) {
        const { errors, data } = result;
        this.officeData=result;
        if (data!=undefined) {
            
            const workOrderOfficeLocation = data.uiapi.query.Location.edges.map((edge) => ({
                Id: edge.node.Id,
                TKELocationCity:edge.node.VisitorAddress?.City.value,
                TKELocationCountryCode:edge.node.VisitorAddress?.CountryCode.value,
                TKELocationPostalCode:edge.node.VisitorAddress?.PostalCode.value,
                TKELocationStateCode:edge.node.VisitorAddress?.StateCode.value,
                TKELocationStreet:edge.node.VisitorAddress?.Street.value
            }));
            if (workOrderOfficeLocation.length === 0) {
                
                this.errors = [`Couldn't find work order office location.`];
            } else {
                this.woOfficeLocation = workOrderOfficeLocation[0];
            }
        }
    }

    /* Set the parameters to be used in query
       technicianUserId    : Logged in user id
       workOrderId         : Read from param reference the work order id
    */

    get alllocationparam() {
            
        if(this.userId && this.currentWorkOrderId)
        {
        return {
            technicianUserId: this.userId ? this.userId : '',
            workOrderId: this.currentWorkOrderId ? this.currentWorkOrderId : ''
        };
    }
    return undefined;
    }
   

    get locationparam() {
        if(this.workOrderoffice)
        {
        return {
            officeName:this.workOrderoffice //'104976'// this.workOrderoffice
        };
    }
    return undefined;
    }
   
   
//get tkelocation based on work order officename (Office Address)

    get addressOptions() {
        return [
            { label: textHomeAddress, value: textHomeAddress },
            { label: textCustomerLocation, value: textCustomerLocation },
            { label: textofficeLocation, value: textofficeLocation },
            { label: textDropShipLocation, value: textDropShipLocation },
        ];
    }

    get shipmentTypeOptions() {
        return [
            { label: 'Standard', value: 'Standard' },
            { label: 'Overnight', value: 'Overnight' },
        ];
    }

    handleSelectAddress(event) {
        
        if(this.woOfficeLocation==undefined)
            {
                this.refreshofficeData();
            }
        const selectedValue = event.detail.value
        this.adHocLocationToggled=false;
        this.selectedAddress = selectedValue;
        this.selectedAddressLocation = selectedValue;
        this.addressData = {};
        if (this.selectedAddress === textHomeAddress) {
            this.customerLocation = false;
            this.officeLocation = false;
            this.dropShipLocation = false;
            if(this.srPersonalAddress!=undefined && this.srPersonalAddress.Personal_Address__c!=undefined)
            {
                this.myHomeAddress = true;
                this.addressData = {
                    Street: this.srPersonalAddress.UserStreet,
                    City:this.srPersonalAddress.UserCity,
                    StateCode: this.srPersonalAddress.UserStateCode,
                    PostalCode: this.srPersonalAddress.UserPostalCode,
                    CountryCode: this.srPersonalAddress.UserCountryCode, // Remove the semicolon here
                };
            }

        } else if (this.selectedAddress === textCustomerLocation) {
            this.myHomeAddress = false;
            this.officeLocation = false;
            this.dropShipLocation = false;
            if(this.woCustomerLocation!=undefined)
            {
                this.customerLocation = true;
                this.destinationLocationId=this.woCustomerLocation.CustomerLocationId;
            }

        } else if (this.selectedAddress === textofficeLocation) {

            this.customerLocation = false;
            this.myHomeAddress = false;
            this.dropShipLocation = false;        
            this.officeLocation = true;
            if(this.woOfficeLocation!=undefined)
            {
                this.destinationLocationId=this.woOfficeLocation.Id;

            }
            else{
                    this.refreshofficeData();
                    this.destinationLocationId=this.woOfficeLocation?.Id;
            }
        } else if (this.selectedAddress === textDropShipLocation) {
            this.officeLocation = false;
            this.customerLocation = false;
            this.myHomeAddress = false;
            if(this.srPersonalAddress!=undefined)
            {
                
                    this.dropShipLocation = true;
                    this.destinationLocationId=this.srPersonalAddress.DropShipLocationId;
                    this.addressData = {
                        Street: this.srPersonalAddress.DropShipStreet,
                        City:this.srPersonalAddress.DropShipCity,
                        StateCode: this.srPersonalAddress.DropShipStateCode,
                        PostalCode: this.srPersonalAddress.DropShipPostalCode,
                        CountryCode: this.srPersonalAddress.DropShipCountryCode, // Remove the semicolon here
                    };
            }
        }
    }

    handleAdHocLocationToggle(event) {
        this.selectedAddress = null;
        this.adHocLocationToggled = event.target.checked;
        this.myHomeAddress = false;
        this.customerLocation = false;
        this.officeLocation = false;
        this.dropShipLocation = false;
        if (this.adHocLocationToggled) {
            this.selectedAddressLocation = textShiptoAddress;
        } else {
            this.selectedAddressLocation = '';
        }
    }

    handleShipmentTypeChange(event) {
        this.selectedShipmentType = event.detail.value;
    }

    handleNeedByDateChange(event) {

        const selectedValue = event.target.value;
        this.needByDateValue = selectedValue;
        const date = new Date(selectedValue);

        // Format the date to YYYY-MM-DDTHH:mm:ss
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        // Construct the formatted date string
        this.selectedNeedByDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    get buttonClass() {
        return this.isVisible ? 'visibility-visible' : 'visibility-hidden';
    }

    handleBackButtonVisibility() {
        this.isVisible = !this.isVisible;
    }
    handleScreenNextClick(event) {
        if (this.validateComponents()) {
            if (!this.showSecondScreen && this.adHocLocationToggled && !this.showThirdScreen && !this.showFourthScreen && !this.showFifthScreen && !this.showReviewScreen) {

                this.showFirstScreen = false;
                this.showSecondScreen = true;
                this.handleBackButtonVisibility();

            } else if ((!this.showThirdScreen && !this.adHocLocationToggled && !this.showFourthScreen && !this.showFifthScreen && !this.showReviewScreen) || (!this.showThirdScreen && this.adHocLocationToggled && !this.showFourthScreen && !this.showFifthScreen && !this.showReviewScreen)) {
                if (this.adHocLocationToggled) {
                    var addressSelectorComp = this.template.querySelector('c-sfs_address-Selector');
                    this.adHocCountry = addressSelectorComp.countryLabel;
                    this.adHocCountryCode = addressSelectorComp.countryCode;
                    this.adHocStateCode = addressSelectorComp.stateCode;
                    this.adHocState = addressSelectorComp.stateLabel;
                    this.adHocCity = addressSelectorComp.city;
                    this.adHocStreet = addressSelectorComp.street;
                    this.adHocZipPostalCode = addressSelectorComp.zipPostalCode;
                }
                this.showFirstScreen = false;
                this.showSecondScreen = false;
                this.showThirdScreen = true;
                if (!this.adHocLocationToggled)
                    this.handleBackButtonVisibility();
            } else if (!this.showFifthScreen && !this.showFourthScreen && !this.showReviewScreen) {

                this.showFirstScreen = false;
                this.showSecondScreen = false;
                this.showThirdScreen = false;
                this.showFourthScreen = true;
                this.showFifthScreen = false;

            } else if (!this.showReviewScreen) {
                if (this.productIdRequestToggled) {
                    this.finalImageCollection.push(this.createImageCollection[0]);
                    this.createImageCollection = [];
                    var productIdComponent = this.template.querySelector('c-sfs_new-product-id-request');
                    this.productIdRequestDescription = productIdComponent.productIdRequestDescription;
                    this.productIdRequestUsageLocation = productIdComponent.productIdRequestUsageLocation;
                    this.productIdRequestQuantity = productIdComponent.productIdRequestQuantity;
                    this.productIdRequestVendorMarkings = productIdComponent.productIdRequestVendorMarkings;
                    this.productIdRequestManufacturer = productIdComponent.productIdRequestManufacturer;
                    this.createProductIdRequestCollection(productIdComponent);
                } else {
                    var sfsProductPicker = this.template.querySelector('c-sfs_product-picker');
                    this.selectedProductRequestId = sfsProductPicker.selectedProductRequestId;
                    this.selectedProductRequestQuantity = sfsProductPicker.selectedQuantity;
                    this.createProductRequestCollection(this.selectedProductRequestId, this.selectedProductRequestQuantity, this.product2IdValue);
                }
                this.showSecondScreen = false;
                this.showFirstScreen = false;
                this.showThirdScreen = false;
                this.showFourthScreen = false;
                this.showFifthScreen = false;
                this.showReviewScreen = true;
            } else if (this.showReviewScreen) {

                this.handleSubmit();
            }
        }
    }
    handleProductRequestChange(e) {
        this.selectedProductRequestId = e.detail;
        this.refreshPricebookData();
    }

    createProductRequestCollection(productId, quantity, product2IdValue) {
        if(this.selectedAssetList.length>0){
        this.selectedAssetList.forEach(lineItemId => {
            // Perform any logic you need with each item
            // For example, you could log the item or check a condition
            this.selectedProductsCollection.push({
                WorkOrderId: this.productIndex,
                WorkOrderLineItemId:lineItemId,
                productId: product2IdValue,
                quantity: quantity,
            });
            this.productIndex += 1;
        });
    }
    else{
          // Perform any logic you need with each item
            // For example, you could log the item or check a condition
            this.selectedProductsCollection.push({
                WorkOrderId: this.productIndex,
                productId: product2IdValue,
                quantity: quantity,
            });
            this.productIndex += 1;
    }
     
        
    }
    productIDIndex = 0;
    createProductIdRequestCollection(productIdComponent) {
        this.productIdRequestCollection.push({
            productRequestId: this.productIDIndex,
            productIdRequestDescription: productIdComponent.productIdRequestDescription,
            productIdRequestUsageLocation: productIdComponent.productIdRequestUsageLocation,
            productIdRequestQuantity: productIdComponent.productIdRequestQuantity,
            productIdRequestVendorMarkings: productIdComponent.productIdRequestVendorMarkings,
            productIdRequestManufacturer: productIdComponent.productIdRequestManufacturer
        });
        this.productIDIndex += 1;
    }

    async handleSubmit() {
        try {
            const productRequestId = await this.createProductRequest();
            if (this.selectedProductsCollection.length > 0) {
                await this.createProductRequestLineItems(productRequestId);
            }
            if (this.productIdRequestCollection.length > 0) {
                const createdRecordIds = await this.createProductIdRequests(productRequestId);
                this.updateFinalImageCollection(createdRecordIds);
                await this.uploadImages();
            }

            this.handleSuccessAlert('New Product Request created.').then(() => {
                this.closeQuickAction();
            });

        } catch (error) {
            this.handleErrorAlert('Some Error Occurred.');

        }
    }

    async createProductRequest() {
        const productRequestFields = this.buildProductRequestFields();
        const productRequestRecordInput = {
            apiName: PRODUCT_REQUEST_OBJECT,
            fields: productRequestFields
        };
        const productRequestRecord = await createRecord(productRequestRecordInput);
        return productRequestRecord.id; // Return the Product Request ID
    }

    buildProductRequestFields() {
        const fields = {};
        fields[WORK_ORDER_FIELD] = this.currentWorkOrderId;

        if (this.adHocLocationToggled) {
            this.addressData = {
                Street: this.adHocStreet,
                City: this.adHocCity,
                StateCode: this.adHocStateCode,
                PostalCode: this.adHocZipPostalCode,
                CountryCode: this.adHocCountryCode
            };
        }

        if (this.addressData) {
            fields[ShipToCity_FIELD] = this.addressData.City;
            fields[ShipToCountryCode_FIELD] = this.addressData.CountryCode;
            fields[ShipToPostalCode_FIELD] = this.addressData.PostalCode;
            fields[ShipToStateCode_FIELD] = this.addressData.StateCode;
            fields[ShipToStreet_FIELD] = this.addressData.Street;
        }

        fields[DestinationLocationId_FIELD] = this.destinationLocationId;
        fields[NeedByDate_FIELD] = this.selectedNeedByDate;
        fields[SHIPMENT_TYPE_FIELD] = this.selectedShipmentType;

        return fields;
    }

    async createProductRequestLineItems(productRequestId) {
        const recordPromises = this.selectedProductsCollection.map(product => this.buildProductRequestLineItem(productRequestId, product));
        await Promise.all(recordPromises);
    }

    buildProductRequestLineItem(productRequestId, product) {
        const productRequestLineItemFields = {
            [PRODUCT_REQUEST_FIELD]: productRequestId,
            [PRODUCT_FIELD]: product.productId,
            [QUANTITY_FIELD]: product.quantity,
            [WORK_ORDER_ID]: this.currentWorkOrderId,
            ...this.addressData && {
                [ShipToCity_FIELD]: this.addressData.City,
                [ShipToCountryCode_FIELD]: this.addressData.CountryCode,
                [ShipToPostalCode_FIELD]: this.addressData.PostalCode,
                [ShipToStateCode_FIELD]: this.addressData.StateCode,
                [ShipToStreet_FIELD]: this.addressData.Street,
            },
            [DestinationLocationId_FIELD]: this.destinationLocationId,
            [NeedByDate_FIELD]: this.selectedNeedByDate,
            [QuantityUnitOfMeasure_FIELD]: 'Each'
        };
        if(this.selectedAssetList.length>0){
            Object.assign(productRequestLineItemFields, {
                [WORK_ORDER_LINEITEM_FIELD]: product.WorkOrderLineItemId
            });
        }
        const lineItemRecordInput = {
            apiName: PRODUCT_REQUEST_LINE_ITEM_OBJECT,
            fields: productRequestLineItemFields
        };
        return createRecord(lineItemRecordInput);
    }

    async createProductIdRequests(productRequestId) {
        const recordPromisesIdRequest = this.productIdRequestCollection.map(productId => this.buildProductIdRequest(productRequestId, productId));
        const createdRecords = await Promise.all(recordPromisesIdRequest);
        return createdRecords.map(record => record.id); // Return the IDs of created records
    }

    buildProductIdRequest(productRequestId, productId) {
        const productIdRequestFields = {
            [SFS_Product_Request__c]: productRequestId,
            [SFS_Manufacturer__c]: productId.productIdRequestManufacturer,
            [SFS_Product_Description__c]: productId.productIdRequestDescription,
            [SFS_Product_Usage_Location__c]: productId.productIdRequestUsageLocation,
            [SFS_Quantity__c]: productId.productIdRequestQuantity,
            [SFS_Identifying_Vendor_Markings]: productId.productIdRequestVendorMarkings,
        };

        const productIdRequestInput = {
            apiName: PRODUCT_ID_REQUEST_OBJECT,
            fields: productIdRequestFields
        };
        return createRecord(productIdRequestInput);
    }

    updateFinalImageCollection(createdRecordIds) {
        this.finalImageCollection = this.finalImageCollection.map((item, index) => ({
            ...item,
            productIdRecordId: index < createdRecordIds.length ? createdRecordIds[index] : item.productIdRecordId
        }));
    }

    async uploadImages() {
        for (const item of this.finalImageCollection) {
            await this.handleUploadRequested(item.productIdRecordId, item.ImagesUploaded);
        }
    }
    
    closeQuickAction() {

        this.dispatchEvent(new CloseActionScreenEvent());
    }

    handleScreenBackClick(event) {
        this.productIdRequestToggled = false;
        // Handle case for Fourth Screen going back to Third Screen
        if (this.showReviewScreen) {
            this.showFifthScreen = false;
            this.showFourthScreen = true;
            this.showReviewScreen = false;
            this.showThirdScreen = false;
            this.showSecondScreen = false;
            this.showFirstScreen = false;

        } else if (this.showFifthScreen) {
            this.createImageCollection = [];
            this.showReviewScreen = false;
            this.showFifthScreen = false;
            this.showThirdScreen = false;
            this.showFourthScreen = true;
            this.showSecondScreen = false;
            this.showFirstScreen = false;
        } else if (this.showFourthScreen) {
            this.showReviewScreen = false;
            this.showFifthScreen = false;
            this.showThirdScreen = true;
            this.showFourthScreen = false;
            this.showSecondScreen = false;
            this.showFirstScreen = false;
        }
        // Handle case for Third Screen going back to Second Screen
        else if (this.showThirdScreen) {
            this.showFifthScreen = false;
            this.showThirdScreen = false;
            this.showReviewScreen = false;
            this.showFourthScreen = false;

            if (this.adHocLocationToggled) {
                this.showSecondScreen = true;
            } else {
                this.handleBackButtonVisibility();
                this.showFirstScreen = true;
            }
        }
        // Handle case for Second Screen going back to First Screen
        else if (this.showSecondScreen) {

            this.handleBackButtonVisibility();
            this.showSecondScreen = false;
            this.showFirstScreen = true;
        }
        // No action if already at the first screen
        else {
            console.log('You are already at the first screen.');
        }
    }

    handleAddAnotherProductRequest() {
        this.showReviewScreen = false;
        this.productIdRequestToggled = false;
        this.showFourthScreen = true;
    }
    showFifthScreen = false;
    handleChangeProductIdRequest() {
        this.productIdRequestToggled = true;
        //handle product id request
        this.showFifthScreen = true;
        this.showFourthScreen = false;
        this.showReviewScreen = false;
        this.showFirstScreen = false;
        this.showSecondScreen = false;
        this.showFirstScreen = false;
        this.showThirdScreen = false;
    }

    validatefirstScreen() {
        if ((!this.adHocLocationToggled || this.adHocLocationToggled == undefined) && (this.selectedAddress == null || this.selectedAddress == undefined)) {
            this.showFirstScreenError = true;
            return false;
        } else {
            this.showFirstScreenError = false;
            return true;
        }
    }

    datetimeerrormsg=false;
    validateComponents() {
        let isParentValid = true;
        let areChildrenValid = true;
    
        if (this.showFirstScreen) {
            return this.validatefirstScreen();
        } else {
            // 1. Validate parent fields using the 'requiredvalidation' class
            const parentFields = [...this.template.querySelectorAll('.requiredvalidation')];
            isParentValid = parentFields.reduce((validSoFar, input) => {
                input.reportValidity(); // Show validation error (if any)
                return validSoFar && input.checkValidity(); // Aggregate validity
            }, true);
    
            // 2. Special case for the datetime-local input
            const dateTimeInput = this.template.querySelector('input[type="datetime-local"].requiredvalidation');
            if (dateTimeInput) {
                const isValid = dateTimeInput.checkValidity();
                dateTimeInput.reportValidity(); // Show validation error (if any)
                
                // Get the parent div of the input
                const parentDiv = dateTimeInput.closest('.slds-form-element__control');
    
                // Add error class to the parent div for visual feedback
                if (!isValid) {
                    this.datetimeerrormsg=true;
                    parentDiv.classList.add('error');
                    dateTimeInput.classList.add('error');
                    isParentValid = false; // Mark as invalid
                } else {
                    this.datetimeerrormsg=false;
                    parentDiv.classList.remove('error');
                    dateTimeInput.classList.remove('error');
                }
            }
    
            // 3. Validate child components
            const childComponents = [...this.template.querySelectorAll('c-sfs_product-picker, c-sfs_address-Selector, c-sfs_new-product-id-request,c-sfs_multi-select-picklist')];
          
       
            areChildrenValid = childComponents.reduce((validSoFar, child) => {
                
                const isValid = child.validateFields(); // Call validateFields on each child
                return validSoFar && isValid; // Call validateFields on each child
            }, true);
    
            // Return true if both parent and child components are valid
            return isParentValid && areChildrenValid;
        }
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

    handleGetImageUploaded(event) {
        this.createImageCollection.push({
            productIdRecordId: this.idIndex++,
            ImagesUploaded: event.detail,
        });
    }
    @api
    async handleUploadRequested(productIdRequestId, imagedata) {

        this.allImagesData = imagedata;
        try {
            await this.uploadAllPhotos(productIdRequestId);
        } catch (e) {
            if (e.message) {

            } else {}
            return;
        } finally {

        }

        // Empty allImagesData to display the initial screen
        this.allImagesData = [];

    }

    async uploadAllPhotos(productIdRequestId) {
        
        this.numPhotosToUpload = this.allImagesData.length;
        this.numSuccessfullyUploadedPhotos = 0;



        // Make a copy of allImagesData to loop over it, because we modify allImagesData
        let allImagesCopy = [...this.allImagesData];

        for (const item of allImagesCopy) {
            const fullFileName = await this.getFullFileName(item);
            const description = item.editedImageInfo.description || item.description;
            await this.uploadData(
                fullFileName,
                description,
                item.data,
                productIdRequestId
            );
            this.numSuccessfullyUploadedPhotos++;
        }
    }

    async getFullFileName(item) {
        
        const ext = item.metadata.edited ? IMAGE_EXT : item.metadata.ext;
        var fullFileName = item.editedImageInfo.fileName || item.metadata.fileName;
        if (!isNullOrEmpty(ext)) {
            fullFileName += `.${ext}`;
        }
        // Replace whitespaces with underscores
        fullFileName = fullFileName.replaceAll(" ", "_");
        return fullFileName;
    }

    // Use LDS createContentDocumentAndVersion function to upload file to a ContentVersion object.
    // This method creates drafts for ContentDocument and ContentVersion objects.
    async uploadData(fileName, description, fileData, productIdRequestId) {
        

        try {

            let fileObject = dataURLtoFile(fileData, fileName);
            const contentDocumentAndVersion =
                await createContentDocumentAndVersion({
                    title: fileName,
                    description: description,
                    fileData: fileObject
                });

            const contentDocumentId = contentDocumentAndVersion.contentDocument.id;
            // Create a ContentDocumentLink (CDL) to associate the uploaded file
            // to the Files Related List of a record, like a Work Order.
            await this.createCdl(productIdRequestId, contentDocumentId);
        } catch (err) {

        }
    }
    async createCdl(productIdRequestId, contentDocumentId) {
        
        debug("Creating a CDL...");

        await createRecord({
                apiName: "ContentDocumentLink",
                fields: {
                    LinkedEntityId: productIdRequestId,
                    ContentDocumentId: contentDocumentId,
                    ShareType: "V"
                }
            })
            .then(() => {
                
                //debug("Successfully created a CDL!");
            })
            .catch((e) => {
                

            });
    }


    assetpicklistlabel='Asset';
    singleAssetWO=true;
    @wire(graphql, {
        query: '$workOrderLineItemQuery',
        variables: "$workorderparam"
      }) 
      wiredWorkOrderLineItems({ error, data }) {
        
        if (data) {
            this.options = data.uiapi.query.WorkOrderLineItem.edges.map(edge => {
                return {
                    label: edge.node.SFS_Asset_Label__c.value, // Extracting the label from the JSON
                    value: edge.node.Id // Extracting the value (ID) from the JSON
                };
            });
            if(this.options.length>1)
            {
                this.assetpicklistlabel=' Select one or more assets for the above product';
                this.singleAssetWO=false;
            
            }
            else{
                this.assetpicklistlabel='Asset';
                this.singleAssetWO=true;
                this.SingleAssetName=this.options[0].label;
                this.selectedAssetList.push(this.options[0].value);
                this.selectedAssetList= [...new Set(this.selectedAssetList)];
            }
        } else if (error) {
         
            console.error('Error fetching work order line items:', error);
        }
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

    selectedAssetList = [];
    selectedValueCombobox='';
  

 //for single select picklist
 handleSelectOption(event){

    this.selectedValueCombobox = event.detail;
}

//for multiselect picklist
handleSelectOptionList(event){
    this.selectedAssetList = event.detail;
    this.selectedAssetList= [...new Set(this.selectedAssetList)];
}
}