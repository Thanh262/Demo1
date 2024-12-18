/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url'],

function(ccr, url) {
    
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
        const customButtonTransferOrder = document.getElementById('tr_custpage_bt_transferorder');
        if (customButtonTransferOrder) {
            customButtonTransferOrder.classList.add('pgBntB');
        }
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

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

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
        let isValid = false;
        let sublistId = 'custpage_sl_result';
        let currentRecord = scriptContext.currentRecord;
        let message = 'Hãy chọn ít nhất một line!';
        
        let lineCount = currentRecord.getLineCount(sublistId);
        for(let i = 0; i < lineCount; i++) {
            let chon = currentRecord.getSublistValue({sublistId: sublistId, fieldId: 'chon', line: i});
            if(chon === true) {
                isValid = true;
                break;
            }
        }
        if(!isValid) {
            alert(message);
        }
        return isValid;
    }
    
    function transferOrder() {
        let currentRecord = ccr.get();
        if(saveRecord({currentRecord})) {
            currentRecord.setValue('custpage_type', 'transferorder');
            const submitButtonTransferOrder = document.getElementById('custpage_bt_transferorder');
            if (submitButtonTransferOrder.disabled) {
                alert('Giao dịch đang được xử lý, vui lòng chờ...');
                return false;
            }
            submitButtonTransferOrder.disabled = true;
        
            document.forms[0].submit();
        }
    }
    
    function searchReport() {
        window.onbeforeunload = null;
        let currentRecord = ccr.get();
        let urlDC = getUrlParam(currentRecord) + '&issearch=T';
        window.location.replace(urlDC);
    }
    
    function getUrlParam(currentRecord) {
        return url.resolveScript({
            scriptId: 'customscript_scv_sl_cmms_thongke_vtscbd',
            deploymentId: 'customdeploy_scv_sl_cmms_thongke_vtscbd',
            returnExternalUrl: false,
            params: getParam(currentRecord)
        });
    }
    
    function getParam(currentRecord) {
        return {
            custpage_subsidiary: currentRecord.getValue('custpage_subsidiary'),
            custpage_fromdate: currentRecord.getText('custpage_fromdate'),
            custpage_todate: currentRecord.getText('custpage_todate')
        }
    }
    
    return {
        pageInit: pageInit,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        saveRecord: saveRecord,
        transferOrder: transferOrder,
        searchReport: searchReport
    };
    
});
