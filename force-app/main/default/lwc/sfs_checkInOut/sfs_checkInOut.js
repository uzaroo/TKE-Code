import { LightningElement, track, api,wire } from 'lwc';
import { gql, graphql,refreshGraphQL } from "lightning/uiGraphQLApi";
import userId from '@salesforce/user/Id';


export default class CheckInOut extends LightningElement {
    userId=userId; // User ID passed to the component
    @track currentCheckInStatus;
    @track lastReportedCheckIn = '';
    @track lastReportedCheckOut = '';
    @track additionalComments = '';
    @track checkInStatus = false;
    serviceresourceData=[];
    serviceResourceRecord;
    
    @wire(graphql, {
        query: '$getServiceRecordQuery',
        variables: '$userParam'
      }) 
      wiredValue(result) {
        debugger;
        const { errors, data } = result;
        this.serviceresourceData=result;
        if (data!=undefined) {
            debugger;
            const recordData = data.uiapi.query.ServiceResource.edges.map((edge) => ({
                Id: edge.node.Id
            }));
            if (recordData.length > 0) {
                
                this.serviceResourceRecord = recordData;
                this.currentCheckInStatus=this.serviceResourceRecord.SFS_Checked_In_Out__c ;
            } 
        }
        if(errors)
        {
            console.log('some error occured '+JSON.stringify(errors));
        }
    }

    get getServiceRecordQuery() {
        
        const query = gql`
        query getServiceResource($technicianUserId: ID) {
            uiapi {
                query {
                    ServiceResource(where: { RelatedRecordId: { eq: $technicianUserId } }
                        first: 1) {
                        edges {
                            node {
                                Id
                                Checked_In_Out__c { value }  
                                Checked_In_Out_Date__c {value}                             
                            }
                        }
                    }
                }
            }
        }
        `;
    debugger;
    return query;
     }

    get userParam() {
        return {
            technicianUserId: this.userId ? this.userId : undefined,
        }
    }

    get buttonLabel() {
        return this.currentCheckInStatus ? 'Check Out' : 'Check In';
    }

    get buttonVariant() {
        return this.currentCheckInStatus  ? 'destructive' : 'brand';
    }

    handleToggle() {
        if (this.currentCheckInStatus ) {
            this.handleCheckOut();
        } else {
            this.handleCheckIn();
        }
    }

    handleCheckIn() {
        this.currentCheckInStatus = true;
        this.lastReportedCheckIn = new Date().toISOString();
        this.lastReportedCheckOut = '';
        this.checkInStatus = true;
        this.updateServiceResource();
    }

    handleCheckOut() {
        this.currentCheckInStatus =false;
        this.lastReportedCheckOut = new Date().toISOString();
        this.lastReportedCheckIn = '';
        this.checkInStatus = false;
        this.updateServiceResource();
    }

    updateServiceResource() {
        const fields = {};
        fields.Id = this.recordId; // Set the Service Resource ID
        fields.SFS_Checked_In_Out__c = this.checkInStatus;
      //  fields.Last_Reported_Check_In__c = this.checkInStatus ? this.lastReportedCheckIn : null;
       // fields.Last_Reported_Check_Out__c = !this.checkInStatus ? this.lastReportedCheckOut : null;

        const recordInput = { fields };

        // updateRecord(recordInput)
        //     .then(() => {
        //         this.dispatchEvent(new ShowToastEvent({
        //             title: 'Success',
        //             message: 'Service Resource updated successfully',
        //             variant: 'success',
        //         }));
        //     })
        //     .catch(error => {
        //         console.error('Error updating service resource:', error);
        //     });
    }

    handleCommentsChange(event) {
        this.additionalComments = event.target.value;
    }

    handleSuccess(event) {
        // Optionally handle success
    }
}