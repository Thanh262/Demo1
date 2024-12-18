/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/file'],

    (record, search, file) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let parameters = scriptContext.request.parameters;
            let templateId = parameters.templateId;
            let recordId = parameters.recordId;
            //let fileId = `../xlsx/${templateId}.xlsx`;
            let fileId = 'SuiteScripts/Demo1/xlsx/scv_xlsx_export_transfer_order.xlsx';

            let objFile = file.load({id: fileId});
            let fileUrl = objFile.url;
            let objResponse = {data: {}, templateUrl: fileUrl}
            try {
                objResponse.data = getTransferOrderData(recordId);
                scriptContext.response.setHeader({
                    name: 'Content-Type',
                    value: 'application/json'
                });
                scriptContext.response.write(JSON.stringify(objResponse))
            } catch (err) {
                scriptContext.response.write(JSON.stringify(objResponse))
            }
        }

        const getTransferOrderData = (recordId) => {
            let transferOrderRecord = record.load({
                type: record.Type.TRANSFER_ORDER, id: recordId
            });
            let headerData = getTemplateHeaderData(transferOrderRecord);
            let {itemsData, tongSoLuongYC, tongSoLuongThuc} = getItemsData(transferOrderRecord);
            return {
                headerData: headerData,
                items: itemsData,
                tongSoLuongYC: tongSoLuongYC,
                tongSoLuongThuc: tongSoLuongThuc
            };
        }

        const getTemplateHeaderData = (transferOrderRecord) => {
            let legalname = getSubsidiaryData(transferOrderRecord.getValue('subsidiary'));
            let mainaddress_text = getLocationData(transferOrderRecord.getValue('location'));
            mainaddress_text = richTextToPlainText(mainaddress_text);
            let trandate = transferOrderRecord.getValue('trandate');
            trandate = formatVietnameseDate(trandate);
            let tranid = transferOrderRecord.getValue('tranid');
            let employee = transferOrderRecord.getText('custbody_scv_vpr_employee');
            let memo = transferOrderRecord.getText('memo');
            let location = transferOrderRecord.getText('location');
            let transferlocation = transferOrderRecord.getText('transferlocation');
            let department = transferOrderRecord.getText('department');

            return {
                legalname: legalname,
                mainaddress_text: mainaddress_text,
                trandate: trandate,
                tranid: tranid,
                employee: employee,
                memo: memo,
                location: location,
                transferlocation: transferlocation,
                department: department
            }
        }

        const formatVietnameseDate = (date) => {
            // Ensure the input is a valid Date object
            if (!(date instanceof Date) || isNaN(date)) {
                throw new Error("Invalid Date");
            }

            // Extract day, month, and year
            const day = date.getDate();
            const month = date.getMonth() + 1; // getMonth() is zero-based
            const year = date.getFullYear();

            // Format the date as "Ngày ... tháng ... năm ..."
            return `Ngày ${day} tháng ${month} năm ${year}`;
        }

        const getSubsidiaryData = (subsidiaryId) => {
            let subsidiaryData = search.lookupFields({
                type: search.Type.SUBSIDIARY, id: subsidiaryId, columns: ['legalname']
            });
            return subsidiaryData.legalname;
        }

        const getLocationData = (locationId) => {
            let locationRecord = record.load({
                type: record.Type.LOCATION, id: locationId,
            })
            let mainaddress_text = locationRecord.getValue('mainaddress_text');
            return mainaddress_text;
        }

        const getItemsData = (transferOrderRecord) => {
            let recordStatus = transferOrderRecord.getValue('status');

            switch (recordStatus) {
                case 'Received':
                case 'Partially Fulfilled':
                    return getItemsDataViaItemFulfillments(transferOrderRecord);

                case 'Pending Approval':
                case 'Pending Fulfillment':
                    return getItemsDataOnRecord(transferOrderRecord);

                case 'Rejected':
                    break;
            }
        }

        const getItemsDataViaItemFulfillments = (transferOrderRecord) => {
            let linksLineCount = transferOrderRecord.getLineCount('links');
            let items = []
            let sum = {tongSoLuongYc: 0, tongSoLuongThuc: 0}

            for (let line = 0; line < linksLineCount; line++) {
                let linkType = transferOrderRecord.getSublistValue('links', 'type', line)
                if (linkType === 'Item Fulfillment') {
                    let itemFulfillmentId = transferOrderRecord.getSublistValue('links', 'id', line)
                    let itemFulfillmentRec = record.load({
                        type: record.Type.ITEM_FULFILLMENT,
                        id: itemFulfillmentId
                    })
                    prepareAndAddItemLines(itemFulfillmentRec, items, sum)
                }
            }
            return {itemsData: items, tongSoLuongYc: sum.tongSoLuongYc, tongSoLuongThuc: sum.tongSoLuongThuc}
        }

        const prepareAndAddItemLines = (itemFulfillmentRec, items, tong) => {
            let itemLines = itemFulfillmentRec.getLineCount('item')
            for (let line = 0; line < itemLines.length; line++) {
                let inventoryDetailSubRec = itemFulfillmentRec.getSublistSubrecord('item', 'inventorydetail', line);
                let itemCode = itemFulfillmentRec.getSublistValue('item', 'custcol_scv_tc_item_code', line)
                let unit_display = itemFulfillmentRec.getSublistValue('item', 'unit_display', line)
                let item_display = itemFulfillmentRec.getSublistValue('item', 'itemname', line)
                let quantity = itemFulfillmentRec.getSublistValue('item', 'quantity', line)
                let custcol_scv_memo = itemFulfillmentRec.getSublistValue('item', 'custcol_scv_memo', line)

                addItemLinesToItems(inventoryDetailSubRec, items, itemCode, unit_display, item_display, quantity, custcol_scv_memo, tong)
            }
        }

        const addItemLinesToItems = (inventoryDetailSubRec, items, itemCode, unit_display, item_display, quantity, custcol_scv_memo, tong) => {
            let inventoryAssignmentLines = inventoryDetailSubRec.getLineCount('inventoryassignment');
            for (let line = 0; line < inventoryAssignmentLines.length; line++) {
                let itemLine = {}
                itemLine.stt = line + 1
                itemLine.itemCode = itemCode
                itemLine.item_display = item_display
                itemLine.unit_display = unit_display
                itemLine.serialLot = inventoryDetailSubRec.getSublistValue('inventoryassignment', 'issueinventorynumber', line)
                itemLine.seriMau = getSeriMau(itemLine.serialLot)
                itemLine.quantity = quantity
                itemLine.itemFfm = inventoryDetailSubRec.getSublistValue('inventoryassignment', 'quantity', line)
                itemLine.status = inventoryDetailSubRec.getSublistValue('inventoryassignment', 'status', line)
                itemLine.custcol_scv_memo = custcol_scv_memo

                tong.tongSoLuongYC += itemLine.quantity;
                tong.tongSoLuongThuc += itemLine.itemFfm;
                items.push(itemLine);
            }
        }

        const getSeriMau = (serialId) => {
            let inventoryNumberSearch = search.lookupFields({
                type: search.Type.INVENTORY_NUMBER,
                id: serialId,
                columns: ['custitemnumber_scv_item_num_color_seri'],
            })

            return inventoryNumberSearch.custitemnumber_scv_item_num_color_seri;
        }

        const getItemsDataOnRecord = (transferOrderRecord) => {

        }

        const richTextToPlainText = (richText) => {
            if (!richText) return '';
            let text = richText.replace(/\n/g, ' ');
            return text.trimEnd();
        }
        return {onRequest}
    });
