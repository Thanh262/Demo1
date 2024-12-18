/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/render', 'N/search','N/log','N/format/i18n'],

    (record, render, search, log, format) => {
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
            addFontVietnamese(objRender);

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

        const addFontVietnamese = (objRender) => {
            objRender.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "libPdf",
                data: {
                    font: {
                        times: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1302&amp;c=9684031_SB1&amp;h=45f88jdQjycF-SASJqOy9hNuxdFjDnDTEauZ15w4Cg6iEw6a&amp;_xt=.ttf',
                        times_bold: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1301&amp;c=9684031_SB1&amp;h=3eSD0B6bpF5mJLtGL-5qYCzqz5Y1Tj-L-5RoXzu_GgWdDIMk&amp;_xt=.ttf',
                        times_italic: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1303&amp;c=9684031_SB1&amp;h=0cMCrMyAZ-dhsuPyUI9lfzzwwBrYScH1_quVVeKqPfZQzPde&amp;_xt=.ttf',
                        times_bolditalic: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1304&amp;c=9684031_SB1&amp;h=_KPnJfAcfxGXcQ3oPbFmOmBK3mFvbu8AgnaHusF16D2Ixfjn&amp;_xt=.ttf',
                    }
                }
            });
        }

        const writeFilePDF = (response, objFile) => {
            response.writeFile({file: objFile, isInline: true});
        }

        return {onRequest}

    });
