/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/currentRecord', 'N/url', '../lib/scv_lib_cs.js',
    '../lib/scv_lib_function.js', '../cons/scv_cons_color.js'
],

function(currentRecord, url, libCS, lbf, constColor) {
    
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
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        onSubmit(scriptContext);
        return false;
    }

    const onSubmit = async (scriptContext) => {
        // TODO: tạo khoảng 10 record yêu cầu nhập xuất kho
        const BATCH_SIZE = 5;
        const BASE_URL = url.resolveScript({
            scriptId: 'customscript_scv_sl_crt_yc_nhapxuatkho',
            deploymentId: 'customdeploy_scv_sl_crt_yc_nhapxuatkho',
            returnExternalUrl: false
        });
        let sublistId = "custpage_sl_result";
        let currRecord = scriptContext.currentRecord;

        let btnSubmit = document.getElementById("tdbody_submitter");
        btnSubmit.style.display = "none";
        libCS.showLoadingDialog(true);

        let arrSublist = getDataSublistResult(currRecord, sublistId);
        arrSublist = hanldeDataSublist(arrSublist, currRecord);
        if(arrSublist.length === 0) {
            resetForm(btnSubmit);
            alert("Vui lòng chọn line để thực hiện tạo Yêu cầu nhập/xuất kho!");
            return false;
        }

        let arrData = [];
        for(let i = 0; i < arrSublist.length; i += BATCH_SIZE) {
            let arrSlice = arrSublist.slice(i, i + BATCH_SIZE);
            let response = await fetchBatchMethodPost(BASE_URL, arrSlice);
            arrData = arrData.concat(response);
        }

        resetForm(btnSubmit);
        showToastMsgResponse(arrData);
    }

    const showToastMsgResponse = (arrData) => {
        hideAlertBox('scv_toast_msg');

        let arrError = arrData.filter(e => e.isSuccess === false);
        let arrSuccess = arrData.filter(e => e.isSuccess === true);

        let htmlSuccess = createMessageSuccess(arrSuccess);
        let htmlError = createMessageError(arrError);
        let htmls = [...htmlSuccess, ...htmlError];

        showAlertBox('scv_toast_msg', 'Success!', htmls.join(""), NLAlertDialog.INFORMATION);
    }

    const createMessageSuccess = (arrSuccess) => {
        if(arrSuccess.length === 0) return [];

        let htmlSuccess = [];
        htmlSuccess.push(`<div style="color: ${constColor.GREY[800]}; font-weight: bold;">`);
        htmlSuccess.push(`<span style="font-weight: bold;">Tạo thành công Yêu cầu nhập/xuất kho: </span>`)
        for(let i = 0; i < arrSuccess.length; i++) {
            let urlRec = url.resolveRecord({
                recordType: 'customsale_scv_ot_yc_xvt',
                recordId: arrSuccess[i].internalid,
            });
            htmlSuccess.push(createTagLink(urlRec, arrSuccess[i].tranid));
            if(i !== arrSuccess.length - 1) {
                htmlSuccess.push(`<span>, </span>`);
            }
        }
        htmlSuccess.push(`</div>`);
        return htmlSuccess;
    }

    const createTagLink = (urlRec, tranId) => {
        let html = `<span><a href="${urlRec}" target="_blank" style="color: ${constColor.BLUE[600]}">${tranId}</a>`;
        html += `</span>`;
        return html;
    }

    const createMessageError = (arrError) => {
        if(arrError.length === 0) return [];
        let htmlError = [
            `<div>`,
            `<span style="color: ${constColor.RED[700]}">${arrError.length} chứng từ tạo thất bại. Nhấn search để xem các dòng chưa tạo chứng từ!</span>`,
            `</div>`
        ];
        // addBackgroundRow(arrError);
        return htmlError;
    }

    const addBackgroundRow = (arrError) => {
        let arrLineNumber = arrError.flatMap(e => e.arrLineNumber);

        let currRecord = currentRecord.get();
        let sublistId = "custpage_sl_result";
        let lc = currRecord.getLineCount(sublistId);

        for(let i = 0; i < lc; i++) {
            let arrCell = document.querySelectorAll("#custpage_sl_result_splits #custpage_sl_resultrow" + i + " td");
            if(arrLineNumber.includes(i)) {
                arrCell.forEach(cellElement => {
                    cellElement.style.setProperty("background-color", constColor.RED[300], "important");
                });
            } else {
                arrCell.forEach(cellElement => {
                    cellElement.style.removeProperty("background-color");
                });
            }
        }
    }


    const resetForm = (btnSubmit) => {
        custpage_sl_resultMarkAll(false);
        libCS.showLoadingDialog(false);
        btnSubmit.style.removeProperty("display");
    }

    const fetchBatchMethodPost = async (url, result) => {
        let promises = result.map(obj => fetchDataMethodPost(url, obj));
        return await Promise.all(promises);
    }

    const fetchDataMethodPost = async (url, data) => {
        try {
            let response = await fetch(url, {
                method: 'POST',
                headers: { 
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`Error fetching ${url}: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error.message);
            return null;
        }
    }

    const getObjParams = (currRecord) => {
        let objRes = {};
        objRes.custpage_subsidiary = currRecord.getValue('custpage_subsidiary');
        objRes.custpage_shift = currRecord.getValue('custpage_shift');
        objRes.custpage_work_center = currRecord.getValue('custpage_work_center');
        objRes.custpage_lot_no = currRecord.getValue('custpage_lot_no');
        objRes.custpage_location = currRecord.getValue('custpage_location');
        objRes.custpage_order_type = currRecord.getValue('custpage_order_type');
        objRes.custpage_account = currRecord.getValue('custpage_account');
        objRes.custpage_fromdt = currRecord.getText('custpage_fromdt');
        objRes.custpage_todt = currRecord.getText('custpage_todt');
        return objRes;
    }

    const hanldeDataSublist = (arrSublist, currRecord) => {
        let arrResult = [];
        let arrGrpSublist = lbf.onGroupByArray(arrSublist, ['work_center_id', 'location_id', 'subsidiary_id', 'shift_id', 'lot_number']);
        
        for(let objGroup of arrGrpSublist) {
            let details = arrSublist.filter(
                e => e.work_center_id == objGroup.work_center_id && e.location_id == objGroup.location_id &&
                e.subsidiary_id == objGroup.subsidiary_id && e.shift_id == objGroup.shift_id && e.lot_number == objGroup.lot_number
            );
            
            objGroup.order_type_id = currRecord.getValue('custpage_order_type');
            objGroup.account_id = currRecord.getValue('custpage_account');

            objGroup.details = details;
            arrResult.push(objGroup);
        }
        return arrResult;
    }

    const getDataSublistResult = (currRecord, sublistId) => {
        let arrSublist = [];
        let lc = currRecord.getLineCount(sublistId);

        for(let i = 0; i < lc; i++) {
            let isMark = currRecord.getSublistValue(sublistId, "custpage_col_0", i);
            if(isMark === true || isMark === "T") {
                let jsonData = currRecord.getSublistValue(sublistId, "custpage_col_json_data", i);
                let objData = JSON.parse(jsonData);

                objData.location_id = currRecord.getSublistValue(sublistId, "custpage_col_1", i) || currRecord.getValue('custpage_location');
                objData.line_number = i;
                arrSublist.push(objData);
            }
        }
        return arrSublist;
    }

    const onSearchResult = () => {
        window.onbeforeunload = null;
        const BASE_URL = url.resolveScript({
            scriptId: 'customscript_scv_sl_crt_yc_nhapxuatkho',
            deploymentId: 'customdeploy_scv_sl_crt_yc_nhapxuatkho',
            returnExternalUrl: false
        });

        let currRecord = currentRecord.get();
        let urlDC = BASE_URL + plusParam(currRecord) + "&isrun=T";
        window.location.replace(urlDC);   
    }

    function plusParam(currRecord) {
        return '&custpage_subsidiary=' + currRecord.getValue('custpage_subsidiary')
            + '&custpage_shift=' + currRecord.getValue('custpage_shift')
            + '&custpage_work_center=' + currRecord.getValue('custpage_work_center')
            + '&custpage_lot_no=' + currRecord.getValue('custpage_lot_no')
            + '&custpage_fromdt=' + currRecord.getText('custpage_fromdt')
            + '&custpage_todt=' + currRecord.getText('custpage_todt');
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        onSearchResult: onSearchResult
    };
    
});
