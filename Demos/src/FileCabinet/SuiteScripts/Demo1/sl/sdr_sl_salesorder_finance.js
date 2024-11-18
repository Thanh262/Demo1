/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','N/redirect','N/ui/serverWidget', '../olib/alasql.min@1.7.3'],
    
    (record,redirect,serverWidget, alasql) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if(scriptContext.request.method === 'GET') {
                let form = createForm()
                let sublist = createSublist(form);
                setValueDataSublist(sublist, getListDataExample());
                scriptContext.response.writePage(form);
            } else {
                scriptContext.response.write({output: scriptContext.request.parameters.custpage_name});
            }
        }
        
        const exampleAlasql = () => {
            const dataExample = [
                {id: 1, name: 'Ala', age: 18},
                {id: 8, name: 'Alg', age: 21},
                {id: 5, name: 'Flb', age: 25},
                {id: 4, name: 'Clg', age: 20}
            ];
            let newData = alasql("select a.* from ? a where a.name like 'Ala'", [dataExample]);
        }
        
        const createForm = () => {
            const form = serverWidget.createForm({
                title : 'Sales Order Financing',
                hideNavBar : false
            });
            form.clientScriptModulePath = '../cs/scv_cs_testorder.js';
            
            form.addField({
                id : 'custpage_sdr_financing_help' ,
                label : 'Please assign a price to the financing of this sales order, then click Submit Financing.',
                type : serverWidget.FieldType.HELP,
            });
            
            let fieldName = form.addField({
                id: 'custpage_name',
                label: 'Name',
                type: serverWidget.FieldType.TEXT
            });
            fieldName.isMandatory = true;
            fieldName.defaultValue = "Test";
            
            form.addSubmitButton({
                id: 'custpage_sdr_financing_save_button',
                label: 'Save Finance Info'
            });
            
            return form;
        }
        
        const createSublist = (form) => {
            let sublist = form.addSublist({id: 'sublist_item', label: 'Item', type: serverWidget.SublistType.LIST});
            let listDataField = getListDataField();
            for(let dataField of listDataField) {
                sublist.addField(dataField);
            }
            return sublist;
        }
        
        const getListDataField = () => {
            return [{id : 'name',
                type : serverWidget.FieldType.TEXT,
                label : 'Name'
            }];
        }
        
        const setValueDataSublist = (sublist, listData) => {
            let line = 0;
            let listDataField = getListDataField();
            for(let data of listData) {
                for(let dataField of listDataField) {
                    sublist.setSublistValue({id : dataField.id, line : line,value : data[dataField.id]});
                }
                line++;
            }
        }
        
        const getListDataExample = () => {
            return [{
                name: 'Co'
            }, {
                name: 'An'
            }];
        }
        
        const createList = () => {
            var list = serverWidget.createList({
                title: 'Purchase History'
            });
            
            list.style = serverWidget.ListStyle.REPORT;
            
            list.addButton({
                id: 'buttonid',
                label: 'Test',
                functionName: '' // the function called when the button is pressed
            });
            
            // Section Two - Columns  - See 'Steps for Creating a Custom List Page', Step Seven
            list.addColumn({
                id: 'column1',
                type: serverWidget.FieldType.DATE,
                label: 'Date',
                align: serverWidget.LayoutJustification.RIGHT
            });
            
            list.addColumn({
                id: 'column2',
                type: serverWidget.FieldType.TEXT,
                label: 'Product',
                align: serverWidget.LayoutJustification.RIGHT
            });
            
            list.addColumn({
                id: 'column3',
                type: serverWidget.FieldType.INTEGER,
                label: 'Quantity',
                align: serverWidget.LayoutJustification.RIGHT
            });
            
            list.addColumn({
                id: 'column4',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Unit Cost',
                align: serverWidget.LayoutJustification.RIGHT
            });
            
            list.addRows({
                rows: [{column1: '05/30/2018', column2: 'Widget', column3: '4', column4: '4.50'},
                    {column1: '05/30/2018', column2: 'Sprocket', column3: '6', column4: '11.50'},
                    {column1: '05/30/2018', column2: 'Gizmo', column3: '9', column4: '1.25'}]
            });
            
            return list;
        }
        
        return {onRequest}

    });
