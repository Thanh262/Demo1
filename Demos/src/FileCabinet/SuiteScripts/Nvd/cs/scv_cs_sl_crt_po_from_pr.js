/**
 * Nội dung: Tạo PO From PR
 * keyword:
 * - PO: purchase Order {purchaseorder}
 * - PR: Purchase request {custompurchase_scv_purchase_request}
 * =======================================================================================
 *  Date                Author                  Description
 *  14 Nov 2024		    Khanh Tran			    Init, create file, Tạo PO From PR from mr.Hải(https://app.clickup.com/t/86cx295gc)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/currentRecord', 'N/url', 'N/ui/dialog', 'N/query', 'N/https',
    '../lib/scv_lib_cs.js', '../lib/scv_lib_function.js', '../lib/scv_lib_cs_xls.js'
],

function(crr, url, dialog, query, https,
    libCs, lbf
) {
    const CUR_SCRIPT = {
        ID: 'customscript_scv_sl_crt_po_from_pr',
        DEPLOYID_UI: 'customdeploy_scv_sl_crt_po_from_pr',
        DEPLOYID_DATA: 'customdeploy_scv_sl_crt_po_from_pr_data'
    }

    const URL_DATA = "/app/site/hosting/scriptlet.nl?script=" + CUR_SCRIPT.ID + "&deploy=" + CUR_SCRIPT.DEPLOYID_DATA;
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
        customTable()
    }

    const customTable = () => {
        let curRec = crr.get();
        let sl = 'custpage_sl_result';
        let subsidiary = curRec.getValue('custpage_subsidiary').join(',');
        let arrLocation = getLocationBySub(subsidiary);
        for(let i = 0; i < curRec.getLineCount(sl); i++){
            curRec.selectLine({sublistId: sl, line: i});
            let json_data = curRec.getSublistValue(sl, 'custpage_col_json_data', i);
            let objData = JSON.parse(json_data);
            let subsidiary_id = objData.subsidiary_id;
            let srcData = arrLocation;
            if(subsidiary_id){
                srcData = arrLocation.filter(e => e.subsidiary == subsidiary_id);
            }

            let locField = curRec.getSublistField({sublistId: sl, fieldId: 'custpage_col_location', line: i});
            locField.removeSelectOption({value : null});
            if(srcData.length > 0){
                locField.insertSelectOption({value: '', text: ''});
                srcData.forEach(obj => {
                    locField.insertSelectOption({value: obj.id, text: obj.name});
                })
            }
            
            curRec.commitLine(sl);
        }
    }

    const getLocationBySub = (subsidiary) => {
        let sql = `
            SELECT location.id, location.name, LocationSubsidiaryMap.subsidiary
            FROM location
            JOIN LocationSubsidiaryMap 
            ON location.id = LocationSubsidiaryMap.location
            WHERE isinactive = 'F'`;
        if(subsidiary) sql += ` AND LocationSubsidiaryMap.subsidiary IN (${subsidiary})`;

        let resultSearch = query.runSuiteQL({query: sql});
        let arrData = resultSearch.asMappedResults();
        return arrData;
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
        let curRec = scriptContext.currentRecord;
        let sl = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;
        let line = scriptContext.line 
        if(fieldId == 'custpage_col_qty'){
            curRec.selectLine({sublistId: sl, line: line});
          
            let qty = curRec.getCurrentSublistValue(sl, 'custpage_col_qty') * 1;
            let qty_remaining = curRec.getSublistValue(sl, 'custpage_col_qty_remaining', line) * 1;
            if(qty > qty_remaining){
                alert('Đã vượt quá số lượng còn lại')
                curRec.setCurrentSublistValue({sublistId: sl, fieldId: 'custpage_col_qty', value: qty_remaining,  ignoreFieldChange: true});
                qty = qty_remaining;
            }

            let rate = curRec.getSublistValue(sl, 'custpage_col_rate', line) * 1;  
            let amt = qty * rate;
            curRec.setCurrentSublistValue(sl, 'custpage_col_amt', amt, true);
        }else if(fieldId == 'custpage_def_vendor'){
            let def_vendor = curRec.getValue('custpage_def_vendor');
            sl = 'custpage_sl_result';
            for(let i = 0; i < curRec.getLineCount(sl); i++){
                curRec.selectLine({sublistId: sl, line: i});
                curRec.setCurrentSublistValue(sl, 'custpage_col_vendor', def_vendor, true);
                curRec.commitLine({sublistId: sl});
            }
        }
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
        window.onbeforeunload = null;
        let progessStatus = libCs.showLoadingDialog(true);
        asynCrtPO(progessStatus)
        return false;
    }

    const asynCrtPO = async (progessStatus) => {
        try {
            let dataSLResult = getDataSLResult();
            if(dataSLResult.length < 1) {
                libCs.showLoadingDialog(false);
                return alert('You must select at least 1 line');
            }

            let params = getObjParams();
            let keyGrp = ['subsidiary_id', 'vendor', 'order_type'];
            let arrGrp = lbf.onGroupByArray(dataSLResult, keyGrp);
            let ttlPromise = arrGrp.length;
            let objNote = {failed: '', success: ''};
            let objRes = {};
            for(let i = 0; i < ttlPromise; i++){    
                progessStatus.innerHTML = `Create PO ${i + 1} / ${ttlPromise}`;
                let objGrp = arrGrp[i];
                let arrLine = dataSLResult.filter(e => e.subsidiary_id == objGrp.subsidiary_id && 
                    e.vendor == objGrp.vendor && e.order_type == objGrp.order_type);
                objRes = await https.post.promise({
                    url: URL_DATA, 
                    body: {
                        action: 'crtPO', 
                        objBody: JSON.stringify({action: 'crtPO', params: params, arrLine: arrLine, objGrp: objGrp})
                    }
                });
                objRes = JSON.parse(objRes.body);
                noteRequest(objRes, objNote);
            }
            
            libCs.showLoadingDialog(false);
            dialog.alert({title: `Notifications`, message: objNote.failed + objNote.success})
            .then(function() {
                let urlDC = url.resolveScript({
                    scriptId: CUR_SCRIPT.ID,
                    deploymentId: CUR_SCRIPT.DEPLOYID_UI,
                    params: params,
                });
                urlDC = urlDC + '&isSearch=T';
                window.location.replace(urlDC);
            })
        } catch (error) {
            alert(error.toString())
            libCs.showLoadingDialog(false)
        }
    }

    const noteRequest = (objRes, objNote) => {
        if(objRes.isSuccess == true) objNote.success += objRes.msg + '<br/>';
        else objNote.failed += objRes.msg + '<br/>';
    }

    const getDataSLResult = () => {
        let arrResult = [];
        let curRec = crr.get();
        let fieldIds = [
            'check', 'subsidiary', 'ngay_yeu_cau', 'so_yeu_cau', 'vendor', 'item',
            'units', 'qty', 'qty_remaining', 'rate', 'amt', 'ngay_can_hang', 'nhom_hang', 'location', 'json_data'
        ];
        let sl = 'custpage_sl_result';
        for(let i = 0; i < curRec.getLineCount(sl); i++){
            let checkbox = curRec.getSublistValue(sl, 'custpage_col_check', i);
            let vendor = curRec.getSublistValue(sl, 'custpage_col_vendor', i);
            if(checkbox && vendor){
                let obj = {};
                fieldIds.forEach(fieldId => {
                    if(fieldId == 'json_data'){
                        let dataSummary = curRec.getSublistValue(sl, 'custpage_col_json_data', i);
                        obj = {...JSON.parse(dataSummary), ...obj};
                    }
                    else obj[fieldId] = curRec.getSublistValue(sl, 'custpage_col_' + fieldId, i)
                })

                arrResult.push(obj)
            }
        }
        return arrResult;
    }

    const onSearchResult = () => {
        window.onbeforeunload = null;
        let params = getObjParams();
        let urlDC = url.resolveScript({
            scriptId: CUR_SCRIPT.ID,
            deploymentId: CUR_SCRIPT.DEPLOYID_UI,
            params: params,
        });
        urlDC = urlDC + '&isSearch=T';
        window.location.replace(urlDC);
    }

    const getObjParams = () => {
        let curRec = crr.get();
        return {
            custpage_subsidiary: curRec.getValue('custpage_subsidiary').join(','),
            custpage_pr: curRec.getValue('custpage_pr').join(','),
            custpage_ncc: curRec.getValue('custpage_ncc').join(','),
            custpage_crtby: curRec.getValue('custpage_crtby'),
            custpage_fromdt: curRec.getText('custpage_fromdt'),
            custpage_todt: curRec.getText('custpage_todt'),
            custpage_def_date: curRec.getText('custpage_def_date'),
            custpage_def_vendor: curRec.getValue('custpage_def_vendor'),
        };
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        onSearchResult: onSearchResult
    };
    
});
