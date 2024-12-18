/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(["N/record", "N/url", '../lib/scv_lib_common_html.js', 'N/file'],
    function (record, url, libHtml, file) {


        const objTemplateId = {
            PHIEU_THU: "CUSTTMPL_SCV_PHIEUTHU",
            PHIEU_CHI: "CUSTTMPL_SCV_PHIEUCHI",
            PHIEU_KE_TOAN: "CUSTTMPL_SCV_PHIEU_KE_TOAN",
            PHIEU_UNC: "CUSTTMPL_SCV_PHIEU_UNC",
        };

        const objSuffixNameScript = {
            PRINT: "scv_sl_addition_print",
            WORD: "scv_sl_render_word",
            WORD_1: "scv_sl_print_word"
        };


        const beforeLoad = scriptContext => {
            try {
                let triggerType = scriptContext.type;
                if (triggerType !== "view") return;
                let newRecord = scriptContext.newRecord;
                let form = scriptContext.form;
                let recType = newRecord.type;
                let arrBtnPrint = [], objPrint = {};
                let isUNC = false, isPhieuThu = false, isPhieuChi = false, isPhieuKeToan = false,
                    isDeNghiTamUngThanhToan = false;
                switch (recType) {
                    case record.Type.DEPOSIT:
                        isPhieuThu = true;
                        isPhieuKeToan = true;
                        break;
                    case record.Type.CUSTOMER_PAYMENT:
                        isPhieuThu = true;
                        isPhieuKeToan = true;
                        break;
                    case record.Type.CUSTOMER_DEPOSIT:
                        isPhieuThu = true;
                        isPhieuKeToan = true;
                        break;
                    case record.Type.CHECK:
                        isUNC = true;
                        isPhieuChi = true;
                        isPhieuKeToan = true;
                        break;
                    case record.Type.VENDOR_PAYMENT:
                        isPhieuChi = true;
                        isPhieuKeToan = true;
                        isUNC = true;
                        break;
                    case record.Type.VENDOR_PREPAYMENT:
                        isUNC = true;
                        isPhieuChi = true;
                        isPhieuKeToan = true;
                        break;
                    case record.Type.JOURNAL_ENTRY:
                        isPhieuKeToan = true;
                        break;
                    case record.Type.VENDOR_BILL:
                        // isUNC = true;
                        isPhieuKeToan = true;
                        break;
                    case record.Type.VENDOR_CREDIT:
                        isPhieuKeToan = true;
                        break;
                    case record.Type.INVOICE:
                        isPhieuKeToan = true;
                        break;
                    case record.Type.CREDIT_MEMO:
                        isPhieuKeToan = true;
                        break;
                    case 'custompurchase_scv_lenhchi':
                        isUNC = true;
                        isPhieuChi = true;
                        isPhieuKeToan = true;
                        break;
                    case record.Type.INVENTORY_ADJUSTMENT:
                        isPhieuKeToan = true;
                        break;
                    case record.Type.EXPENSE_REPORT:
                        isPhieuKeToan = true;
                        isDeNghiTamUngThanhToan = true;
                        break;
                    case "customrecord_scv_emp":
                        isDeNghiTamUngThanhToan = true;
                        break;
                    case 'salesorder':
                        addBtnPrintSC_EXCEL(form, newRecord, objPrint);
                        arrBtnPrint.push(...Object.values(objPrint));
                        break;
                    case 'customrecord_scv_sd':
                        addBtnPrintSD_EXCEL(form, newRecord, objPrint);
                        arrBtnPrint.push(...Object.values(objPrint));
                        break;
                    case 'customrecord_scv_cmms_maintenanceplan_h':
                        objPrint = addBtnPrintPDF(form, newRecord, 'Kế hoạch', 'custpage_ycbd', 'scv_render_ycbd_pdf');
                        arrBtnPrint.push(...Object.values(objPrint));
                        break;
                    case 'customrecord_scv_cmms_toolscheck_h':
                        objPrint = addBtnPrintPDF(form, newRecord, 'BBKT', 'custpage_bbkt', 'scv_render_bbkt_pdf');
                        arrBtnPrint.push(...Object.values(objPrint));
                        break;
                    case 'customrecord_scv_cmms_workorder':
                        objPrint = addBtnPrintPDF(form, newRecord, 'Phiếu SCSC', 'custpage_scsc', 'scv_render_scsc_pdf');
                        arrBtnPrint.push(...Object.values(objPrint));
                        break;
                    default:
                        break;
                }
                libHtml.addIconButtonExport(form, arrBtnPrint, "custpage_add_icon_prt");

                isUNC ? addButtonPrint(scriptContext, "UNC", "phieu_unc", "pdf", objSuffixNameScript.PRINT, objTemplateId.PHIEU_UNC) : "";
                isPhieuChi ? addButtonPrint(scriptContext, "Phiếu chi", "phieu_chi", "pdf", objSuffixNameScript.PRINT, objTemplateId.PHIEU_CHI) : "";
                isPhieuThu ? addButtonPrint(scriptContext, "Phiếu thu", "phieu_thu", "pdf", objSuffixNameScript.PRINT, objTemplateId.PHIEU_THU) : "";
                isPhieuKeToan ? addButtonPrint(scriptContext, "Phiếu kế toán", "phieu_ke_toan", "pdf", objSuffixNameScript.PRINT, objTemplateId.PHIEU_KE_TOAN) : "";
            } catch (err) {
                log.error("Error BeforeLoad : ", err);
            }
        }

        const addBtnPrintPDF = (_form, _newRecord, _label, _id, _printfile) => {
            let recType = _newRecord.type;
            let createPdfUrl = url.resolveScript({
                scriptId: 'customscript_scv_sl_addition_print_pdf',
                deploymentId: 'customdeploy_scv_sl_addition_print_pdf',
                returnExternalUrl: false
            });
            createPdfUrl += '&id=' + _newRecord.id + '&type=' + recType + '&printfile=' + _printfile;
            _form.addButton({
                id: _id,
                label: _label,
                functionName: "window.open('" + createPdfUrl + "');"
            });
            return {export_type: "PDF", id: _id};
        }

        const addButtonPrint = (scriptContext, labelButton, idBtn, typePrint, dir, templateId) => {
            const urlLink = url.resolveScript({
                scriptId: `customscript_${dir}`,
                deploymentId: `customdeploy_${dir}`,
                returnExternalUrl: false,
                params: {}
            });
            let newUrlLink = `${urlLink}&recid=${scriptContext.newRecord.id}&rectype=${scriptContext.newRecord.type}&idbtn=${idBtn}&rendertype=${typePrint}&TEMPLATE=${templateId}`;
            scriptContext.form.addButton({
                id: `custpage_${idBtn}`,
                label: labelButton,
                functionName: `window.open("${newUrlLink}")`
            });
        }
        const addBtnPrintSC_EXCEL = (form, newRecord, objPrint) => {
            objPrint.btn_sc_vn = addBtnPrintExcel(form, newRecord, {
                btnId: 'custpage_btn_sc_vn_excel',
                btnName: 'SC (VN)',
                templateId: 'scv_xlsx_sales_contract_vn'
            });
            objPrint.btn_sc_en = addBtnPrintExcel(form, newRecord, {
                btnId: 'custpage_btn_sc_en_excel',
                btnName: 'SC (EN)',
                templateId: 'scv_xlsx_sales_contract_en'
            });
        }
        const addBtnPrintSD_EXCEL = (form, newRecord, objPrint) => {
            objPrint.btn_cl_excel = addBtnPrintExcel(form, newRecord, {
                btnId: 'custpage_btn_cl_excel',
                btnName: 'CL',
                templateId: 'scv_xlsx_commercial_invoice'
            });
            objPrint.btn_ic_excel = addBtnPrintExcel(form, newRecord, {
                btnId: 'custpage_btn_ic_excel',
                btnName: 'IC',
                templateId: 'scv_xlsx_insurance'
            });
            objPrint.btn_pl_excel = addBtnPrintExcel(form, newRecord, {
                btnId: 'custpage_btn_pl_excel',
                btnName: 'P\\L',
                templateId: 'scv_xlsx_packing_list'
            });
            objPrint.btn_bl_excel = addBtnPrintExcel(form, newRecord, {
                btnId: 'custpage_btn_bl_excel',
                btnName: 'B\\L',
                templateId: 'scv_xlsx_detail_bl'
            });
        }

        const addBtnPrintExcel = (form, newRec, params) => {
            try {
                let templateId = params.templateId;
                if (!form.getField('custpage_inline_html_exp_exceljs')) {
                    let htmlFile = file.load({id: '../html/scv_html_exp_exceljs.html'})
                    let htmlContent = htmlFile.getContents();
                    form.addField({
                        id: 'custpage_inline_html_exp_exceljs',
                        type: 'inlinehtml',
                        label: 'inlinehtml'
                    }).defaultValue = htmlContent;
                }
                form.addButton({
                    id: params.btnId,
                    label: params.btnName,
                    functionName: `onExport(${JSON.stringify({
                        recId: newRec.id,
                        recType: newRec.type,
                        templateId
                    })})`
                });
                return {export_type: "EXCEL", id: params.btnId};
            } catch (error) {
                log.error('error - addButtonPrintExcel', error)
            }
        }

        return {
            beforeLoad
        }
    });