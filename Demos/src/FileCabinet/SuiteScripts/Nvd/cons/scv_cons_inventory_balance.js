/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  29 Nov 2024         Phu Pham			    Init, create file.
 */
define(['N/url'],
    function(url) {

        const getDataSetupRecord = (recType) => {
            let data = [
                {
                    type: "workorder", sublist: "item", 
                    itemField: "item", locationField: "location",
                    serialSelected: "custcol_scv_lot_serial_selected", serialCode: "custcol_scv_qc_serial_code"
                },
                {
                    type: "workorder", sublist: "recmachcustrecord_scv_lift_mat_wo_related",
                    itemField: "custrecord_scv_lift_mat_item", locationField: "recmachcustrecord_scv_lift_mat_wo_related.custrecord_scv_lift_mat_location",
                    serialSelected: "custrecord_scv_lift_mat_lot_serial", serialCode: "custrecord_scv_lift_mat_qc_material"
                },
            ];
            let arrResult = data.filter(e => e.type === recType);
            return arrResult;
        };

        const addButtonSelectLotOnMachineRow = (curRec) => {
            let arrSetup = getDataSetupRecord(curRec.type);
            for(let i = 0; i < arrSetup.length; i++) {
                let sublistId = arrSetup[i].sublist;
                let cellIndex = arrSetup[i].cellIndex;

                const sublistButtons = document.getElementById(sublistId + "_buttons");
                if(!sublistButtons) continue;
                let curRow = sublistButtons.querySelector("table tr");
                
                cellIndex = cellIndex || (curRow.cells.length - 1);
                let cell = curRow.insertCell(cellIndex);
                let inputElement = createCellElement(cell, sublistId);
                let parentElement = inputElement.parentElement;

                inputElement.addEventListener("mouseover",  () => {
                    parentElement.style.setProperty("background-color", "#E8E8E8", "important");
                });
                inputElement.addEventListener("mouseleave",  () => {
                    parentElement.style.setProperty("background-color", "#F2F2F2", "important");
                });
                inputElement.addEventListener("click", (e) => {
                    let line_number = nlapiGetCurrentLineItemIndex(sublistId);

                    let location = "";
                    let partsLocation = arrSetup[i].locationField.split(".");
                    if(partsLocation.length > 1) {
                        location = curRec.getCurrentSublistValue(partsLocation[0], partsLocation[1]);
                    } else {
                        location = curRec.getValue(arrSetup[i].locationField);
                    }
                    
                    let item = curRec.getCurrentSublistValue(sublistId, arrSetup[i].itemField);
                    
                    if(!item) {
                        return alert("Vui lòng nhập Item để thực hiện chức năng này!");
                    }
                    if(!location) {
                        return alert("Vui lòng nhập Location để thực hiện chức năng này!");
                    }
                    let urlScript = url.resolveScript({
                        scriptId: 'customscript_scv_sl_popup_inv_balance',
                        deploymentId: 'customdeploy_scv_sl_popup_inv_balance',
                        returnExternalUrl: false,
                        params: {
                            line_number, location, item, sublistId,
                            recType: curRec.type
                        }
                    });
                    nlExtOpenWindow(urlScript, 'popupInvBalance', window.innerWidth - 400, window.innerHeight - 300, this, true, "Inventory Balance");
                });
            }
        }

        const createCellElement = (cell, sublistId) => {
            let inputId = sublistId + "_select_lot";

            let inputStyle = "color: #333 !important; font-size: 13px !important; padding: 0px 8px !important;";
            let bntBgCustom = "background: #F2F2F2 !important; border-radius: 3px; border: 1px solid #B2B2B2 !important;";
            cell.innerHTML = `
                <table class="machBnt" id="tbl_${inputId}" cellpadding="0" cellspacing="0" border="0" style="cursor:hand;" role="presentation">
                    <tbody>
                        <tr>
                            <td class="bntBgB" style="${bntBgCustom}" valign="top">
                                <input type="button" style="${inputStyle}" class="rndbuttoninpt bntBgT" value="Select Lot" id="${inputId}" name="${inputId}"/>
                            </td>
                        </tr>
                    </tbody>
                </table>`;
            
            return document.getElementById(inputId);
        }

        const onSubmitPopupInvBalance = (scriptContext) => {
            let curRec = scriptContext.currentRecord;
            let line_number = curRec.getValue("custpage_line") * 1;
            let sublistId = curRec.getValue("custpage_sublistid");
            let rectype = curRec.getValue("custpage_rectype");

            let objSelect = getDataSelected(curRec);
            if(objSelect.isSelected === false) {
                return alert("Vui lòng chọn line để thực hiện!");
            }

            let arrSetup = getDataSetupRecord(rectype);
            let objSetup = arrSetup.find(e => e.sublist == sublistId);

            window.parent.nlapiSelectLineItem(sublistId, line_number);
            window.parent.nlapiSetCurrentLineItemValue(sublistId, objSetup.serialSelected, objSelect.lot_number || "");
            window.parent.nlapiSetCurrentLineItemValue(sublistId, objSetup.serialCode, objSelect.serial_code || "");
            closePopup(true);
        }

        const getDataSelected = (curRec) => {
            let objRes = {
                isSelected: false
            };
            let sublistId = "custpage_sl_result";
            let lc = curRec.getLineCount(sublistId);
            for(let i = 0; i < lc; i++) {
                let isSelect = curRec.getSublistValue(sublistId, "custpage_col_0", i);
                if(isSelect === "T") {
                    objRes.isSelected = true;
                    objRes.lot_number = curRec.getSublistValue(sublistId, "custpage_col_2", i);
                    objRes.serial_code = curRec.getSublistValue(sublistId, "custpage_col_1", i);
                    break;
                }
            }
            return objRes;
        }

        return {
            getDataSetupRecord,
            addButtonSelectLotOnMachineRow,
            onSubmitPopupInvBalance
        };
        
    });
    