/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/url', '../lib/scv_lib_cs', '../lib/scv_lib_cmms'],

function(ccr, search, url, lcs, libCmms) {
    
    const SUBLIST_RESULT = 'custpage_sl_result';
    const FIELDID_SELECT = 'chon';
    
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
        let location = currentRecord.getValue('custpage_location');
        let locationUserBins = false;
        if(location) {
            let lookupFieldsBin = search.lookupFields({type: search.Type.LOCATION, id: location, columns: ['usesbins']});
            locationUserBins = lookupFieldsBin.usesbins;
        }
        libCmms.toggleFieldUseBins(currentRecord, SUBLIST_RESULT, locationUserBins);
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
        let currentRecord = scriptContext.currentRecord;
        if(scriptContext.fieldId === 'custpage_location') {
            let location = currentRecord.getValue('custpage_location');
            
            let lineCountResult = currentRecord.getLineCount(SUBLIST_RESULT);
            if(lineCountResult) {
                if(location) {
                    let lookupFieldsBin = search.lookupFields({type: search.Type.LOCATION, id: location, columns: ['usesbins']});
                    let locationUserBins = lookupFieldsBin.usesbins;
                    if(locationUserBins === true) {
                        let listFieldBin = [];
                        for(let i = 0; i < lineCountResult; i++) {
                            let fieldBin = currentRecord.getSublistField({sublistId: SUBLIST_RESULT, fieldId: 'custpage_binnumber', line: i});
                            listFieldBin.push(fieldBin);
                        }
                        let cb = ['internalid', 'binnumber'];
                        let fb = [['inactive', 'is', false], 'and', ['location', 'anyof', location]];
                        lcs.insertSelection(listFieldBin, 'bin', cb, fb, true, null);
                    }
                    libCmms.toggleFieldUseBins(currentRecord, SUBLIST_RESULT, locationUserBins)
                } else {
                    libCmms.clearSelectBin(currentRecord, SUBLIST_RESULT, lineCountResult);
                }
            }
        }
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
        
        let location = currentRecord.getValue('custpage_location');
        if(!location) {
            alert('Hãy nhập Kho!');
            return isValid;
        }
        let message = 'Hãy chọn ít nhất một line!';
        
        let lookupFieldsBin = search.lookupFields({type: search.Type.LOCATION, id: location, columns: ['usesbins']});
        let lineCount = currentRecord.getLineCount(SUBLIST_RESULT);
        for(let i = 0; i < lineCount; i++) {
            let chon = currentRecord.getSublistValue({sublistId: SUBLIST_RESULT, fieldId: FIELDID_SELECT, line: i});
            let islotitem = currentRecord.getSublistValue({sublistId: SUBLIST_RESULT, fieldId: 'islotitem', line: i});
            let receiptinventorynumber = currentRecord.getSublistValue({sublistId: SUBLIST_RESULT, fieldId: 'receiptinventorynumber', line: i});
            let binnumber = currentRecord.getSublistValue({sublistId: SUBLIST_RESULT, fieldId: 'custpage_binnumber', line: i});
            let inventorystatus = currentRecord.getSublistValue({sublistId: SUBLIST_RESULT, fieldId: 'inventorystatus', line: i});
            let usebins = currentRecord.getSublistValue({sublistId: SUBLIST_RESULT, fieldId: 'usebins', line: i});
            
            if(chon === true) {
                isValid = true;
                if(islotitem === 'true') {
                    if(!receiptinventorynumber) {
                        message = 'Hãy nhập Searial/Lot Number!';
                        isValid = false; break;
                    }
                    if(!inventorystatus) {
                        message = 'Hãy nhập Trạng thái!';
                        isValid = false; break;
                    }
                }
                if((lookupFieldsBin.usesbins === true && usebins === 'true') && !binnumber) {
                    message = 'Hãy nhập BIN!';
                    isValid = false; break;
                }
            }
        }
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
            scriptId: 'customscript_scv_sl_cmms_nhapvt_thuhoi',
            deploymentId: 'customdeploy_scv_sl_cmms_nhapvt_thuhoi',
            returnExternalUrl: false,
            params: getParam(currentRecord)
        });
    }
    
    function getParam(currentRecord) {
        return {
            custpage_subsidiary: currentRecord.getValue('custpage_subsidiary'),
            custpage_asset: currentRecord.getValue('custpage_asset'),
            custpage_location: currentRecord.getValue('custpage_location'),
            custpage_trandate: currentRecord.getText('custpage_trandate'),
            custpage_scbd: currentRecord.getText('custpage_scbd')
        }
    }
    
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
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
