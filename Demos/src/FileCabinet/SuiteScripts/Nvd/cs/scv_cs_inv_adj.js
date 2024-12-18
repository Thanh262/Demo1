/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord'],

function(currentRecord) {
    
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
        commitDataLineMakeCopyIA(scriptContext);
    }

    function getObjParams (curRec) {
        let strParams = curRec.getValue('entryformquerystring').split('&');
        let objParams = {};
        for (let i = 0; i < strParams.length; i++) {
            let arr = strParams[i].split('=');
            objParams[arr[0]] = arr[1];
        }
        return objParams;
    }

    function commitDataLineMakeCopyIA(scriptContext) {
        let mode = scriptContext.mode;
        if (['create', 'copy'].indexOf(mode) === -1) return;
        let curRec = currentRecord.get();
        let objParams = getObjParams(curRec);
        if (objParams.makecopy !== 'T') return;
        let slId = 'inventory';
        let lc = curRec.getLineCount(slId);
        for (let i = 0; i < lc; i++) {
            curRec.selectLine(slId, i);
            let avail = curRec.getCurrentSublistValue({sublistId: slId, fieldId: 'inventorydetailavail'});
            let qty = curRec.getCurrentSublistValue({sublistId: slId, fieldId: 'adjustqtyby'});
            if (avail != 'T') {
                curRec.commitLine(slId);
                continue;
            }
            let invDetRec = curRec.getCurrentSublistSubrecord({sublistId: slId, fieldId: 'inventorydetail'});
            if (!invDetRec) {
                curRec.commitLine(slId);
                continue;
            }
            invDetRec.setValue('totalquantity', qty);
            curRec.commitLine(slId);
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

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged
    };
    
});
