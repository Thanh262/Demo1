/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', '../lib/scv_lib_cs'],
	
	function(ccr, url, libCs) {
		
		const SUBLIST_ID_WORK_ORDER = 'custpage_sublist_workorders';
	
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
			let  currentRecord = scriptContext.currentRecord;
			if(scriptContext.fieldId === 'custpage_subsidiary') {
				let  fieldLocation = currentRecord.getField('custpage_location');
				let  fieldFromLocation = currentRecord.getField('custpage_from_location');
				let c = ['internalid', 'namenohierarchy'];
				let f = [['subsidiary', 'anyOf', currentRecord.getValue('custpage_subsidiary')], 'and',['isinactive', 'is', false]];
				libCs.insertSelection([fieldLocation, fieldFromLocation], 'location', c, f, true, null);
				let lineCount = currentRecord.getLineCount(SUBLIST_ID_WORK_ORDER);
				for(let i = 0; i < lineCount; i++) {
					let fieldLocationFromLine = currentRecord.getSublistField({sublistId: SUBLIST_ID_WORK_ORDER, fieldId: 'custpage_from_location_line', line: i});
					libCs.insertSelectionFromField(fieldLocationFromLine, fieldLocation, false, null);
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
			let lineCount = currentRecord.getLineCount(SUBLIST_ID_WORK_ORDER);
			for(let i = 0; i < lineCount; i++) {
				let isSelect = currentRecord.getSublistValue({sublistId: SUBLIST_ID_WORK_ORDER, fieldId: 'custpage_select', line: i});
				if(isSelect === true || isSelect === 'T') {
					isValid = true;
				}
			}
			if(!isValid) {
				alert('Vui lòng chọn ít nhất một dòng!');
			}
			return isValid;
		}
		
		function searchWorkOrders() {
			window.onbeforeunload = null;
			let  currentRecord = ccr.get();
			let  urlTOReq = url.resolveScript({
				scriptId: 'customscriptscv_sl_wo2transfer',
				deploymentId: 'customdeploy_scv_sl_wo2tranf',
				returnExternalUrl: false
			});

			urlTOReq = urlTOReq + '&custpage_subsidiary=' + currentRecord.getValue('custpage_subsidiary')
				+ '&custpage_location=' + currentRecord.getValue('custpage_location')
				+ '&custpage_req_item=' + currentRecord.getValue('custpage_req_item')
				+ '&custpage_req_item_type=' + currentRecord.getValue('custpage_req_item_type')
				+ '&custpage_req_status=' + currentRecord.getValue('custpage_req_status')
				+ '&custpage_req_approval_status=' + currentRecord.getValue('custpage_req_approval_status')
				+ '&custpage_req_from_date=' + currentRecord.getText("custpage_req_from_date")
				+ '&custpage_req_to_date=' + currentRecord.getText("custpage_req_to_date")
				+ '&custpage_from_location=' + currentRecord.getValue("custpage_from_location")
				//+ '&custpage_from_location_text=' + currentRecord.getText("custpage_from_location")
				+ '&isSearch=T'
				+ '&custpage_assembly_lot=' + currentRecord.getValue('custpage_assembly_lot')
				+ '&custpage_wo_center=' + currentRecord.getValue('custpage_wo_center');
			window.location.replace(urlTOReq);			
		}

		function searchSalesOrders() {
			let  currentRecord = ccr.get();
			let  urlReq = url.resolveScript({
				scriptId: 'customscript_scv_sl_so2wo',
				deploymentId: 'customdeploy_scv_sl_so2wo',
				returnExternalUrl: false
			});
			urlReq = urlReq + '&custpage_saleorder=' + currentRecord.getValue('custpage_saleorder')
				+ '&custpage_customer=' + currentRecord.getValue('custpage_customer');
			window.location.replace(urlReq);
		}
		
		
		
		return {
//        pageInit: pageInit,
			fieldChanged: fieldChanged,
//        postSourcing: postSourcing,
//        sublistChanged: sublistChanged,
			lineInit: lineInit,
			saveRecord: saveRecord,
			searchWorkOrders:searchWorkOrders,
			searchSalesOrders: searchSalesOrders
		};

	});
