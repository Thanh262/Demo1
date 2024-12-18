/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', '../lib/scv_lib_report'],
    
    (record, search, lrp) => {
        const SAVED_SEARCH_ID_CHECK_TAM_UNG_MUA_HANG = 'customsearch_scv_emp_precheck_2';
        const SAVED_SEARCH_ID_HOAN_UNG_TAM_UNG_MUA_HANG = 'customsearch_scv_emp_exprep_4';
        const SAVED_SEARCH_ID_DEPOSIT_TAM_UNG_MUA_HANG = 'customsearch_scv_emp_deposits_2';
        
        const PAGE_SIZE = 1000;
        
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            let tgType = scriptContext.type;
            let relatedTransaction;
            let recType;
            if(tgType === scriptContext.UserEventType.DELETE) {
                relatedTransaction = scriptContext.oldRecord.getValue('custbody_scv_related_transaction')[0];
                recType = scriptContext.oldRecord.type;
            } else {
                relatedTransaction = scriptContext.newRecord.getValue('custbody_scv_related_transaction')[0];
                recType = scriptContext.newRecord.type;
            }
            if(relatedTransaction) {
                let lkTransaction = search.lookupFields({type: search.Type.TRANSACTION, id: relatedTransaction
                    , columns: ['recordtype', 'custbody_scv_emp_check_amt', 'custbody_scv_emp_refund_amt', 'custbody_scv_emp_deposit_amt', 'custbody_scv_emp_remaining_amt', 'custbody_scv_remaining_po', 'total']});
                if(lkTransaction.recordtype === record.Type.PURCHASE_ORDER) {
                    let listDataAmount = [];
                    let filtersAmount = [];
                    pushFilters(filtersAmount, relatedTransaction);
                    if(recType === record.Type.CHECK) {
                        lrp.doSearchSSRangeLabelId(SAVED_SEARCH_ID_CHECK_TAM_UNG_MUA_HANG, PAGE_SIZE, listDataAmount, filtersAmount);
                        let check_amt = calculateAmount(listDataAmount);
                        let remainingAmount = calculateRemainingAmount(lkTransaction, check_amt);
                        if(check_amt !== Number(lkTransaction.custbody_scv_emp_check_amt) || isDiffRemaining(remainingAmount, lkTransaction)) {
                            submitFieldsPurchaseOrder(relatedTransaction, {custbody_scv_emp_check_amt: check_amt, custbody_scv_emp_remaining_amt: remainingAmount.remaining_amt,
                                custbody_scv_remaining_po: remainingAmount.remaining_po});
                        }
                    } else if(recType === record.Type.EXPENSE_REPORT || recType === record.Type.JOURNAL_ENTRY || recType === record.Type.VENDOR_CREDIT) {
                        lrp.doSearchSSRangeLabelId(SAVED_SEARCH_ID_HOAN_UNG_TAM_UNG_MUA_HANG, PAGE_SIZE, listDataAmount, filtersAmount);
                        let refund_amt = calculateAmount(listDataAmount);
                        let remainingAmount = calculateRemainingAmount(lkTransaction, null, refund_amt);
                        if(refund_amt !== Number(lkTransaction.custbody_scv_emp_refund_amt) || isDiffRemaining(remainingAmount, lkTransaction)) {
                            submitFieldsPurchaseOrder(relatedTransaction, {custbody_scv_emp_refund_amt: refund_amt, custbody_scv_emp_remaining_amt: remainingAmount.remaining_amt,
                                custbody_scv_remaining_po: remainingAmount.remaining_po});
                        }
                        
                    } else if(recType === record.Type.DEPOSIT) {
                        lrp.doSearchSSRangeLabelId(SAVED_SEARCH_ID_DEPOSIT_TAM_UNG_MUA_HANG, PAGE_SIZE, listDataAmount, filtersAmount);
                        let deposit_amt = calculateAmount(listDataAmount);
                        let remainingAmount = calculateRemainingAmount(lkTransaction, null, null, deposit_amt);
                        if(deposit_amt !== Number(lkTransaction.custbody_scv_emp_deposit_amt) || isDiffRemaining(remainingAmount, lkTransaction)) {
                            submitFieldsPurchaseOrder(relatedTransaction, {custbody_scv_emp_deposit_amt: deposit_amt, custbody_scv_emp_remaining_amt: remainingAmount.remaining_amt,
                                custbody_scv_remaining_po: remainingAmount.remaining_po});
                        }
                    }
                }
            }
        }
        
        const isDiffRemaining = (remainingAmount, lkTransaction) => {
            return remainingAmount.remaining_po !== Number(lkTransaction.custbody_scv_remaining_po) || remainingAmount.remaining_amt !== remainingAmount.old_remaining_amt;
        }
        
        const submitFieldsPurchaseOrder = (relatedTransaction, objValues) => {
            record.submitFields({type: record.Type.PURCHASE_ORDER, id: relatedTransaction,
                values: objValues, options: {ignoreMandatoryFields: true}});
        }
        
        const calculateAmount  = (listDataAmount) => {
            let totalAmount = 0;
            for(let objAmount of listDataAmount) {
                totalAmount += Number(objAmount['Amount']);
            }
            return totalAmount;
        }
        
        const calculateRemainingAmount = (lkTransaction, check_amt, refund_amt, deposit_amt) => {
            let remaining_amt = (check_amt ?? lkTransaction.custbody_scv_emp_check_amt ?? 0) -
                (refund_amt ?? lkTransaction.custbody_scv_emp_refund_amt ?? 0) - (deposit_amt ?? lkTransaction.custbody_scv_emp_deposit_amt ?? 0);
            let remaining_po = lkTransaction.total -
                (refund_amt ?? lkTransaction.custbody_scv_emp_refund_amt ?? 0) - remaining_amt;
            
            return {remaining_amt, remaining_po, old_remaining_amt: Number(lkTransaction.custbody_scv_emp_remaining_amt)}
        }
        
        const pushFilters = (filters, relatedTransaction) => {
            filters.push(search.createFilter({name: 'custbody_scv_related_transaction', operator: search.Operator.ANYOF, values:  relatedTransaction}));
        }
        
        return {afterSubmit}

    });
