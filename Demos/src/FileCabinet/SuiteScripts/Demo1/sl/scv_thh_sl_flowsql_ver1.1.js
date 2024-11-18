/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/query', 'N/ui/serverWidget', 'N/search'], (query, serverWidget, search) => {
    const onRequest = (scriptContext) => {
        let request = scriptContext.request;
        let parameters = request.parameters;
        if (request.method === 'GET') {
            let {form, sublist} = createForm(parameters);
            if(parameters.isSearch === 'T') {
                let listDataTestOrderLines = getListDataTestOrderLines(parameters);
                setValueLineOfTestOrderLines(sublist, parameters, listDataTestOrderLines);
            }

            scriptContext.response.writePage(form);
        }
    }
    
    const setValueLineOfTestOrderLines = (sublist, parameters, listDataTestOrderLines) => {
        let interestRate = parameters.custpage_interest_rate || 0;
        let line = 0;
        for (let testOrderLine of listDataTestOrderLines) {
            let grossAmount = parseFloat(testOrderLine.custrecord_scv_test_odl_grossamt);
            
            setSublistValueLine(sublist, line, 'custpage_item', testOrderLine.custrecord_scv_test_odl_item_display);
            setSublistValueLine(sublist, line, 'custpage_grossamount', grossAmount.toFixed(2));
            setSublistValueLine(sublist, line, 'custpage_interest_amount', (grossAmount * interestRate).toFixed(2));
            
            line++;
        }
    }
    
    const setSublistValueLine = (sublist, line, fieldId, value) => {
        if(value || value === 0) {
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

        let fieldSubdiary =  form.addField({
            id: 'custpage_subsidiary',
            type: serverWidget.FieldType.SELECT,
            source : 'subsidiary',
            label: 'Subsidiary'
        });
        fieldSubdiary.defaultValue = parameters.custpage_subsidiary;
        
        let fieldCustomer = form.addField({
            id: 'custpage_customer',
            type: serverWidget.FieldType.SELECT,
            source : 'customer',
            label: 'Customer'
        })
        fieldCustomer.defaultValue = parameters.custpage_customer;

        let interestRate = form.addField({
            id: 'custpage_interest_rate',
            type: serverWidget.FieldType.PERCENT,
            label : 'interest_rate',
        })

        interestRate.defaultValue = 5;

        let sublist = form.addSublist({
            id: 'custpage_sublist',
            type: serverWidget.SublistType.LIST,
            label: 'SCV Test Order Line Results'
        });
        
        addListFieldsLine(sublist, getListFieldsLine);

        form.addButton({
            id: 'custpage_search_btn',
            label : 'Search',
            functionName : 'searchOrderItems'
        })

        form.clientScriptModulePath = '../cs/scv_thh_cs_flowsql';

        return {form, sublist};
    }
    
    const addListFieldsLine = (sublist, listFields) => {
        for(let objFields of listFields) {
            let field = sublist.addField(objFields);
            if(objFields.isMandatory) {
                field.isMandatory = isMandatory;
            }
            if(objFields.displayType)  {
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
        }
    ];
    
    const getListDataTestOrderLines = (parameters) => {
        // let sqlWhere = '', params = [], sqlJoinTestOrder = '';
        //
        // if (parameters.custpage_subsidiary) {
        //     sqlWhere = ' and todl.custrecord_scv_tol_itsub = ?';
        //     params.push(parameters.custpage_subsidiary);
        // }
        //
        // if (parameters.custpage_customer) {
        //     sqlJoinTestOrder = ' join customrecord_scv_test_order tod on tod.id = todl.custrecord_scv_test_odl_order';
        //     sqlWhere += ' and tod.custrecord_scv_test_order_customer = ?';
        //     params.push(parameters.custpage_customer);
        // }
        //
        // let sqlTestOrderLine =  `
        //     select todl.custrecord_scv_test_odl_item, BUILTIN.DF(todl.custrecord_scv_test_odl_item) custrecord_scv_test_odl_item_display, todl.custrecord_scv_test_odl_grossamt
        //     from  customrecord_scv_test_order_line todl ${sqlJoinTestOrder}
        //     where todl.isinactive = 'F' ${sqlWhere}
        // `;
        //
        // return query.runSuiteQL({query: sqlTestOrderLine, params: params}).asMappedResults();
    }

    return {onRequest}
});