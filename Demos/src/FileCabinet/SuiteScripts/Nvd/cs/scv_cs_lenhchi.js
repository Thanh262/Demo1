/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
var sstax;
define(['../olib/clib', '../olib/lodash.min', 'N/currentRecord'],

    function (clib, _, currentRecord) {

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
            try {
                sstax = clib.searchData('customsearch_scv_taxcode_search', [], []);
            } catch (e) {
                console.log('pageInit:' + JSON.stringify(e));
            }

        }

        function fieldChanged(scriptContext) {
            try {
                updateDataInLineExpense(scriptContext);
            } catch (e) {
                alert(e.toString());
                // console.log('fieldChanged:' + JSON.stringify(e));

            }
        }
        function updateDataInLineExpense(scriptContext) {
            let currentRecord = scriptContext.currentRecord;
            const sublistId = scriptContext.sublistId;
            if (sublistId !== 'expense') return;
            const filedId = scriptContext.fieldId;
            let grossAmount = 0;
            if (filedId === 'custcol_scv_sumtrans_line_taxcode') {
                let taxcode = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxcode'});
                let f = _.find(sstax, {'Internal ID': taxcode});
                let rate = f?.Rate || '0';
                currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxrate', value: _.replace(rate, '%', '')});
            }
            if (filedId === 'custcol_scv_sumtrans_line_taxcode' || filedId === 'amount') {
                const amount = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'amount'});
                let taxcode = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxcode'});
                let f = _.find(sstax, {'Internal ID': taxcode});
                let rate = _.replace(f?.Rate||'', '%', '');
                let taxamt = _.round(rate * amount / 100);
                currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxamt', value: taxamt});
                currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_grossamt', value: taxamt + amount});
                grossAmount = taxamt + amount;
            } else if (filedId === 'custcol_scv_sumtrans_line_taxamt') {
                const amount = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'amount'});
                const taxamt = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_taxamt'});
                currentRecord.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_grossamt', value: taxamt + amount});
                grossAmount = taxamt + amount;
            }
            else if (filedId === 'custcol_scv_sumtrans_line_grossamt') {
                grossAmount = currentRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_grossamt'})*1;
            }
            updateSumGrossAmount(scriptContext, grossAmount, scriptContext.line)

        }

        function updateSumGrossAmount(scriptContext, grossAmount, lineId, factor = 1) {
            let curRec = currentRecord.get();
            let fieldId = scriptContext.fieldId;
            let sublistId = scriptContext.sublistId;
            if (sublistId!=='expense') return;
            if (['amount', 'quantity', 'rate', 'custcol_scv_sumtrans_line_taxamt', 'custcol_scv_sumtrans_line_taxcode', 'custcol_scv_sumtrans_line_grossamt'].indexOf(fieldId) === -1) return;
            let lineCount = curRec.getLineCount('expense');
            let totalAmount = 0;
            for (let i =0; i < lineCount; i++) {
                let lineGrossAmount = curRec.getSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_sumtrans_line_grossamt', line: i})*1;
                if (i === lineId) lineGrossAmount = grossAmount*factor;
                totalAmount += lineGrossAmount;
            }
            if (lineId === lineCount) totalAmount += grossAmount*factor;
            curRec.setValue('custbody_scv_lc_amount_st', totalAmount, true);
        }

        function sublistChanged(scriptContext) {
            const operation = scriptContext.operation;
            const factor = operation === 'remove' ? -1 : 1;
            updateTotalAmountSublistChanged(scriptContext, factor)
        }

        function updateTotalAmountSublistChanged(scriptContext, factor = 1) {
            let curRecLine = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            if (sublistId !== 'expense') return;
            let grossAmount= curRecLine.getCurrentSublistValue({sublistId: 'expense', fieldId: 'custcol_scv_sumtrans_line_grossamt'});
            let lineId= curRecLine.getCurrentSublistValue({sublistId: 'expense', fieldId: 'line'});
            let curRec = currentRecord.get();
            let lineCount = curRec.getLineCount('expense');
            let totalAmount = 0;
            for (let i =0; i < lineCount; i++) {
                let lineGrossAmount = curRec.getSublistValue({sublistId: 'expense', fieldId: 'custcol_scv_sumtrans_line_grossamt', line: i})*1;
                if (i === lineId) lineGrossAmount = grossAmount*factor;
                totalAmount += lineGrossAmount;
            }
            curRec.setValue('custbody_scv_lc_amount_st', totalAmount, true);
        }


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            sublistChanged: sublistChanged,
        };

    });
