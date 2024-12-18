/**
 * @NApiVersion 2.1
 * @NScriptType workflowactionscript
 */
define(['N/record', 'N/redirect'],

function(record, redirect) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @Since 2016.1
     */
    function onAction(scriptContext) {
    	let newRecord = scriptContext.newRecord;
    	let recType = newRecord.type;
    	let viewUrl = '/app/accounting/transactions/journal.nl?whence=';
    	viewUrl += '&createdfromid=' + newRecord.id + '&createdrectype=' + recType;
    	redirect.redirect({url: viewUrl});
    }
    
    return {
        onAction : onAction
    };
    
});
