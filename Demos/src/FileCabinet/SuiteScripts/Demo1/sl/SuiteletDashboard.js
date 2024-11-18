/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/ui/serverWidget", "N/search"],

    function (serverWidget, search) {
        function demoList(context) {
            var list = serverWidget.createList({
                title: 'Simple List'
            });
            list.style = context.request.parameters.style;
            var column = list.addColumn({
                id: 'custbody_dashboard_image',
                label: 'Dashboard',
                type: serverWidget.FieldType.TEXT,
                align: serverWidget.LayoutJustification.LEFT
            });
            column.setURL({
                url: "https://system.netsuite.com/app/center/card.nl?sc=-69" //URL of a Dashboard
            });
            column.addParamToURL({
                param: 'entityid',
                value: 'entity',
                dynamic: true // the dynamic parameter that allows to link the URL of a Dashboard with the corresponding entity
            });
            list.addColumn({
                id: 'trandate',
                label: 'date',
                type: serverWidget.FieldType.DATE,
                align: serverWidget.LayoutJustification.LEFT
            });
            list.addColumn({
                id: 'name_display',
                label: 'Customer',
                type: serverWidget.FieldType.TEXT,
                align: serverWidget.LayoutJustification.LEFT
            });
            list.addColumn({
                id: 'salesrep_display',
                label: 'Sales Rep',
                type: serverWidget.FieldType.TEXT,
                align: serverWidget.LayoutJustification.LEFT
            });
            list.addColumn({
                id: 'amount',
                label: 'Amount',
                type: serverWidget.FieldType.CURRENCY,
                align: serverWidget.LayoutJustification.RIGHT
            });

            var searchEstimate = search.create({
                type: search.Type.ESTIMATE,
                filters: [{
                    name: 'mainline',
                    operator: 'is',
                    values: ['T']
                }],
                columns: [{
                    name: 'trandate'
                }, {
                    name: 'entity'
                }, {
                    name: 'name'
                }, {
                    name: 'salesrep'
                }, {
                    name: 'amount'
                }, {
                    name: 'custbody_dashboard_image'    // Dashboard link
                }],
            });
            var searchEstimateResults = searchEstimate.run();
            var results = searchEstimateResults.getRange({
                start: 0,
                end: 1000
            });
            list.addRows({
                rows: results
            });

            context.response.writePage({
                pageObject: list
            });
        }

        return {
            onRequest: demoList
        };
    });