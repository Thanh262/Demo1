/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', '../lib/scv_lib_cs'],
    function (currentRecord, url, libCS) {
        const arrFldsMandatory = ['custpage_subsidiary'];
        function pageInit(scriptContext) {}
        function onExport() {
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();
            if (!libCS.fnValidateFields(currRecord, arrFldsMandatory)) return;
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_bs_rpt_export',
                deploymentId: 'customdeploy_scv_sl_bs_rpt_export',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord);
            window.open(urlDC);

        }

        function onPrint() {
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_bs_rpt_export',
                deploymentId: 'customdeploy_scv_sl_bs_rpt_export',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord) + '&isPrint=T';
            window.open(urlDC);

        }

        function onSearchResult() {
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();
            if (!libCS.fnValidateFields(currRecord, arrFldsMandatory)) return;
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_bs_rpt',
                deploymentId: 'customdeploy_scv_sl_bs_rpt',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord);
            window.location.replace(urlDC);
        }

        function plusParam(currRecord) {
            let curtodt = currRecord.getValue('custpage_curtodt');
            let curtodt_header = "ngày " + curtodt.getDate() + " tháng " + (curtodt.getMonth() + 1) + " năm " + curtodt.getFullYear();
            return '&custpage_subsidiary=' + currRecord.getValue('custpage_subsidiary')
                + '&custpage_curtodt=' + currRecord.getText('custpage_curtodt')
                + '&custpage_beftodt=' + currRecord.getText('custpage_beftodt')
                + '&curtodt_header=' + curtodt_header
                + '&isrun=1';
        }

        return {
            pageInit: pageInit,
            onSearchResult: onSearchResult,
            onExport: onExport,
            onPrint: onPrint
        };

    });
