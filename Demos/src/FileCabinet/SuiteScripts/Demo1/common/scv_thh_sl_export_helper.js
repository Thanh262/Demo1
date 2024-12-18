/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','N/render','./scv_common_pdf'],
    
    (record,render, pdf) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            //by default, all request sent here will be understood as pdf/excel export => no need to specify get/post
            let parameters = scriptContext.request.parameters;
            let additionalRecords = JSON.parse(parameters.additionalRecords);
            let objRender = buildPDF(parameters.templateId, parameters.recordId, parameters.recordType, additionalRecords);


            scriptContext.response.writeFile({
                file: objRender,
                isInline: true,
            });
        }

        const buildPDF = (templateId, recordId, recordType, additionalRecords) => {
            let objRender = render.create();
            objRender.setTemplateById(templateId);

            let mainRecord = record.load({
                type: recordType,
                id: recordId,
            });
            objRender.addRecord(recordType,mainRecord);

            if (additionalRecords && Object.keys(additionalRecords).length > 0) {
                for (let key of Object.keys(additionalRecords)) {
                    let additionalRecord = record.load({
                        type: key, // The record type (e.g., "customer" or "customrecord_scv_thh_sales_contract")
                        id: additionalRecords[key] // The record ID (e.g., "10" or "1")
                    });
                    objRender.addRecord(key, additionalRecord); // Adding the loaded record to the renderer
                }
            }

            pdf.addFontVietnamese(objRender);

            return objRender.renderAsPdf();
        }


        return {onRequest}

    });
