/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect', '../lib/scv_lib_function.js'],

(record, redirect, lbf) => {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
	const onRequest = (context) => {
    	let request = context.request;
		let parameters = request.parameters;
		let irid = parameters.irid;
		let ordertype = parameters.ordertype;
		let createdfrom = parameters.createdfrom;
		let status = parameters.status;
		if(ordertype === 'PurchOrd' && (status === 'pendingBilling' || status === 'partiallyReceived' || status === 'pendingBillPartReceived')) {
			let recIr = record.load({type:'itemreceipt', id: irid});
			let recVb = record.transform({fromType: 'purchaseorder', fromId: createdfrom, toType: 'vendorbill', isDynamic: true});
			let nFieldData = ['custbody_scv_created_transaction'];
			lbf.setValueData(recVb, nFieldData, [irid]);
			let slIt = 'item';
			let lcItIr = recIr.getLineCount(slIt);
			let lcItVb = recVb.getLineCount(slIt);
			let isRemove, quantityIr, listLineRm = [];
			let listOLEx = {}, line, orderline, orderlineIr, locationIr, rateIr;
			for(let i = 0; i < lcItVb; i++) {
				orderline = recVb.getSublistValue({sublistId: slIt, fieldId: 'orderline', line: i});
				line = recVb.getSublistValue({sublistId: slIt, fieldId: 'line', line: i});
				isRemove = true;
				for(let j = 0; j < lcItIr; j++) {
					orderlineIr = recIr.getSublistValue({sublistId: slIt, fieldId: 'orderline', line: j});
					locationIr = recIr.getSublistValue({sublistId: slIt, fieldId: 'location', line: j});
					if(orderline === orderlineIr) {
						if(!listOLEx[String(orderline)]) {
							isRemove = false;
							quantityIr = recIr.getSublistValue({sublistId: slIt, fieldId: 'quantity', line: j});
							rateIr = recIr.getSublistValue({sublistId: slIt, fieldId: 'rate', line: j});
							
							recVb.selectLine({sublistId: slIt, line: i});
							recVb.setCurrentSublistValue({sublistId: slIt, fieldId: 'quantity', value: quantityIr});
							recVb.setCurrentSublistValue({sublistId: slIt, fieldId: 'location', value: locationIr});
							recVb.setCurrentSublistValue({sublistId: slIt, fieldId: 'rate', value: rateIr});
							recVb.commitLine({sublistId: slIt});
							
							listOLEx[String(orderline)] = orderline;
						}
					}
				}
				if(isRemove) {
					listLineRm.push(line);
				}
			}
			removeLineLine(recVb, slIt, listLineRm);
			let id = recVb.save({enableSourcing: true, ignoreMandatoryFields : true});
			redirect.toRecord({type : 'vendorbill', id : id});
		} else {
			redirect.toRecord({type : 'itemreceipt', id : irid});
		}
    }
	
	const removeLineLine = (recVb, slIt, listLineRm) => {
    	let lLRemove = listLineRm.length;
    	let lcItVb, line;
    	for(let j = 0; j < lLRemove; j++) {
    		lcItVb = recVb.getLineCount(slIt);
    		for(let i = lcItVb - 1; i >= 0; i--) {
    			line = recVb.getSublistValue({sublistId: slIt, fieldId: 'line', line: i});
				if(listLineRm[j] === line) {
					recVb.removeLine({sublistId: slIt, line: i});	
					lcItVb = lcItVb - 1;
				}
    		}	
    	}
    }
    
    return {
        onRequest
    };
    
});
