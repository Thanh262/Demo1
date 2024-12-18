/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/file'], function(serverWidget, file ) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Sample data for multiple sheets
            const dataSheet1 = [
                { Name: "Alice", Age: 30 },
                { Name: "Bob", Age: 25 }
            ];

            const dataSheet2 = [
                { Product: "Laptop", Price: 1000 },
                { Product: "Phone", Price: 500 }
            ];

            var xlsxFile = file.load({
                id: '1299' // Path to the library
            });
            eval(xlsxFile.getContents());

            // Check if XLSX is defined
            if (typeof XLSX === 'undefined') {
                throw new Error('XLSX library is not loaded correctly.');
            }

            // Check if utils and json_to_sheet are available
            if (typeof XLSX.utils === 'undefined' || typeof XLSX.utils.json_to_sheet !== 'function') {
                throw new Error('json_to_sheet function is not available in XLSX.utils.');
            }
            // Create worksheets from the data
            const worksheet1 = XLSX.utils.json_to_sheet(dataSheet1);
            const worksheet2 = XLSX.utils.json_to_sheet(dataSheet2);

            // Create a new workbook
            const workbook = xlsxFile.utils.book_new();

            // Append the worksheets to the workbook
            xlsxFile.utils.book_append_sheet(workbook, worksheet1, "Users");
            xlsxFile.utils.book_append_sheet(workbook, worksheet2, "Products");

            // Write the workbook to a buffer
            const buffer = xlsxFile.write(workbook, { bookType: 'xlsx', type: 'buffer' });

            // Set the response headers for file download
            context.response.setHeader({
                name: 'Content-Disposition',
                value: 'attachment; filename="ExportedData.xlsx"'
            });
            context.response.setHeader({
                name: 'Content-Type',
                value: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });

            // Write the buffer directly to the response
            context.response.write(buffer);
        }
    }

    return {
        onRequest: onRequest
    };
});