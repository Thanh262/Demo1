/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/query', 'N/render', 'N/ui/serverWidget', 'N/search', '../olib/alasql.min@1.7.3', '../common/scv_common_pdf'],
    (query, render, serverWidget, search, alasql, comPdf) => {
    const onRequest = (scriptContext) => {
        let request = scriptContext.request;
        let parameters = request.parameters;
        if (request.method === 'GET') {
            if(parameters.isExportPdf === 'T') {
                let listDataTestOrderLines = queryListDataTestOrderLines(parameters);
                //them vao search
                let listItemsAvaiable = searchListDataItemAvailable();
                let listDataTestOrder = joinSearchAndQuery(listDataTestOrderLines, listItemsAvaiable, parameters.custpage_interest_rate);
                
                let objFilePdf = buildFilePdf(parameters, listDataTestOrder);
                
                writeFilePDF(scriptContext.response, objFilePdf);
            } else {
                let {form, sublist} = createForm(parameters);
                if (parameters.isSearch === 'T') {
                    let listDataTestOrderLines = queryListDataTestOrderLines(parameters);
                    
                    let listItemsAvaiable = searchListDataItemAvailable();
                    let listDataTestOrder = joinSearchAndQuery(listDataTestOrderLines, listItemsAvaiable, parameters.custpage_interest_rate);
                    setValueLineOfTestOrderLines(sublist, parameters, listDataTestOrder);
                }
                scriptContext.response.writePage(form);
            }
        }
    }

    const buildFilePdf = (parameters, listDataTestOrder) => {
        let objRender = render.create();
        objRender.setTemplateByScriptId(parameters.templateId);
        comPdf.addFontVietnamese(objRender);

        objRender.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: 'itemLists',
            data : {
                listDataTestOrder : listDataTestOrder
            }

        });



        objRender.addCustomDataSource({
            format: render.DataSource.OBJECT,
            alias: 'subsidiary',
            data : {
                name : parameters.subsidiaryName
            }

        });

        return objRender.renderAsPdf();
        
    }

    const writeFilePDF = (response, objFile) => {
        response.writeFile({file: objFile, isInline: true});
    }
   
    const setValueLineOfTestOrderLines = (sublist, parameters, joinResult) => {
        let interestRate = parameters.custpage_interest_rate || 0;
        let line = 0;
        for (let joinTestOrderLine of joinResult) {
            let grossAmount = parseFloat(joinTestOrderLine.grossamt);
            let qavailable = parseFloat(joinTestOrderLine.quantityavailable) || 0;

            setSublistValueLine(sublist, line, 'custpage_item', joinTestOrderLine.itemid);
            setSublistValueLine(sublist, line, 'custpage_grossamount', grossAmount.toFixed(2));
            setSublistValueLine(sublist, line, 'custpage_interest_amount', (grossAmount.toFixed(2) * (interestRate/100) ));
            setSublistValueLine(sublist, line, 'custpage_available', qavailable.toFixed(2));

            line++;
        }
    }

    const setSublistValueLine = (sublist, line, fieldId, value) => {
        if (value || value === 0) {
            sublist.setSublistValue({
                id: fieldId,
                line: line,
                value: value
            });
        }
    }

    const createForm = (parameters) => {
        let form = serverWidget.createForm({
            title: 'SCV Test Order Suitelet Search'
        });

        let fieldSubdiary = form.addField({
            id: 'custpage_subsidiary',
            type: serverWidget.FieldType.SELECT,
            source: 'subsidiary',
            label: 'Subsidiary'
        });
        fieldSubdiary.defaultValue = parameters.custpage_subsidiary;

        let fieldCustomer = form.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.SELECT,
            source: 'customer',
            label: 'Customer'
        })
        fieldCustomer.defaultValue = parameters.custpage_customer;

        let interestRate = form.addField({
            id: 'custpage_interest_rate',
            type: serverWidget.FieldType.PERCENT,
            label: 'interest_rate',
        })

        interestRate.defaultValue = parameters.custpage_interest_rate ?? 5 ;

        let sublist = form.addSublist({
            id: 'custpage_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'SCV Test Order Line Results'
        });

        addListFieldsLine(sublist, getListFieldsLine);

        form.addButton({
            id: 'custpage_search_btn',
            label: 'Search',
            functionName: 'searchOrderItems'
        });

        form.addButton({
            id: 'custpage_export_to_pdf_btn',
            label: 'Export to PDF',
            functionName: 'exportPdf',
        });
        
        form.addButton({
            id: 'custpage_export_to_pdf_btn',
            label: 'Export to Excel',
            functionName: 'exportToExcel',
        });
        
        form.clientScriptModulePath = '../cs/scv_thh_cs_flow_sql_printpdf';

        return {form, sublist};
    }

    const addListFieldsLine = (sublist, listFields) => {
        for (let objFields of listFields) {
            let field = sublist.addField(objFields);
            if (objFields.isMandatory) {
                field.isMandatory = isMandatory;
            }
            if (objFields.displayType) {
                field.updateDisplayType({displayType: objFields.displayType});
            }
        }
    }

    const getListFieldsLine = [
        {
            id: 'custpage_item',
            type: serverWidget.FieldType.TEXT,
            label: 'ITEM'
        },
        {
            id: 'custpage_grossamount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Gross Amount', displayType: serverWidget.FieldDisplayType.ENTRY
        },
        {
            id: 'custpage_interest_amount',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Interest Amount'
        },
        {
            id: 'custpage_available',
            type: serverWidget.FieldType.FLOAT,
            label: 'Available',
        }
    ];

    const queryListDataTestOrderLines = (parameters) => {
        let sqlWhere = '', params = [], sqlJoinTestOrder = '';

        if (parameters.custpage_subsidiary) {
            sqlWhere = ' and todl.custrecord_scv_tol_itsub = ?';
            params.push(parameters.custpage_subsidiary);
        }

        if (parameters.custpage_customer) {
            sqlJoinTestOrder = ' join customrecord_scv_test_order tod on tod.id = todl.custrecord_scv_test_odl_order';
            sqlWhere += ' and tod.custrecord_scv_test_order_customer = ?';
            params.push(parameters.custpage_customer);
        }

        let sqlTestOrderLine = `
            select todl.custrecord_scv_test_odl_item item, todl.custrecord_scv_test_odl_grossamt grossamt
            from  customrecord_scv_test_order_line todl ${sqlJoinTestOrder}
            where todl.isinactive = 'F' ${sqlWhere}`;

        return query.runSuiteQL({query: sqlTestOrderLine, params: params}).asMappedResults();
    }

    const searchListDataItemAvailable = () => {
        let orderLineSearch = search.load('customsearch_scv_thh_item_test_2');
        let list = [];

        orderLineSearch.run().each( result => {
            list.push({
                item: result.id,
                itemid: result.getValue('itemid'),
                quantityavailable : result.getValue('quantityavailable'),
            });
            return true;
        });

        return list;
    }

    const joinSearchAndQuery =(listDataTestOrderLines, listItemsAvaiable, interestRate) => {
        return alasql("select a.item, b.itemid, a.grossamt,a.grossamt * ? AS interestamt, b.quantityavailable FROM ? as a JOIN ? as b ON a.item = b.item ", [interestRate,listDataTestOrderLines, listItemsAvaiable]);
    }

    return {onRequest}
});