import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class SlsObjectAwareModalPoc extends LightningModal {
    @api content;
    @api _objectApiName;
    @api _requiredFields;

    handleOkay() {
        this.close('okay');
    }
}