/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
// This sample shows how to render search results into a PDF file.
define(['N/render', 'N/search'], function(render, search) {
    function onRequest(options) {
        var request = options.request;
        var response = options.response;

        var rs = search.create({
            type: search.Type.TRANSACTION,
            columns: ['trandate', 'amount', 'entity'],
            filters: []
        }).run();

        var results = rs.getRange(0, 1000);
        var renderer = render.create();
        renderer.templateContent = xmlStr;
        renderer.addSearchResults({
            templateName: 'results',
            searchResult: results
        });

        var newfile = renderer.renderAsPdf();
        response.writeFile(newfile, false);
    }

    return {
        onRequest: onRequest
    };
});