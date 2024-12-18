/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', '../lib/scv_lib_cs'],
    function(currentRecord, url, libCS) {
        const arrFldsMandatory = ['custpage_subsidiary'];
        function onExport(){
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();
            if (!libCS.fnValidateFields(currRecord, arrFldsMandatory)) {
                return;
            }
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_pl_rpt_export',
                deploymentId: 'customdeploy_scv_sl_pl_rpt_export',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord);
            window.open(urlDC);

        }
        function onPrint(){
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();
            if (!libCS.fnValidateFields(currRecord, arrFldsMandatory)) {
                return;
            }
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_pl_rpt_export',
                deploymentId: 'customdeploy_scv_sl_pl_rpt_export',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord) + '&isPrint=T';
            window.open(urlDC);

        }

        function onSearchResult(){
            window.onbeforeunload = null;
            let currRecord = currentRecord.get();
            if (!libCS.fnValidateFields(currRecord, arrFldsMandatory)) {
                return;
            }
            let urlDC = url.resolveScript({
                scriptId: 'customscript_scv_sl_pl_rpt',
                deploymentId: 'customdeploy_scv_sl_pl_rpt',
                returnExternalUrl: false
            });
            urlDC = urlDC + plusParam(currRecord);
            window.location.replace(urlDC);
        }

        function plusParam(currRecord) {
            return '&custpage_subsidiary=' + currRecord.getValue('custpage_subsidiary')
                + '&custpage_curfromdt=' + currRecord.getText('custpage_curfromdt')
                + '&custpage_curtodt=' + currRecord.getText('custpage_curtodt')
                + '&custpage_beffromdt=' + currRecord.getText('custpage_beffromdt')
                + '&custpage_beftodt=' + currRecord.getText('custpage_beftodt')
                + '&curtodt_year=' + currRecord.getValue('custpage_curtodt').getFullYear()
                + '&isrun=1';
        }

        return {
            pageInit: ()=>({}),
            onSearchResult: onSearchResult,
            onExport: onExport,
            onPrint: onPrint
        };

    });
