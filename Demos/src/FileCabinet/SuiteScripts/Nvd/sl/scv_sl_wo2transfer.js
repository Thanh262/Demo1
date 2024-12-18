/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(
	[ 'N/record', 'N/search', 'N/ui/serverWidget', 'N/redirect', 'N/runtime'
		, '../lib/scv_lib_report.js', '../olib/lodash.min'],
	
	(record, search, serverWidget, redirect, runtime, lrp, lodash) => {
		
		const SUBLIST_ID_WORKORDERS = 'custpage_sublist_workorders';
		const SUBLIST_ID_ITEM = 'item';
		
		const copyOptions = (parameters, subsidiary) => {
			return {
				'subsidiary' : subsidiary,
				'location' : parameters.custpage_location,
				'from_date' : parameters.custpage_req_from_date,
				'to_date' : parameters.custpage_req_to_date,
				'item' : parameters.custpage_req_item,
				'item_type' : parameters.custpage_req_item_type,
				'status' : parameters.custpage_req_status,
				'approval_status' : parameters.custpage_req_approval_status,
				'from_location' : parameters.custpage_from_location,
				'isSearch': parameters.isSearch,
				'assembly_lot': parameters.custpage_assembly_lot,
				'wo_center': parameters.custpage_wo_center
			}
		}
		
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
			let response = context.response;

			let parameters = request.parameters;
			let subsidiary = parameters.custpage_subsidiary || runtime.getCurrentUser().subsidiary;
			let options = copyOptions(parameters, subsidiary);

			if (request.method === 'GET') {
				// SEARCH WORK ORDER DETAILS
				let form = serverWidget.createForm({
					title : 'Create Transfer Order from WOs'
				});

				form.clientScriptModulePath = '../cs/scv_cs_workorder.js';
				form.addButton({
					id : 'custpage_bt_search',
					label : 'Search',
					functionName : 'searchWorkOrders()'
				});
				initForm(form, options);
				response.writePage(form);
			} else {
				let listDataSelect = getListDataSelect(request, options);
				let groupDataSelect = lodash.groupBy(listDataSelect, o => o.location + (o.custbody_scv_wo_center ? '>>' + o.custbody_scv_wo_center : ''));
				let listTransferOrderIds = [];
				for(let key in groupDataSelect) {
					let listDataChildren = groupDataSelect[key];
					listTransferOrderIds.push(createAndSaveTransferOrder(listDataChildren, options));
				}
				redirect.toRecord({
					type : record.Type.TRANSFER_ORDER,
					id : listTransferOrderIds[0]
				});
			}
		}
		
		const createAndSaveTransferOrder = (listDataSelect, options) => {
			let recTransferOrder = record.create({type: record.Type.TRANSFER_ORDER, isDynamic: true});
			let objDataSelectZero = listDataSelect[0];
			
			recTransferOrder.setValue('subsidiary', options.subsidiary);
			recTransferOrder.setValue('location', objDataSelectZero.location);
			recTransferOrder.setValue('transferlocation', options.location);
			recTransferOrder.setValue('firmed', true);
			recTransferOrder.setValue('useitemcostastransfercost', true);
			recTransferOrder.setValue('custbody_scv_wo_center', objDataSelectZero.custbody_scv_wo_center);
			
			for(let objDataSelect of listDataSelect) {
				recTransferOrder.setCurrentSublistValue({sublistId: SUBLIST_ID_ITEM, fieldId: 'item', value: objDataSelect.item});
				recTransferOrder.setCurrentSublistValue({sublistId: SUBLIST_ID_ITEM, fieldId: 'custcol_scv_tc_item_code', value: objDataSelect.custcol_scv_tc_item_code});
				recTransferOrder.setCurrentSublistValue({sublistId: SUBLIST_ID_ITEM, fieldId: 'units', value: objDataSelect.units});
				recTransferOrder.setCurrentSublistValue({sublistId: SUBLIST_ID_ITEM, fieldId: 'quantity', value: objDataSelect.quantity});
				recTransferOrder.setCurrentSublistValue({sublistId: SUBLIST_ID_ITEM, fieldId: 'custcol_scv_tl_wo', value: objDataSelect.custcol_scv_tl_wo});
				recTransferOrder.setCurrentSublistValue({sublistId: SUBLIST_ID_ITEM, fieldId: 'custcol_scv_wo_to_if_ir_line_id', value: objDataSelect.custcol_scv_wo_to_if_ir_line_id});
				recTransferOrder.commitLine({sublistId: SUBLIST_ID_ITEM});
			}
			
			return recTransferOrder.save({enableSourcing: false, ignoreMandatoryFields : true});
		}
		
		const getListDataSelect = (request, options) => {
			let vCheck = false;
			let lineCount = request.getLineCount(SUBLIST_ID_WORKORDERS);
			let listDataSelect = [];
			for(let i = 0; i < lineCount; i++) {
				vCheck = request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_select', line: i});
				if (vCheck === true || vCheck === 'T') {
					listDataSelect.push({
						custbody_scv_wo_center: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_wo_center', line: i}),
						location: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_from_location_line', line: i}) || options.from_location,
						item: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_item_id', line: i}),
						custcol_scv_tc_item_code: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_item_code', line: i}),
						units: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_unitid', line: i}),
						quantity: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_quantityuom_transfer', line: i}),
						custcol_scv_tl_wo: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_workorder_id', line: i}),
						custcol_scv_wo_to_if_ir_line_id: request.getSublistValue({group: SUBLIST_ID_WORKORDERS, name: 'custpage_line_number', line: i})
					})
				}
			}
			return listDataSelect;
		}
		
		const initForm = (form, options) => {
			options = options || {};
			initHederField(form, options);
			
			let sublist = form.addSublist({
				id : SUBLIST_ID_WORKORDERS,
				type : serverWidget.SublistType.LIST,
				label : 'Work Orders'
			});
			sublist.addMarkAllButtons();
			initSublist(sublist);
			assignSelectOptionLine(form, sublist);
			
			let resultSet = options.isSearch === 'T' ? searchWorkorder(options) : [];

			for (let i = 0; i < resultSet.length; i++) {
				let objLineResult = resultSet[i];
				if(objLineResult){
					for (let objCol of COLS_ON_SUBLIST) {
						let tempValue = objLineResult[objCol.fieldIdOfSS]
						if(tempValue) {
							sublist.setSublistValue({id : objCol.id, line : i,value : tempValue});
						}
					}
				}
			}
			form.addSubmitButton({label : 'Create Transfer Order'});
		}
		
		const assignSelectOptionLine = (form, sublist) => {
			const fieldFromLocation = form.getField('custpage_from_location');
			const fieldFromLocaitonLine = sublist.getField('custpage_from_location_line');
			lrp.addSelectionFromField(fieldFromLocaitonLine, fieldFromLocation, true, null);
		}
		
		const initHederField = (form, options) => {
			// GROUP SEARCH FILTER
			form.addFieldGroup({
				id : 'fieldgroup_req_main',
				label : 'Filters:'
			});
			let custpage_subsidiary = form.addField({
				id : 'custpage_subsidiary',
				type : serverWidget.FieldType.SELECT,
				label : 'Subsidiary',
				//source : 'subsidiary',
				container : 'fieldgroup_req_main'
			});
			
			lrp.addSelectSubsidiary(custpage_subsidiary, options.subsidiary);
			custpage_subsidiary.isMandatory = true;
			
			let custpage_location = form.addField({
				id : 'custpage_location',
				type : serverWidget.FieldType.SELECT,
				label : 'Location',
				//source : 'location',
				container : 'fieldgroup_req_main'
			});
			custpage_location.isMandatory = true;
			let c = ['internalid', 'namenohierarchy'];
			let f = [['subsidiary', 'anyOf', options.subsidiary], 'and',['isinactive', 'is', false]];
			lrp.addSelection(custpage_location, 'location', c, f, true, options.location);
			
			let custpage_req_from_date = form.addField({
				id : 'custpage_req_from_date',
				type : serverWidget.FieldType.DATE,
				label : 'From Date',
				container : 'fieldgroup_req_main'
			});
			custpage_req_from_date.defaultValue = options.from_date;
			
			let custpage_req_to_date = form.addField({
				id : 'custpage_req_to_date',
				type : serverWidget.FieldType.DATE,
				label : 'To Date',
				container : 'fieldgroup_req_main'
			});
			custpage_req_to_date.defaultValue = options.to_date;
			
			let custpage_req_item = form.addField({
				id : 'custpage_req_item',
				type : serverWidget.FieldType.SELECT,
				label : 'Item',
				source : 'item',
				container : 'fieldgroup_req_main'
			});
			custpage_req_item.defaultValue = options.item;
			
			let custpage_req_item_type = form.addField({
				id : 'custpage_req_item_type',
				type : serverWidget.FieldType.MULTISELECT,
				label : 'Item Type',
				container : 'fieldgroup_req_main'
			});
			custpage_req_item_type.addSelectOption({value : 'InvtPart', text : 'Inventory Item', isSelected: options.item_type && options.item_type.toString().indexOf('InvtPart') !== -1});
			custpage_req_item_type.addSelectOption({value : 'Assembly', text : 'Assembly', isSelected: options.item_type && options.item_type.toString().indexOf('Assembly') !== -1});
			
			let custpage_req_status = form.addField({
				id : 'custpage_req_status',
				type : serverWidget.FieldType.MULTISELECT,
				label : 'Status',
				container : 'fieldgroup_req_main'
			});
			custpage_req_status.addSelectOption({value : 'WorkOrd:A', text : 'Planned', isSelected: options.status && options.status.toString().indexOf('WorkOrd:A')  !== -1});
			custpage_req_status.addSelectOption({value : 'WorkOrd:B', text : 'Released', isSelected: options.status && options.status.toString().indexOf('WorkOrd:B')  !== -1});
			custpage_req_status.addSelectOption({value : 'WorkOrd:D', text : 'In Process', isSelected: options.status && options.status.toString().indexOf('WorkOrd:D')  !== -1});
			
			let custpage_req_approval_status = form.addField({
				id : 'custpage_req_approval_status',
				type : serverWidget.FieldType.MULTISELECT,
				label : 'Approval Status',
				source : 'customrecord_scv_approval_status',
				container : 'fieldgroup_req_main'
			});
			custpage_req_approval_status.defaultValue = options.approval_status;
			
			let custpage_assembly_lot = form.addField({
				id : 'custpage_assembly_lot',
				type : serverWidget.FieldType.TEXT,
				label : 'Prod Lot Number ',
				container : 'fieldgroup_req_main'
			});
			custpage_assembly_lot.defaultValue = options.assembly_lot;
			
			let custpage_wo_center = form.addField({
				id : 'custpage_wo_center',
				type : serverWidget.FieldType.SELECT,
				label : 'WO Center',
				container : 'fieldgroup_req_main'
			});
			let sqlWoCenter = `select eg.id value, eg.groupname text from entitygroup eg where eg.isinactive = 'F'`;
			lrp.addSelectionViaSql(custpage_wo_center, sqlWoCenter, [], true, options.wo_center);
			
			// GROUP DEFAULT VALUE
			form.addFieldGroup({
				id : 'fieldgroup_req_default_val',
				label : 'Default Values:'
			});
			
			let custpage_from_location = form.addField({
				id : 'custpage_from_location',
				type : serverWidget.FieldType.SELECT,
				label : 'From Location',
				//source : 'location',
				container : 'fieldgroup_req_default_val'
			});
			custpage_from_location.isMandatory = true;
			lrp.addSelectionFromField(custpage_from_location, custpage_location, false, options.from_location);
		}
		
		const COLS_ON_SUBLIST = [
			{id : 'custpage_workorder_id',label : 'Work Order ID',type : 'text',display : 'hidden', fieldIdOfSS: 'workorder_id'},
			{id : 'custpage_workorder_number',label : 'Work Order',type : 'text',display : 'disabled', fieldIdOfSS: 'workorder_number'},
			{id : 'custpage_from_location_line',label : 'From Location',type : serverWidget.FieldType.SELECT,display : 'entry'},
			{id : 'custpage_assembly_lot',label : 'Prod Lot Number',type : 'text',display : 'disabled', fieldIdOfSS: 'assembly_lot'},
			{id : 'custpage_wo_center',label : 'WO Center',type : 'text',display : 'hidden', fieldIdOfSS: 'wo_center'},
			{id : 'custpage_wo_center_text',label : 'WO Center',type : 'text',display : 'disabled', fieldIdOfSS: 'wo_center_text'},
			{id : 'custpage_mfg_itemcode',label : 'Assembly Item',type : 'text',display : 'disabled', fieldIdOfSS: 'mfg_itemcode'},
			{id : 'custpage_workorder_status',label : 'Status',type : 'text',display : 'disabled', fieldIdOfSS: 'workorder_status'},
			{id : 'custpage_line_number',label : 'Item Line',type : 'text',display : 'hidden', fieldIdOfSS: 'line_number'},
			{id : 'custpage_item_id',label : 'Item ID',type : 'text',display : 'hidden', fieldIdOfSS: 'item_id'},
			{id : 'custpage_item_code',label : 'Item Code',type : 'text',display : 'disabled', fieldIdOfSS: 'item_code'},
			{id : 'custpage_item_name',label : 'Item',type : 'text',display : 'disabled', fieldIdOfSS: 'item_name'},
			{id : 'custpage_startdate',label : 'Start Date',type : 'date',display : 'disabled', fieldIdOfSS: 'startdate'},
			{id : 'custpage_enddate',label : 'End Date',type : 'date',display : 'disabled', fieldIdOfSS: 'enddate'},
			{id : 'custpage_unit',label : 'UoM',type : 'text',display : 'disabled', fieldIdOfSS: 'unit'},
			{id : 'custpage_quantityuom',label : 'Quantity',type : 'float',display : 'disabled', fieldIdOfSS: 'quantityuom'},
			{id : 'custpage_quantityuom_transfer',label : 'Quantity to Transfer',type : 'float',display : 'disabled', fieldIdOfSS: 'quantityuom'},
			{id : 'custpage_unitid',label : 'UOM ID',type : 'text',display : 'hidden', fieldIdOfSS: 'unitid'}
		];
		
		const initSublist = (sublist) => {
			lrp.addFieldSelect(sublist, 'custpage_select');
			lrp.addFieldSublistColId(sublist, COLS_ON_SUBLIST);
		}
		
		const searchWorkorder = (options) => {
			let search_filter = createSearchFilter(options);
			let searchWo = search.create({
				type : "workorder",
				filters : search_filter,
				columns : [
					search.createColumn({ name: "tranid" }),
					search.createColumn({ name: "status" }),
					search.createColumn({ name: "line" }),
					search.createColumn({ name: "internalid", join: "item" }),
					search.createColumn({ name: "upccode", join: "item" }),
					search.createColumn({ name: "itemid", join: "item" }),
					search.createColumn({ name: "internalid" }),
					search.createColumn({ name: "startdate" }),
					search.createColumn({ name: "enddate" }),
					search.createColumn({ name: "quantityuom" }),
					search.createColumn({ name: "unit" }),
					search.createColumn({ name: "custbody_scv_mfg_itemcode" }),
					search.createColumn({ name: "unitid" }),
					search.createColumn({ name: "custbody_scv_prod_start_date" }),
					search.createColumn({ name: "custbody_scv_prod_end_date" }),
					search.createColumn({ name: "custbody_scv_assembly_lot"}),
					search.createColumn({ name: "custbody_scv_wo_center"})
				]
			});
			
			let resultSet = [];
			let mapObj = getAllReadyMapping();
			let sR = searchWo.run().getRange({start: 0, end: 1000});
			for (let i=0; i < sR.length; i++) {
				let result = sR[i];
				let wo_id = result.getValue({name :'internalid'});
				let line_number = result.getValue({name :'line'});
				
				let checkMapping = isAlreadyMapping(wo_id, line_number,mapObj);
				if (checkMapping) {
					resultSet.push({
						'line_number': line_number,
						'item_id': result.getValue(result.columns[3]),
						'item_name': result.getValue(result.columns[5]),
						'item_code': result.getValue(result.columns[4]) || result.getValue(result.columns[5]),
						'quantityuom': result.getValue({name : 'quantityuom'}),
						'unit': result.getValue({name : 'unit'}),
						'unitid': result.getValue({name : 'unitid'}),
						'workorder_id': result.getValue({name :'internalid'}),
						'workorder_number': result.getValue({name :'tranid'}),
						'workorder_status': result.getText({name :'status'}),
						'startdate': result.getValue({name :'startdate'}) || result.getValue({name :'custbody_scv_prod_start_date'}),
						'enddate': result.getValue({name : 'enddate'}) || result.getValue({name :'custbody_scv_prod_end_date'}),
						'mfg_itemcode': result.getValue({name : 'custbody_scv_mfg_itemcode'}),
						'assembly_lot': result.getValue({name : 'custbody_scv_assembly_lot'}),
						'wo_center': result.getValue({name : 'custbody_scv_wo_center'}),
						'wo_center_text': result.getText({name : 'custbody_scv_wo_center'})
					});
				}
			}
			return resultSet;
		}
		
		const createSearchFilter = (options) => {
			let filterWorkOrder = [];
			filterWorkOrder.push(search.createFilter({
				name : 'mainline',
				operator : search.Operator.IS,
				values : 'F'
			}));
			filterWorkOrder.push(search.createFilter({
				name : 'status',
				operator : search.Operator.ANYOF,
				values : [ "WorkOrd:A", "WorkOrd:B", "WorkOrd:D" ]
			}));
			filterWorkOrder.push(search.createFilter({
				name : 'type',
				join : 'item',
				operator : search.Operator.ANYOF,
				values : [ "InvtPart", "Assembly" ]
			}));
			filterWorkOrder.push(search.createFilter({
				name : 'custcol_scv_tl_wo_to',
				operator : search.Operator.ANYOF,
				values : '@NONE@'
			}));

			filterWorkOrder.push(search.createFilter({
				name : 'quantity',
				operator : search.Operator.GREATERTHAN,
				values : 0
			}));

			if (options.subsidiary) {
				filterWorkOrder.push(search.createFilter({
					name : 'subsidiary',
					operator : search.Operator.IS,
					values : options.subsidiary
				}));
			}
			if (options.location) {
				filterWorkOrder.push(search.createFilter({
					name : 'location',
					operator : search.Operator.IS,
					values : options.location
				}));
			}
			if (options.item) {
				filterWorkOrder.push(search.createFilter({
					name : 'internalid',
					join : 'item',
					operator : search.Operator.IS,
					values : options.item
				}));
			}
			if (options.status) {
				filterWorkOrder.push(search.createFilter({
					name : 'status',
					operator : search.Operator.ANYOF,
					values : options.status.split(',')
				}));
			}
			if (options.item_type) {
				filterWorkOrder.push(search.createFilter({
					name : 'itemtype',
					operator : search.Operator.IS,
					values : options.item_type.split(',')
				}));
			}
			if (options.from_date) {
				filterWorkOrder.push(search.createFilter({
					name : 'formuladate',
					operator : search.Operator.ONORAFTER,
					values : options.from_date,
					formula: "nvl({startdate},{custbody_scv_prod_start_date})"
				}));
			}
			if (options.to_date) {
				filterWorkOrder.push(search.createFilter({
					name : 'formuladate',
					operator : search.Operator.ONORBEFORE,
					values : options.to_date,
					formula: "nvl({enddate},{custbody_scv_prod_end_date})"
				}));
			}
			if (options.approval_status) {
				filterWorkOrder.push(search.createFilter({
					name : 'custbody_scv_approval_status',
					operator : search.Operator.ANYOF,
					values : options.approval_status.split(',')
				}));
			}
			if(options.assembly_lot) {
				filterWorkOrder.push(search.createFilter({
					name : 'custbody_scv_assembly_lot',
					operator : search.Operator.IS,
					values : options.assembly_lot
				}));
			}
			if(options.wo_center) {
				filterWorkOrder.push(search.createFilter({
					name : 'custbody_scv_wo_center',
					operator : search.Operator.ANYOF,
					values : options.wo_center
				}));
			}
			return filterWorkOrder;
		}
		
		const getAllReadyMapping = () => {
			let mapp = {};
			let f = [
				["type","anyof","TrnfrOrd"],  "AND",
				["mainline","is","F"], "AND",
				["custcol_scv_tl_wo","noneof","@NONE@"], "AND",
				["custcol_scv_tl_wo.mainline","is","T"], "AND",
				["custcol_scv_tl_wo.status","anyof","WorkOrd:A","WorkOrd:B","WorkOrd:D"]
			];
			let c = ['internalid','custcol_scv_tl_wo','custcol_scv_wo_to_if_ir_line_id'];
			let s = search.create({type: 'transferorder', filters: f, columns :c});
			
			let r = s.runPaged({pageSize: 1000});
			let numPage = r.pageRanges.length;
			let searchPage, tempData, numTemp;
			for(let np = 0; np < numPage; np++) {
				searchPage = r.fetch({index : np});
				tempData = searchPage.data;
				if(tempData) {
					numTemp = tempData.length;
					for(let i = 0; i < numTemp; i++) {
						mapp[tempData[i].getValue('custcol_scv_tl_wo').toString() + '_' + tempData[i].getValue('custcol_scv_wo_to_if_ir_line_id').toString()] = true;
					}
				}
			}
			
			return mapp;
		}
		
		const isAlreadyMapping = (wo_id, line_number, dictObj) => {
			let key = wo_id.toString() + '_' + line_number.toString();
			return !(key in dictObj);
		}
		
		return {
			onRequest
		};

		
	});