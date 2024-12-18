/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', '../lib/scv_lib_function'],
    (record, libFn) => {
        const CustomConfig = {
            STATUS: {
                DA_PHE_DUYET: '5'
            }
        };

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            try {
                let form = scriptContext.form;
                let sublist = form.getSublist({id: 'expense'});
                let fieldTaxcode = sublist.getField({id: 'taxcode'});
                let fieldTaxrate = sublist.getField({id: 'taxrate1'});
                let fieldTax1amt = sublist.getField({id: 'tax1amt'});
                let fieldGrossamt = sublist.getField({id: 'grossamt'});
                fieldTaxcode.isMandatory = false;
                fieldTaxcode.updateDisplayType({displayType: 'hidden'});
                fieldTaxrate.isMandatory = false;
                fieldTaxrate?.updateDisplayType({displayType: 'hidden'});
                fieldTax1amt?.updateDisplayType({displayType: 'hidden'});
                fieldGrossamt?.updateDisplayType({displayType: 'hidden'});
            } catch (e) {}
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            updateGrossAmount(scriptContext);
        }

        function updateGrossAmount(scriptContext) {
            if (scriptContext.type === 'delete') return;
            let newRecord = scriptContext.newRecord;
            const lineCount = newRecord.getLineCount('expense');
            const blVND = newRecord.getValue('currency') === '1' || !newRecord.getValue('currency');
            let totalGrossAmount = 0;
            for (let i = 0; i < lineCount; i++) totalGrossAmount += newRecord.getSublistValue({sublistId: 'expense', fieldId: 'amount', line: i}) * 1;
            const factorNumber = blVND ? 1 : 100000;
            const grossAmt = Math.round(totalGrossAmount * factorNumber) / factorNumber;
            newRecord.setValue('custbody_scv_sum_trans_grossamount', grossAmt);
        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            if (scriptContext.type === 'delete') return;
            let oldRecord = scriptContext.oldRecord;
            let newRecord = scriptContext.newRecord;
            let oldStatus = oldRecord?.getValue("custbody_scv_tt_phe_duyet");
            let newStatus = newRecord.getValue("custbody_scv_tt_phe_duyet");
            const blCrtCheck = oldStatus !== newStatus && newStatus === CustomConfig.STATUS.DA_PHE_DUYET;
            if (blCrtCheck) {
                const checkId = createWriteCheck(newRecord.id);
                if (checkId) record.submitFields({type: newRecord.type, id: newRecord.id, values: {custbody_scv_check_transaction: checkId}, options : {ignoreMandatoryFields: true}});
            }
        }

        function createWriteCheck(lenhchi) {
            let recLC = record.load({type: "custompurchase_scv_lenhchi", id: lenhchi});
            let recCheck = record.create({type: record.Type.CHECK, isDynamic: true});
            const lc = recLC.getLineCount('expense');
            libFn.setValue(recCheck, recLC, [
                'entity',
                'account',
                'subsidiary',
                'currency',
                'trandate',
                'memo',
                'department',
                'cseg_scv_sg_proj',
                'custbody_scv_created_transaction',
                'custbody_scv_kemtheo',
                'custbody_scv_emp_number',
                'custbody_scv_dntt_link',
                'custbody_scv_doc_number',
                'custbody_scv_beneficiary_bank',
                'custbody_scv_bank_stt',
                'custbody_scv_amount_in_word',
                'custbody_scv_amount_in_word_en'
            ], [
                'custbody_scv_payee',
                'account',
                'subsidiary',
                'currency',
                'trandate',
                'memo',
                'department',
                'cseg_scv_sg_proj',
                'custbody_scv_created_transaction',
                'custbody_scv_kemtheo',
                'custbody_scv_emp_number',
                'custbody_scv_dntt_link',
                'custbody_scv_doc_number',
                'custbody_scv_beneficiary_bank',
                'custbody_scv_bank_stt',
                'custbody_scv_amount_in_word',
                'custbody_scv_amount_in_word_en'
            ]);
            for (let i = 0; i < lc; i++) {
                recCheck.selectNewLine('expense');
                libFn.setCurrentSublistValue(recCheck, recLC,'expense','expense', [
                    'account',
                    'amount',
                    'taxcode',
                    'tax1amt',
                    'grossamt',
                    'memo',
                    'location',
                    'department',
                    'cseg_scv_sg_proj',
                    'custcol_scv_invoice_date',
                    'custcol_scv_invoice_number',
                    'custcol_scv_invoice_pattern',
                    'custcol_scv_invoice_serial',
                    'custcol_scv_line_name',
                    'custcol_scv_vendor'
                ], [
                    'account',
                    'amount',
                    'custcol_scv_sumtrans_line_taxcode',
                    'custcol_scv_sumtrans_line_taxamt',
                    'custcol_scv_sumtrans_line_grossamt',
                    'memo',
                    'location',
                    'department',
                    'cseg_scv_sg_proj',
                    'custcol_scv_invoice_date',
                    'custcol_scv_invoice_number',
                    'custcol_scv_invoice_pattern',
                    'custcol_scv_invoice_serial',
                    'custcol_scv_line_name',
                    'custcol_scv_vendor'
                ], i);
                recCheck.commitLine('expense');
            }
            return recCheck.save({ignoreMandatoryFields: true});
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
