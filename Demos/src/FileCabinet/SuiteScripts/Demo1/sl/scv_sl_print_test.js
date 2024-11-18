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
                        times: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1281&amp;c=9684031_SB1&amp;h=5FjCLDpRFo6UVqmwFNJWO73gr5V3sIWVI9J8sIwFU8ni5HNy&amp;_xt=.ttf',
                        times_bold: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1280&amp;c=9684031_SB1&amp;h=sg-3gzG6XRNvDuoXD0x-e4FipKGSR95I086vEHHqrf9nCTHU&amp;_xt=.ttf',
                        times_italic: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1278&amp;c=9684031_SB1&amp;h=bd_O6KFRs3ktOV764JXgj2XXwvAbEctxy_CnnJHAJ7svAqXP&amp;_xt=.ttf',
                        times_bolditalic: 'https://9684031-sb1.app.netsuite.com/core/media/media.nl?id=1279&amp;c=9684031_SB1&amp;h=7HfV81HtMVd53-Wr7dXVCN_LU7Pgu5YygHEYgyUTtEK1R6Nc&amp;_xt=.ttf',
                    }
                }
            });
        }

        const writeFilePDF = (response, objFile) => {
            response.writeFile({file: objFile, isInline: true});
        }

        return {onRequest}

    });
