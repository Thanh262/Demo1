/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/url'],

function(ccr, record, search, url) {
    
	function refresh() {
		window.location.reload();
	}
	
	function searchReport() {
		let currentRecord = ccr.get();
		let urlDC = url.resolveScript({
			scriptId: 'customscript_scv_sl_allocate_pur_cost',
		    deploymentId: 'customdeploy_scv_sl_allocate_pur_cost',
		    returnExternalUrl: false
		});
		urlDC = urlDC + plusParam(currentRecord);
		window.location.replace(urlDC);
	}
	
	function markAll() {
		setValueSelect('custpage_sl_bill', 'custpage_sl_select', true);
	}
	
	function unmarkAll() {
		setValueSelect('custpage_sl_bill', 'custpage_sl_select', false);
	}
	
	function markAllItr() {
		setValueSelect('custpage_sl_itr', 'custpage_sl_select', true);
		allocate();
	}
	
	function unmarkAllItr() {
		setValueSelect('custpage_sl_itr', 'custpage_sl_select', false);		
	}
	
	function setValueSelect(sl, sf_select, value) {
		let currentRecord = ccr.get();
		let lc = currentRecord.getLineCount(sl);
		for(let i = 0; i < lc; i++) {
			currentRecord.selectLine({sublistId: sl, line: i});
			currentRecord.setCurrentSublistValue({sublistId: sl, fieldId: sf_select, value: value});
			currentRecord.commitLine(sl);
		}
	}
	
	function recalHeader() {
		let currentRecord = ccr.get();
		let sl = 'custpage_sl_bill';
		let sf_select = 'custpage_sl_select';
		let lc = currentRecord.getLineCount(sl);
		let select, total_cpmh_trongnuoc = 0, total_cpmh_quocte = 0, costcateg_id, amount, costcateg;
		for(let i = 0; i < lc; i++) {
			select = currentRecord.getSublistValue({sublistId: sl, fieldId: sf_select, line: i});
			if(select === true || select === 'T') {
				costcateg_id = currentRecord.getSublistValue({sublistId: sl, fieldId: 'costcateg_id', line: i});
				costcateg = currentRecord.getSublistValue({sublistId: sl, fieldId: 'costcateg', line: i});
				costcateg = costcateg.substr(0,2);
				amount = currentRecord.getSublistValue({sublistId: sl, fieldId: 'amount', line: i}) * 1;
				if(costcateg === '01') {
					total_cpmh_quocte = total_cpmh_quocte + amount;
				} else if(costcateg === '02') {
					total_cpmh_trongnuoc = total_cpmh_trongnuoc + amount;
				}
			}
		}
		currentRecord.setValue('custpage_chiphimuahangquocte', total_cpmh_quocte);
		currentRecord.setValue('custpage_chiphimuahangtrongnuoc', total_cpmh_trongnuoc);
	}
	
	function allocate() {
		let currentRecord = ccr.get();
		let sl = 'custpage_sl_itr';
		let sf_select = 'custpage_sl_select';
		let lc = currentRecord.getLineCount(sl);
		let chiphimuahangquocte = currentRecord.getValue('custpage_chiphimuahangquocte');
		let chiphimuahangtrongnuoc = currentRecord.getValue('custpage_chiphimuahangtrongnuoc');
		let select, amount, total_amount = 0, exchangerate, currency_text, cpmh_quocte_line, cpmh_trongnuoc_line, cpmhqt_noex, cpmhtn_noex;
		let total_quocte_line = 0, total_trongnuoc_line = 0, amount_max = 0, line_max = 0, exchangerate_max = 0, cpmh_quocte_line_max = 0, cpmh_trongnuoc_line_max = 0;
		for(let i = 0; i < lc; i++) {
			select = currentRecord.getSublistValue({sublistId: sl, fieldId: sf_select, line: i});
			if(select === true || select === 'T') {
				amount = currentRecord.getSublistValue({sublistId: sl, fieldId: 'amount', line: i}) * 1;
				total_amount = total_amount + amount;
			}	
		}
		let list_ct = [], total_amount_ct_qt = 0, total_amount_ct_tn = 0;//console.log('total_amount');console.log(total_amount)
		if(total_amount !== 0) {
			for(let i = 0; i < lc; i++) {
				select = currentRecord.getSublistValue({sublistId: sl, fieldId: sf_select, line: i});
				currentRecord.selectLine({sublistId: sl, line: i});
				if(select === true || select === 'T') {
					amount = currentRecord.getSublistValue({sublistId: sl, fieldId: 'amount', line: i}) * 1;//console.log('amount');console.log(amount)
					exchangerate = currentRecord.getSublistValue({sublistId: sl, fieldId: 'exchangerate_hidden', line: i});console.log(exchangerate);
					currency_text = currentRecord.getSublistValue({sublistId: sl, fieldId: 'currency_text', line: i});
					if(currency_text === 'VND') {
						exchangerate = 1;
					}
					cpmhqt_noex = chiphimuahangquocte * amount / total_amount;
					cpmhtn_noex = (chiphimuahangtrongnuoc * amount / total_amount);
					cpmh_quocte_line = cpmhqt_noex / exchangerate;//console.log(cpmhqt_noex)
					cpmh_trongnuoc_line = cpmhtn_noex/ exchangerate;
					if(currency_text === 'VND') {
						cpmh_quocte_line= Math.round(cpmh_quocte_line);
						cpmh_trongnuoc_line = Math.round(cpmh_trongnuoc_line);
					} else {
						cpmh_quocte_line = cpmh_quocte_line.toFixed(2) * 1;
						cpmh_trongnuoc_line = cpmh_trongnuoc_line.toFixed(2) * 1;
					}
					total_quocte_line = total_quocte_line + cpmh_quocte_line;
					total_trongnuoc_line = total_trongnuoc_line + cpmh_trongnuoc_line;
					total_amount_ct_qt += cpmh_quocte_line * exchangerate;
					total_amount_ct_tn += cpmh_trongnuoc_line * exchangerate;
					if(amount >= amount_max) {
						line_max = i;
						exchangerate_max = exchangerate;
						cpmh_quocte_line_max = cpmh_quocte_line;
						cpmh_trongnuoc_line_max = cpmh_trongnuoc_line;
					}
					if(list_ct[0] !== currency_text) {
						list_ct.push(currency_text);
					}
					
					
				} else {
					cpmh_quocte_line = ''; cpmh_trongnuoc_line = '';
					cpmhqt_noex = ''; cpmhtn_noex = '';
				}
				currentRecord.setCurrentSublistValue({sublistId: sl, fieldId: 'chiphi_muahang_quocte', value: cpmh_quocte_line});//console.log(cpmh_quocte_line);
				currentRecord.setCurrentSublistValue({sublistId: sl, fieldId: 'chiphi_muahang_trongnuoc', value: cpmh_trongnuoc_line});
				currentRecord.setCurrentSublistValue({sublistId: sl, fieldId: 'cpmhqt_noex', value: cpmhqt_noex});
				currentRecord.setCurrentSublistValue({sublistId: sl, fieldId: 'cpmhtn_noex', value: cpmhtn_noex});
				currentRecord.commitLine({sublistId: sl});
			}
		}
	}
	
	function plusParam(currentRecord) {
		return '&custpage_tokhaihaiquan=' + currentRecord.getText('custpage_tokhaihaiquan');
	}
	
	function pageInit(scriptContext) {
		
    }
	
	function fieldChanged(scriptContext){
		let sublistId = scriptContext.sublistId;
		let fieldId = scriptContext.fieldId;
		let currentRecord = scriptContext.currentRecord;
		if(sublistId === 'custpage_sl_itr' && fieldId === 'custpage_sl_select') {
			let select = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custpage_sl_select'});
			if(!(select === true || select === 'T')) {
				currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'chiphi_muahang_quocte', value: ''});
				currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'chiphi_muahang_trongnuoc', value: ''});
			} else {
				//allocate();
			}
		}
	}
	
	function sublistChanged(scriptContext) {		
		let sublistId = scriptContext.sublistId;
		if(sublistId === 'custpage_sl_bill') {
			recalHeader();
		}
	}
	
	function postSourcing(scriptContext) {		
		
    }
	
	function saveRecord(scriptContext) {
		let currentRecord = scriptContext.currentRecord;
		let sl = 'custpage_sl_itr';
		let sf_select = 'custpage_sl_select';
		let lc = currentRecord.getLineCount(sl);
		let isselect = false, isvalid = true, islinequocte = true, islinetrongnuoc = true, chiphi_muahang_quocte, chiphi_muahang_trongnuoc;
		for(let i = 0; i < lc; i++) {
			let select = currentRecord.getSublistValue({sublistId: sl, fieldId: sf_select, line: i});
			if(select === true || select === 'T') {
				isselect = true;	
				chiphi_muahang_quocte = currentRecord.getSublistValue({sublistId: sl, fieldId: 'chiphi_muahang_quocte', line: i});
				chiphi_muahang_trongnuoc = currentRecord.getSublistValue({sublistId: sl, fieldId: 'chiphi_muahang_trongnuoc', line: i});
				if(!chiphi_muahang_quocte && chiphi_muahang_quocte === '') {
					islinequocte = false;
				}
				if(!chiphi_muahang_trongnuoc && chiphi_muahang_trongnuoc === '') {
					islinetrongnuoc = false;
				}
			}
		}
		
		if(islinequocte === false || islinetrongnuoc === false) {
			alert('chưa phân bổ hết cho chứng từ nhập kho được chọn!');
			isvalid = false;
		}
		
		if(isselect === false) {
			isvalid = false;
			alert('Bạn phải chọn ít nhất một chứng từ nhập kho!');
		}
		if(isvalid) { 
			return confirm('Bạn có muốn phân bổ không?');
		} else {
			return isvalid;
		}
	}
	
    return {
    	refresh: refresh,    	
    	searchReport: searchReport,
    	markAll: markAll,
    	unmarkAll: unmarkAll,
    	markAllItr: markAllItr,
    	unmarkAllItr: unmarkAllItr,
    	allocate: allocate,
    	pageInit: pageInit,
    	fieldChanged: fieldChanged,
    	sublistChanged: sublistChanged,
    	postSourcing: postSourcing,
    	saveRecord: saveRecord
    };
    
});
