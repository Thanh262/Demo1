/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/url',
    '../cons/scv_cons_inventory_balance.js', '../lib/scv_lib_cs.js'
],

function(url, constInvBalance, libCS) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
        
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        window.onbeforeunload = null;
        let curRec = scriptContext.currentRecord;
        let fieldId = scriptContext.fieldId;
        if(fieldId === 'custpage_location') {
            let urlSl = url.resolveScript({
                scriptId: 'customscript_scv_sl_popup_inv_balance',
                deploymentId: 'customdeploy_scv_sl_popup_inv_balance',
                returnExternalUrl: false
            });
            urlSl += plusParam(curRec);
            window.location.replace(urlSl);
        }
	}

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        libCS.showLoadingDialog(true);
        libCS.delay(200)
            .then(() => {
                constInvBalance.onSubmitPopupInvBalance(scriptContext);
            })
            .catch((err) => console.error(err))
            .finally(() => libCS.showLoadingDialog(false))
        
        return false;
    }

    function plusParam(curRec) {
		return '&line_number=' + curRec.getValue('custpage_line') +
            '&item=' + curRec.getValue('custpage_item') +
            '&location=' + curRec.getValue('custpage_location') + 
            '&sublistId=' + curRec.getValue('custpage_sublistid') + 
            '&recType=' + curRec.getValue('custpage_rectype') + 
            '&ifrmcntnr=T';
	}

    function onCancel() {
        closePopup(true);
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        onCancel: onCancel
    };
    
});
