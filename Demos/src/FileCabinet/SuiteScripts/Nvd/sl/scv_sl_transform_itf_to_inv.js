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
		let itfid = parameters.itfid;
		let ordertype = parameters.ordertype;
		let createdfrom = parameters.createdfrom;
		let status = parameters.status;
		if(ordertype === 'SalesOrd' && (status === 'pendingBilling' || status === 'pendingBillingPartFulfilled' || status === 'pendingFulfillment')) {
			let recITF = record.load({type:'itemfulfillment', id: itfid});
			
			let slIt = 'item';
			let listItemItf = [];
			makeListItemItf(recITF, slIt, listItemItf);
			
			let recINV = record.transform({fromType: 'salesorder', fromId: createdfrom, toType: 'invoice'});
			let nField = ['trandate' ,'postingperiod'];
			let nFieldData = ['custbody_scv_created_transaction'];
			let rField = ['trandate', 'postingperiod'];
			
			let isdiscount = false;
			lbf.setValue(recINV, recITF, nField, rField);
			lbf.setValueData(recINV, nFieldData, [itfid]);
			
			let lcItItf = listItemItf.length;
			let lcItInv = recINV.getLineCount(slIt);
			
			let itemInv, isRemove, quantityItf, listLineRm = [];
			let listOLEx = {}, line, orderline, rate, amount, orderlineItf;
			for(let i = 0; i < lcItInv; i++) {
				itemInv = recINV.getSublistValue({sublistId: slIt, fieldId: 'item', line: i});
				orderline = recINV.getSublistValue({sublistId: slIt, fieldId: 'orderline', line: i});
				line = recINV.getSublistValue({sublistId: slIt, fieldId: 'line', line: i});
				let itemtype = recINV.getSublistValue({sublistId: slIt, fieldId: 'itemtype', line: i});
				rate = recINV.getSublistValue({sublistId: slIt, fieldId: 'rate', line: i});
				amount = recINV.getSublistValue({sublistId: slIt, fieldId: 'amount', line: i});
				if(itemtype === 'Discount') {
            		isdiscount = true;
            	}
				isRemove = true;
				for(let j = 0; j < lcItItf; j++) {
					let objItf = listItemItf[j];
					orderlineItf = objItf.orderlineItf;
					if(orderline === orderlineItf) {
						if(!listOLEx[String(orderline)]) {
							isRemove = false;
							quantityItf = objItf.quantityItf;
							recINV.setSublistValue({sublistId: slIt, fieldId: 'quantity', line: i, value: quantityItf});
							if(!rate) {
								recINV.setSublistValue({sublistId: slIt, fieldId: 'amount', line: i, value: amount});
							}
							
							listOLEx[String(orderline)] = orderline;
						}
					}
				}
				if(isRemove) {
					listLineRm.push(line);
				}
			}
			removeLineLine(recINV, slIt, listLineRm);
			
			if(isdiscount) {
            	let lcIt = recINV.getLineCount(slIt);
	            let createdfrom = recINV.getValue('createdfrom');
	        	let recSO = record.load({type: 'salesorder', id: createdfrom});
	        	let lcItSO = recSO.getLineCount(slIt);
	        	let promotion_rate_01, promotion_rate_02, promotion_rate_03, orderlineso, amount, tax1amt, grossamt, line_isfreegift;
	            for(let i = 0; i < lcIt; i++) {
	            	promotion_rate_01 = recINV.getSublistValue({sublistId: slIt, fieldId: 'custcol_scv_promotion_rate_01', line: i});
	            	promotion_rate_02 = recINV.getSublistValue({sublistId: slIt, fieldId: 'custcol_scv_promotion_rate_02', line: i});
	            	promotion_rate_03 = recINV.getSublistValue({sublistId: slIt, fieldId: 'custcol_scv_promotion_rate_03', line: i});
	            	if(!!promotion_rate_01 || !!promotion_rate_02 || !!promotion_rate_03) {
		            	orderline = recINV.getSublistValue({sublistId: slIt, fieldId: 'orderline', line: i});
		            	for(let j = 0; j < lcItSO; j++) {
		            		orderlineso = recSO.getSublistValue({sublistId: slIt, fieldId: 'line', line: j});
		            		line_isfreegift = recSO.getSublistValue({sublistId: slIt, fieldId: 'custcol_scv_line_isfreegift', line: j});
		            		if(orderline === orderlineso && !(line_isfreegift === true || line_isfreegift === "T")) {
		            			amount = recINV.getSublistValue({sublistId: slIt, fieldId: 'quantity', line: i}) * recINV.getSublistValue({sublistId: slIt, fieldId: 'rate', line: i});
		            			tax1amt = amount * recINV.getSublistValue({sublistId: slIt, fieldId: 'taxrate1', line: i}) / 100;
		            			grossamt = amount + tax1amt;
		            			if(!!promotion_rate_01) {
		            				insertLineDiscount(recINV, recSO, slIt, i, j, '01', promotion_rate_01/100, amount, tax1amt, grossamt)
			            			i++;
			            			lcIt++;
		            			}
		            			if(!!promotion_rate_02) {
		            				insertLineDiscount(recINV, recSO, slIt, i, j, '02', promotion_rate_02/100, amount, tax1amt, grossamt)
			            			i++;
			            			lcIt++;
		            			}
		            			if(!!promotion_rate_03) {
		            				insertLineDiscount(recINV, recSO, slIt, i, j, '03', promotion_rate_03/100, amount, tax1amt, grossamt)
			            			i++;
			            			lcIt++;
		            			}
		            			break;
		            		}
		            	}
	            	}
	            }
            }
			let id = recINV.save({enableSourcing: true, ignoreMandatoryFields : true});
			record.submitFields({type : 'itemfulfillment', id : itfid, values: {custbody_scv_created_invoice: id, custbody_scv_related_transaction: id}});
			redirect.toRecord({type : 'invoice', id : id});
		} else {
			redirect.toRecord({type : 'itemfulfillment', id : itfid});
		}
    }
	
	const makeListItemItf = (recITF, slIt, listItemItf) => {
    	let lcItItf = recITF.getLineCount(slIt);
    	let lineItf, orderlineItf, quantityItf;
    	for(let j = 0; j < lcItItf; j++) {
	    	lineItf = recITF.getSublistValue({sublistId: slIt, fieldId: 'line', line: j});
			orderlineItf = recITF.getSublistValue({sublistId: slIt, fieldId: 'orderline', line: j});
			quantityItf = recITF.getSublistValue({sublistId: slIt, fieldId: 'quantity', line: j});
			listItemItf.push({lineItf: lineItf, orderlineItf: orderlineItf, quantityItf: quantityItf});
    	}
    }
	
	const insertLineDiscount = (newRecord, recSO, slIt, i, j, suffix, discountrate, amount, tax1amt, grossamt) => {
    	amount = amount * discountrate;
    	tax1amt = tax1amt * discountrate;
    	grossamt = grossamt * discountrate;
		
    	let itemdiscount = recSO.getSublistValue({sublistId: slIt, fieldId: 'item', line: j + 1});
		newRecord.insertLine({sublistId: slIt, line: i + 1});
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'item', value: itemdiscount, line: i + 1});
		let fieldlines = ['custcol_scv_tc_item_code', 'description', 'taxcode', 'class', 'custcol_scv_line_promotion_' + suffix, 
		    'custcol_scv_promotion_rate_' + suffix];
		lbf.setSublistValueDiff(newRecord, recSO, slIt, slIt, fieldlines, fieldlines, i + 1, j + 1);
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'price', value: -1, line: i + 1});
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'rate', value: -amount, line: i + 1});
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'amount', value: -amount, line: i + 1});
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'tax1amt', value: -tax1amt, line: i + 1});
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'grossamt', value: -grossamt, line: i + 1});
		
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'custcol_scv_discount_amount_' + suffix, value: amount, line: i});
		newRecord.setSublistValue({sublistId: slIt, fieldId: 'custcol_scv_discount_amt_af_tax', value: grossamt, line: i});
		
    }
	
	const removeLineLine = (recINV, slIt, listLineRm) => {
    	let lLRemove = listLineRm.length;
    	let lcItInv, line;
    	for(let j = 0; j < lLRemove; j++) {
    		lcItInv = recINV.getLineCount(slIt);
    		for(let i = lcItInv - 1; i >= 0; i--) {
    			line = recINV.getSublistValue({sublistId: slIt, fieldId: 'line', line: i});
				if(listLineRm[j] === line) {
					recINV.removeLine({sublistId: slIt, line: i});	
					lcItInv = lcItInv - 1;
				}
    		}	
    	}
    }
    
    return {
        onRequest
    };
    
});
