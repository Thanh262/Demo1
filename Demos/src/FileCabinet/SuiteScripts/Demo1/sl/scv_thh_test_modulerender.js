/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
// This sample shows how to render search results into a PDF file.
define(['N/render', 'N/search'], function(render, search) {
    function onRequest(options) {
        var request = options.request;
        var response = options.response;

        var xmlStr = '<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n' +
            '<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n' +
            '<pdf lang=\"ru=RU\" xml:lang=\"ru-RU\">\n" + "<head>\n' +
            '<link name=\"russianfont\" type=\"font\" subtype=\"opentype\" ' +
            'src=\"NetSuiteFonts/verdana.ttf\" " + "src-bold=\"NetSuiteFonts/verdanab.ttf\"' +
            'src-italic=\"NetSuiteFonts/verdanai.ttf\" " + "src-bolditalic=\"NetSuiteFonts/verdanabi.ttf\"' +
            'bytes=\"2\"/>\n" + "</head>\n' +
            '<body font-family=\"russianfont\" font-size=\"18\">\n??????? ?????</body>\n" + "</pdf>';

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