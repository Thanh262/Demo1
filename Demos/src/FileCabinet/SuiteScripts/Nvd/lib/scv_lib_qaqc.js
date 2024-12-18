define(['N/record', 'N/search', './scv_lib_function'],
    function (record, search, libFn) {

        const objConsProductStage = {
            IPC: '11',
            PQC: '5',
            IQC: '4'
        };

        const DIGIT_MAX_NUMBER = 5;

        const getConfigQAQCInSubsidiary = (subsidiary) => {
            if (!libFn.isContainValue(subsidiary)) return;
            let arrConfig = [];
            if (Array.isArray(subsidiary)) {
                const sqlQuery = `SELECT id,
                                         custrecord_scv_sub_auto_created_ib_qc,
                                         custrecord_scv_sub_create_ib_ir_to,
                                         custrecord_scv_sub_qc_insp_plan_line
                                  FROM SUBSIDIARY
                                  WHERE id = ('${subsidiary.join("','")}')`;
                const dataSubs = libFn.callQuery(sqlQuery).map(o => ({
                    id: o.id,
                    autoCrtInboundQC: checked(o.custrecord_scv_sub_auto_created_ib_qc),
                    crtInboundQCForIROrTO: checked(o.custrecord_scv_sub_create_ib_ir_to),
                    addInspectionPlanLine: checked(o.custrecord_scv_sub_qc_insp_plan_line)
                }));
                arrConfig = arrConfig.concat(dataSubs);
            } else {
                let lkSub = search.lookupFields({
                    type: 'subsidiary',
                    id: subsidiary,
                    columns: [
                        'custrecord_scv_sub_qc_insp_plan_line',
                        'custrecord_scv_sub_auto_created_ib_qc',
                        'custrecord_scv_sub_create_ib_ir_to'
                    ]
                });
                arrConfig.push({
                    id: subsidiary,
                    autoCrtInboundQC: lkSub.custrecord_scv_sub_auto_created_ib_qc,
                    crtInboundQCForIROrTO: lkSub.custrecord_scv_sub_create_ib_ir_to,
                    addInspectionPlanLine: lkSub.custrecord_scv_sub_qc_insp_plan_line
                });
            }
            return arrConfig;
        };

        const generateMFGInspectionOfTrans = (tranType, tranId) => {
            let tranRec = record.load({type: tranType, id: tranId});
            const objMFGInspectionsOfTrans = createMFGInspectionWithTran(tranRec);
            if (!objMFGInspectionsOfTrans?.isSuccess) return;
            setMFGInspectionsOnLine({
                tranRec: tranRec,
                objMFGInspections: objMFGInspectionsOfTrans?.inspectionResult
            });
            if (objMFGInspectionsOfTrans?.inspectionNumber?.insNumId) {
                record.submitFields({
                    type: 'customrecord_scv_inspection_number', id: objMFGInspectionsOfTrans.inspectionNumber.insNumId,
                    values: {
                        'custrecord_scv_in_wo_no': objMFGInspectionsOfTrans.maxNum
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            }
            tranRec.save({ignoreMandatoryFields: true});
        };

        const createMFGInspectionWithTran = (tranRec) => {
            const createdFrom = tranRec.getValue('createdfrom');
            const subId = tranRec.getValue('subsidiary');
            const orderTypeId = tranRec.getValue('custbody_scv_order_type');
            if (!orderTypeId) return;
            let lkOrder = search.lookupFields({
                type: 'customrecord_scv_order_type',
                id: orderTypeId,
                columns: ['custrecord_scv_order_type_qc_tp']
            });
            let objResult = {isSuccess: false};
            if (!lkOrder?.custrecord_scv_order_type_qc_tp) return objResult;
            const arrInsPlan = getArrPQCPlanOnLine(tranRec);
            const blCheckCreateMFGIns = checkCreateMFGInspection(tranRec);
            if (!blCheckCreateMFGIns) return objResult;
            const arrInsFields = getElementInsFields({
                arrInsPlan: arrInsPlan,
                productStage: objConsProductStage.PQC,
                recordType: tranRec.type,
                createFromItemReceipt: 'T'
            });
            const objSub = getConfigQAQCInSubsidiary(subId)[0];
            const tranDate = tranRec.getValue('trandate');
            const yearMonth = dateToMMYY(tranDate);
            const resultInsNum = getMaxNumberMFGInspection(subId, yearMonth);
            let curMaxNum = resultInsNum.maxNum;
            const lcItem = tranRec.getLineCount('item');
            let objInspections = {};
            for (let i = 0; i < lcItem; i++) {
                let curLine = new LoadCurrentLine(tranRec, 'item', i);
                const itemreceipt = curLine.value('itemreceive');
                const pqcPlanId = curLine.value('custcol_scv_pqc_plan');
                const blInsStarted = curLine.value('custcol_scv_inspect_started');
                const mfgInspectionId = curLine.value('custcol_scv_mfg_insp_num');
                if (!checked(itemreceipt) || !checked(blInsStarted) || !!mfgInspectionId || !pqcPlanId) continue;
                let sampleQty = curLine.value('custcol_scv_sample_qty') * 1;
                if (sampleQty <= 0) sampleQty = 1;
                const arrDataLineInsFields = arrInsFields.filter(o => o.insPlan === pqcPlanId);
                if (arrDataLineInsFields.length === 0) continue;
                const arrDataCrtIns = getDataCreateMFGInspection({
                    newRecord: tranRec,
                    lineIndex: i,
                    createdFrom: createdFrom,
                    arrDataLineInsFields: arrDataLineInsFields,
                    objSub: objSub
                });
                objInspections[i] = arrDataCrtIns;
                if (!Array.isArray(arrDataCrtIns) || arrDataCrtIns.length === 0) continue;
                let arrIdInsLine = [];
                const lcInsCrt = arrDataCrtIns.length;
                for (let j = 0; j < sampleQty; j++) {
                    for (let k = 0; k < lcInsCrt; k++) {
                        let docNum = '';
                        if (resultInsNum.insNumId) {
                            curMaxNum++;
                            docNum = resultInsNum.prefixDocNum + curMaxNum.toString().padStart(DIGIT_MAX_NUMBER, '0');
                        }
                        const objIns = arrDataCrtIns[k];
                        const insResultId = createMFGInspection({
                            arrDataHeader: objIns.header,
                            arrDataLine: objIns.line,
                            docNum: docNum,
                        });
                        if (!!insResultId) objResult.isSuccess = true;
                        arrIdInsLine.push(insResultId);
                    }
                }
                objInspections[i] = arrIdInsLine;
            }

            return {
                isSuccess: objResult.isSuccess,
                inspectionResult: objInspections,
                inspectionNumber: resultInsNum,
                maxNum: curMaxNum
            };
        };

        const getMaxNumberMFGInspection = (subsidiary, monthYear) => {
            let result = {maxNum: null, insNumId: null, prefixDocNum: null};
            const columns = [
                'custrecord_scv_in_subsidiary_prefix',
                'custrecord_scv_in_wo_prefix',
                'custrecord_scv_in_wo_no',
            ];
            const sVN = searchInspectionNumber(subsidiary, columns, monthYear);
            if (sVN === null) return result;
            const prefixDocNum = sVN.getValue('custrecord_scv_in_subsidiary_prefix') + '.' + sVN.getValue('custrecord_scv_in_wo_prefix') + '.' + monthYear + '.';
            result.maxNum = +sVN.getValue('custrecord_scv_in_wo_no') || 0;
            result.prefixDocNum = prefixDocNum;
            result.insNumId = sVN.id;
            return result;
        }

        const createMFGInspection = (options) => {
            const {
                arrDataHeader,
                arrDataLine,
                docNum
            } = options;
            let recMFGInspection = record.create({type: 'customrecord_scv_inspection_reswo_tb'});
            const sublistMFGInsDetailId = 'recmachcustrecord_scv_irw_irwt';
            const arrFieldsLine = [
                'custrecord_scv_irw_workorder', 'custrecord_scv_irw_assembly', 'custrecord_scv_irw_qty_tested'
                , 'custrecord_scv_irw_inspection_plan', 'custrecord_scv_irw_inspection_field'
                , 'custrecord_scv_irw_test_methods', 'custrecord_scv_irw_test_desc', 'custrecord_scv_mfg_ird_subsidiary'
                , 'custrecord_scv_irwt_sequences', 'custrecord_scv_irwt_isp_type'
                , 'custrecord_scv_irwt_isp_type2', 'custrecord_scv_irwt_isp_type3'
            ];
            const arrFieldsHeader = [
                'custrecord_scv_irwt_assembly',
                'custrecord_scv_assembly_disname',
                'custrecord_scv_product_unit_mfg',
                'custrecord_scv_irwt_inspection_plan',
                'custrecord_scv_mfg_ir_subsidiary',
                'custrecord_scv_mfg_location',
                'custrecord_scv_mqc_wo',
                'custrecord_scv_irwt_workorder',
                'custrecord_scv_mfg_inspect_qty_abs_lot',
                'custrecord_scv_passed_quantity'
            ];
            recMFGInspection.setValue('custrecord_scv_if_wo_inspection_no', docNum);
            libFn.setValueData(recMFGInspection, arrFieldsHeader, arrDataHeader);
            const lcLine = arrDataLine.length;
            for (let i = 0; i < lcLine; i++) {
                const data = arrDataLine[i];
                recMFGInspection.insertLine({sublistId: sublistMFGInsDetailId, line: i});
                libFn.setSublistValueData(recMFGInspection, sublistMFGInsDetailId, arrFieldsLine, i, data);
                recMFGInspection.setSublistValue(sublistMFGInsDetailId, 'custrecord_scv_if_line_wo_inspct_number', i, docNum);
            }
            return recMFGInspection.save({ignoreMandatoryFields: true});
        }

        const getDataCreateMFGInspection = (options) => {
            const {
                newRecord,
                createdFrom,
                arrDataLineInsFields,
                objSub,
                lineIndex,
            } = options;
            let arrDataIns = [];
            let curLine = new LoadCurrentLine(newRecord, 'item', lineIndex);
            const lcInsFld = arrDataLineInsFields.length;
            const locId = newRecord.getValue('location');
            const subId = newRecord.getValue('subsidiary');
            const item = curLine.value('item');
            const description = curLine.value('description');
            const quantity = curLine.value('quantity');
            const pqcPlanId = curLine.value('custcol_scv_pqc_plan');
            const lineUnitsId = curLine.value('units');
            const sampleQty = curLine.value('custcol_scv_sample_qty') * 1 || 0;
            const slIVD = 'inventoryassignment';
            if (!lineHasInvDetail(newRecord, 'item', lineIndex)) return arrDataIns;
            let recSub = newRecord.getSublistSubrecord({
                sublistId: 'item',
                fieldId: 'inventorydetail',
                line: lineIndex
            });
            const lcIVD = recSub.getLineCount(slIVD);
            for (let idxDet = 0; idxDet < lcIVD; idxDet++) {
                let objInspection = {header: [], line: []};
                let curLineInvDet = new LoadCurrentLine(recSub, slIVD, idxDet);
                const numberedRecordId = curLineInvDet.value('numberedrecordid');
                objInspection.header = [
                    item, description, lineUnitsId,
                    pqcPlanId, subId, locId,
                    createdFrom, newRecord.id,
                    numberedRecordId, quantity
                ];
                if (objSub.addInspectionPlanLine) {
                    for (let j = 0; j < lcInsFld; j++) {
                        const objInsFld = arrDataLineInsFields[j];
                        objInspection
                            .line
                            .push([
                                newRecord.id, item, sampleQty,
                                pqcPlanId, objInsFld.id,
                                objInsFld.method, objInsFld.description,
                                subId, objInsFld.sequence, objInsFld.insMethod,
                                objInsFld.insTypeL2, objInsFld.insTypeL3
                            ]);
                    }
                }
                arrDataIns.push(objInspection);
            }
            return arrDataIns;
        }

        const checkCreateMFGInspection = (tranRec) => {
            const lcItem = tranRec.getLineCount('item');
            for (let i = 0; i < lcItem; i++) {
                const mfgInspection = tranRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_mfg_insp_num',
                    line: i
                });
                const pqcPlanId = tranRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_pqc_plan',
                    line: i
                });
                if (!!pqcPlanId && !mfgInspection) return true;
            }
            return false;
        }

        const getArrPQCPlanOnLine = (tranRec) => {
            const arrInsPlan = [];
            const lcItem = tranRec.getLineCount('item');
            for (let i = 0; i < lcItem; i++) {
                const itemreceive = tranRec.getSublistValue({sublistId: 'item', fieldId: 'itemreceive', line: i});
                if (!checked(itemreceive)) continue;
                const pqcPlanId = tranRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_pqc_plan',
                    line: i
                });
                if (!!pqcPlanId && arrInsPlan.indexOf(pqcPlanId) === -1) arrInsPlan.push(pqcPlanId);
            }
            return arrInsPlan;
        };

        const setMFGInspectionsOnLine = (options) => {
            const {
                tranRec,
                objMFGInspections,
            } = options;
            const arrLines = Object.keys(objMFGInspections);
            const lenLines = arrLines.length;
            for (let i = 0; i < lenLines; i++) {
                const lineIndex = arrLines[i];
                if (!objMFGInspections[lineIndex]?.[0]) continue;
                tranRec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_mfg_insp_num',
                    line: lineIndex,
                    value: objMFGInspections[lineIndex][0]
                });
            }
        }

        const generateInspectionResultsOfTrans = (tranType, tranId) => {
            let tranRec = record.load({type: tranType, id: tranId});
            const objInspectionsOfTrans = createInspectionResultWithTran(tranRec);
            if (!objInspectionsOfTrans.isSuccess) return;
            setInspectionsResultOnLine({
                tranRec: tranRec,
                objInspectionsResult: objInspectionsOfTrans?.inspectionResult
            });
            if (objInspectionsOfTrans?.inspectionNumber?.insNumId) {
                record.submitFields({
                    type: 'customrecord_scv_inspection_number',
                    id: objInspectionsOfTrans.inspectionNumber.insNumId,
                    values: {'custrecord_scv_in_input_no': objInspectionsOfTrans.maxNum},
                    options: {
                        ignoreMandatoryFields: true
                    }
                });
            }
            tranRec.save({ignoreMandatoryFields: true});
        };

        const setInspectionsResultOnLine = (options) => {
            const {
                tranRec,
                objInspectionsResult,
            } = options;
            const arrLines = Object.keys(objInspectionsResult);
            const lenLines = arrLines.length;
            for (let i = 0; i < lenLines; i++) {
                const lineIndex = arrLines[i];
                if (!objInspectionsResult[lineIndex]?.[0]) continue;
                tranRec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_inbound_inspection_result',
                    line: lineIndex,
                    value: objInspectionsResult[lineIndex][0]
                });
            }
        }

        const getIdProductStageFilter = (transType) => {
            if (transType === record.Type.WORK_ORDER) return objConsProductStage.PQC;
            return objConsProductStage.IQC;
        }

        const createInspectionResultWithTran = (tranRec) => {
            const objInspections = {};
            const createdFrom = tranRec.getValue('createdfrom') || tranRec.getValue('custbody_scv_created_transaction');
            const subId = tranRec.getValue('subsidiary');
            const arrInsPlan = getInsPlanAllLine(tranRec);
            const blCheckCreateInboundIns = checkCreateInboundInsResult(tranRec);
            if (!blCheckCreateInboundIns) return {
                isSuccess: false
            };
            const arrInsFields = getElementInsFields({
                arrInsPlan: arrInsPlan,
                productStage: getIdProductStageFilter(tranRec.type),
                recordType: tranRec.type
            });
            const objSub = getConfigQAQCInSubsidiary(subId)[0];
            const tranDate = tranRec.getValue('trandate');
            const yearMonth = dateToMMYY(tranDate);
            const resultInsNum = getMaxNumberInspection(subId, yearMonth);
            let curMaxNum = resultInsNum.maxNum;
            const lcItem = tranRec.getLineCount('item');
            let isSuccess = false;
            for (let i = 0; i < lcItem; i++) {
                let curLine = new LoadCurrentLine(tranRec, 'item', i);
                const insPlanId = curLine.value('custcol_scv_inspection_plan');
                const inboundInsResult = curLine.value('custcol_scv_inbound_inspection_result');
                if (!!inboundInsResult) continue;
                if (!libFn.isContainValue(insPlanId)) continue;
                let sampleQty = curLine.value('custcol_scv_sample_qty') * 1;
                if (sampleQty <= 0) sampleQty = 1;
                const arrDataLineInsFields = arrInsFields.filter(o => o.insPlan === insPlanId);
                if (arrDataLineInsFields.length === 0) continue;
                const arrDataCrtIns = getDataCreateInspection({
                    newRecord: tranRec,
                    lineIndex: i,
                    createdFrom: createdFrom,
                    arrDataLineInsFields: arrDataLineInsFields,
                    objSub: objSub
                });
                if (!Array.isArray(arrDataCrtIns) || arrDataCrtIns.length === 0) continue;
                let arrIdInsLine = [];
                const lcInsCrt = arrDataCrtIns.length;
                for (let j = 0; j < sampleQty; j++) {
                    for (let k = 0; k < lcInsCrt; k++) {
                        let docNum = '';
                        if (resultInsNum.insNumId) {
                            curMaxNum++;
                            docNum = resultInsNum.prefixDocNum + curMaxNum.toString().padStart(DIGIT_MAX_NUMBER, '0');
                        }
                        const objIns = arrDataCrtIns[k];
                        const insResultId = createInspectionResults({
                            arrDataHeader: objIns.header,
                            arrDataLine: objIns.line,
                            docNum: docNum,
                        });
                        if (!!insResultId) isSuccess = true;
                        arrIdInsLine.push(insResultId);
                    }
                }
                objInspections[i] = arrIdInsLine;
            }

            return {
                isSuccess: isSuccess,
                inspectionResult: objInspections,
                inspectionNumber: resultInsNum,
                maxNum: curMaxNum
            };
        }

        const createInspectionResults = (options) => {
            const {
                arrDataHeader,
                arrDataLine,
                docNum
            } = options;
            let recIRT = record.create({type: 'customrecord_scv_inspection_result_tb'});
            const slIRT = 'recmachcustrecord_scv_ir_irt';
            const fields = [
                'custrecord_scv_ir_line_nr', 'custrecord_scv_ir_item_number', 'custrecord_scv_ir_inspect_plan', 'custrecord_scv_ir_inspect_tdesc'
                , 'custrecord_scv_ir_qty_tested', 'custrecord_scv_ir_lot_number', 'custrecord_scv_ir_inspect_field', 'custrecord_scv_ir_test_methods',
                'custrecord_scv_iird_subsidiary', 'custrecord_scv_ir_inspect_method', 'custrecord_scv_ir_test_type', 'custrecord_scv_irt_sequences',
                'custrecord_scv_ir_receipt_no', 'custrecord_scv_ir_purchase_order'
            ];
            const arrFieldsHeader = [
                'custrecord_scv_irt_inspection_plan', 'custrecord_scv_irt_item', 'custrecord_scv_irt_lot_number', 'custrecord_scv_irt_subsidiary',
                'custrecord_scv_irt_receiptno_line_id', 'custrecord_scv_irt_receipt_qty'
                , 'custrecord_scv_irt_packaging_qty', 'custrecord_scv_irt_supplier_lot', 'custrecord_scv_irt_supplier_mfg_date'
                , 'custrecord_scv_irt_expiration_date', 'custrecord_scv_irt_inentory_number', 'custrecord_scv_irt_manufacturer',
                'custrecord_scv_irt_receipt_from', 'custrecord_scv_irt_receipt_no',
                'custrecord_scv_irt_lot_unit', 'custrecord_scv_irt_receiptno_line_id'
            ];
            recIRT.setValue('custrecord_scv_irt_inspect_number', docNum);
            libFn.setValueData(recIRT, arrFieldsHeader, arrDataHeader);
            const lcLine = arrDataLine.length;
            for (let i = 0; i < lcLine; i++) {
                const data = arrDataLine[i];
                recIRT.insertLine({sublistId: slIRT, line: i});
                libFn.setSublistValueData(recIRT, slIRT, fields, i, data);
                recIRT.setSublistValue(slIRT, 'custrecord_scv_ir_insp_document', i, docNum);
            }
            return recIRT.save({ignoreMandatoryFields: true});
        }

        const getInsPlanAllLine = (tranRec) => {
            const arrInsPlan = [];
            const lcItem = tranRec.getLineCount('item');
            for (let i = 0; i < lcItem; i++) {
                const insPlanId = tranRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_inspection_plan',
                    line: i
                });
                if (!!insPlanId && arrInsPlan.indexOf(insPlanId) === -1) arrInsPlan.push(insPlanId);
            }
            return arrInsPlan;
        }

        const checkCreateInboundInsResult = (tranRec) => {
            const lcItem = tranRec.getLineCount('item');
            for (let i = 0; i < lcItem; i++) {
                const inboundInsResult = tranRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_inbound_inspection_result',
                    line: i
                });
                const insPlanId = tranRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_scv_inspection_plan',
                    line: i
                });
                if (!!insPlanId && !inboundInsResult) return true;
            }
            return false;
        }

        const getDataCreateInspection = (options) => {
            const {
                newRecord,
                createdFrom,
                arrDataLineInsFields,
                objSub,
                lineIndex,
            } = options;
            let arrDataIns = [];
            let curLine = new LoadCurrentLine(newRecord, 'item', lineIndex);
            const inspectionPlan = curLine.value('custcol_scv_inspection_plan');
            const lcInsFld = arrDataLineInsFields.length;
            const subId = newRecord.getValue('subsidiary');
            const item = curLine.value('item');
            const quantity = curLine.value('quantity');
            const lineUnitsId = curLine.value('units');
            const lineNo = curLine.value('line');
            const lotNum = curLine.value('custcol_scv_lot_serial_selected') || '';
            const sampleQty = curLine.value('custcol_scv_sample_qty') * 1 || 0;
            const poLinePackaging = curLine.value('custcol_scv_po_line_packging');
            const supplierLot = curLine.value('custcol_supplier_lot');
            const supplierMfgDate = curLine.value('custcol_scv_supplier_mfg_date');
            const manufacturer = curLine.text('custcol_scv_manufacture_item');
            const kitLineId = curLine.value('kitlineid');
            const slIVD = 'inventoryassignment';
            if (lineHasInvDetail(newRecord, 'item', lineIndex)) {
                let recSub = newRecord.getSublistSubrecord({
                    sublistId: 'item',
                    fieldId: 'inventorydetail',
                    line: lineIndex
                });
                const lcIVD = recSub.getLineCount(slIVD);
                for (let idxDet = 0; idxDet < lcIVD; idxDet++) {
                    let objInspection = {header: [], line: []};
                    let curLineInvDet = new LoadCurrentLine(recSub, slIVD, idxDet);
                    const lotNumber = curLineInvDet.value('receiptinventorynumber');
                    const numberedRecordId = curLineInvDet.value('numberedrecordid');
                    const expirationDate = curLineInvDet.value('expirationdate');
                    objInspection.header = [
                        inspectionPlan, item, lotNumber, subId,
                        kitLineId, quantity, poLinePackaging,
                        supplierLot, supplierMfgDate, expirationDate,
                        numberedRecordId, manufacturer,
                        createdFrom, newRecord.id,
                        lineUnitsId, lineNo
                    ];
                    if (objSub.addInspectionPlanLine) {
                        for (let j = 0; j < lcInsFld; j++) {
                            const objInsFld = arrDataLineInsFields[j];
                            objInspection.line.push([
                                lineIndex, item, inspectionPlan, objInsFld.description,
                                sampleQty, lotNumber, objInsFld.id, objInsFld.method,
                                subId, objInsFld.insMethod, objInsFld.testType,
                                objInsFld.sequence, newRecord.id, createdFrom
                            ]);
                        }
                    }
                    arrDataIns.push(objInspection);
                }
            } else {
                let objInspection = {header: [], line: []};
                objInspection.header = [
                    inspectionPlan, item, lotNum, subId,
                    kitLineId, quantity, poLinePackaging,
                    supplierLot, supplierMfgDate, '',
                    '', manufacturer, createdFrom, newRecord.id
                ];
                if (objSub.addInspectionPlanLine) {
                    for (let j = 0; j < lcInsFld; j++) {
                        const objInsFld = arrDataLineInsFields[j];
                        objInspection.line.push([
                            lineIndex, item, inspectionPlan, objInsFld.description, sampleQty, lotNum,
                            objInsFld.id, objInsFld.method, subId, objInsFld.insMethod,
                            objInsFld.testType, objInsFld.sequence,
                            newRecord.id, createdFrom
                        ]);
                    }
                }
                arrDataIns.push(objInspection);
            }
            return arrDataIns;
        }

        /**
         * Des : Get Element Inspection Fields
         * @param options
         * @param options.recordType {String} -  Record Type
         * @param options.arrInsPlan {Array} -  array of inspection plan
         * @param options.productStage {String} -  product stage id
         * @param options.createFromItemReceipt {String} -  Create From item receipt
         * @returns {{ sequence: *, method: *, insMethod: *, description: *, testType: *, insPlan: *, id: *, subsidiary: * }[]|*[]}
         */
        const getElementInsFields = (options) => {
            if (options.arrInsPlan.length === 0) return [];
            let f = [];
            f.push(search.createFilter({name: 'isinactive', operator: 'is', values: false}));
            if (libFn.isContainValue(options.arrInsPlan)) {
                search.createFilter({
                    name: 'custrecord_scv_if_inspec_plan',
                    operator: 'anyof',
                    values: options.arrInsPlan
                })
            }
            if (options.productStage) {
                f.push(search.createFilter({
                    name: 'custrecord_scv_if_sequence',
                    operator: 'anyof',
                    values: options.productStage
                }));
            }
            if (options?.createFromItemReceipt === 'T') {
                f.push(search.createFilter({
                    name: 'custrecord_scv_pqc_yn',
                    join: 'custrecord_scv_if_production_stage',
                    operator: 'is',
                    values: true
                }))
            } else {
                f.push(search.createFilter({
                    name: 'custrecord_scv_pqc_yn',
                    join: 'custrecord_scv_if_production_stage',
                    operator: 'is',
                    values: options.recordType === record.Type.WORK_ORDER
                }))
            }
            let c =
                [
                    'custrecord_scv_if_test_description', 'custrecord_scv_if_test_method',
                    {name: 'custrecord_scv_ip_subsidiary', join: 'custrecord_scv_if_inspec_plan'},
                    'custrecord_scv_if_inspec_method', 'custrecord_scv_if_test_type',
                    {name: 'custrecord_scv_if_sequence', sort: 'ASC'},
                    'custrecord_scv_if_inspec_plan', 'internalid',
                    'custrecord_scv_if_inspection_type_l2', 'custrecord_scv_if_inspection_type_l3'
                ];
            let s = search.create({type: 'customrecord_scv_inspection_field', filters: f, columns: c});
            let cols = s.columns;
            let r = s.run().getRange({start: 0, end: 1000});
            const npData = r.length;
            let arrResult = [];
            for (let i = 0; i < npData; i++) {
                arrResult.push({
                    description: r[i].getValue(cols[0]),
                    method: r[i].getValue(cols[1]),
                    subsidiary: r[i].getValue(cols[2]),
                    insMethod: r[i].getValue(cols[3]),
                    testType: r[i].getValue(cols[4]),
                    sequence: r[i].getValue(cols[5]),
                    insPlan: r[i].getValue(cols[6]),
                    id: r[i].getValue(cols[7]),
                    insTypeL2: r[i].getValue(cols[8]),
                    insTypeL3: r[i].getValue(cols[9])
                });
            }
            return arrResult;
        }

        const getMaxNumberInspection = (subsidiary, monthYear) => {
            let result = {maxNum: null, insNumId: null, prefixDocNum: null};
            const columns = [
                'custrecord_scv_in_subsidiary_prefix',
                'custrecord_scv_in_input_prefix',
                'custrecord_scv_in_input_no',
            ];
            const sVN = searchInspectionNumber(subsidiary, columns, monthYear);
            if (sVN === null) return result;
            const prefixDocNum = sVN.getValue('custrecord_scv_in_subsidiary_prefix') + '.' + sVN.getValue('custrecord_scv_in_input_prefix') + '.' + monthYear + '.';
            result.maxNum = +sVN.getValue('custrecord_scv_in_input_no') || 0;
            result.prefixDocNum = prefixDocNum;
            result.insNumId = sVN.id;
            return result;
        }

        const searchInspectionNumber = (subsidiary, columns, monthYear) => {
            let obj;
            let searchVN = search.create({
                type: 'customrecord_scv_inspection_number',
                filters: [['custrecord_scv_in_subsidiary', search.Operator.ANYOF, subsidiary]
                    , 'and', ['custrecord_scv_in_year_month', 'is', monthYear]
                    , 'and', ['isinactive', 'is', false]
                ],
                columns: columns
            });
            let resultsVN = searchVN.run().getRange({start: 0, end: 1});
            const lengthVN = resultsVN.length;
            if (lengthVN > 0) {
                obj = resultsVN[0];
            } else {
                createInspectionNumber(subsidiary, monthYear);
                obj = searchInspectionNumber(subsidiary, columns, monthYear);
            }
            return obj;
        }

        const createInspectionNumber = (subsidiary, monthYear) => {
            let lkSub = search.lookupFields({type: 'subsidiary', id: subsidiary, columns: ['name']});
            let recDocNum = record.create({type: 'customrecord_scv_inspection_number'});
            recDocNum.setValue('name', lkSub.name);
            recDocNum.setValue('custrecord_scv_in_year_month', monthYear);
            recDocNum.setValue('custrecord_scv_in_subsidiary', subsidiary);
            recDocNum.save({enableSourcing: false, ignoreMandatoryFields: true});
        }

        const dateToMMYY = (date) => (date.getMonth() + 1).toString().padStart(2, '2') + date.getFullYear().toString().substring(2, 4)

        const checked = (value) => {
            if (typeof value === 'boolean') return value;
            return value === 'T' || value === 'true';
        }

        const lineHasInvDetail = (curRec, sublistId, lineIndex) => {
            const fldInvDet = 'inventorydetail';
            const fldInvDetAvail = 'inventorydetailavail';
            const sublistInvDet = 'inventoryassignment';
            const hasInvDet = checked(curRec.getSublistValue(sublistId, fldInvDetAvail, lineIndex));
            if (!hasInvDet) return false;
            return curRec.getSublistSubrecord(sublistId, fldInvDet, lineIndex).getLineCount(sublistInvDet) > 0;
        }

        function LoadCurrentLine(curRec, sublistId, lineIndex) {
            return {
                value: f => curRec.getSublistValue(sublistId, f, lineIndex),
                text: f => curRec.getSublistText(sublistId, f, lineIndex),
                set: (f, v) => curRec.setSublistValue(sublistId, f, lineIndex, v)
            }
        }

        return {
            searchInspectionNumber: searchInspectionNumber,
            dateToMMYY: dateToMMYY,
            checked: checked,
            generateInspectionResultsOfTrans: generateInspectionResultsOfTrans,
            generateMFGInspectionOfTrans: generateMFGInspectionOfTrans
        };

    });
