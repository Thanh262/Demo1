/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],

function() {



    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    if (typeof ExcelJS === 'undefined') {
        //jQuery.getScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js');
        jQuery.getScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js')
    }
    if (typeof saveAs === "undefined") {
        jQuery.getScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');
    }

    const exportExcel = (id) => {
        //let currentRecord = crr.get();

        let salesOrder = record.load({
            type: record.Type.SALES_ORDER,
            id: id,
        });

        let contract = search.lookupFields({
            type: 'customrecord_scv_sales_contract',
            id: salesOrder.getValue('custbody_scv_sales_contract')
        })

        let entity = search.lookupFields({
            type: record.Type.CUSTOMER,
            id: salesOrder.getValue('entity'),
            columns: ['custentity_scv_legal_name', 'defaultaddress', 'phone', 'custentity_scv_contact_name', 'custentity_scv_position_st', '']
        });

        let subsidiary = search.lookupFields({
            type: record.Type.SUBSIDIARY,
            id: salesOrder.getValue('subsidiary'),
            columns: ['legalname', 'mainaddress_text', 'custrecord_scv_sub_phone'],
        });

        let workbook = new ExcelJS.Workbook();

        const sheet1 = workbook.addWorksheet('Hợp đồng mua bán', {
            pageSetup: {
                paperSize: 9,
                orientation: 'portrait'
            }
        });

        let mergeCellsList = ['A1:H1', 'E2:H2', 'E3:H3', 'A4:C4', 'E4:H4', 'A5:C5', 'E5:H5',
            'A6:C6', 'E6:C6', 'A7:C7', 'E7:C7', 'A8:C8', 'E8:C8',
            'A9:H9', 'A21:H21', 'A22:H22', 'A23:H23', 'A24:H24', 'A25:H25',
            'A27:H27', 'A28:H28', 'A29:H29', 'A31:H31', 'A34:H34', 'A32:H32', 'A33:H33',]

        for (let i = 0; i < mergeCellsList.length; i++) {
            sheet1.mergeCells(mergeCellsList[i]);
        }

        sheet1.columns = [
            {width: 5.7,style: {font: {name: 'Times New Roman', size: 12}}},
            {width: 23.7,style: {font: {name: 'Times New Roman', size: 12}}},
            {width: 23.7,style: {font: {name: 'Times New Roman', size: 12}}},
            {width: 7.6,style: {font: {name: 'Times New Roman', size: 12}}},
            {width: 11,style: {font: {name: 'Times New Roman', size: 12}}},
            {width: 14.4,style: {font: {name: 'Times New Roman', size: 12}}},
            {width: 16,style: {font: {name: 'Times New Roman', size: 12}}},
            {width: 12.5,style: {font: {name: 'Times New Roman', size: 12}}},
        ];

        sheet1.getCell('A1').font = {bold: true, size: 18};
        sheet1.getCell('A1').value = "HỢP ĐỒNG MUA BÁN";

        let hopDongSo = contract.name;
        let hopDongNgay = contract.custrecord_scv_sc_date;

        let benBan = subsidiary.legalname;
        let diaChiBenBan = subsidiary.mainaddress_text;
        let sdtBenBan = subsidiary.custrecord_scv_sub_phone;
        let nguoiDaiDienBenBan = salesOrder.getValue('custbody_scv_nguoi_dai_dien');
        let chucVuBenBan = salesOrder.getValue('custbody_scv_chuc_vu');

        let benMua = entity.custentity_scv_legal_name;
        let diaChiBenMua = entity.defaultaddress;
        let sdtBenMua = entity.phone;
        let nguoiDaiDienBenMua = entity.custentity_scv_contact_name;
        let chucVuBenMua = entity.custentity_scv_position_st;

        sheet1.getCell('E2').value = {
            'richText': [
                {font: {size: 11}, text: 'Số: '},
                {font: {size: 11}, text: hopDongSo}
            ]
        };

        sheet1.getCell('E3').value = {
            'richText': [
                {font: {size: 11}, text: 'Ngày:'},
                {font: {size: 11}, text: hopDongNgay}
            ]
        };

        setCell(sheet1, 'A4', 'Bên bán: ', benBan, {bold: true, italic: true, underline: true});
        setCell(sheet1, 'E4', 'Bên mua: ', benMua, {bold: true, italic: true, underline: true});

        setCell(sheet1, 'A5', 'Địa chỉ: ', diaChiBenBan, {bold: true});
        setCell(sheet1, 'E5', 'Địa chỉ: ', diaChiBenMua, {bold: true});

        setCell(sheet1, 'A6', 'Số điện thoại: ', sdtBenBan, {bold: true});
        setCell(sheet1, 'E6', 'Số điện thoại ', sdtBenMua, {bold: true});

        setCell(sheet1, 'A7', 'Người đại diện: ', nguoiDaiDienBenBan, {bold: true});
        setCell(sheet1, 'E7', 'Người đại diện: ', nguoiDaiDienBenMua, {bold: true});

        setCell(sheet1, 'A8', 'Chức vụ: ', chucVuBenBan, {bold: true});
        setCell(sheet1, 'E8', 'Chức vụ: ', chucVuBenMua, {bold: true});

        sheet1.getCell('A9').value = 'Hợp đồng này được thoả thuận bởi 2 bên, đồng ý mua và bán hàng hoá theo những điều khoản và điều kiện sau:';
        setCell(sheet1, 'A10', 'ĐIỀU 1 : HÀNG HOÁ VÀ GIÁ CẢ ', '', {font: {bold: true}});

        let tenMatHang = salesOrder.getValue('custbody_scv_so_name_of_goods');
        setCell(sheet1, 'A11', 'Tên mặt hàng: ', tenMatHang, {font: {bold: true}})

        let headerCells = ['A12', 'B12', 'C12', 'D12', 'E12','F12', 'G12', 'H12'];
        let colorCode = 'ffe6ff';
        setCellColor(sheet1, headerCells, colorCode);
        setCellAlignment(sheet1,headerCells,'center');
        sheet1.getRow(12).font = {bold: true};

        sheet1.getCell('A12').value = 'STT';
        sheet1.getCell('B12').value = 'Tên hàng';
        sheet1.getCell('C12').value = 'Đặc tính quy cách';
        sheet1.getCell('D12').value = 'Đơn vị tính';
        sheet1.getCell('E12').value = 'Số lượng';
        sheet1.getCell('F12').value = 'Đơn giá';
        sheet1.getCell('G12').value = 'Thành tiền';
        sheet1.getCell('H12').value = 'Ghi chú';

        for (let i = 0; i < salesOrder.getLineCount(); i++) {

            let row = [];
            row.push(i + 1);
            addItemLine(row, salesOrder, i);

            sheet1.addRow(row);
        }

        let tongSoLuong = salesOrder.getValue('custbody_scv_sum_quantity');
        let tongThanhTien = salesOrder.getValue('custbody_scv_total_amount');

        let row = [,,'Tổng',,tongSoLuong,,tongThanhTien];

        sheet1.addRows(row);


        let buffer = workbook.xlsx.writeBuffer()
        saveAs(new Blob([buffer]), 'result.xlsx');

    }

    const addItemLine = (row, salesOrder, i) =>{
        row.push(salesOrder.getSublistValue({
            sublistId : 'item',
            fieldId : 'item',
            line : i
        }));

        row.push(salesOrder.getSublistValue({
            sublistId : 'item',
            fieldId : 'description',
            line : i
        }));

        row.push(salesOrder.getSublistValue({
            sublistId : 'item',
            fieldId : 'units',
            line : i
        }));

        row.push(salesOrder.getSublistValue({
            sublistId : 'item',
            fieldId : 'quantity',
            line : i
        }));

        row.push(salesOrder.getSublistValue({
            sublistId : 'item',
            fieldId : 'custcol_scv_don_gia',
            line : i
        }))

        row.push(salesOrder.getSublistValue({
            sublistId : 'item',
            fieldId : 'custcol_scv_thanh_tien',
            line : i
        }))

        row.push(salesOrder.getSublistValue({
            sublistId : 'item',
            fieldId : 'custcol_scv_memo_2',
            line : i
        }))
    }

    const setCellAlignment = (worksheet, cells, position) => {
        for(let cell in cells) {
            worksheet.getCell(cell).alignment = { vertical: 'middle', horizontal: position };
        }
    }

    const setCell = (sheet, cell, infoText = '', data = '', fontObj) => {
        sheet.getCell(cell).value = {
            'richText': [
                {font: fontObj, text: infoText},
                {font: {size: 12}, text: data}
            ]
        };
    }

    const setCellColor = (worksheet, cells, colorCode) => {
        for (let cell in cells) {
            worksheet.getCell(cell).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: {argb: colorCode},
            };
        }
    }

    const s2ab = (s) => {
        let sL = s.length;
        let buf = new ArrayBuffer(sL);
        let view = new Uint8Array(buf);
        for (let i = 0; i < sL; i++) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }

    function pageInit(scriptContext) {
        let recordId = scriptContext.request.parameters.recordId;
        exportExcel();
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
        exportExcel : exportExcel,
        // pageInit: pageInit,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        // saveRecord: saveRecord
    };
    
});
