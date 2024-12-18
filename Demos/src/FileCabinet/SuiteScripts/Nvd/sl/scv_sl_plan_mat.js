/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Dec 2024         Huy Pham			    Init, create file, Tính toán phân bổ trọng lượng nâng hạ trong sản xuất, from mr.Bính(https://app.clickup.com/t/86cx40ye7)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget','N/runtime', 'N/url', 'N/search', 'N/record',
    '../lib/scv_lib_function.js', '../olib/alasql/alasql.min@1.7.3.js', 
    '../lib/scv_lib_report.js',

    '../cons/scv_cons_format.js',
    '../cons/scv_cons_record.js',

    '../cons/scv_cons_purplan_ind.js',

    '../cons/scv_cons_search_mfg_plan.js',
    '../cons/scv_cons_search_item_map_bom.js',
    '../cons/scv_cons_search_bom_revise_list.js',
    '../cons/scv_cons_search_list_item_stand_lq.js',
    '../cons/scv_cons_search_inv_onhand.js',
    '../cons/scv_cons_search_inv_onhand_pending.js',
    '../cons/scv_cons_search_plan_qty_remain.js',
    '../cons/scv_cons_search_asb_item_inv_used.js',
],
    
    (serverWidget,runtime, url, search, record,
        lbf, alasql, 
        libRpt,

        constFormat,
        constRecord,

        constPurPlanInd,

        constSearchMfgPlan,
        constSearchItemMapBom,
        constSearchBomReviseList,
        constSearchListItemStandLQ,
        constSearchInvOnhand,
        constSearchInvOnhandPending,
        constSearchPlanQtyRemain,
        constSearchAsbItemInvUsed
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let response = scriptContext.response;
            let params = request.parameters;
    
            if(request.method == "GET"){
                let mainForm = onCreateFormUI(params);

                if(params.isSearch == "T"){
                    let arrDataSource = getDataSource(params);

                    onRenderDataSublist(mainForm.custpage_sl_item, arrDataSource);
                }

                response.writePage(mainForm.form);
            }
        }

        const onCreateFormUI = (_params) =>{
            let form = serverWidget.createForm({title: "Planning Materials"});
            form.clientScriptModulePath = '../cs/scv_cs_sl_plan_mat.js';

            libRpt.addPageLinkForm(form, [
                constSearchMfgPlan.ID, constSearchItemMapBom.ID, constSearchBomReviseList.ID,
                constSearchListItemStandLQ.ID, constSearchInvOnhand.ID, constSearchInvOnhandPending.ID,
                constSearchPlanQtyRemain.ID, constSearchAsbItemInvUsed.ID
            ]);
            lbf.pinHeaderSublist(form);

            form.addSubmitButton({label: "Tạo KHMH"});
            form.addButton({id: "custpage_btn_search", label: "Search", functionName: "onSearchResult()"});

            let mainGrp = lbf.addFieldGroup(form, "fieldgrp_main","Criteria");

            let custpage_subsidiary = form.addField({
                id: 'custpage_subsidiary',
                type: "select",
                source: "subsidiary",
                label: 'Công ty',
                container: mainGrp.id
            }).setHelpText("Subsidiary");
            custpage_subsidiary.isMandatory = true;

            let custpage_purplan_params = form.addField({
                id: 'custpage_purplan_params',
                type: "select",
                label: 'Tham số',
                container: mainGrp.id
            }).setHelpText("Tham số");
            custpage_purplan_params.isMandatory = true;

            let custpage_crtdt = form.addField({
                id: 'custpage_crtdt',
                type: "date",
                label: 'Ngày tạo',
                container: mainGrp.id
            }).updateLayoutType({
                layoutType: "startrow"
            }).setHelpText("Ngày tạo");
            custpage_crtdt.isMandatory = true;
            
            let custpage_expecteddt_nextmonth = form.addField({
                id: 'custpage_expecteddt_nextmonth',
                type: "date",
                label: 'Ngày dự kiến hàng về của KHMH tháng sau',
                container: mainGrp.id
            }).updateLayoutType({
                layoutType: "startrow"
            }).updateDisplayType({
                displayType: "disabled"
            }).setHelpText("Ngày dự kiến hàng về của KHMH tháng sau");

            let custpage_stockdt = form.addField({
                id: 'custpage_stockdt',
                type: "date",
                label: 'Ngày lấy tồn kho',
                container: mainGrp.id
            }).updateLayoutType({
                layoutType: "startrow"
            }).updateDisplayType({
                displayType: "disabled"
            }).setHelpText("Ngày lấy tồn kho");

            let custpage_hsdc = form.addField({
                id: 'custpage_hsdc',
                type: "float",
                label: 'Hệ số điều chỉnh SL sản xuất',
                container: mainGrp.id
            }).updateLayoutType({
                layoutType: "startrow"
            }).updateDisplayType({
                displayType: "disabled"
            }).setHelpText("Hệ số điều chỉnh SL sản xuất");

            let custpage_usedfromdt = form.addField({
                id: 'custpage_usedfromdt',
                type: "date",
                label: 'Thời gian tiêu hao từ',
                container: mainGrp.id
            }).updateLayoutType({
                layoutType: "startrow"
            }).updateDisplayType({
                displayType: "disabled"
            }).setHelpText("Thời gian tiêu hao từ");

            let custpage_usedtodt = form.addField({
                id: 'custpage_usedtodt',
                type: "date",
                label: 'Đến',
                container: mainGrp.id
            }).updateLayoutType({
                layoutType: "endrow"
            }).updateDisplayType({
                displayType: "disabled"
            }).setHelpText("Thời gian tiêu hao đến");

            loadFieldDataPurPlanInd(custpage_purplan_params, _params.custpage_subsidiary);

            loadDataDefaultByPurPlanInd(_params);

            if(!!_params.custpage_subsidiary) custpage_subsidiary.defaultValue = _params.custpage_subsidiary;
            if(!!_params.custpage_purplan_params) custpage_purplan_params.defaultValue = _params.custpage_purplan_params;
            if(!!_params.custpage_crtdt) custpage_crtdt.defaultValue = _params.custpage_crtdt;
            if(!!_params.custpage_expecteddt_nextmonth) custpage_expecteddt_nextmonth.defaultValue = _params.custpage_expecteddt_nextmonth;
            if(!!_params.custpage_stockdt) custpage_stockdt.defaultValue = _params.custpage_stockdt;
            if(!!_params.custpage_hsdc) custpage_hsdc.defaultValue = _params.custpage_hsdc;
            if(!!_params.custpage_usedfromdt) custpage_usedfromdt.defaultValue = _params.custpage_usedfromdt;
            if(!!_params.custpage_usedtodt) custpage_usedtodt.defaultValue = _params.custpage_usedtodt;

            let itemSublist = form.addSublist({
                id : "custpage_sl_item",
                type : "LIST",
                label : 'Item List'
            });
            onCreateSublistColumn(itemSublist);

            return {form: form, custpage_sl_item: itemSublist};
        }

        const onCreateSublistColumn = (_sublist) => {
            let arrColumn = getColumnOfSublist()

            for(let i = 0; i< arrColumn.length; i++){
                let objCol = arrColumn[i];
                let field = _sublist.addField({
                    id : objCol.id,
                    type : objCol.type,
                    source: objCol.source||null,
                    label : objCol.label
                }).updateDisplayType({displayType: objCol.displayType||"inline"});

                field.isMandatory = objCol.isMandatory ?? false;

                if(!!objCol.defaultValue){
                    field.defaultValue = objCol.defaultValue;
                }
            }
        }

        const getColumnOfSublist = () =>{
            let arrColumn = [
                {id: "custpage_col_item", label: "Tên HHDV", type: "select", source: "item"},
                {id: "custpage_col_qty", label: "Quantity", type: "float"},
                {id: "custpage_col_consump_month", label: "Tiêu hao TB tháng", type: "float"},
                {id: "custpage_col_predicted_consump_avg", label: "Dự báo tiêu hao trung bình", type: "float"},
                {id: "custpage_col_plan_safety_days", label: "Số ngày dự phòng kế hoạch", type: "float"},
                {id: "custpage_col_qty_processing", label: "Tồn kho không tính hàng CXL", type: "float"},
                {id: "custpage_col_onhand_pending", label: "Tồn kho chờ xử lý", type: "float"},
                {id: "custpage_col_qty_po", label: "SL hàng đi đường đã lên PO", type: "float"},
                {id: "custpage_col_qty_po_remain", label: "SL hàng đi đường chưa lên PO", type: "float"},
                {id: "custpage_col_total_qty", label: "Tổng số lượng tồn kho + đi đường", type: "float"},
                {id: "custpage_col_qty_req", label: "Số lượng nhu cầu mua", type: "float"},
                {id: "custpage_col_qty_purplan", label: "Số lượng kế hoạch mua", type: "float"}
            ]
            return arrColumn;
        }
        
        const onRenderDataSublist = (_sublist, _arrResult) =>{
            let arrColumns = getColumnOfSublist();

            for(let i = 0; i < _arrResult.length; i++){
                let objRes = _arrResult[i];

                for(let j = 0; j < arrColumns.length; j++){
                    let colId = arrColumns[j].id;

                    let val_col = objRes[colId];

                    if(lbf.isContainValue(val_col)){
                        _sublist.setSublistValue({id: colId, line: i, value: val_col});
                    }
                }
            }
        }

        const getDataSource = (_params) =>{
            let arrMfgPlan = getDataSS01_MfgPlan(_params);log.error("huy-arrMfgPlan", arrMfgPlan)
            let arrItemMapBom = getDataSS02_ItemMapBom(_params);log.error("huy-arrItemMapBom", arrItemMapBom)
            let arrBomRevise = getDataSS03_BomReviseList(_params);log.error("huy-arrBomRevise", arrBomRevise)
            let arrItemStand = getDataSS04_ListItemStandLQ(_params);log.error("huy-arrItemStand", arrItemStand)
            let arrInvOnhand = getDataSS05_InvOnhand(_params);log.error("huy-arrInvOnhand", arrInvOnhand)
            let arrInvOnhandPending = getDataSS06_InvOnhandPending(_params);log.error("huy-arrInvOnhandPending", arrInvOnhandPending)
            let arrPlanQtyRemain = getDataSS07_PlanQtyRemain(_params);log.error("huy-arrPlanQtyRemain", arrPlanQtyRemain)
            let arrAsbItemInvUsed = getDataSS08_AsbItemInvUsed(_params);log.error("huy-arrAsbItemInvUsed", arrAsbItemInvUsed)
            return [];
        }
        
        const loadFieldDataPurPlanInd = (_field, _subsidiaryId) => {
            if(!_subsidiaryId) return;

            let arrResult = constPurPlanInd.getDataSource(
                search.createFilter({
                    name: 'custrecord_scv_pur_plan_ind_subsidiary',
                    operator: "anyof",
                    values: _subsidiaryId
                })
            );

            constRecord.initLoadFieldServer(_field, {
                displayExpr: "name", valueExpr: "internalid", data: arrResult
            }, true)
        }

        const loadDataDefaultByPurPlanInd = (_params) =>{
            if(!_params.custpage_purplan_params) return _params;

            let arrPurPlanInd = constPurPlanInd.getDataSource(
                search.createFilter({
                    name: 'internalid',
                    operator: "anyof",
                    values: _params.custpage_purplan_params
                })
            );
            if(arrPurPlanInd.length == 0) return _params;

            let objPurPlanInd = arrPurPlanInd[0];

            _params.custpage_crtdt = !!_params.custpage_crtdt ? _params.custpage_crtdt : objPurPlanInd.custrecord_scv_pur_plan_ind_date;
            _params.custpage_expecteddt_nextmonth = objPurPlanInd.custrecord_scv_pur_plan_ind_dkhv;
            _params.custpage_stockdt = objPurPlanInd.custrecord_scv_pur_plan_ind_receipt_date;
            _params.custpage_hsdc = objPurPlanInd.custrecord_scv_pur_plan_ind_hsdc;
            _params.custpage_usedfromdt = objPurPlanInd.custrecord_scv_pur_plan_date_used_from;
            _params.custpage_usedtodt = objPurPlanInd.custrecord_scv_pur_plan_ind_date_used_to;

            return _params;
        }

        const getDataSS01_MfgPlan = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchMfgPlan.getDataSource(myFilters);

            return arrResult;
        }

        const getDataSS02_ItemMapBom = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchItemMapBom.getDataSource(myFilters);

            return arrResult;
        }

        const getDataSS03_BomReviseList = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchBomReviseList.getDataSource(myFilters);

            return arrResult;
        }

        const getDataSS04_ListItemStandLQ = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchListItemStandLQ.getDataSource(myFilters);

            return arrResult;
        }

        const getDataSS05_InvOnhand = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchInvOnhand.getDataSource(myFilters);

            return arrResult;
        }

        const getDataSS06_InvOnhandPending = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchInvOnhandPending.getDataSource(myFilters);

            return arrResult;
        }

        const getDataSS07_PlanQtyRemain = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchPlanQtyRemain.getDataSource(myFilters);

            return arrResult;
        }

        const getDataSS08_AsbItemInvUsed = (_params) => {
            let myFilters = [];
            
            let arrResult = constSearchAsbItemInvUsed.getDataSource(myFilters);

            return arrResult;
        }
        
        return {onRequest}

    });
