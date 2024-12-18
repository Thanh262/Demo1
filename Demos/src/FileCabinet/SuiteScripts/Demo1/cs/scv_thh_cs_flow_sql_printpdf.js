/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/search', 'N/url', 'N/record'],

    function (ccr, search, url, record) {

        /*if(typeof ExcelJS === "undefined"){
            jQuery.getScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js');
        }*/
        if (typeof saveAs === "undefined") {
            jQuery.getScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
        }

        if (typeof XLSX === "undefined") {
            jQuery.getScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
        }

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
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

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

        }

        const exportPdf = () => {
            let currentRecord = ccr.get();
            let params = getParameters(currentRecord);
            let subsidiary = currentRecord.getText({
                fieldId: 'custpage_subsidiary'
            })

            params.templateId = 'CUSTTMPL_SCV_TESTORDER_PRINT_TABLE';
            params.isExportPdf = 'T';
            params.subsidiaryName = subsidiary;

            let urlExportPdf = url.resolveScript({
                scriptId: 'customscript_scv_thh_sl_flow_sql_printpd',
                deploymentId: 'customdeploy_scv_thh_sl_flow_sql_printpd',
                returnExternalUrl: false,
                params: params
            });
            window.open(urlExportPdf);
        }

        const exportToExcel = () => {
            let currentRecord = ccr.get();
            let sublistId = 'custpage_sublist';
            let lineCountSublist = currentRecord.getLineCount(sublistId);

            let style_header = {
                alignment: {vertical: "center", horizontal: "center"}, font: {sz: 14, bold: true, color: '#FF00FF'}
            };
            let ws_data = [, [, , , , , {v: 'FINANCIAL ANALYTICS', t: 's', s: style_header}]];

            let headerLine = [, , , , 'Item', 'Gross Amount', 'Interest Amount', 'Available'];
            ws_data.push(headerLine);

            for (let i = 0; i < lineCountSublist; i++) {
                let item = currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custpage_item',
                    line: i
                });

                let grossamt = currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custpage_grossamount',
                    line: i
                });

                let interestAmt = currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custpage_interest_amount',
                    line: i
                });

                let available = currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custpage_available',
                    line: i
                });
                ws_data.push([, , , , item, grossamt, interestAmt, available]);
            }

            let workBook = XLSX.utils.book_new();
            workBook.SheetNames.push("Sheet1");

            workBook.Sheets["Sheet1"] = XLSX.utils.aoa_to_sheet(ws_data);

            workBook.Sheets["Sheet1"]["!cols"] = [{wch: 10}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 50}, {wch: 15}, {wch: 15}, {wch: 10},];

            let wbout = XLSX.write(workBook, {bookType: 'xlsx', type: 'binary'});
            saveAs(new Blob([s2ab(wbout)], {type: "application/octet-stream"}), 'Test.xlsx');
        }

        const s2ab = (s) => {
            let sL = s.length;
            let buf = new ArrayBuffer(sL);
            let view = new Uint8Array(buf);
            for (let i = 0; i < sL; i++) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        const searchOrderItems = () => {
            let currentRecord = ccr.get();
            let parameters = getParameters(currentRecord);
            parameters.isSearch = 'T';

            let urlSearchOrder = url.resolveScript({
                scriptId: 'customscript_scv_thh_sl_flow_sql_printpd',
                deploymentId: 'customdeploy_scv_thh_sl_flow_sql_printpd',
                returnExternalUrl: false,
                params: parameters
            })
            window.location.replace(urlSearchOrder);
        }

        const getParameters = (currentRecord) => {
            return {
                custpage_subsidiary: currentRecord.getValue('custpage_subsidiary'),
                custpage_customer: currentRecord.getValue('custpage_customer'),
                custpage_interest_rate: currentRecord.getValue('custpage_interest_rate')
            }
        }

        return {
            pageInit: pageInit, // fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord,
            exportPdf: exportPdf, exportToExcel: exportToExcel, searchOrderItems: searchOrderItems
        };

    });
