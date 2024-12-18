/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '../lib/scv_lib_function.js'],
function(record, search, lbf) {

    function each(params) {
    	let recAcc = record.load({type: params.type, id: params.id});
    	let parent = recAcc.getValue('parent');
    	let acc = {number: '', name: ''};
    	if(lbf.isContainValue(parent)) {
    		getNumberAccunt(params.type, parent, acc);
    	}
    	recAcc.setValue('custrecord_scv_cct_acc_parent', acc.number);
    	recAcc.setValue('custrecord_scv_cct_acc_parent_name', acc.name);
    	try {
			recAcc.save();
		} catch (e) {
			log.debug('exception', e);
		}
    }
    
    function getNumberAccunt(type, id, acc) {    	
    	let recAcc = record.load({type: type, id: id});
    	let parent = recAcc.getValue('parent');
    	if(acc.number.length > 0) {
    		acc.number = recAcc.getValue('acctnumber') + '//' + acc.number;
    		acc.name = recAcc.getValue('acctname') + '//' + acc.name;
		} else {
			acc.number = recAcc.getValue('acctnumber');
			acc.name = recAcc.getValue('acctname');
		}    	
    	if(lbf.isContainValue(parent)) {    		
    		getNumberAccunt(type, parent, acc);
    	}    	
    }
    
    return {
        each: each
    };
    
});
