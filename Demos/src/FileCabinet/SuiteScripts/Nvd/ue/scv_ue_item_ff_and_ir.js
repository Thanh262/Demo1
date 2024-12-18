/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(
	['N/record', 'N/search', 'N/url'],
	
	(record, search, url) => {
		const beforeLoad = (scriptContext) => {
			let tgType = scriptContext.type;
			let newRecord = scriptContext.newRecord;
			if(tgType === 'view') {
				let form = scriptContext.form;
				let ordertype = newRecord.getValue('ordertype');
				if(ordertype === 'SalesOrd') {
					let createdfrom = newRecord.getValue('createdfrom');
					let lkT = search.lookupFields({type: 'salesorder', id: createdfrom, columns: ['status']});
					let status = lkT.status[0].value;
					if(status === 'pendingBilling' || status === 'pendingBillingPartFulfilled' || status === 'pendingFulfillment') {
						let created_invoice = newRecord.getValue('custbody_scv_created_invoice');
						if(!created_invoice) {
							if(sINV(newRecord.id) === 0) {
								addButtonITFToINV(form, newRecord.id, ordertype, createdfrom, status);
							}
						}
					}
					
				} else if(ordertype === 'PurchOrd') {
					let createdfrom = newRecord.getValue('createdfrom');
					let lkT = search.lookupFields({type: 'transaction', id: createdfrom, columns: ['status']});
					let status = lkT.status[0].value;
					if(status === 'pendingBilling' || status === 'partiallyReceived' || status === 'pendingBillPartReceived') {
						let lVb = sVB(newRecord.id);
						if(lVb === 0) {
							addButtonIRToVb(form, newRecord.id, ordertype, createdfrom, status);
						}
					}
				}
			}
		}
		
		const sINV = (itfid) => {
			let f = [['custbody_scv_created_transaction', 'anyof', itfid]];
			let s = search.create({type: 'invoice',
				filters: f,
				columns: ['internalid']
			});
			let r = s.run().getRange(0, 1000);
			return r.length;
		}
		
		const addButtonITFToINV = (form, internalId, ordertype, createdfrom, status) => {
			let createPdfUrl = url.resolveScript({
				scriptId: 'customscript_scv_sl_transform_itf_to_inv',
				deploymentId: 'customdeploy_scv_sl_transform_itf_to_inv',
				returnExternalUrl: false
			});
			createPdfUrl += '&itfid=' + internalId + '&ordertype=' + ordertype + '&createdfrom=' + createdfrom+ '&status=' + status;
			form.addButton({
				id: 'custpage_bt_itf_to_inv',
				label: 'Create Bill',
				functionName: "document.getElementById('custpage_bt_itf_to_inv').disabled = true; window.location.replace('" + createPdfUrl + "');"
			});

		}
		
		const sVB = (itfid) => {
			let s = search.create({type: 'vendorbill',
				filters: [['custbody_scv_created_transaction', 'anyof', itfid]],
				columns: ['internalid']
			});
			let r = s.run().getRange(0,1000);
			return r.length;
		}
		
		const addButtonIRToVb = (form, internalId, ordertype, createdfrom, status) => {
			let createPdfUrl = url.resolveScript({
				scriptId: 'customscript_scv_sl_transform_ir_to_vb',
				deploymentId: 'customdeploy_scv_sl_transform_ir_to_vb',
				returnExternalUrl: false
			});
			createPdfUrl += '&irid=' + internalId + '&ordertype=' + ordertype + '&createdfrom=' + createdfrom + '&status=' + status;
			form.addButton({
				id: 'custpage_bt_ir_to_vb',
				label: 'Create Bill',
				functionName: "window.location.replace('" + createPdfUrl + "');"
			});

		}
		
		return {
			beforeLoad
		}
	});
