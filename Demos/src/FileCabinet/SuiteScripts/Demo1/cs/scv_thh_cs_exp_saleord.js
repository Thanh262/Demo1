/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/currentRecord', 'N/record', 'N/search', 'N/url'],

    function (crr, record, search, url) {

        const loadLib = async (url) => {
            return new Promise((resolve, reject) => {
                jQuery.getScript(url)
                    .done((script, textStatus) => {
                        resolve(`Script loaded successfully: ${textStatus}`);
                    })
                    .fail((jqxhr, settings, exception) => {
                        reject(new Error(`Failed to load script: ${exception}`));
                    });


            })
        }

        const exportExcel = async (salesOrderId) => {

            try {
                if (typeof ExcelJS === 'undefined') {
                    await loadLib('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js');
                }
                if (typeof saveAs === "undefined") {
                    await loadLib('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
                }

                let salesOrder = record.load({
                    type: record.Type.SALES_ORDER,
                    id: salesOrderId,
                });
                let contract = search.lookupFields({
                    type: 'customrecord_scv_sales_contract',
                    id: salesOrder.getValue('custbody_scv_sales_contract'),
                    columns: ['name', 'custrecord_scv_sc_date']
                })

                let a = salesOrder.getValue('entity');

                let entity = search.lookupFields({
                    type: record.Type.CUSTOMER,
                    id: salesOrder.getValue('entity'),
                    columns: [
                        'custentity_scv_legal_name',
                        'address',
                        'phone',
                        'custentity_scv_contact_name',
                        'custentity_scv_position_st']
                });

                let subsidiary = search.lookupFields({
                    type: record.Type.SUBSIDIARY,
                    id: salesOrder.getValue('subsidiary'),
                    columns: ['legalname',
                        //'address',
                        'custrecord_scv_sub_phone'],
                });

                let workbook = new ExcelJS.Workbook();

                const sheet1 = workbook.addWorksheet('Hợp đồng mua bán', {
                    pageSetup: {
                        paperSize: 9,
                        orientation: 'portrait'
                    }
                });

                sheet1.columns = [
                    {width: 5.7, style: {font: {size: 12, name: 'Times New Roman',}}},
                    {width: 23.7, style: {font: {name: 'Times New Roman', size: 12}}},
                    {width: 23.7, style: {font: {name: 'Times New Roman', size: 12}}},
                    {width: 7.6, style: {font: {name: 'Times New Roman', size: 12}}},
                    {width: 11, style: {font: {name: 'Times New Roman', size: 12}}},
                    {width: 14.4, style: {font: {name: 'Times New Roman', size: 12}}},
                    {width: 16, style: {font: {name: 'Times New Roman', size: 12}}},
                    {width: 12.5, style: {font: {name: 'Times New Roman', size: 12}}},
                ];

                let mergeCellsList = ['A1:H1', 'E2:H2', 'E3:H3', 'A4:C4', 'E4:H4', 'A5:C5', 'E5:H5',
                    'A6:C6', 'E6:H6', 'A7:C7', 'E7:H7', 'A8:C8', 'E8:H8',
                    'A9:H9',
                    // 'A21:H21', 'A22:H22', 'A23:H23', 'A24:H24', 'A25:H25',
                    // 'A27:H27', 'A28:H28', 'A29:H29', 'A31:H31', 'A32:H32', 'A33:H33', 'A34:H34',
                ]

                for (let i = 0; i < mergeCellsList.length; i++) {
                    sheet1.mergeCells(mergeCellsList[i]);
                }

                sheet1.getCell('A1').font = {name: 'Times New Roman', bold: true, size: 18};
                sheet1.getCell('A1').value = "HỢP ĐỒNG MUA BÁN";
                sheet1.getCell('A1').alignment = {vertical: 'middle', horizontal: 'center'};
                sheet1.getRow(1).height = 27.75;

                let hopDongSo = contract.name;
                let hopDongNgay = contract.custrecord_scv_sc_date;

                let benBan = subsidiary.legalname;
                let diaChiBenBan = subsidiary.mainaddress_text;
                let sdtBenBan = subsidiary.custrecord_scv_sub_phone;
                let nguoiDaiDienBenBan = salesOrder.getValue('custbody_scv_nguoi_dai_dien');
                let chucVuBenBan = salesOrder.getValue('custbody_scv_chuc_vu');

                let benMua = entity.custentity_scv_legal_name;
                let diaChiBenMua = entity.address;
                let sdtBenMua = entity.phone;
                let nguoiDaiDienBenMua = entity.custentity_scv_contact_name;
                let chucVuBenMua = entity.custentity_scv_position_st;

                sheet1.getCell('E2').value = {
                    'richText': [
                        {font: {name: 'Times New Roman', size: 11}, text: 'Số: '},
                        {font: {name: 'Times New Roman', size: 11}, text: hopDongSo}
                    ]
                };

                sheet1.getCell('E3').value = {
                    'richText': [
                        {font: {name: 'Times New Roman', size: 11}, text: 'Ngày: '},
                        {font: {name: 'Times New Roman', size: 11}, text: hopDongNgay}
                    ]
                };

                setCell(sheet1, 'A4', 'Bên bán: ', benBan, {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true,
                    italic: true,
                    underline: true
                });
                setCell(sheet1, 'E4', 'Bên mua: ', benMua, {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true,
                    italic: true,
                    underline: true
                });

                setCell(sheet1, 'A5', 'Địa chỉ: ', diaChiBenBan, {size: 12, name: 'Times New Roman', bold: true});
                setCell(sheet1, 'E5', 'Địa chỉ: ', diaChiBenMua, {size: 12, name: 'Times New Roman', bold: true});

                setCell(sheet1, 'A6', 'Số điện thoại: ', sdtBenBan, {size: 12, name: 'Times New Roman', bold: true});
                setCell(sheet1, 'E6', 'Số điện thoại ', sdtBenMua, {size: 12, name: 'Times New Roman', bold: true});

                setCell(sheet1, 'A7', 'Người đại diện: ', nguoiDaiDienBenBan, {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true
                });
                setCell(sheet1, 'E7', 'Người đại diện: ', nguoiDaiDienBenMua, {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true
                });

                setCell(sheet1, 'A8', 'Chức vụ: ', chucVuBenBan, {size: 12, name: 'Times New Roman', bold: true});
                setCell(sheet1, 'E8', 'Chức vụ: ', chucVuBenMua, {size: 12, name: 'Times New Roman', bold: true});

                sheet1.getCell('A9').value = 'Hợp đồng này được thoả thuận bởi 2 bên, đồng ý mua và bán hàng hoá theo những điều khoản và điều kiện sau:';
                setCell(sheet1, 'A10', 'ĐIỀU 1 : HÀNG HOÁ VÀ GIÁ CẢ ', " ", {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true
                });

                let tenMatHang = salesOrder.getValue('custbody_scv_so_name_of_goods');
                setCell(sheet1, 'A11', 'Tên mặt hàng: ', tenMatHang, {size: 12, name: 'Times New Roman', bold: true})

                let headerCells = ['A12', 'B12', 'C12', 'D12', 'E12', 'F12', 'G12', 'H12'];
                let colorCode = 'ffe6ff';
                setCellColor(sheet1, headerCells, colorCode);
                setCellAlignment(sheet1, headerCells, 'center');
                sheet1.getRow(12).font = {name: 'Times New Roman', bold: true};

                let salesOrderLines = salesOrder.getLineCount('item');

                let row = [[]];
                row.pop();
                for (let i = 0; i < salesOrderLines; i++) {
                    let rowData = []
                    rowData.push(i + 1);
                    addItemLine(rowData, salesOrder, i);

                    row.push(rowData)
                }

                let tableStartRow = sheet1.lastRow.number;
                const table = sheet1.addTable({
                    name: 'MyTable',
                    ref: 'A12',
                    headerRow: true,
                    totalsRow: true,
                    style: {
                        theme: 'none',
                        showRowStripes: true,
                    },
                    columns: [
                        {name: 'STT', totalsRowLabel: 'Tổng '},
                        {name: 'Tên hàng', filterButton: true},
                        {name: 'Đặc tính quy cách',},
                        {name: 'Đơn vị tính', filterButton: true},
                        {name: 'Số lượng', totalsRowFunction: 'sum'},
                        {name: 'Đơn giá', filterButton: true},
                        {name: 'Thành tiền', totalsRowFunction: 'sum'},
                        {name: 'Ghi chú'},
                    ],
                    rows: row
                });

                sheet1.getRow(tableStartRow).eachCell(cell => {
                    cell.alignment = {vertical : 'center'};
                })

                const tableRange = table.table.tableRef; // E.g., 'A1:D3'
                const [startCell, endCell] = tableRange.split(':');
                sheet1.eachRow({includeEmpty: false}, (row, rowNumber) => {
                    if (rowNumber >= parseInt(startCell.match(/\d+/)[0]) && rowNumber <= parseInt(endCell.match(/\d+/)[0])) { // Apply only to the table rows
                        row.eachCell((cell) => {
                            cell.border = {
                                top: {style: 'thin'},
                                left: {style: 'thin'},
                                bottom: {style: 'thin'},
                                right: {style: 'thin'},
                            };
                        });
                    }
                });

                const lastRow = sheet1.lastRow;
                const lastTableRow = lastRow.number;

                for (let i = tableStartRow; i < lastTableRow; i++) {
                    let curRow = sheet1.getRow(i);
                    curRow.eachCell((cell) => {
                        cell.alignment = { vertical: 'middle' ,wrapText: true }
                    });
                }

                lastRow.eachCell({includeEmpty: true}, function (cell, colNumber) {
                    //console.log('Cell ' + colNumber + ' = ' + cell.value);
                    cell.border = {
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'},
                    };
                });

                lastRow.eachCell({includeEmpty: true}, function (cell, colNumber) {
                    //console.log('Cell ' + colNumber + ' = ' + cell.value);
                    cell.border = {
                        top: {style: 'thin'},
                        left: {style: 'thin'},
                        bottom: {style: 'thin'},
                        right: {style: 'thin'},
                    };
                });

                let currentRow = lastRow.number + 1;
                let index = currentRow;
                for (let i = 0; i < 14; i++) {
                    let currentCell = 'A' + index;
                    sheet1.mergeCells(currentCell, 'H' + index);
                    index += 1;
                }


                let soTienBangChu = salesOrder.getValue('custbody_scv_amount_in_word');
                setCell(sheet1, 'A' + currentRow, 'Số tiền bằng chữ: ', soTienBangChu, {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true
                })
                currentRow += 1;

                let dieuKienGia = salesOrder.getValue('custbody_scv_so_dkhh_dkg');
                setCell(sheet1, 'A' + currentRow, '1.1 Điều kiện giá: ', dieuKienGia, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;

                let dungSaiSoLuong = salesOrder.getValue('custbody_scv_so_dkhh_dssl');
                setCell(sheet1, 'A' + currentRow, '1.2 Dung sai số lượng: ', dungSaiSoLuong, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;

                let dongGoi = salesOrder.getValue('custbody_scv_so_dkhh_dg');
                setCell(sheet1, 'A' + currentRow, '1.3 Đóng gói: ', dongGoi, {size: 12, name: 'Times New Roman'})
                currentRow += 1;

                let tieuChuanSoLuong = salesOrder.getValue('custbody_scv_so_dkhh_tccl');
                setCell(sheet1, 'A' + currentRow, '1.4 Tiêu chuẩn chất lượng: ', tieuChuanSoLuong, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;


                setCell(sheet1, 'A' + currentRow, 'ĐIỀU 2: ĐIỀU KHOẢN GIAO HÀNG ', ' ', {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true
                })
                currentRow += 1;

                let thoiGianGiaoHang = salesOrder.getValue('shipdate');
                setCell(sheet1, 'A' + currentRow, '2.1 Thời gian giao hàng: Khoảng ngày ', thoiGianGiaoHang, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;

                let giaoHangTungPhan = salesOrder.getValue('custbody_scv_so_dkgh_ghtp');
                setCell(sheet1, 'A' + currentRow, '2.2 Giao hàng từng phần: ', giaoHangTungPhan, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;

                let phuongThucGiaoHang = salesOrder.getValue('custbody_scv_so_dkgh_ptgh');
                setCell(sheet1, 'A' + currentRow, '2.3 Phương thức giao hàng: ', phuongThucGiaoHang, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;


                setCell(sheet1, 'A' + currentRow, 'ĐIỀU 3: ĐIỀU KHOẢN THANH TOÁN ', ' ', {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true
                })
                currentRow += 1;

                let phuongThucThoiHanThanhToan = salesOrder.getValue('custbody_scv_so_dktt_pttt');
                setCell(sheet1, 'A' + currentRow, '3.1 Phương thức và thời hạn thanh toán:  ', phuongThucThoiHanThanhToan, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;


                let dongTienThanhToan = salesOrder.getValue('currency');
                setCell(sheet1, 'A' + currentRow, '3.2 Đồng tiền thanh toán:  ', dongTienThanhToan, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;

                let taiKhoanThanhToan = salesOrder.getValue('custbody_scv_so_dktt_tktt');
                setCell(sheet1, 'A' + currentRow, '3.3 Tài khoản thanh toán: ', taiKhoanThanhToan, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;

                let trachNhiemCuaBenMua = salesOrder.getValue('custbody_scv_so_dktt_trach_nhiem');
                setCell(sheet1, 'A' + currentRow, '3.4 Trách nhiệm của bên mua liên quan đến thanh toán: ', trachNhiemCuaBenMua, {
                    size: 12,
                    name: 'Times New Roman'
                })
                currentRow += 1;


                setCell(sheet1, 'A' + currentRow, 'ĐIỀU 3: ĐIỀU KHOẢN THANH TOÁN ', ' ', {
                    size: 12,
                    name: 'Times New Roman',
                    bold: true
                })
                currentRow += 1;

                const buffer = await workbook.xlsx.writeBuffer();
                saveAs(new Blob([buffer]), 'Hợp đống mua bán.xlsx');

            } catch (error) {
                console.error(error);
            }

        }

        const addItemLine = (row, salesOrder, i) => {
            row.push(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'item_display',
                line: i
            }));

            row.push(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'description',
                line: i
            }));

            row.push(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'units',
                line: i
            }));

            row.push(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                line: i
            }));

            row.push(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_scv_don_gia',
                line: i
            }))

            row.push(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_scv_thanh_tien',
                line: i
            }))

            row.push(salesOrder.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_scv_memo_2',
                line: i
            }))
        }

        const setCellAlignment = (worksheet, cells, position) => {
            for (let cell of cells) {
                worksheet.getCell(cell).alignment = {vertical: 'middle', horizontal: position};
            }
        }

        const setCell = (sheet, cell, infoText, data = ' ', fontObj) => {
            sheet.getCell(cell).value = {
                'richText': [
                    {font: fontObj, text: infoText},
                    {font: {name: 'Times New Roman', size: 12}, text: data}
                ]
            };
        }

        const setCellColor = (worksheet, cells, colorCode) => {
            for (let cell of cells) {
                worksheet.getCell(cell).fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: {argb: colorCode},
                };
            }
        }

        const exportPDF = (salesOrderId) => {
            let exportUrl = url.resolveScript({
                scriptId: 'customscript_scv_thh_sl_export_helper',
                deploymentId: 'customdeploy_scv_thh_sl_export_helper',
                returnExternalUrl: false,
                params: getParameters(salesOrderId)
            });
            window.open(exportUrl, '_blank');
        }

        const getParameters = (salesOrderId) => {
            let fieldLookUp = search.lookupFields({
                type: search.Type.SALES_ORDER,
                id: salesOrderId,
                columns: ['entity', 'custbody_scv_sales_contract', 'subsidiary'],
            })

            let customerId = fieldLookUp.entity[0].value;
            let contractId = fieldLookUp.custbody_scv_sales_contract[0].value;
            let subsidiaryId = fieldLookUp.subsidiary[0].value;

            return {
                templateId: 111,
                recordId: salesOrderId,
                recordType: 'salesorder',
                additionalRecords: JSON.stringify({
                    customer: customerId,
                    customrecord_scv_sales_contract: contractId,
                    subsidiary: subsidiaryId,
                })
            }
        }

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            let currentRecord = scriptContext.currentRecord;
            let exportType = currentRecord.getValue('custpage_export_field');
            let salesOrderId = currentRecord.getValue('custpage_sales_order_id');

            if (exportType === 'excel') {
                exportExcel(salesOrderId);
            } else {
                exportPDF(salesOrderId);
            }
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

        }

        return {
            pageInit: pageInit,
            exportExcel: exportExcel,
            exportPDF: exportPDF,
            // fieldChanged: fieldChanged,
            // postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            saveRecord: saveRecord
        };

    });
