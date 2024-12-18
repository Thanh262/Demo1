/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/dataset', 'N/query', 'N/ui/serverWidget'],
    (dataset, query, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let response = scriptContext.response;
            let request = scriptContext.request;
            let params = request.parameters;

            let arrInvBalance = getDataSetInvBalance(params);
            let MainForm = onCreateFormUI(params);
            onRenderData(MainForm.sublist, arrInvBalance);

            response.writePage(MainForm.form);
        }

        const onRenderData = (sublist, data) => {
            for (var i = 0; i < data.length; i++) {
                setRowDataSublist(sublist, i, [
                    "custpage_col_1", "custpage_col_2", "custpage_col_3", "custpage_col_4",
                    "custpage_col_5"
                ], [
                    data[i].custitemnumber_scv_item_num_color_seri, data[i].inventorynumber,
                    data[i].formula_1, data[i].location, data[i].item
                ]);
            }
        }

        const getDataSetInvBalance = (params) => {
            // load dataset
            let loadDataSet = dataset.load({
                id: 'custdataset_scv_inventory_balance_dataset'
            });
            // create condition
            let locationColumn = dataset.createColumn({fieldId: "location"});
            let locationCondition = dataset.createCondition({column: locationColumn, operator: query.Operator.ANY_OF, values: [params.location]});

            let itemColumn = dataset.createColumn({fieldId: "item"});
            let itemCondition = dataset.createCondition({column: itemColumn, operator: query.Operator.ANY_OF, values: [params.item]});

            loadDataSet.condition = dataset.createCondition({operator: 'AND', children: [locationCondition, itemCondition]});
            // run
            let results = loadDataSet.run().asMappedResults();
            return results;
        }

        const onCreateFormUI = (params) => {
            let mainForm = serverWidget.createForm({title: "Inventory Balance"});
            mainForm.clientScriptModulePath = '../cs/scv_cs_sl_popup_inv_balance.js';
            let defaultGrp = addFieldGroup(mainForm, "fieldgrp_main", "Default");
            // add button
            mainForm.addSubmitButton({label : 'Submit'});
            mainForm.addButton({
                id: "custpage_btn_cancel",
                label: "Cancel",
                functionName: "onCancel()"
            });
            // add field
            let custpage_location = mainForm.addField({
                id: "custpage_location",
                type: serverWidget.FieldType.SELECT,
                label: "Location",
                source: "location",
                container: defaultGrp.id
            });
            let custpage_item = mainForm.addField({
                id: "custpage_item",
                type: serverWidget.FieldType.SELECT,
                label: "Item",
                source: "item",
                container: defaultGrp.id
            });
            let custpage_line = mainForm.addField({
                id: "custpage_line",
                type: serverWidget.FieldType.INTEGER,
                label: "Line",
                container: defaultGrp.id
            });

            let custpage_rectype = mainForm.addField({
                id: "custpage_rectype",
                type: serverWidget.FieldType.TEXT,
                label: "Rec Type",
                container: defaultGrp.id
            });
            let custpage_sublistid = mainForm.addField({
                id: "custpage_sublistid",
                type: serverWidget.FieldType.TEXT,
                label: "Sublist ID",
                container: defaultGrp.id
            });
            // default value
            // custpage_location.updateDisplayType({displayType: 'disabled'});
            custpage_item.updateDisplayType({displayType: 'disabled'});
            custpage_line.updateDisplayType({displayType: 'hidden'});
            custpage_rectype.updateDisplayType({displayType: 'hidden'});
            custpage_sublistid.updateDisplayType({displayType: 'hidden'});
            custpage_location.defaultValue = params.location;
            custpage_item.defaultValue = params.item;
            custpage_line.defaultValue = params.line_number;
            custpage_sublistid.defaultValue = params.sublistId;
            custpage_rectype.defaultValue = params.recType;
            // add sublist
            let sublist = mainForm.addSublist({
                id: "custpage_sl_result",
                type: serverWidget.SublistType.LIST,
                label: 'Result',
            });
            onCreateSublistColumn(sublist);
            return {form: mainForm, sublist: sublist};
        }

        function onCreateSublistColumn(sublist){		
            let arrColumn = [
                { label: "Select", type: "radio", displayType: "entry" },
                { label: "Seri màu", type: "text" },
                { label: "Serial/Lot Number", type: "select", source: "inventorynumber" },
                { label: "Qty Serial Available", type: "float" },
                { label: "Location", type: "select", source: "location" },
                { label: "Item", type: "select", source: "item" },
            ];
            let index = 0;
            for(let i = 0; i< arrColumn.length; i++){
                let field = sublist.addField({
                    id: arrColumn[i].id || ("custpage_col_"+ index),
                    type: arrColumn[i].type,
                    label: arrColumn[i].label,
                    source: arrColumn[i].source || null,
                });
                field.updateDisplayType({ displayType: arrColumn[i].displayType || "inline"});

                if(!arrColumn[i].id) {
                    index++;
                }
            }
        }

        function setRowDataSublist(_sublist, _line, _field, _data){
            for(var i = 0; i<_field.length; i++){
                addValueColField(_sublist, _field[i], _line, _data[i]);
            }
        }
        function addValueColField(sublist, id, line, value) {
            if(!!value){
                sublist.setSublistValue({
                    id: id,
                    line: line,
                    value: value
                });
            }
        }

        function addFieldGroup(_form, _id, _label){
            let _obj = {id: _id, label: _label}
            _form.addFieldGroup(_obj);
            return _obj;
        }

        return {onRequest}

    });
