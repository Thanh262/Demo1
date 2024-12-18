/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/ui/serverWidget'],

    (serverWidget, jQuery) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const onRequest = (scriptContext) => {
            let parameters = scriptContext.request.parameters;
            let exportType = parameters.export;
            let salesOrderId = parameters.salesOrderId;

            let form = serverWidget.createForm('File Exported!');
            //form.clientScriptModulePath = '../cs/scv_thh_cs_exp_excel';
            form.clientScriptModulePath = '../cs/scv_thh_cs_exp_saleord';

            let salesOrderIdField = form.addField({
                id: 'custpage_sales_order_id',
                label: 'Sales Order Id',
                type: serverWidget.FieldType.INTEGER,

            }).defaultValue = salesOrderId;

            let exportTypeField = form.addField({
                id: 'custpage_export_field',
                label: 'Export Type',
                type: 'text',

            }).defaultValue = exportType;

            // exportTypeField.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.DISABLED
            // });

            scriptContext.response.writePage(form);

        }


        return {onRequest}

    });
