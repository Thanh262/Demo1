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
 * @NScriptType Suitelet
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/format', 'N/https', 'N/cache',
    '../lib/scv_lib_function.js', '../lib/scv_lib_report.js', '../cons/scv_cons_ordertype.js',
    '../cons/scv_cons_search_pr_create_po.js', '../cons/scv_cons_search_pr_remaining_po.js'
],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (record, runtime, search, serverWidget, url, format, https, cache,
        lbf, lrp, constOrderType,
        constSearchPRCrtPO, constSearchPRRPO, 
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const CUR_SCRIPT = {
            ID: 'customscript_scv_sl_crt_po_from_pr',
            DEPLOYID_UI: 'customdeploy_scv_sl_crt_po_from_pr',
            DEPLOYID_DATA: 'customdeploy_scv_sl_crt_po_from_pr_data'
        }

        const onRequest = (scriptContext) => {
            let response = scriptContext.response;
            let request = scriptContext.request;
            let params = request.parameters;
            let curScript = runtime.getCurrentScript();
            if(curScript.deploymentId == CUR_SCRIPT.DEPLOYID_DATA){
                let objResponse = {data: [], isSuccess: true, msg: ''};
                try {
                    if(params.action == 'crtPO'){
                        objResponse = crtPO(params);
                    }
                    // else if(params.action == 'updateQtyRemainForPR_byPO'){
                    //     updateQtyRemainForPR_byPO(params);
                    // }else if(params.action == 'updateQtyRemainForPR'){
                    //     objResponse = updateQtyRemainForPR(params);
                    // }
                    
                    response.setHeader({name: 'Content-Type', value: 'application/json'});
                    response.write(JSON.stringify(objResponse));
                } catch (error) {
                    log.error('error - post action: ' + params.action, error);
                    objResponse = {isSuccess: false, msg: `${error.message}`};
                    response.write(JSON.stringify(objResponse));
                }
                
            }else{
                if(scriptContext.request.method == 'GET'){
                    let mainForm = onCreateFormUI(params);
                    if(params.isSearch == 'T'){
                        mainForm.form.addSubmitButton("Submit");
                        let results = getDataResultMapped(params);
                        renderDataSublist(mainForm.sublist, results);
                    }

                    response.writePage(mainForm.form);
                }
            }
        }

        const updateQtyRemainForPR = (params) => {
            let objBody = JSON.parse(params.objBody);log.error('objBody', objBody)
            let {pr_id, arrData: arrLinePO} = objBody;
            let oriLineIds = [];
            arrLinePO.forEach(obj => {
                if(oriLineIds.includes(obj.ori_lineid)) return;

                oriLineIds.push(obj.ori_lineid);
            })

            params.oriLineIds = oriLineIds;
            let arrSS_prRPO = getDataSS_prRPO(params);
            let prRec = record.load({type: 'custompurchase_scv_purchase_request', id: pr_id});
            let sl = 'item';
            let isSave = false;
            for(let i = 0; i < prRec.getLineCount(sl); i++){
                let ori_lineid = prRec.getSublistValue(sl, 'custcol_scv_ori_lineid', i);
                let objLinePO = arrLinePO.find(e => e.ori_lineid == ori_lineid);
                if(!objLinePO) continue;

                let objSS = arrSS_prRPO.find(e => e.ori_lineid == ori_lineid);
                if(!objSS) continue;

                let conversion_rate = prRec.getSublistValue(sl, 'custcol_scv_conversion_rate', i) * 1;
                let val = objSS.qty_remaining/conversion_rate;
                prRec.setSublistValue({sublistId: sl, fieldId: 'custcol_scv_pr_qty_remaining', line: i, value: val});
                isSave = true;
            }

            if(isSave){
                prRec.save({enableSourcing: false, ignoreMandatoryFields: true})
                return {data: pr_id, isSuccess: true, msg: 'Update thành công PR ' + pr_id};
            }
        }

        const updateQtyRemainForPR_byPO = async (params) => {
            let promises = [];
            let curRec = record.load({type: 'purchaseorder', id: params.po_id})
            let arrSlItem = [], arrPR = [];
            let sl = 'item';
            for(let i = 0; i < curRec.getLineCount(sl); i++){
                let isclosed = curRec.getSublistValue(sl, 'isclosed', i);
                if(isclosed) continue;

                let pr_id = curRec.getSublistValue(sl, 'custcol_scv_sumtrans_line_originno', i);
                let ori_lineid = curRec.getSublistValue(sl, 'custcol_scv_ori_lineid', i);
                arrSlItem.push({pr_id, ori_lineid});
                if(!arrPR.includes(pr_id)) arrPR.push(pr_id)
            };

            if(arrPR.length == 0) return;
          
            arrPR.forEach(pr_id => {
                let arrData = arrSlItem.filter(e => e.pr_id == pr_id);
                promises.push(
                    https.requestSuitelet.promise({
                        scriptId: 'customscript_scv_sl_crt_po_from_pr',
                        deploymentId: 'customdeploy_scv_sl_crt_po_from_pr_data',
                        body: {
                            action: 'updateQtyRemainForPR', 
                            objBody: JSON.stringify({pr_id, arrData})
                        }
                    })
                )
            });

            let results = await Promise.all(promises);
            let message = '';
            results.forEach((result) => {   
                let objRes = JSON.parse(result.body);
                if(objRes.isSuccess === false){
                    message += objRes.msg + '<br/>';
                }
            });

            if(message){
                let cacheInstance = cache.getCache({ name: 'error_updateQtyRemainForPR', scope: cache.Scope.PUBLIC });
                cacheInstance.put({
                    key: curRec.id,
                    value: message,
                });
            }
        }

        const crtPO = (params) => {
            let objBody = JSON.parse(params.objBody);log.error('objBody', objBody)
            let {params: paramFilter, arrLine, objGrp} = objBody;
            let poRec = record.create({type: 'purchaseorder', isDynamic: true});
            let order_type = objGrp.order_type || constOrderType.RECORDS.MUA_HANG_THEO_KE_HOACH.ID;
            lbf.setValueData(poRec, [
                'entity', 'subsidiary', 'custbody_scv_order_type', 
            ], [
                objGrp.vendor, objGrp.subsidiary_id, order_type,
            ]);
            if(paramFilter.custpage_def_date){
                poRec.setValue('trandate', format.parse({value: paramFilter.custpage_def_date, type: 'date'}))
            }

            let sl = 'item';
            arrLine.forEach((obj, i) => {
                poRec.selectNewLine({sublistId: sl});
                let expectedreceiptdate = '';
                if(obj.ngay_can_hang){
                    expectedreceiptdate = format.parse({value: obj.ngay_can_hang, type: 'date'});
                }

                lbf.setCurrentSublistValueData(poRec, sl, [
                    'item', 'units', 'quantity', 'rate', 'amount',
                    'cseg_scv_pdc', 'expectedreceiptdate', 'custcol_scv_sumtrans_line_originno',
                    'location', 'custcol_scv_memo', 'custcol_scv_ori_lineid'
                ], [
                    obj.item_id, obj.units_id, obj.qty, obj.rate, obj.amt,
                    obj.nhom_hang_id, expectedreceiptdate, obj.pr_id,
                    obj.location, obj.ghi_chu, obj.ori_lineid
                ]);
                poRec.commitLine({sublistId: sl});
            })

            let recId = poRec.save({enableSourcing: false, ignoreMandatoryFields: true});log.error('recId', recId)
            if(recId){
                let recName = search.lookupFields({ type: 'purchaseorder', id: recId, columns: ['tranid'] }).tranid;
                let urlRec = url.resolveRecord({ recordType: 'purchaseorder', recordId: recId });
                let msg = `<a href="${urlRec}" target="_blank">Create: ${recName}</a>`;
                return {data: recId, isSuccess: true, msg: msg};
            }
        }

        const renderDataSublist = (sl, arrData) => {
            let arrColSl = getColSl();
            arrData.forEach((objData, index) => {
                arrColSl.forEach(col => {
                    let val = objData[col.id];
                    if(val || val === 0) sl.setSublistValue({id: 'custpage_col_' + col.id, line: index, value: val});
                })
            }) 
        }

        const getDataResultMapped = (params) => {
            let arrSS_prCrtPO = getDataSS_prCrtPO(params);
            if(arrSS_prCrtPO.length == 0) return [];

            let oriLineIds = [];
            arrSS_prCrtPO.forEach(obj => {
                if(oriLineIds.includes(obj.ori_lineid)) return;

                oriLineIds.push(obj.ori_lineid);
            })

            params.oriLineIds = oriLineIds;
            let arrSS_prRPO = getDataSS_prRPO(params);
            let results = [];
            arrSS_prCrtPO.forEach(obj => {
                let objRes = obj;
                objRes.qty_remaining = 0;
                if(objRes.unit_conversion_rate){
                    let objSS_prRPO = arrSS_prRPO.find(e => e.ori_lineid == objRes.ori_lineid);
                    if(objSS_prRPO){
                        objRes.qty_remaining = objSS_prRPO.qty_remaining/objRes.unit_conversion_rate
                    }
                }
               
                objRes.json_data = JSON.stringify(objRes);
                results.push(objRes)
            })
            return results
        }

        const getDataSS_prRPO = (params) => {
            let myFilters = [];
            if(params.custpage_subsidiary){
                myFilters.push(
                    search.createFilter({name: 'subsidiary', operator: 'anyof', values: params.custpage_subsidiary.split(',')})
                );
            }

            return constSearchPRRPO.getDataSource(myFilters);
        }

        const getDataSS_prCrtPO = (params) => {
            let myFilters = [];
            if(params.custpage_subsidiary){
                myFilters.push(
                    search.createFilter({name: 'subsidiary', operator: 'anyof', values: params.custpage_subsidiary.split(',')})
                );
            }
           
            if(params.custpage_pr){
                myFilters.push(
                    search.createFilter({name: 'internalid', operator: 'anyof', values: params.custpage_pr.split(',')})
                );
            } 
            
            if(params.custpage_ncc){
                myFilters.push(
                    search.createFilter({name: 'custcol_scv_vendor', operator: 'anyof', values: params.custpage_ncc.split(',')})
                );
            }

            if(params.custpage_crtby){
                myFilters.push(
                    search.createFilter({name: 'createdby', operator: 'anyof', values: params.custpage_crtby})
                );
            }
            
            if(params.custpage_fromdt){
                myFilters.push(search.createFilter({name: 'trandate', operator: 'onorafter', values: params.custpage_fromdt}));
            }

            if(params.custpage_todt){
                myFilters.push(search.createFilter({name: 'trandate', operator: 'onorbefore', values: params.custpage_todt}));
            }

            return constSearchPRCrtPO.getDataSource(myFilters, params);
        }

        const onCreateFormUI = (params) => {
            let mainForm = serverWidget.createForm({title: 'Create PO From PR'});
            lbf.pinHeaderSublist(mainForm);
            mainForm.clientScriptModulePath = '../cs/scv_cs_sl_crt_po_from_pr.js';
            mainForm.addButton({id: 'custpage_btn_search', label: 'Search', functionName: 'onSearchResult()'});
            let filterGrp = lbf.addFieldGroup(mainForm, 'fieldgrp_main', 'Filters');
            let defaultGrp = lbf.addFieldGroup(mainForm, 'default_main', 'Default Values');
            let resultGrp = lbf.addFieldGroup(mainForm, 'fieldgrp_result','Result');
            let custpage_subsidiary = mainForm.addField({
                id: 'custpage_subsidiary',
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Đơn vị',
                source: 'subsidiary',
                container: filterGrp.id
            }).setHelpText('Subsidiary').updateBreakType({breakType: 'STARTCOL'})

            let custpage_pr = mainForm.addField({
                id: 'custpage_pr',
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Số yêu cầu',
                source: 'custompurchase_scv_purchase_request',
                container: filterGrp.id
            }).setHelpText('Số yêu cầu').updateBreakType({breakType: 'STARTCOL'})

            let custpage_ncc = mainForm.addField({
                id: 'custpage_ncc',
                type: serverWidget.FieldType.MULTISELECT,
                label: 'NCC',
                source: 'vendor',
                container: filterGrp.id
            }).setHelpText('Nhà cung cấp').updateBreakType({breakType: 'STARTCOL'})

            let custpage_crtby = mainForm.addField({
                id: 'custpage_crtby',
                type: serverWidget.FieldType.SELECT,
                label: 'Người yêu cầu',
                source: 'employee',
                container: filterGrp.id
            }).setHelpText('Người yêu cầu').updateBreakType({breakType: 'STARTCOL'})

            let custpage_fromdt = mainForm.addField({
                id: 'custpage_fromdt',
                type: serverWidget.FieldType.DATE,
                label: 'From date',
                container: filterGrp.id
            }).setHelpText('From date').updateLayoutType({layoutType: 'startrow'});

            let custpage_todt = mainForm.addField({
                id: 'custpage_todt',
                type: serverWidget.FieldType.DATE,
                label: 'To date',
                container: filterGrp.id
            }).setHelpText('To date').updateLayoutType({layoutType: 'endrow'});

            let custpage_def_date = mainForm.addField({
                id: 'custpage_def_date',
                type: serverWidget.FieldType.DATE,
                label: 'Date',
                container: defaultGrp.id
            }).setHelpText('Date').updateBreakType({breakType: 'STARTCOL'})

            let custpage_def_vendor = mainForm.addField({
                id: 'custpage_def_vendor',
                type: serverWidget.FieldType.SELECT,
                label: 'Vendor',
                source: 'vendor',
                container: defaultGrp.id
            }).setHelpText('Vendor').updateBreakType({breakType: 'STARTCOL'})
        
            if(params.custpage_subsidiary) custpage_subsidiary.defaultValue = params.custpage_subsidiary.split(',')
            if(params.custpage_pr)custpage_pr.defaultValue = params.custpage_pr.split(',')
            if(params.custpage_ncc) custpage_ncc.defaultValue = params.custpage_ncc.split(',')

            custpage_crtby.defaultValue = params.custpage_crtby;
            custpage_fromdt.defaultValue = params.custpage_fromdt;
            custpage_todt.defaultValue = params.custpage_todt;
            custpage_def_date.defaultValue = params.custpage_def_date;
            custpage_def_vendor.defaultValue = params.custpage_def_vendor;


            let custpage_sl_result = mainForm.addSublist({id: 'custpage_sl_result', type: 'list', label: 'Result', tab: resultGrp.id});
            custpage_sl_result.addMarkAllButtons();
            onCreateSublistColumn(custpage_sl_result)
            return {form: mainForm, sublist: custpage_sl_result};
        }

        const onCreateSublistColumn = (sl) => {
            let arrColumn = getColSl();
            for(let col of arrColumn){
                if(['amt'].includes(col.id)){
                    sl.addField({id: 'custpage_col_' + col.id, type: col.type, label: col.label, source: col.source || []})
                    .updateDisplayType({displayType: col.displayType || 'inline'})
                    .updateDisplayType({ displayType: 'disabled' });
                }
                else{
                    sl.addField({id: 'custpage_col_' + col.id, type: col.type, label: col.label, source: col.source || []})
                    .updateDisplayType({displayType: col.displayType || 'inline'})
                }
            }
        }

        const getColSl = () => {
            return [
                { id: 'check', label: 'Check', type: 'checkbox', displayType: 'entry'},
                { id: 'subsidiary', label: 'Đơn vị', type: 'text'},
                { id: 'ngay_yeu_cau', label: 'Ngày yêu cầu', type: 'text' },
                { id: 'so_yeu_cau', label: 'Số yêu cầu', type: 'text' },
                { id: 'vendor', label: 'ncc', type: 'select', source: 'vendor', displayType: 'entry'},
                { id: 'item', label: 'Hàng hóa dịch vụ', type: 'text'},
                { id: 'units', label: 'ĐVT', type: 'text'},
                { id: 'qty', label: 'Số lượng', type: 'float', displayType: 'entry'},
                { id: 'qty_remaining', label: 'Số lượng còn lại', type: 'float'},
                { id: 'rate', label: 'Đơn giá', type: 'float'},
                { id: 'amt', label: 'Thành tiền', type: 'float', displayType: 'entry'},
                { id: 'ngay_can_hang', label: 'Ngày cần hàng', type: 'text'},
                { id: 'nhom_hang', label: 'Nhóm hàng', type: 'text'},
                { id: 'location', label: 'Kho', type: 'select', displayType: 'entry'},
                { id: 'ori_lineid', label: 'Original Line ID', type: 'text'},
                { id: 'json_data', label: 'JSON DATA', type: 'textarea', displayType: 'hidden'},
            ]
        }

        return {onRequest}

    });
