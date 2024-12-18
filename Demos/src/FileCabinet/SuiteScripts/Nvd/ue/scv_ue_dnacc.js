/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', '../lib/scv_lib_function.js', '../lib/scv_lib_dnacc.js'],

function(record, lbf, ldn) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {
    	if(scriptContext.type === 'copy') {
    		let newRecord = scriptContext.newRecord;
    		lbf.setValueData(newRecord, ['custbody_scv_created_transaction', 'custbody_scv_related_transaction'
    		    , 'custbody_scv_emp_number', 'custbody_scv_doc_number', 'custbody_scv_docnum', 'custbody_scv_doc_altnumber']
    		, ['','','','', '', '']);
    	}
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(scriptContext) {
    	let trType = scriptContext.type;
    	if(trType === 'create' || trType === 'edit' || trType === 'copy') {
	    	let newRecord = scriptContext.newRecord;
	    	ldn.makeDocNumber(newRecord);	    		    	
    	}
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(scriptContext) {
    	let tgType = scriptContext.type;
    	if(tgType === 'create' || tgType === 'copy') {
    		let newRecord = scriptContext.newRecord;
    		let doc_number = newRecord.getValue('custbody_scv_doc_number');
    		let id = newRecord.id;
    		if(doc_number !== undefined && !doc_number && id) {
    			doc_number = ldn.makeDocNumber(newRecord);
				if(doc_number) {
					record.submitFields({type: newRecord.type, id: id, values: {custbody_scv_doc_number: doc_number}});
				}
    		}
    	}
    }
     
    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
    
});
