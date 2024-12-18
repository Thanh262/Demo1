/**
 * Nội dung:
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 *  ?                   ?                       ?
 *  05 Nov 2024         Phu Pham                Init, create file
 *  05 Nov 2024         Phu Pham                Add button phân bổ nhà cung cấp from mr. Hải (https://app.clickup.com/t/86cwzb5he)
 *  08 Nov 2024         Khanh Tran              Add button 'Create WO' from mr. Bính (https://app.clickup.com/t/86cx0f856)
 *  19 Nov 2024         Khanh Tran              Add button 'Tính giá cở sở' from ms. Ngọc (https://app.clickup.com/t/86cx3r94u)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
        'N/url', 'N/search', 'N/query', 'N/file', 'N/ui/message',
        '../lib/scv_lib_function.js',
        '../lib/scv_lib_common_html.js',
        '../cons/scv_cons_approvalstatus.js',
        '../cons/scv_cons_other_work_order.js',
        '../cons/scv_cons_calc_base_price.js',
    ],

    (
        url, search, query, file, message,
        lbf, libHtml, constApprStatus, constOWO,
        constCalcBasePrice
    ) => {
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
            addButtonTypeView(scriptContext);
            addButtonTypeCreateEditCopy(scriptContext);
        }

        const addButtonTypeCreateEditCopy = (scriptContext) => {
            if (!["create", "edit", "copy"].includes(scriptContext.type)) return;

            let form = scriptContext.form;
            let newRec = scriptContext.newRecord;

            switch (newRec.type) {
                case "salesorder":
                    constCalcBasePrice.addButtonCalcBasePrice(form, newRec);
                    break;
            }
        }

        const addButtonTypeView = (scriptContext) => {
            if (scriptContext.type != "view") return;

            let form = scriptContext.form;
            let newRec = scriptContext.newRecord;
            let request = scriptContext.request;

            switch (newRec.type) {
                case "custompurchase_scv_purchase_request":
                    addButtonPhanBoNCC(form, newRec, request);
                    break;
                case "custompurchase_scv_other_work_order":
                    constOWO.addBtnCrtWO(form, newRec);
                    break;
                case "workorder":
                    addBtnIssueMROComponent(form, newRec);
                    break;
                case "salesorder":
                    addBtnCalcPaymentPrice(form, newRec);
                    break;
            }
        }

        const addBtnIssueMROComponent = (form, newRec) => {
            let urlScript = url.resolveScript({
                scriptId: 'customscript_scv_sl_issue_mro_components',
                deploymentId: 'customdeploy_scv_sl_issue_mro_components',
                params: {rectype: newRec.type, recid: newRec.id}
            });

            form.addButton({
                id: "custpage_scv_btn_issue_mro_comp",
                label: "Issue MRO Components",
                functionName: `window.location.replace('${urlScript}')`
            });
        }

        const addBtnCalcPaymentPrice = (form, newRec) => {
            let urlScript = url.resolveScript({
                scriptId: 'customscript_scv_sl_calc_payment_price',
                deploymentId: 'customdeploy_scv_sl_calc_payment_price',
                params: {rectype: newRec.type, recid: newRec.id}
            });

            form.addButton({
                id: "custpage_scv_btn_calc_payment_price",
                label: "Tính giá TT",
                functionName: `window.location.replace('${urlScript}')`
            });
        }

        const addButtonPhanBoNCC = (form, newRec, request) => {
            let params = request?.parameters || {};
            let approval_status = newRec.getValue("custbody_scv_approval_status");
            if (approval_status == constApprStatus.RECORDS.OPEN.ID || approval_status == constApprStatus.RECORDS.REJECTED.ID) {
                let urlScript = url.resolveScript({
                    scriptId: 'customscript_scv_sl_allocate_entity',
                    deploymentId: 'customdeploy_scv_sl_allocate_entity',
                    params: {custpage_rectype: newRec.type, custpage_recid: newRec.id}
                });

                form.addButton({
                    id: "custpage_scv_btn_phanbo_ncc",
                    label: "Phân bổ NCC",
                    functionName: `window.location.replace('${urlScript}')`
                });
            }

            if (params.isAllocateVendor == "F") {
                form.addPageInitMessage({
                    type: message.Type.WARNING,
                    message: "Tổng số lượng nhập của vendor không bằng plan quantity (item). Không thể thực hiện phân bổ NCC!",
                    duration: -1
                });
            } else if (params.isAllocateVendor == "T") {
                form.addPageInitMessage({
                    type: message.Type.CONFIRMATION,
                    message: "Thực hiện phân bổ nhà cung cấp thành công!",
                    duration: -1
                });
            }
        }

        return {beforeLoad}

    });
