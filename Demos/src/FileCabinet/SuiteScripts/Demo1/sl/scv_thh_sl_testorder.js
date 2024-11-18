/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search'], (serverWidget, search) => {
    const onRequest = (scriptContext) => {
        if (scriptContext.request.method === 'GET') {
            let form = serverWidget.createForm({
                title: 'SCV Test Order Suitelet'
            });

            let customerField = form.addField({
                id: 'custpage_customer',
                type: serverWidget.FieldType.SELECT, source: 'customer',
                label: 'Customer'
            });
            //customerField.addSelectOption({value: '', text: ''});
            //populateCustomerOptions(customerField);

            let subsidiaryField = form.addField({
                id: 'custpage_subsidiary',
                type: serverWidget.FieldType.SELECT,
                label: 'Subsidiary'
            });
            subsidiaryField.addSelectOption({value: '', text: ''});
            populateSubsidiaryOptions(subsidiaryField);

            let interestRateField = form.addField({
                id: 'custpage_interest_rate',
                type: serverWidget.FieldType.PERCENT,
                label: 'Interest Rate'
            });
            interestRateField.defaultValue = 5;

            let sublist = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'SCV Test Order Line Results'
            });

            sublist.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.TEXT,
                label: 'Item'
            });
            sublist.addField({
                id: 'custpage_gross_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Gross Amount'
            });
            sublist.addField({
                id: 'custpage_interest_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Interest Amount'
            });

            form.addSubmitButton({label: 'Search'});
            scriptContext.response.writePage(form);

        } else {
            const customerId = scriptContext.request.parameters.custpage_customer;
            const subsidiaryId = scriptContext.request.parameters.custpage_subsidiary;
            const interestRate = parseFloat(scriptContext.request.parameters.custpage_interest_rate || 5) / 100;

            let searchResults = searchTestOrderLines(customerId, subsidiaryId);

            let form = serverWidget.createForm({
                title: 'SCV Test Order Suitelet - Results'
            });

            // Redo fields and sublist for result display
            let sublist = form.addSublist({
                id: 'custpage_results',
                type: serverWidget.SublistType.LIST,
                label: 'SCV Test Order Line Results'
            });

            let itemField = sublist.addField({
                id: 'custpage_item',
                type: serverWidget.FieldType.TEXT,
                label: 'Item'
            });
            let grossAmountField = sublist.addField({
                id: 'custpage_gross_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Gross Amount'
            });
            let interestAmountField = sublist.addField({
                id: 'custpage_interest_amount',
                type: serverWidget.FieldType.CURRENCY,
                label: 'Interest Amount'
            });

            for (let i = 0; i < searchResults.length; i++) {
                let result = searchResults[i];
                let grossAmount = parseFloat(result.getValue('grossamount'));
                let interestAmount = grossAmount * interestRate;

                sublist.setSublistValue({
                    id: 'custpage_item',
                    line: i,
                    value: result.getValue('item')
                });
                sublist.setSublistValue({
                    id: 'custpage_gross_amount',
                    line: i,
                    value: grossAmount.toFixed(2)
                });
                sublist.setSublistValue({
                    id: 'custpage_interest_amount',
                    line: i,
                    value: interestAmount.toFixed(2)
                });
            }

            form.addSubmitButton({label: 'Search Again'});
            scriptContext.response.writePage(form);
        }
    }

    function populateCustomerOptions(field) {
        let customerSearch = search.create({
            type: search.Type.CUSTOMER,
            columns: ['entityid']
        });
        customerSearch.run().each(result => {
            field.addSelectOption({
                value: result.id,
                text: result.getValue('entityid')
            });
            return true;
        });
    }

    function populateSubsidiaryOptions(field) {
        let subsidiarySearch = search.create({
            type: search.Type.SUBSIDIARY,
            columns: ['name']
        });
        subsidiarySearch.run().each(result => {
            field.addSelectOption({
                value: result.id,
                text: result.getValue('name')
            });
            return true;
        });
    }

    function searchTestOrderLines(customerId, subsidiaryId) {
        let filters = [
            ['mainline', 'is', 'F'],
            'AND',
            ['type', 'anyof', 'SalesOrd']
        ];

        if (customerId) {
            filters.push('AND', ['customer', 'anyof', customerId]);
        }

        if (subsidiaryId) {
            filters.push('AND', ['subsidiary', 'anyof', subsidiaryId]);
        }

        let orderLineSearch = search.create({
            type: 'salesorder',
            filters: filters,
            columns: [
                'item',
                'grossamount'
            ]
        });

        return orderLineSearch.run().getRange({start: 0, end: 1000});
    }

    return {onRequest};
});

