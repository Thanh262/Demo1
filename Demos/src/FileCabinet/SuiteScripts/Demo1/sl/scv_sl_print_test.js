/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/render', 'N/search', 'N/log', 'N/format/i18n', '../common/scv_common_pdf'],

    (record, render, search, log, format, comPdf) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let parameters = request.parameters;
            let objFilePdf = buildFilePdf(parameters);
            writeFilePDF(scriptContext.response, objFilePdf);
        }

        const buildFilePdf = (parameters) => {
            let objRender = render.create();
            objRender.setTemplateByScriptId(parameters.templateid);
            comPdf.addFontVietnamese(objRender);

            let recLoad = record.load({type: parameters.trtype, id: parameters.trid});
            objRender.addRecord('record', recLoad);

            addSpellOutTotalAmount(objRender, recLoad);

            return objRender.renderAsPdf();
        }

        const addSpellOutTotalAmount = (objRender, recLoad) => {
            let spelloutAmount = format.spellOut({
                number: recLoad.getValue('custrecord_scv_test_order_totalamount'),
                locale: "vi_VN"
            })


            objRender.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "additionalData",
                data: {
                    spelloutAmount: spelloutAmount
                }
            });
        }

        const writeFilePDF = (response, objFile) => {
            response.writeFile({file: objFile, isInline: true});
        }

        return {onRequest}

    });
