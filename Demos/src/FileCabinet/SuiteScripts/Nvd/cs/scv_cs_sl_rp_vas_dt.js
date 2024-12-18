/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', '../lib/scv_lib_cs'],

    function (ccr, url, libCS) {


       const arrFldsMandatory = [ 'custpage_subsidiary'];
        function getUrlSL(objParams = {}) {
            return url.resolveScript({
                scriptId: 'customscript_scv_sl_rp_vas_dt',
                deploymentId: 'customdeploy_scv_sl_rp_vas_dt',
                returnExternalUrl: false,
                params: (objParams || {})
            });
        }

        function pageInit(scriptContext) {
            let currentRecord = scriptContext.currentRecord;
            const style = "font-weight:bold; background-color: #cce57f !important;border-color: white #cce57f #cce57f #cce57f !important;";
            const sl = 'custpage_sl_ct';
            const lc = currentRecord.getLineCount(sl);
            for (let i = 0; i < lc; i++) {
                const idrow = '#' + sl + 'row' + i;
                const trandate = currentRecord.getSublistValue({sublistId: sl, fieldId: 'trandate', line: i});
                if (!trandate) {
                    const vDebitAmtVND = currentRecord.getSublistValue({sublistId: sl, fieldId: 'sodunovnd', line: i});
                    if (libCS.isContainValue(vDebitAmtVND)) {
                        jQuery(idrow).find("td").attr('style', style);
                    } else {
                        jQuery(idrow).attr("style", style);
                    }
                }
            }

        }

        function refresh() {
            window.location.reload();
        }

        function searchReport() {
            window.onbeforeunload = null;
            let currentRecord = ccr.get();
            if (!libCS.fnValidateFields(currentRecord, arrFldsMandatory))return;
            let urlDC = getUrlSL();
            urlDC = urlDC + plusParam(currentRecord) + plusAccount(currentRecord);
            window.location.replace(urlDC);
        }

        function plusParam(currentRecord) {
            return '&custpage_entity=' + encodeURIComponent(currentRecord.getValue('custpage_entity'))
                + '&custpage_subsidiary=' + currentRecord.getValue('custpage_subsidiary')
                + '&custpage_subsidiarytext=' + currentRecord.getText('custpage_subsidiary')
                + '&custpage_order_type=' + currentRecord.getValue('custpage_order_type')
                + '&custpage_classification=' + currentRecord.getValue('custpage_classification')
                + '&custpage_location=' + currentRecord.getValue('custpage_location')
                + '&custpage_department=' + currentRecord.getValue('custpage_department')
                + '&custpage_kmcp=' + currentRecord.getValue('custpage_kmcp')
                + '&custpage_not_level=' + (currentRecord.getValue('custpage_not_level') ? 'T' : 'F')
                + '&custpage_acc_level=' + currentRecord.getValue('custpage_acc_level')
                + '&custpage_date_dauky=' + currentRecord.getText('custpage_date_dauky')
                + '&custpage_date_cuoiky=' + currentRecord.getText('custpage_date_cuoiky')
                + '&custpage_reportype=' + currentRecord.getValue('custpage_reportype')
                + '&custpage_currencyvalue=' + currentRecord.getValue('custpage_currencyvalue')
                + '&custpage_currencytext=' + currentRecord.getText('custpage_currencyvalue')
                + '&custpage_debitloanagreement=' + currentRecord.getValue('custpage_debitloanagreement')
                + '&custpage_debitloanagreementtext=' + currentRecord.getText('custpage_debitloanagreement')
                + '&custpage_account_parent=' + currentRecord.getValue('custpage_account_parent')
                + '&custpage_exportbc=' + currentRecord.getValue('custpage_exportbc')
                ;
        }

        function plusAccount(currentRecord) {
            let account_parent_text = getAccountText(currentRecord.getText('custpage_account_parent'), ' ');
            let account_text = getAccountText(currentRecord.getText('custpage_account'), ' ');
            let acc_t = (!!account_parent_text && !!account_text) ? (account_parent_text + ', ' + account_text) : (!!account_text ? account_text : account_parent_text);
            return '&custpage_account=' + currentRecord.getValue('custpage_account') + '&custpage_accounttext=' + acc_t;
        }

        function getAccountText(account, space) {
            let accounttext = '';
            if (!!account && account.length > 0) {
                for (let i in account) {
                    let tempvalue = account[i];
                    if (!!tempvalue) {
                        tempvalue = tempvalue.split(space);
                        accounttext = accounttext + tempvalue[0] + ','
                    }
                }
            }
            if (accounttext.length > 0)
                accounttext = accounttext.slice(0, -1);
            return accounttext;
        }

        function getAcccountNumber(account, space) {
            let accounttext = [], tempvalue;
            if (!!account && account.length > 0) {
                for (let i in account) {
                    tempvalue = account[i];
                    if (!!tempvalue) {
                        tempvalue = tempvalue.split(space);
                        accounttext.push(tempvalue[0]);
                    }
                }
            }
            return accounttext;
        }

        function exportReport() {
            window.onbeforeunload = null;
            let currentRecord = ccr.get();
            if (!libCS.fnValidateFields(currentRecord, arrFldsMandatory))return;
            let urlDC = getUrlSL();
            let reportype = currentRecord.getText('custpage_reportype');
            let entity = currentRecord.getValue('custpage_entity');
            reportype = !!entity ? (reportype + '_' + entity) : reportype;
            urlDC += plusParam(currentRecord) + plusAccount(currentRecord) + '&isexport=T' + '&namefile=' + reportype + '.xls';
            window.open(urlDC);
        }

        function exportReportDetail() {
            window.onbeforeunload = null;
            let currentRecord = ccr.get();
            if (!libCS.fnValidateFields(currentRecord, arrFldsMandatory))return;
            let urlDC = getUrlSL();
            urlDC += plusParam(currentRecord) + '&isexport=T';
            let account = currentRecord.getValue('custpage_account');
            let accountnumber = getAcccountNumber(currentRecord.getText('custpage_account'), ' ');
            let reportype = currentRecord.getText('custpage_reportype');
            let entity = currentRecord.getValue('custpage_entity');
            reportype = !!entity ? reportype + '_' + entity : reportype;
            let fn = function fn(accountp, accountnumberp, reportypep) {
                window.open(urlDC + '&custpage_account=' + accountp + '&custpage_accounttext=' + accountnumberp + '&namefile=' + reportypep + '_' + accountnumberp + '.xls')
            };
            if (accountnumber.length > 0) {
                for (let i in accountnumber) {
                    setTimeout(fn, i * 7000, account[i], accountnumber[i], reportype);
                }
            } else {
                window.open(urlDC + plusAccount(currentRecord) + '&namefile=' + reportype + '.xls');
            }
        }

        function onPrintPdf() {
            window.onbeforeunload = null;
            let currentRecord = ccr.get();
            if (!libCS.fnValidateFields(currentRecord, arrFldsMandatory))return;
            let urlDC = getUrlSL();
            let reportype = currentRecord.getText('custpage_reportype');
            let entity = currentRecord.getValue('custpage_entity');
            reportype = !!entity ? reportype + '_' + entity : reportype;
            urlDC += plusParam(currentRecord) + plusAccount(currentRecord) + '&isexport=T' + '&namefile=' + reportype + '.xls&isPrint=T';
            window.open(urlDC);
        }


        return {
            pageInit: pageInit,
            refresh: refresh,
            searchReport: searchReport,
            exportReport: exportReport,
            onPrintPdf: onPrintPdf,
            exportReportDetail: exportReportDetail,
        };

    });
