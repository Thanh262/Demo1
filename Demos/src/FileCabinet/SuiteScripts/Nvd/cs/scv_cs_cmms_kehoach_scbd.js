/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url'],

function(ccr, url) {
    
    const SUBLISTID_RESULT = 'custpage_sl_result';
    
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
        let currentRecord = scriptContext.currentRecord;
        let lineCount = currentRecord.getLineCount(SUBLISTID_RESULT);
        let sublistFieldsResult = ['custrecord_scv_cmms_mp_type_l', 'department', 'custrecord_scv_cmms_mp_fromdate_l', 'custrecord_scv_cmms_mp_fromtime_l', 'custrecord_scv_cmms_mp_todate_l', 'custrecord_scv_cmms_mp_totime_l'];
        for(let i = 0; i < lineCount; i++) {
            let id = currentRecord.getSublistValue({sublistId: SUBLISTID_RESULT, fieldId: 'id', line: i});
            if(!id) {
                for(let fieldId of sublistFieldsResult) {
                    let objField = currentRecord.getSublistField({sublistId: SUBLISTID_RESULT, fieldId: fieldId, line: i});
                    if(objField) {
                        objField.isDisabled = true;
                    }
                }
            }
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
        let currentRecord = scriptContext.currentRecord;
        let message = 'Hãy chọn ít nhất một line!';
        
        let lineCount = currentRecord.getLineCount(SUBLISTID_RESULT);
        isValid = !!lineCount;
        if(!isValid) {
            alert(message);
        }
        return isValid;
    }
    
    function searchReport() {
        window.onbeforeunload = null;
        let currentRecord = ccr.get();
        let urlDC = getUrlParam(currentRecord) + '&issearch=T';
        window.location.replace(urlDC);
    }
    
    function getUrlParam(currentRecord) {
        return url.resolveScript({
            scriptId: 'customscript_scv_sl_cmms_kehoach_scbd',
            deploymentId: 'customdeploy_scv_sl_cmms_kehoach_scbd',
            returnExternalUrl: false,
            params: getParam(currentRecord)
        });
    }
    
    function getParam(currentRecord) {
        return {
            custpage_subsidiary: currentRecord.getValue('custpage_subsidiary'),
            custpage_period: currentRecord.getValue('custpage_period'),
            custpage_period_text: currentRecord.getText('custpage_period'),
            custpage_famasset: currentRecord.getValue('custpage_famasset')
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
        searchReport: searchReport
    };
    
});
