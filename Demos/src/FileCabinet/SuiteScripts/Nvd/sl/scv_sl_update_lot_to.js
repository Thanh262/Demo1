/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/redirect', 'N/record', 'N/search', '../lib/scv_lib_function.js'],

(redirect, record, search, lbf) => {
   
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
		let trid = parameters.trid;
		let trtype = parameters.trtype;
		
		let recRecord = record.load({type: trtype, id: trid});
		let recSubIVD, inventorydetailavail;
    	let sl = 'item', slIVD = 'inventoryassignment', lcIVD, lotquantity, n;
		let lcIt = recRecord.getLineCount(sl);
		let arrIt = [], arrLoc = [], locationline, itemline;
		let location = recRecord.getValue('location');
		for(let i = 0; i < lcIt; i++) {
			itemline = recRecord.getSublistValue({sublistId: sl, fieldId: 'item', line: i});
			locationline = recRecord.getSublistValue({sublistId: sl, fieldId: 'location', line: i}) || location;
			if(itemline && !arrIt.includes(itemline)) {
				arrIt.push(itemline);
			}
			if(locationline && !arrLoc.includes(locationline)) {
				arrLoc.push(locationline);
			}
		}

		let c = [{name: 'item', sort: 'ASC'}, {name: 'expirationdate', join: 'inventorynumber', sort: 'ASC'}, 'location', 'inventorynumber', 'binnumber', {name: 'quantityavailable', join: 'inventorynumber'},
		         ];
		let f = [['location', 'anyof', arrLoc], 'and', ['inventorynumber.location', 'anyof', arrLoc], 'and', ['item', 'anyof', arrIt], 'and', ['inventorynumber.quantityavailable', 'greaterthan', 0], 'and'];
    	f.push([['inventorynumber.expirationdate', 'after', 'today'], 'or', ['inventorynumber.expirationdate', 'isempty', '']]);
    	let s = search.create({
    		type: 'InventoryBalance',
    		filters: f,
    		columns: c
    	});
    	let r = s.run().getRange({start: 0, end: 1000});
    	
    	let lR = r.length, lotnumber, quantity, item, stquantity, stitem, conversionrate, issueinventorynumber;
    	let tempq, binnumber, txt_lotnumber;
    	
    	let iinnotavai = [], arrItquantity = [];
    	for(let j = 0; j < lcIt; j++) {
			locationline = recRecord.getSublistValue({sublistId: sl, fieldId: 'location', line: j}) || location;
    		stitem = recRecord.getSublistValue({sublistId: sl, fieldId: 'item', line: j});
    		inventorydetailavail = recRecord.getSublistValue({sublistId: sl, fieldId: 'inventorydetailavail', line: j});
    		if((inventorydetailavail === true || inventorydetailavail === 'T')) {
    			recSubIVD = recRecord.getSublistSubrecord({sublistId: sl, fieldId: 'inventorydetail', line: j});
    			lcIVD = recSubIVD.getLineCount(slIVD);
    			for(n = 0; n < lcIVD; n++) {
    				issueinventorynumber = recSubIVD.getSublistValue({sublistId: slIVD, fieldId: 'issueinventorynumber', line: n});
    				binnumber = lbf.reValue(recSubIVD.getSublistValue({sublistId: slIVD, fieldId: 'binnumber', line: n}));
    				tempq = recSubIVD.getSublistValue({sublistId: slIVD, fieldId: 'quantity', line: n}) * 1;
    				pushItemInvenNumberTotal(arrItquantity, [stitem, issueinventorynumber, tempq, binnumber, locationline]);
    			}	
    		}
    	}
    	for(let j = 0; j < lcIt; j++) {
    		txt_lotnumber = '';
			locationline = recRecord.getSublistValue({sublistId: sl, fieldId: 'location', line: j}) || location;
			stitem = recRecord.getSublistValue({sublistId: sl, fieldId: 'item', line: j});
    		inventorydetailavail = recRecord.getSublistValue({sublistId: sl, fieldId: 'inventorydetailavail', line: j});
    		if((inventorydetailavail === true || inventorydetailavail === 'T')) {
    			stquantity = recRecord.getSublistValue({sublistId: sl, fieldId: 'quantity', line: j});
				recSubIVD = recRecord.getSublistSubrecord({sublistId: sl, fieldId: 'inventorydetail', line: j});
				conversionrate = recSubIVD.getValue('conversionrate');
				lcIVD = recSubIVD.getLineCount(slIVD);
				lotquantity = 0;
    			n = 0;
    			for(n = 0; n < lcIVD; n++) {
    				lotquantity = lotquantity + recSubIVD.getSublistValue({sublistId: slIVD, fieldId: 'quantity', line: n}) * 1;
    				txt_lotnumber = txt_lotnumber + recSubIVD.getSublistText({sublistId: slIVD, fieldId: 'issueinventorynumber', line: n}) + ',';
    			}
    			if(lotquantity < stquantity) {
    				for(let i = 0; i < lR; i++) {    		
                		item = r[i].getValue(c[0]);
                		if(item === stitem && locationline === r[i].getValue(c[2])) {
                			lotnumber = r[i].getValue(c[3]);
                			binnumber = lbf.reValue(r[i].getValue(c[4]));
                			quantity = r[i].getValue(c[5]);
                			if(lbf.isExists(iinnotavai, lotnumber + '_' + binnumber) === false) {
                				quantity = quantity/ conversionrate;
                				if(conversionrate >= 1) {
                					quantity = Math.floor(quantity);
                				}
                				tempq = getQtyItemInvenNumberTotal(arrItquantity, stitem, lotnumber, binnumber, locationline);
                				quantity = quantity - tempq;
                				if(quantity > 0) {            					
            						if(quantity <= (stquantity - lotquantity)) {
            							txt_lotnumber = txt_lotnumber + r[i].getText(c[3]) + ',';
            							recSubIVD.insertLine({sublistId: slIVD, line: lcIVD});
            							lbf.setSublistValueData(recSubIVD, slIVD, ['issueinventorynumber', 'quantity', 'binnumber'], lcIVD, [lotnumber, quantity, binnumber]);
                						iinnotavai.push(lotnumber + '_' + binnumber);
                						quantity = recSubIVD.getSublistValue({sublistId: slIVD, fieldId: 'quantity', line: lcIVD}) * 1;
                						lotquantity = lotquantity + quantity;
                						pushItemInvenNumberTotal(arrItquantity, [stitem, lotnumber, quantity, binnumber, locationline]);
                    				} else if(stquantity - lotquantity > 0) {
                    					txt_lotnumber = txt_lotnumber + r[i].getText(c[3]) + ',';
                    					recSubIVD.insertLine({sublistId: slIVD, line: lcIVD});
                    					lbf.setSublistValueData(recSubIVD, slIVD, ['issueinventorynumber', 'quantity', 'binnumber'], lcIVD, [lotnumber, stquantity - lotquantity, binnumber]);
                    					pushItemInvenNumberTotal(arrItquantity, [stitem, lotnumber, stquantity - lotquantity, binnumber, locationline]);
                    					break;
                    				}  
                					lcIVD++;
                				}
                				           				
                			}
                		}       		
                	}
    			}    		
    			if(txt_lotnumber.length > 0) {
    				txt_lotnumber = txt_lotnumber.substring(0, txt_lotnumber.length - 1);
    			}
    		} 
		}
    	recRecord.save({enableSourcing: false, ignoreMandatoryFields : true}); 
    	redirect.toRecord({
            type: trtype,
            id: trid
        });
    }
	
	const pushItemInvenNumberTotal = (arrItquantity, itquantity) => {
    	let lIt = arrItquantity.length;
    	let ispush = true;
    	for(let z = 0; z < lIt; z++) {
    		if(arrItquantity[z][0] === itquantity[0] && arrItquantity[z][1] === itquantity[1] && arrItquantity[z][3] === itquantity[3] && arrItquantity[z][4] === itquantity[4]) {
    			ispush = false;
    			arrItquantity[z][2] = arrItquantity[z][2] * 1 + itquantity[2] * 1;
    		}
    	}
    	if(ispush) {
    		arrItquantity.push(itquantity);
    	}
    }
	
	const getQtyItemInvenNumberTotal = (arrItquantity, stitem, issueinventorynumber, binnumber, locationline) => {
    	let qty = 0;
    	let lIt = arrItquantity.length;
    	for(let z = 0; z < lIt; z++) {
    		if(arrItquantity[z][0] === stitem && arrItquantity[z][1] === issueinventorynumber && arrItquantity[z][3] === binnumber && arrItquantity[z][4] === locationline) {
    			qty = arrItquantity[z][2];
    		}
    	}
    	return qty;
    }
    
    return {
        onRequest
    };
    
});
