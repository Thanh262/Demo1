/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/format/i18n','N/url'],

    (format, url) => {
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
            let recordId = scriptContext.newRecord.id;
            let form = scriptContext.form;
            let exportExcelUrl = url.resolveScript({
                scriptId: 'customscript_scv_thh_sl_export_salesord',
                deploymentId: 'customdeploy_scv_thh_sl_export_salesord',
                returnExternalUrl: false,
                params : {
                    salesOrderId : recordId,
                    export: 'excel'
                }
            });

            let exportPdfUrl = url.resolveScript({
                scriptId: 'customscript_scv_thh_sl_export_salesord',
                deploymentId: 'customdeploy_scv_thh_sl_export_salesord',
                returnExternalUrl: false,
                params : {
                    salesOrderId : recordId,
                    export: 'pdf'
                }
            });

            form.addButton({
                id: 'custpage_export_pdf_btn',
                label: 'Export PDF',
                functionName: `window.open('${exportPdfUrl}', '_blank');`
            });

            form.addButton({
                id: 'custpage_export_excel_btn',
                label: 'Export Excel',
                functionName: `window.open('${exportExcelUrl}', '_blank');`
            });

            //form.clientScriptModulePath = '../cs/scv_thh_cs_exp_saleord';
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
            let newRecord = scriptContext.newRecord;
            let sublistId = 'item';
            let lineCount = newRecord.getLineCount(sublistId);
            for(let i = 0; i < lineCount; i++) {
                tinhDonGia(newRecord, sublistId, i);
                tinhThanhTien(newRecord, sublistId, i);
            }
            tinhTongSoLuong(newRecord, sublistId, lineCount);
            tinhTongThanhTien(newRecord, sublistId, lineCount);

            setTienBangChu(newRecord);
        }

        const setTienBangChu = (newRecord) => {
            let tongThanhTien = newRecord.getValue('custbody_scv_total_amount');

            let tienBangChu = format.spellOut({
                number: tongThanhTien,
                locale: 'vi_VN',
            });

            newRecord.setValue('custbody_scv_amount_in_word', tienBangChu);
        }

        const tinhDonGia = (currentRecord, sublistId, lineNum) => {
            let grossamt = currentRecord.getSublistValue({
                sublistId: sublistId,
                fieldId: 'grossamt',
                line: lineNum,
            }) ?? 0;

            let quantity = currentRecord.getSublistValue({
                sublistId: sublistId,
                fieldId: 'quantity',
                line: lineNum,
            }) ?? 0;

            currentRecord.setSublistValue({
                sublistId: sublistId,
                fieldId: 'custcol_scv_don_gia',
                line: lineNum,
                value: (grossamt / quantity) ?? 0,
            });
        }

        const tinhThanhTien = (currentRecord, sublistId, lineNum) => {
            let quantity = currentRecord.getSublistValue({
                sublistId: sublistId,
                fieldId: 'quantity',
                line: lineNum,
            }) ?? 0;

            let donGia = currentRecord.getSublistValue({
                sublistId: sublistId,
                fieldId: 'custcol_scv_don_gia',
                line: lineNum,
            }) ?? 0;

            currentRecord.setSublistValue({
                sublistId: sublistId,
                fieldId: 'custcol_scv_thanh_tien',
                line: lineNum,
                value: (donGia * quantity) ?? 0,
            });
        }

        const tinhTongSoLuong = (currentRecord, sublistId, lineCount) => {
            let tongSoLuong = 0;
            for(let i = 0; i < lineCount; i++) {
                tongSoLuong += currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'quantity',
                    line: i,
                });
            }

            currentRecord.setValue({
                fieldId: 'custbody_scv_sum_quantity',
                value: tongSoLuong ?? 0,
            });
        }

        const tinhTongThanhTien = (currentRecord, sublistId, lineCount) => {
            let tongThanhTien = 0;
            for(let i = 0; i < lineCount; i++) {
                tongThanhTien += currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custcol_scv_thanh_tien',
                    line: i,
                });
            }

            currentRecord.setValue({
                fieldId: 'custbody_scv_total_amount',
                value: tongThanhTien ?? 0,
            });
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

        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
