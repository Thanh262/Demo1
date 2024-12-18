/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/query', 'N/format'],

function(currentRecord, url, query, format) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */

    const ACTION_TYPE = {
        EMPTY: { ID: "", NAME: "" },
        UNCHANGED: { ID: 1, NAME: "Unchanged" },
        EDIT: { ID: 2, NAME: "Edit" },
        ADD: { ID: 3, NAME: "Add" },
    };

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
        let currRecord = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        if(sublistId !== 'custpage_sl_prod_labor') return true;

        let internalid = currRecord.getCurrentSublistValue(sublistId, "custpage_col_internalid");
        let date = currRecord.getCurrentSublistValue(sublistId, "custpage_col_date");
        if(!internalid) {
            if(!date) {
                currRecord.setCurrentSublistValue(sublistId, "custpage_col_date", new Date());
            }
            currRecord.setCurrentSublistValue(sublistId, "custpage_col_action", ACTION_TYPE.ADD.ID);
            currRecord.setCurrentSublistValue(sublistId, "custpage_col_subsidiary", currRecord.getValue("custpage_subsidiary"));
            currRecord.setCurrentSublistValue(sublistId, "custpage_col_location", currRecord.getValue("custpage_location"));
            currRecord.setCurrentSublistValue(sublistId, "custpage_col_work_center", currRecord.getValue("custpage_work_center"));
        }
        return true;
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

    }

    const onSearchResult = () => {
        window.onbeforeunload = null;
        const BASE_URL = url.resolveScript({
            scriptId: 'customscript_scv_sl_prod_labor_statistic',
            deploymentId: 'customdeploy_scv_sl_prod_labor_statistic',
            returnExternalUrl: false
        });

        let currRecord = currentRecord.get();
        let objFieldMandatory = validateFieldsMandatory(currRecord, ["custpage_subsidiary", "custpage_location", "custpage_work_center"]);
        if(!objFieldMandatory.isValidate) {
            return alert(objFieldMandatory.notification);
        }

        let urlDC = BASE_URL + plusParam(currRecord) + "&isrun=T";
        window.location.replace(urlDC);
    }

    const validateFieldsMandatory = (currRecord, fields) => {
        let isValidate = true;
        let notification = "Vui lòng nhập fields: ";

        for(let fieldId of fields) {
            let value = currRecord.getValue(fieldId);
            if(!value) {
                isValidate = false;
                notification += currRecord.getField(fieldId).label + ", ";
            }
        }
        return {
            isValidate, 
            notification: !!isValidate ? "Success!" : (notification.slice(0, notification.length - 2) + ".")
        };
    }

    function plusParam(currRecord) {
        return '&custpage_subsidiary=' + currRecord.getValue('custpage_subsidiary')
            + '&custpage_shift=' + currRecord.getValue('custpage_shift')
            + '&custpage_work_center=' + currRecord.getValue('custpage_work_center')
            + '&custpage_lot_no=' + currRecord.getValue('custpage_lot_no')
            + '&custpage_location=' + currRecord.getValue('custpage_location')
            + '&custpage_fromdt=' + currRecord.getText('custpage_fromdt')
            + '&custpage_todt=' + currRecord.getText('custpage_todt');
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        onSearchResult: onSearchResult,
        validateLine: validateLine,
        // saveRecord: saveRecord
    };
    
});
