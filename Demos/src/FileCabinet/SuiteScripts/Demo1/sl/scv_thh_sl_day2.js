/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search'], (serverWidget, search) => {
    const onRequest = (scriptContext) => {
        let request = scriptContext.request;
        let parameters = request.parameters;
        if (request.method === 'GET') {
            let {form, sublist} = createForm(parameters);
            if(parameters.isSearch === 'T') {
                let searchResults = searchTestOrderLines(parameters);
                setValueLineOfTestOrderLines(sublist, parameters, searchResults);
            }

            scriptContext.response.writePage(form);
        }
    }
    
    const setValueLineOfTestOrderLines = (sublist, parameters, searchResults) => {
        let interestRate = parameters.custpage_interest_rate || 0;
        for (let i = 0; i < searchResults.length; i++) {
            let result = searchResults[i];
            let grossAmount = parseFloat(result.getValue('grossamount'));
            let interestAmount = grossAmount * interestRate;
            
            sublist.setSublistValue({
                id: 'custpage_item',
                line: i,
                value: result.getText('item')
            });
            sublist.setSublistValue({
                id: 'custpage_grossamount',
                line: i,
                value: grossAmount.toFixed(2)
            });
            sublist.setSublistValue({
                id: 'custpage_interest_amount',
                line: i,
                value: interestAmount.toFixed(2)
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

        form.clientScriptModulePath = '../cs/scv_thh_cs_getorder';

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
    
    const searchTestOrderLines = (parameters) => {
        let filters = [
           ['custrecord_scv_tol_itsub', 'anyof', parameters.custpage_subsidiary]
        ];
        
        if (parameters.custpage_customer) {
            filters.push('AND', ['custrecord_scv_test_odl_order.custrecord_scv_test_order_customer', 'anyof', parameters.custpage_customer]);
        }
        //search.createFilter({name: 'custrecord_scv_test_order_customer', join: 'custrecord_scv_test_odl_order', operator: search.Operator.ANYOF, values: parameters.custpage_customer})
        
        if (parameters.custpage_subsidiary) {
            filters.push('AND', ['custrecord_scv_tol_itsub', 'anyof', parameters.custpage_subsidiary]);
        }
        
        let orderLineSearch = search.create({
            type: 'customrecord_scv_test_order_line',
            filters: filters,
            columns: [
                search.createColumn({
                    name : 'custrecord_scv_test_odl_item',
                    label: 'Item'
                }),
                search.createColumn({
                    name: 'custrecord_scv_test_odl_grossamt',
                    label: 'Gross Amount'
                })
            ]
        });
        
        return orderLineSearch.run().getRange({start: 0, end: 1000});
    }

    return {onRequest}
});