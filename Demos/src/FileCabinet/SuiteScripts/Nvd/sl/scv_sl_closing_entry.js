/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/config', 'N/format', 'N/ui/message', 'N/redirect', 'N/runtime', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/task', '../lib/scv_lib_function.js', '../lib/scv_lib_report.js'],

function(config, format, message, redirect, runtime, record, search, serverWidget, task, lfunc, lrp) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
    	let request = context.request;
    	let response = context.response;
    	let parameters = request.parameters;
    	
    	let subsidiary = parameters.custpage_subsidiary;    	  	   
    	let date_from = parameters.custpage_date_from;
    	let date_to = parameters.custpage_date_to;
    	let reportype = parameters.custpage_reportype;
    	
    	let isRun = true;    	
    	if(!subsidiary) {
			let userObj = runtime.getCurrentUser();
			subsidiary = [userObj.subsidiary];
			isRun = false;
		} else {
			subsidiary = subsidiary.split(',');			
		}
    	if(!reportype) {
    		reportype = '1';
			isRun = false;
		}
    	if(!date_to) {
    		isRun = false;
    	}
    	
    	let configRecObj = config.load({type: config.Type.USER_PREFERENCES});
		let timezone = configRecObj.getValue('TIMEZONE');
		
		let objSS = {
    		"1": "customsearch_scv_kc_income",
    		"2": "customsearch_scv_closing_entry",
    		"3": "customsearch_scv_closing_entry_2",
    		"4": "customsearch_scv_closing_entry_3"
    	}
		
    	if(request.method === 'GET') {
    		let title = 'Closing Entry';
    		let form = serverWidget.createForm({
	    		title : title
	    	});
    		form.addSubmitButton({
    		    label : 'Create'
    		});
    		form.clientScriptModulePath = '../cs/scv_cs_sl_closing_entry.js';
    		form.addButton({id: 'custpage_bt_search', label: 'Search', functionName: 'searchReport()'});
    		addFieldSearch(form, subsidiary, date_from, date_to, reportype);
    		
    		let messageInf = parameters.custpage_message;
    		if(lfunc.isContainValue(messageInf)) {
    			form.addPageInitMessage({type: message.Type.INFORMATION, message: messageInf, duration: -1});
    			isRun = false;
    		}
    		
    		let s = search.load(objSS[reportype]);
	    	let c = s.columns;
	    	let lc = c.length;
	    	let pre = 'custpage_sl_rep', prett = 'custpage_sl_tt';
    		let sublistId = 'custpage_sl_result';
    		let sublist = form.addSublist({
    		    id : sublistId,
    		    type : serverWidget.SublistType.LIST,
    		    label : 'KẾT QUẢ'
    		});    		
    		    		
    		let pgSize = 1000;
    		let f = s.filters;
    		
    		if(isRun) {   
    			let date1 = format.parse({value: date_to, type: format.Type.DATE, timezone: timezone});
    			date1.setDate(1);
    			date_from = format.format({value : date1, type : format.Type.DATE});
    			f.push(search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary}));
    			f.push(search.createFilter({name: 'trandate', operator: search.Operator.ONORAFTER, values: date_from}));
        		f.push(search.createFilter({name: 'trandate', operator: search.Operator.ONORBEFORE, values: date_to}));
    			
        		let fieldStt = sublist.addField({id : prett + 0, type : 'float', label : 'STT'});
        		fieldStt.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
        		
        		addFieldSublist(sublist, c, pre);   
        		
        		let listmap = [];
        		if(reportype === '1') {
        			let fieldAc = sublist.addField({id : 'allocationaccount', type : 'text', label : 'Allocation Account'});
        			fieldAc.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
            		let ftmap = [search.createFilter({name: 'custrecord_scv_mapping_acc_subs', operator: search.Operator.ANYOF, values: subsidiary})];
        			let clmap = [['subsidiary', 0], ['accountincome', 1, 'sltext'], ['accountcredit', 2]];
        			lrp.doSearchSSMore('customsearch_scv_kc_mapping_acc', 1000, listmap, ftmap, clmap, null, null);
        		}
        		
        		s.columns = c;
        		s.filters = f;	        		
    		        		
        		lc = c.length;    			
        		//Xu ly
    			let r = s.runPaged({pageSize: pgSize});
				let numPage = r.pageRanges.length;
				let searchPage, tempData, numTemp, tampValue, line = 0, j = 0;	
				let col = JSON.parse(JSON.stringify(c));
				let vrNone = '- None -';
				
				for(let np = 0; np < numPage; np++) {
					searchPage = r.fetch({index : np });
		    		tempData = searchPage.data;
		    		if(lfunc.isContainValue(tempData)) {
		    			numTemp = tempData.length;
		    			for(let i = 0; i < numTemp; i++) {	
		    				sublist.setSublistValue({id : prett + 0, line : line, value : (line + 1).toFixed(0)});
		    				for(j = 0; j < lc; j++) {
		    					tampValue = getValueDisplay(tempData[i], col[j], c[j]);
		    					if(lfunc.isContainValue(tampValue) && tampValue !== vrNone) {
		    						sublist.setSublistValue({id : pre + j, line : line, value : tampValue});
		    					}		    					
		    				}	
		    				if(reportype === '1') {
		        				objTemp = listmap[0];	            				
	            				if(!!objTemp && !!objTemp.accountincome) {
	            					sublist.setSublistValue({id : 'allocationaccount', line : line, value : objTemp.accountincome.substr(0, 9)});
	            				}
		    				}
		    				line++;		    				
		    			}		    			
		    		}
				}			
				
    		}
    		response.writePage(form);
    	} else {    		
    		let date1 = format.parse({value: date_to, type: format.Type.DATE, timezone: timezone});
			date1.setDate(1);
			date_from = format.format({value : date1, type : format.Type.DATE});
    		let trandate = format.parse({value: date_to, type: format.Type.DATE, timezone: timezone});
			
    		createClosingentry(objSS, reportype, subsidiary, date_from, date_to, trandate);
    		    		
    		let messageInf = 'Tạo bút toán Closing Entry thành công!';
    		let mrTaskId = '';
    		redirect.toSuitelet({
    		    scriptId: 'customscript_scv_sl_closing_entry',
    		    deploymentId: 'customdeploy_scv_sl_closing_entry',
    		    parameters: {mrTaskId: mrTaskId, custpage_reportype: reportype, custpage_subsidiary: parameters.custpage_subsidiary, custpage_date_from: date_from, custpage_date_to: date_to, custpage_message: messageInf}
    		});
    	}
    }
    
    function createClosingentry(objSS, reportype, subsidiary, date_from, date_to, trandate) {
    	let ssid = objSS[reportype];
    	
    	let s = search.load(ssid);
    	let c = s.columns;
    	let f = s.filters;
    	
    	f.push(search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary}));
    	f.push(search.createFilter({name: 'trandate', operator: search.Operator.ONORAFTER, values: date_from}));
    	f.push(search.createFilter({name: 'trandate', operator: search.Operator.ONORBEFORE, values: date_to}));
    	s.filters = f;
    	let rectype_clept = 'customtransaction_scv_clos_entry_posting';
    	let rectype_cle = 'customtransaction_scv_closing_entry';    	
    	
    	let r = s.runPaged({pageSize: 1000});
		let numPage = r.pageRanges.length;
		let searchPage, tempData, numTemp, objTemp;		
		let subPre = '', subNext = '', recCE1 = null, amount, account, accountcredit;
		
		let slL = 'line';
		let fieldsCredit = ['account', 'credit', 'memo'];
		let fieldsDebit = ['account', 'debit', 'memo'];
		let fieldsHead = ['subsidiary', 'trandate', 'memo'];
		
		if(reportype === '1') {
			memo1 = 'Kết chuyển giảm trừ doanh thu';
			let listmap = [];
			let ftmap = [search.createFilter({name: 'custrecord_scv_mapping_acc_subs', operator: search.Operator.ANYOF, values: subsidiary})];
			let clmap = [['subsidiary', 0], ['accountincome', 1], ['accountcredit', 2]];
			lrp.doSearchSSMore('customsearch_scv_kc_mapping_acc', 1000, listmap, ftmap, clmap, null, null);
			
			for(let np = 0; np < numPage; np++) {
    			searchPage = r.fetch({index : np });
        		tempData = searchPage.data;
        		if(lfunc.isContainValue(tempData)) {
        			numTemp = tempData.length;
        			for(let i = 0; i < numTemp; i++) {
        				subNext = tempData[i].getValue(c[0]);
        				account = tempData[i].getValue(c[1]);
        				amount = tempData[i].getValue(c[2]);        				
        				
        				if(subNext !== subPre) {
        					if(!!recCE1) {
        						recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
        					}
        					
        					recCE1 = record.create({type: rectype_cle, isDynamic: true});        		    		
        		    		lfunc.setValueData(recCE1, fieldsHead, [subNext, trandate, memo1]);
        				}
        				subPre = subNext;
        				if(amount !== 0) {
        					recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsDebit, [account, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL});  
            				objTemp = listmap[0];
            				if(!objTemp) {
            					throw 'Có một hoặc nhiều line không có tài khoản kết chuyển. Vui lòng kiểm tra lại!';
            				}
            				accountcredit = objTemp.accountincome;
            				
            				recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsCredit, [accountcredit, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL}); 
        				}
    	        	}
        		}
    		}
			if(!!recCE1) {
				recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
			}
		} else if(reportype === '2') {
			memo1 = 'Kết chuyển doanh thu';
			let listmap = [], pageinfo = null, params_map = [];
			let sql_acc_map = "select acc.id, acc.acctnumber from account acc where acc.issummary = 'F'";
			lrp.doSearchSql(listmap, pageinfo, sql_acc_map, params_map);			
			
			for(let np = 0; np < numPage; np++) {
    			searchPage = r.fetch({index : np });
        		tempData = searchPage.data;
        		if(lfunc.isContainValue(tempData)) {
        			numTemp = tempData.length;
        			for(let i = 0; i < numTemp; i++) {
        				subNext = tempData[i].getValue(c[0]);
        				account = tempData[i].getValue(c[1]);
        				amount = tempData[i].getValue(c[2]);
        				acctnumber = tempData[i].getValue(c[3]);
        				
        				if(subNext !== subPre) {
        					if(!!recCE1) {
        						recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
        					}
        					
        					recCE1 = record.create({type: rectype_cle, isDynamic: true});        		    		
        		    		lfunc.setValueData(recCE1, fieldsHead, [subNext, trandate, memo1]);
        				}
        				subPre = subNext;
        				if(amount !== 0) {
        					recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsDebit, [account, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL});  
            				objTemp = listmap.find(e => e.acctnumber === acctnumber);
            				accountcredit = objTemp.id;
            				recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsCredit, [accountcredit, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL}); 
        				}
    	        	}
        		}
    		}
			if(!!recCE1) {
				recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
			}
		} else if(reportype === '3') {
			memo1 = 'Kết chuyển chi phí';
			let listmap = [], pageinfo = null, params_map = [];
			let sql_acc_map = "select acc.id, acc.acctnumber from account acc where acc.issummary = 'F'";
			lrp.doSearchSql(listmap, pageinfo, sql_acc_map, params_map);			
			
			for(let np = 0; np < numPage; np++) {
    			searchPage = r.fetch({index : np });
        		tempData = searchPage.data;
        		if(lfunc.isContainValue(tempData)) {
        			numTemp = tempData.length;
        			for(let i = 0; i < numTemp; i++) {
        				subNext = tempData[i].getValue(c[0]);
        				account = tempData[i].getValue(c[1]);
        				amount = tempData[i].getValue(c[2]);
        				acctnumber = tempData[i].getValue(c[3]);
        				
        				if(subNext !== subPre) {
        					if(!!recCE1) {
        						recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
        					}
        					
        					recCE1 = record.create({type: rectype_cle, isDynamic: true});        		    		
        		    		lfunc.setValueData(recCE1, fieldsHead, [subNext, trandate, memo1]);
        				}
        				subPre = subNext;
        				if(amount !== 0) {
        					recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsDebit, [account, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL});  
            				objTemp = listmap.find(e => e.acctnumber === acctnumber);
            				accountcredit = objTemp.id;
            				recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsCredit, [accountcredit, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL}); 
        				}
    	        	}
        		}
    		}
			if(!!recCE1) {
				recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
			}
		} else if(reportype === '4') {
			memo1 = 'Kết chuyển lợi nhuận';
			let listmap = [], pageinfo = null, params_map = [];
			let sql_acc_map = "select acc.id, acc.acctnumber from account acc where acc.issummary = 'F'";
			lrp.doSearchSql(listmap, pageinfo, sql_acc_map, params_map);			
			
			for(let np = 0; np < numPage; np++) {
    			searchPage = r.fetch({index : np });
        		tempData = searchPage.data;
        		if(lfunc.isContainValue(tempData)) {
        			numTemp = tempData.length;
        			for(let i = 0; i < numTemp; i++) {
        				subNext = tempData[i].getValue(c[0]);
        				account = tempData[i].getValue(c[1]);
        				amount = tempData[i].getValue(c[2]);
        				acctnumber = tempData[i].getValue(c[3]);
        				
        				if(subNext !== subPre) {
        					if(!!recCE1) {
        						recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
        					}
        					
        					recCE1 = record.create({type: rectype_clept, isDynamic: true});        		    		
        		    		lfunc.setValueData(recCE1, fieldsHead, [subNext, trandate, memo1]);
        				}
        				subPre = subNext;
        				if(amount !== 0) {
        					recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsDebit, [account, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL});  
            				objTemp = listmap.find(e => e.acctnumber === acctnumber);
            				accountcredit = objTemp.id;
            				recCE1.selectNewLine({sublistId: slL});
        					lfunc.setCurrentSublistValueData(recCE1, slL, fieldsCredit, [accountcredit, amount, memo1]);        
            				recCE1.commitLine({sublistId: slL}); 
        				}
    	        	}
        		}
    		}
			if(!!recCE1) {
				recCE1.save({enableSourcing: false, ignoreMandatoryFields : true});
			}
		}
    }
    
    function getValueDisplay(row, col, cl) {
    	let tampValue;
    	if(col.type === 'select' && col.name !== 'subsidiarynohierarchy') {
			tampValue = row.getText(cl);
		} else {
			tampValue = row.getValue(cl);
		}
    	return tampValue;
    }
    
    function addFieldSublist(sublist, c, pre) {
    	let lc = c.length;
    	let ctemp, type, i;
    	for(i = 0; i < lc; i++) {
    		ctemp = JSON.parse(JSON.stringify(c[i])); 
    		type = ctemp.type;
    		if(type.substring(0,8) === 'currency') {
    			type = 'currency';
    		} else if(type === 'select') {
    			type = 'text';
    		} 
    		addFieldInine(sublist, pre + i, type, ctemp.label);    		     		
    	}  
    }
    
    function addFieldInine(sublist, id, type, label) {
    	let field = sublist.addField({id : id,
		    type : type,
		    label : label
		});
		field.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
    }
    
    function addFieldSearch(form, subsidiary, date_from, date_to, reportype) {
    	form.addFieldGroup({
    	    id : 'fieldgroup_dc_main',
    	    label : 'Criteria'
    	});    	
    	
    	let custpage_reportype = form.addField({
	        id: 'custpage_reportype', type: serverWidget.FieldType.SELECT,
	        label: 'Type', container: 'fieldgroup_dc_main' 
	    });
    	custpage_reportype.isMandatory = true;
    	addSelectReportType(custpage_reportype, reportype);
    	
    	let custpage_subsidiary = form.addField({
	        id: 'custpage_subsidiary', type: serverWidget.FieldType.SELECT,
	        label: 'Subsidiary', container: 'fieldgroup_dc_main' //source: 'subsidiary', MULTISELECT
	    });
    	lrp.addSelectSubsidiary(custpage_subsidiary, subsidiary);    	
    	custpage_subsidiary.isMandatory = true;  	
    	
    	let custpage_date_to = form.addField({
	        id: 'custpage_date_to', type: serverWidget.FieldType.DATE,
	        label: 'Closing Date', container: 'fieldgroup_dc_main'
	    });
    	custpage_date_to.defaultValue = date_to;
    	custpage_date_to.isMandatory = true;    	
    }
    
    function addSelectReportType(fRep, reportype) {
    	let listReport = [{value: '1', label: 'Kết chuyển giảm trừ doanh thu'}
    		, {value: '2', label: 'Kết chuyển doanh thu'}
    		, {value: '3', label: 'Kết chuyển chi phí'}   
    		, {value: '4', label: 'Kết chuyển lợi nhuận'}   
    		];
    	let lR = listReport.length;
    	let isSelected = false;
    	for(let i = 0; i < lR; i++) {
			isSelected = reportype === listReport[i].value;
			fRep.addSelectOption({value : listReport[i].value, text : listReport[i].label, isSelected: isSelected});
		}
    }
     
    return {
        onRequest: onRequest
    };
    
});
