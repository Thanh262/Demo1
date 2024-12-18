/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/record', 'N/search', '../lib/scv_lib_function.js', '../lib/scv_lib_qaqc.js'],
    function (runtime, record, search, lfunc, qaqc) {

        /**
         * Function definition to be triggered before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {}

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {}

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            let recType = scriptContext.newRecord.type;
            if (recType === 'workordercompletion') {
                createInsMFTInspection(scriptContext);
            }
        }

        const createInsMFTInspection = (scriptContext) => {
            let tgType = scriptContext.type;
            let newRecord = scriptContext.newRecord;
            let id = newRecord.id;
            const blEventCrt = (['create', 'edit'].indexOf(tgType) !== -1) && runtime.executionContext === runtime.ContextType.USER_INTERFACE;
            if (!blEventCrt) return;
            let inspectStarted = newRecord.getValue('custbody_scv_inspection_started');
            let inspection_plan = newRecord.getValue('custbody_scv_inspect_plan_assy');
            let sample_qty = newRecord.getValue('custbody_scv_inspect_sample_qty');
            const workorderId = newRecord.getValue('createdfrom');
            const subsidiary = newRecord.getValue('subsidiary');
            const stage_wo = newRecord.getValue('custbody_scv_production_stage_wo');
            let trandate = newRecord.getValue('trandate');
            const year_month = lfunc.makePrefix(trandate.getMonth() + 1, 2, '0') + trandate.getFullYear().toString().substring(2, 4);
            const blCheckInsStartAndStageWO = (inspectStarted === 'T') && lfunc.isContainValue(stage_wo);
            if (!blCheckInsStartAndStageWO) return;
            let item = newRecord.getValue('item');
            let lkItem = search.lookupFields({
                type: 'item',
                id: item,
                columns: ['custitem_scv_inspection_plan', 'custitem_scv_sample_percent', 'custitem_scv_sample_qty']
            });
            if (!lfunc.isContainValue(inspection_plan)) inspection_plan = lkItem.custitem_scv_inspection_plan?.[0]?.value || '';
            if (lfunc.isContainValue(sample_qty)) sample_qty = lkItem.custitem_scv_sample_qty;
            const hasMFGInsResult = checkMFGInsResult(tgType, id, item, stage_wo) && lfunc.isContainValue(inspection_plan) && lfunc.isContainValue(sample_qty);
            if (!hasMFGInsResult) return;
            let r = getDataInsFields(inspection_plan, stage_wo);
            let lR = r.length;
            if (lR === 0) return;
            let lkSub = search.lookupFields({
                type: 'subsidiary',
                id: subsidiary,
                columns: [
                    'custrecord_scv_sub_qc_insp_plan_line', 'custrecord_scv_sub_auto_created_ib_qc'
                ]
            });
            const doc_number = getInspectionNumberMFG(subsidiary, year_month);
            // --------------------------------------------------------------------------------------------------//
            let recIRWT = record.create({type: 'customrecord_scv_inspection_reswo_tb'});
            lfunc.setValueData(recIRWT, ['custrecord_scv_irwt_workorder', 'custrecord_scv_irwt_assembly', 'custrecord_scv_irwt_inspection_plan',
                    'custrecord_scv_production_stage', 'custrecord_scv_mfg_ir_subsidiary', 'custrecord_scv_if_wo_inspection_no'
                    , 'custrecord_scv_irwt_quantity_test_h', 'custrecord_scv_mqc_wo'],
                [id, item, inspection_plan, stage_wo, subsidiary, doc_number, sample_qty, workorderId]);

            const fields = ['custrecord_scv_irw_workorder', 'custrecord_scv_irw_assembly', 'custrecord_scv_irw_qty_tested'
                , 'custrecord_scv_irw_inspection_plan', 'custrecord_scv_irw_inspection_field'
                , 'custrecord_scv_irw_test_methods', 'custrecord_scv_irw_test_desc', 'custrecord_scv_mfg_ird_subsidiary',
                'custrecord_scv_if_line_wo_inspct_number', 'custrecord_scv_irwt_sequences',
                'custrecord_scv_irwt_isp_type'];
            const slIRWT = 'recmachcustrecord_scv_irw_irwt';
            if (qaqc.checked(lkSub.custrecord_scv_sub_qc_insp_plan_line)) {
                for (let j = 0; j < lR; j++) {
                    let data = [id, item, sample_qty, inspection_plan, r[j].id, r[j].getValue(c[1]), r[j].getValue(c[0])
                        , subsidiary, doc_number, r[j].getValue(c[3]), r[j].getValue(c[4])];//idIRWT,
                    recIRWT.insertLine({sublistId: slIRWT, line: j});
                    lfunc.setSublistValueData(recIRWT, slIRWT, fields, j, data);
                }
            }
            let recSubInv = newRecord.getSubrecord('inventorydetail');
            let invStr = '';
            let qtyChoHuy = 0;
            lfunc.iter(recSubInv, 'inventoryassignment', function (idx, getV, setV) {
                let binID = getV('binnumber');
                if (lfunc.isContainValue(binID)) {
                    let binRec = record.load({type: 'bin', id: binID});
                    invStr += binRec.getValue('binnumber') + ': ' + getV('quantity') + '\n';
                    const blChoHuy = binRec.getValue("custrecordscv_chohuy");
                    if (qaqc.checked(blChoHuy)) qtyChoHuy += getV('quantity');
                }
            });
            recIRWT.setValue('custrecord_scv_mir_bin_qty_detail', invStr);
            recIRWT.setValue('custrecordscv_slchohuy', qtyChoHuy);
            let idIRWT = recIRWT.save({enableSourcing: false, ignoreMandatoryFields: true});
            // --------------------------------------------------------------------------------------------------//
            record.submitFields({
                type: newRecord.type,
                id: newRecord.id,
                values: {custbody_scv_related_mfg: idIRWT},
                options: {ignoreMandatoryFields: true}
            });
            const createdFrom = newRecord.getValue("createdfrom");
            const recTypeCrtFrom = lfunc.getTranRecordType(createdFrom);
            if (recTypeCrtFrom === "workorder")
                record.submitFields({
                    type: recTypeCrtFrom,
                    id: createdFrom,
                    values: {custbody_scv_related_mfg: idIRWT},
                    options: {enableSourcing: false, ignoreMandatoryFields: true}
                });
        }

        const getDataInsFields = (insPlan, stage_wo) => {
            let f = [['custrecord_scv_if_inspec_plan', 'anyof', insPlan], 'and', ['custrecord_scv_if_production_stage', 'anyof', stage_wo]];
            let c = [
                'custrecord_scv_if_test_description', 'custrecord_scv_if_test_method'
                , {name: 'custrecord_scv_ip_subsidiary', join: 'custrecord_scv_if_inspec_plan'},
                {name: 'custrecord_scv_if_sequence', sort: 'ASC'},
                "custrecord_scv_if_inspec_method"
            ];
            let s = search.create({type: 'customrecord_scv_inspection_field', filters: f, columns: c});
            return s.run().getRange({start: 0, end: 1000});
        }

        const checkMFGInsResult = (tgType, id, item, stage_wo) => {
            let isCreate = true;
            if (tgType !== 'edit') return isCreate;
            const filters = [['custrecord_scv_irwt_workorder', 'anyof', id], 'and', ['custrecord_scv_irwt_assembly', 'anyof', item]
                , 'and', ['custrecord_scv_production_stage', 'anyof', stage_wo]];
            const columns = ['custrecord_scv_irwt_workorder'];
            let s = search.create({
                type: 'customrecord_scv_inspection_reswo_tb',
                filters: filters,
                columns: columns
            });
            let r = s.run().getRange({start: 0, end: 1});
            if (r.length > 0) isCreate = false;
            return isCreate;
        }

        const getInspectionNumberMFG = (subsidiary, year_month) => {
            let columns = ['custrecord_scv_in_subsidiary_prefix', 'custrecord_scv_in_wo_prefix', 'custrecord_scv_in_wo_no'];
            let sVN = qaqc.searchInspectionNumber(subsidiary, columns, year_month);
            let doc_no = '';
            let doc_number = '';
            if (sVN != null) {
                doc_no = +sVN.getValue('custrecord_scv_in_wo_no') + 1;
                doc_number += sVN.getValue('custrecord_scv_in_subsidiary_prefix') + '.' + sVN.getValue('custrecord_scv_in_wo_prefix') + '.' + year_month;
                doc_number = doc_number + '.' + lfunc.makePrefix(doc_no, 5, '0');
                record.submitFields({
                    type: 'customrecord_scv_inspection_number', id: sVN.id, values: {custrecord_scv_in_wo_no: doc_no},
                    options: {enableSourcing: false, ignoreMandatoryFields: true}
                });
            }
            return doc_number;
        }


        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
