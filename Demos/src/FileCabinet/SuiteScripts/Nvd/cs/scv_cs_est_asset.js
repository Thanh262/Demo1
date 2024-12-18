/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

    function () {

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
            if ([
                'custrecord_scv_cmms_tc_age_h',
                'custrecord_scv_cmms_tc_agecheck_h',
                'custrecord_scv_cmms_tc_origincost_h',
                'custrecord_scv_cmms_tc_residualstatus_h'
            ]
                .indexOf(scriptContext.fieldId) !== -1) {
                setDataEstAsset(scriptContext.currentRecord);
            }
        }

        function setDataEstAsset(curRec) {
            const tuoiThoQuyDinh = curRec.getValue('custrecord_scv_cmms_tc_age_h') * 1;
            const tuoiThoDanhGia = curRec.getValue('custrecord_scv_cmms_tc_agecheck_h') * 1;
            const tuoiThoConLai = tuoiThoQuyDinh - tuoiThoDanhGia;
            const giaTriCCDCBanDau = curRec.getValue('custrecord_scv_cmms_tc_origincost_h') * 1;
            const phanTramTinhTrangConLai = curRec.getValue('custrecord_scv_cmms_tc_residualstatus_h') * 1;
            
            const khauHaoConLai = tuoiThoQuyDinh !== 0 ? 100 * (tuoiThoConLai / tuoiThoQuyDinh) : null;
            const giaTriKhauHaoCCDC = khauHaoConLai * giaTriCCDCBanDau;
            const giaTriConLaiCCDC = giaTriCCDCBanDau * phanTramTinhTrangConLai;
            curRec.setValue('custrecord_scv_cmms_tc_remainage_h', tuoiThoConLai, true);
            curRec.setValue('custrecord_scv_cmms_tc_residualpercent_h', khauHaoConLai || '', true);
            curRec.setValue('custrecord_scv_cmms_tc_deprvalue_h', giaTriKhauHaoCCDC, true);
            curRec.setValue('custrecord_scv_cmms_tc_residualvalue_h', giaTriConLaiCCDC, true);
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
        };

    });
