/**
 * Nội dung: Function QC
 * * =======================================================================================
 *  Date                Author                  Description
 *  25 Sep 2024         Duy Nguyen	    		Init, create file, move from ELMICH
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/record', 'N/search', 'N/ui/serverWidget', 'N/redirect', '../lib/scv_lib_function.js', '../lib/scv_lib_qaqc'],
    function (message, record, search, serverWidget, redirect, lfunc, libQAQC) {

        function buildForm(request, response, parameters) {
            let createdfromid = parameters.createdfromid;
            let rectype = parameters.createdrectype;
            let production_stage = parameters.production_stage;
            let quantity_test = parameters.quantity_test;
            let form = serverWidget.createForm({title: 'MFG Inspection'});
            let fCreatedFromId = form.addField({id: 'custpage_createdfromid', type: serverWidget.FieldType.TEXT, label: 'TG ID'});
            fCreatedFromId.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            fCreatedFromId.defaultValue = createdfromid;
            let fRecordType = form.addField({id: 'custpage_rectype', type: serverWidget.FieldType.TEXT, label: 'Record Type'});
            fRecordType.updateDisplayType({displayType: serverWidget.FieldDisplayType.HIDDEN});
            fRecordType.defaultValue = rectype;
            let fStage = form.addField({
                id: 'custpage_production_stage',
                type: serverWidget.FieldType.SELECT,
                label: 'Production Stage',
                source: 'customrecord_scv_production_stage'
            });
            fStage.defaultValue = production_stage;
            fStage.isMandatory = true;
            if (!lfunc.isContainValue(quantity_test) && !!createdfromid) {
                let lkTran = search.lookupFields({type: rectype, id: createdfromid, columns: ['custbody_scv_inspect_sample_qty']});
                quantity_test = lkTran.custbody_scv_inspect_sample_qty;
            }
            if (!lfunc.isContainValue(quantity_test)) quantity_test = 1;
            let fQuantity = form.addField({id: 'custpage_quantity_test', type: serverWidget.FieldType.FLOAT, label: 'Quantity Tested'});
            fQuantity.defaultValue = quantity_test;
            fQuantity.isMandatory = true;
            form.addSubmitButton({label: 'Save'});
            lfunc.addButtonBack(form, createdfromid, rectype);
            response.writePage(form);
        }

        function postForm(request, response, parameters) {
            let createdfromid = parameters.custpage_createdfromid;
            let rectype = parameters.custpage_rectype;
            let production_stage = parameters.custpage_production_stage;
            let quantity_test = parameters.custpage_quantity_test;
            let newRecord = record.load({type: rectype, id: createdfromid});
            const idIRWT = createMFG(newRecord, production_stage, quantity_test);
            if (lfunc.isContainValue(idIRWT)) {
                record.submitFields({
                    type: rectype,
                    id: createdfromid,
                    values: {custbody_scv_related_mfg: idIRWT},
                    options: {enableSourcing: false, ignoreMandatoryFields: true}
                });
                redirect.toRecord({type: 'customrecord_scv_inspection_reswo_tb', id: idIRWT});
            }
            else {
                redirect.toSuitelet({
                    scriptId: 'customscript_scv_sl_mfg_inspection',
                    deploymentId: 'customdeploy_scv_sl_mfg_inspection',
                    parameters: {
                        'createdfromid': createdfromid,
                        'createdrectype': rectype,
                        'production_stage': production_stage,
                        'message': 'Không có chỉ tiêu cho giai đoạn này!'
                    }
                });
            }
        }

        function createMFG(newRecord, stage_wo, quantity_test) {
            let id = newRecord.id;
            let idIRWT = '';
            let inspect_started = newRecord.getValue('custbody_scv_inspection_started');
            let inspection_plan = newRecord.getValue('custbody_scv_inspect_plan_assy');
            let sample_qty = quantity_test;
            const subsidiary = newRecord.getValue('subsidiary');
            let trandate = newRecord.getValue('trandate');
            let year_month = lfunc.makePrefix(trandate.getMonth() + 1, 2, '0') + trandate.getFullYear().toString().substring(2, 4);
            const status = newRecord.getValue('status');
            const blCrtIRWT = (libQAQC.checked(inspect_started) || status === 'Built') && lfunc.isContainValue(stage_wo);
            if (!blCrtIRWT) return idIRWT;
            let item = newRecord.getValue('assemblyitem') || newRecord.getValue('item');
            let unitId = newRecord.getValue('units');
            const lotNumber = getLotNumber(newRecord);
            let locationId = newRecord.getValue('location');
            let lkItem = search.lookupFields({type: 'item', id: item, columns: ['custitem_scv_inspection_plan',]});
            if (!lfunc.isContainValue(inspection_plan)) inspection_plan = lkItem.custitem_scv_inspection_plan?.[0]?.value || '';
            const blCrtIRWTCheckSampleQty = lfunc.isContainValue(inspection_plan) && lfunc.isContainValue(sample_qty);
            if (!blCrtIRWTCheckSampleQty) return idIRWT;
            const arrDataInsFields = loadInsFields(inspection_plan, stage_wo);
            const lR = arrDataInsFields.length;
            if (lR === 0) return idIRWT;
            const doc_number = getInspectionNumberMFG(subsidiary, year_month);
            let lkSub = search.lookupFields({type: 'subsidiary', id: subsidiary, columns: ['custrecord_scv_sub_qc_insp_plan_line']});
            let tank_name = newRecord.getValue('custbody_scv_bin_of_mfg');
            let recIRWT = record.create({type: 'customrecord_scv_inspection_reswo_tb'});
            lfunc.setValueData(recIRWT,
                [
                    'custrecord_scv_irwt_workorder', 'custrecord_scv_irwt_assembly', 'custrecord_scv_irwt_inspection_plan',
                    'custrecord_scv_production_stage', 'custrecord_scv_mfg_ir_subsidiary', 'custrecord_scv_if_wo_inspection_no',
                    'custrecord_scv_irwt_quantity_test_h', 'custrecord_scv_irwt_tank_name', 'custrecord_scv_product_unit_mfg',
                    'custrecord_scv_irwt_sampling_place', 'custrecord_scv_mfg_inspect_qty_abs_lot'
                ],
                [id, item, inspection_plan,
                    stage_wo, subsidiary, doc_number,
                    sample_qty, tank_name,
                    unitId, locationId, lotNumber]);

            if (libQAQC.checked(lkSub.custrecord_scv_sub_qc_insp_plan_line)) {
                const slIRWT = 'recmachcustrecord_scv_irw_irwt';
                let fields = ['custrecord_scv_irw_workorder', 'custrecord_scv_irw_assembly', 'custrecord_scv_irw_qty_tested'
                    , 'custrecord_scv_irw_inspection_plan', 'custrecord_scv_irw_inspection_field'
                    , 'custrecord_scv_irw_test_methods', 'custrecord_scv_irw_test_desc', 'custrecord_scv_mfg_ird_subsidiary'
                    , 'custrecord_scv_if_line_wo_inspct_number', 'custrecord_scv_irwt_sequences', 'custrecord_scv_irwt_isp_type'
                    , 'custrecord_scv_irwt_isp_type2', 'custrecord_scv_irwt_isp_type3'];
                for (let j = 0; j < lR; j++) {
                    const objInsFields = arrDataInsFields[j];
                    let data = [id, item, sample_qty
                        , inspection_plan, objInsFields.id
                        , objInsFields.testMethod, objInsFields.testDes, subsidiary
                        , doc_number, objInsFields.sequence, objInsFields.insMethod
                        , objInsFields.insTypeL2, objInsFields.insTypeL3];
                    recIRWT.insertLine({sublistId: slIRWT, line: j});
                    lfunc.setSublistValueData(recIRWT, slIRWT, fields, j, data);
                }
            }
            idIRWT = recIRWT.save({enableSourcing: false, ignoreMandatoryFields: true});
            return idIRWT;
        }

        function getLotNumber(curRec) {
            if (curRec.type === 'workorder') return '';
            let curInvDet = curRec.getSubrecord({fieldId : 'inventorydetail'});
            let lc = curInvDet.getLineCount({sublistId : 'inventoryassignment'});
            if (lc <= 0) return '';
            const numberedrecordid = curInvDet.getSublistValue({sublistId : 'inventoryassignment', fieldId : 'numberedrecordid', line : 0});
            return numberedrecordid;
            // const issueinventorynumber = curInvDet.getSublistValue({sublistId : 'inventoryassignment', fieldId : 'issueinventorynumber', line : 0});
            // const receiptinventorynumber = curInvDet.getSublistValue({sublistId : 'inventoryassignment', fieldId : 'receiptinventorynumber', line : 0});

            // return issueinventorynumber || receiptinventorynumber;
        }

        function loadInsFields(insPlan, stage_wo) {
            if (!insPlan || !stage_wo) return [];
            let f = [['custrecord_scv_if_inspec_plan', 'anyof', insPlan], 'and', ['custrecord_scv_if_production_stage', 'anyof', stage_wo]];
            let c = [
                'custrecord_scv_if_test_description', 'custrecord_scv_if_test_method',
                {name: 'custrecord_scv_ip_subsidiary', join: 'custrecord_scv_if_inspec_plan'}, {name: 'custrecord_scv_if_sequence', sort: 'ASC'},
                'custrecord_scv_if_inspec_method', 'custrecord_scv_if_inspection_type_l2',
                'custrecord_scv_if_inspection_type_l3', 'internalid'
            ];
            let s = search.create({type: 'customrecord_scv_inspection_field', filters: f, columns: c});
            let r = s.run().getRange({start: 0, end: 1000});
            const cols = s.columns;
            if (r.length === 0) return [];
            const len = r.length;
            let arrData = [];
            for (let i = 0; i < len; i++) {
                arrData.push({
                    testDes: r[i].getValue(cols[0]),
                    testMethod: r[i].getValue(cols[1]),
                    subId: r[i].getValue(cols[2]),
                    sequence: r[i].getValue(cols[3]),
                    insMethod: r[i].getValue(cols[4]),
                    insTypeL2: r[i].getValue(cols[5]),
                    insTypeL3: r[i].getValue(cols[6]),
                    id: r[i].getValue(cols[7]),
                })
            }
            return arrData;
        }

        function getInspectionNumberMFG(subsidiary, year_month) {
            let columns = ['custrecord_scv_in_subsidiary_prefix', 'custrecord_scv_in_wo_prefix', 'custrecord_scv_in_wo_no'];
            let sVN = libQAQC.searchInspectionNumber(subsidiary, columns, year_month);
            let doc_no = '';
            let doc_number = '';
            if (!sVN) return '';
            doc_no = sVN.getValue('custrecord_scv_in_wo_no') * 1 + 1;
            doc_number = sVN.getValue('custrecord_scv_in_subsidiary_prefix') + '.' + sVN.getValue('custrecord_scv_in_wo_prefix') + '.' + year_month;
            doc_number = doc_number + '.' + lfunc.makePrefix(doc_no, 5, '0');
            record.submitFields({
                type: 'customrecord_scv_inspection_number',
                id: sVN.id,
                values: {custrecord_scv_in_wo_no: doc_no},
                options: {enableSourcing: false, ignoreMandatoryFields: true}
            });
            return doc_number;
        }

        function onRequest(context) {
            let request = context.request;
            let response = context.response;
            let parameters = request.parameters;
            if (request.method === 'GET') {
                buildForm(request, response, parameters);
            }
            else {
                postForm(request, response, parameters);
            }
        }

        return {
            onRequest: onRequest
        };

    });