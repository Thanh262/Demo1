/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
        'N/render', 'N/search', 'N/record', 'N/query', 'N/config', '../lib/scv_lib_pdf.js'
    ],
    (
        render, search, record, query, config, libPdf,
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const renderRecordToPdfWithTemplate = (id, type, printfile) => {
            if (!printfile) throw "Chưa có setup file xml!";
            let renderer = libPdf.renderTemplateWithXml(printfile);
            let rec = addDefaultRecordRender(renderer, type, id);
            switch (printfile) {
                case "scv_render_ycbd_pdf":
                    printKHBD(rec, renderer, id); // Kế hoạch bảo dưỡng
                    break;
                case "scv_render_bbkt_pdf":
                    printPDGTS(rec, renderer, id); // Phiếu đánh giá tài sản
                    break;
                case "scv_render_scsc_pdf":
                    printPSCBD(rec, renderer, id); // Phiếu sửa chữa bảo dưỡng
                    break;

            }
            // let pdfFile = renderer.renderAsPdf();
            return renderer.renderAsPdf();
        }

        const printKHBD = (rec, renderer, id) => {
            let cmms_mp_date = rec.getValue('custrecord_scv_cmms_mp_date');
            let sublistId = 'recmachcustrecord_scv_cmms_mp_plan_l';
            let mp_date = ngaygioin(cmms_mp_date) || "Ngày ..... tháng ...... năm ......";
            let lineCnt = rec.getLineCount({sublistId: sublistId});
            let co_code, eq_code, asset_l_text;
            let rsPlanL = [];
            for (let i = 0; i < lineCnt; i++) {
                let asset_l = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_asset_l',
                    line: i
                });
                asset_l_text = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_asset_l',
                    line: i
                });
                let component_l = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_component_l',
                    line: i
                });
                let component_l_text = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_component_l',
                    line: i
                });
                if (component_l) {
                    let componentlkF = search.lookupFields({
                        type: 'customrecord_scv_cmms_component',
                        id: component_l,
                        columns: ['custrecord_scv_cmms_co_code']
                    })
                    co_code = componentlkF.custrecord_scv_cmms_co_code;
                }
                let equipment_l = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_equipment_l',
                    line: i
                });
                let equipment_l_text = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_equipment_l',
                    line: i
                });
                if (equipment_l) {
                    let componentlkF = search.lookupFields({
                        type: 'customrecord_scv_cmms_equipment',
                        id: equipment_l,
                        columns: ['custrecord_scv_cmms_eq_code']
                    })
                    eq_code = componentlkF.custrecord_scv_cmms_eq_code;
                }
                let type_l = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_type_l',
                    line: i
                });
                let description_l = rec.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_mp_description_l',
                    line: i
                });
                let slPlanL = {
                    asset_l_text: asset_l_text,
                    asset_l: asset_l,
                    component_l_text: component_l_text,
                    co_code: co_code,
                    equipment_l_text: equipment_l_text,
                    eq_code: eq_code,
                    type_l: type_l,
                    description_l: description_l,
                };
                rsPlanL.push(slPlanL);
            }
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "jsonData",
                data: {
                    id: id,
                    cmms_mp_date: mp_date,
                    rsPlanL: rsPlanL,
                    asset_l_text: asset_l_text

                }
            });
        }

        const printPDGTS = (rec, renderer, id) => {
            let name = rec.getValue('name');
            let tc_date_h = rec.getText('custrecord_scv_cmms_tc_date_h') || "..../..../20.....";
            let tc_opinion_h = rec.getValue('custrecord_scv_cmms_tc_opinion_h');
            let configLogo = `<img src="https://9684031.app.netsuite.com/core/media/media.nl?id=1&amp;c=9684031&amp;h=mcJr2ucgJbrnayY6oV79rxY8yajRdmcccapTT_sc5To_sjtx&amp;fcts=20240808031643&amp;whence=" alt="view" style="width: 88px; height: 88px;" />`;

            let objTC = {
                ten_ccdc: rec.getText('custrecord_scv_cmms_tc_item_h') || rec.getText('custrecord_scv_cmms_tc_asset_h'),
                tc_unit_h: rec.getText('custrecord_scv_cmms_tc_unit_h'),
                tc_quantity_h: rec.getValue('custrecord_scv_cmms_tc_quantity_h'),
                tc_curstatus_h: rec.getValue('custrecord_scv_cmms_tc_curstatus_h'),
                tc_noofcheck_h: rec.getValue('custrecord_scv_cmms_tc_noofcheck_h'),
                tc_age_h: rec.getValue('custrecord_scv_cmms_tc_age_h'),
                tc_deliverydate_h: rec.getText('custrecord_scv_cmms_tc_deliverydate_h'),
                tc_agecheck_h: rec.getValue('custrecord_scv_cmms_tc_agecheck_h'),
                tc_remainage_h: rec.getValue('custrecord_scv_cmms_tc_remainage_h'),
                tc_origincost_h: rec.getValue('custrecord_scv_cmms_tc_origincost_h'),
                tc_residualpercent_h: rec.getValue('custrecord_scv_cmms_tc_residualpercent_h'),
                tc_residualstatus_h: rec.getValue('custrecord_scv_cmms_tc_residualstatus_h'),
                tc_deprvalue_h: rec.getValue('custrecord_scv_cmms_tc_deprvalue_h'),
                tc_residualvalue_h: rec.getValue('custrecord_scv_cmms_tc_residualvalue_h'),
                tc_difference_h: rec.getValue('custrecord_scv_cmms_tc_difference_h'),
                tc_rewardamt_h: rec.getValue('custrecord_scv_cmms_tc_rewardamt_h'),
                tc_punchamt_h: rec.getValue('custrecord_scv_cmms_tc_punchamt_h'),
                tc_reason_h: rec.getValue('custrecord_scv_cmms_tc_reason_h')
            };


            let sublistId = 'recmachcustrecord_scv_cmms_tc_header_l';
            let lineCnt = rec.getLineCount({sublistId: sublistId});
            let rsHeader = [];
            for (let i = 0; i < lineCnt; i++) {
                let tc_employee_l = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_tc_employee_l',
                    line: i
                });
                let tc_position_l = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_tc_position_l',
                    line: i
                });
                let slHeader = {
                    tc_employee_l: tc_employee_l,
                    tc_position_l: tc_position_l,
                };
                rsHeader.push(slHeader);
            }
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "jsonData",
                data: {
                    id: id,
                    configLogo:configLogo,
                    rsHeader: rsHeader,
                    objTC: objTC,
                    name: name,
                    tc_date_h: tc_date_h,
                    tc_opinion_h: tc_opinion_h

                }
            });
        }

        const printPSCBD = (rec, renderer, id) => {
            let name = rec.getValue('name');
            let wo_equipment = rec.getValue('custrecord_scv_cmms_wo_equipment');
            let wo_asset = rec.getValue('custrecord_scv_cmms_wo_asset');
            let timeissue, mahieu_vitri, cassetdepartment, creator_department, pic_department, configLogo;
            if (wo_asset){
                let lkFasset = search.lookupFields({
                    type: 'customrecord_ncfar_asset',
                    id: wo_asset,
                    columns: ['custrecord_assetlocation', 'name', 'custrecord_assetdepartment']
                });
                let location = (lkFasset.custrecord_assetlocation || [])[0]?.text || '';
                let department = (lkFasset.custrecord_assetdepartment || [])[0]?.text || '';
                let assetlocation = escapeXML(location);
                cassetdepartment = escapeXML(department);
                let assetname = lkFasset.name;
                 mahieu_vitri = [assetname, assetlocation]
                    .filter(value => value)
                    .join(' / ');
            }

            let wo_creator = rec.getValue('custrecord_scv_cmms_wo_creator');
            let wo_pic = rec.getValue('custrecord_scv_cmms_wo_pic');
            if (wo_creator){
                let lkFDep = search.lookupFields({
                    type: 'employee',
                    id: wo_creator,
                    columns: ['department']
                });

                let rawDepartment = (lkFDep.department || [])[0]?.text || '';
                creator_department = escapeXML(rawDepartment);
            }
            if (wo_pic){
                let lkFDep = search.lookupFields({
                    type: 'employee',
                    id: wo_pic,
                    columns: ['department']
                });

                let rawDepartment = (lkFDep.department || [])[0]?.text || '';
                pic_department = escapeXML(rawDepartment);
            }
            let wo_timeissue = rec.getText('custrecord_scv_cmms_wo_timeissue');
            if (wo_timeissue) {
                let parts = wo_timeissue.split(' ');
                let date = parts[0];
                let time = parts[1].split(':');
                let hour = time[0];
                let minute = time[1];
                 timeissue = date + ' ' + hour + ' giờ ' + minute + ' phút';
            }
            let wo_actualfromtime = rec.getText('custrecord_scv_cmms_wo_actualfromtime');
            let wo_actualtotime = rec.getText('custrecord_scv_cmms_wo_actualtotime');
            let actualtotime = formatTimeToVietnamese(wo_actualtotime);
            let actualfromtime = formatTimeToVietnamese(wo_actualfromtime);

            let wo_subsidiary = rec.getValue('custrecord_scv_cmms_wo_subsidiary');
      if (wo_subsidiary) {
          let recSub = record.load({
              type: 'subsidiary',
              id: wo_subsidiary,
          });
          let logo = recSub.getValue('logo') || recSub.getValue('pagelogo')
          if (logo) {
               configLogo = libPdf.createImageBySubsidiary(logo, 88, 88)
          } else {
               configLogo = `<img src="https://9684031.app.netsuite.com/core/media/media.nl?id=1&amp;c=9684031&amp;h=mcJr2ucgJbrnayY6oV79rxY8yajRdmcccapTT_sc5To_sjtx&amp;fcts=20240808031643&amp;whence=" alt="view" style="width: 88px; height: 88px;" />`;
          }
      }
            let sublistId = 'recmachcustrecord_scv_cmms_bg_wo';
            let lineCnt = rec.getLineCount({sublistId: sublistId});
            let rsBGWO = [];
            for (let i = 0; i < lineCnt; i++) {
                let bg_actualitem = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_bg_actualitem',
                    line: i
                });
                let bg_unit = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_bg_unit',
                    line: i
                });
                let bg_actualquantity = rec.getSublistText({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_cmms_bg_actualquantity',
                    line: i
                });
                let slBGWO = {
                    stt: i + 1,
                    bg_actualitem: bg_actualitem,
                    bg_unit: bg_unit,
                    bg_actualquantity: bg_actualquantity,
                };
                rsBGWO.push(slBGWO);
            }
            log.error('rsBGWO', rsBGWO);
            renderer.addCustomDataSource({
                format: render.DataSource.OBJECT,
                alias: "jsonData",
                data: {
                    id: id,
                    rsBGWO: rsBGWO,
                    configLogo:configLogo,
                    creator_department: creator_department,
                    pic_department: pic_department,
                    cassetdepartment: cassetdepartment,
                    mahieu_vitri: mahieu_vitri,
                    actualfromtime: actualfromtime || ".....giờ.....phút",
                    actualtotime: actualtotime || ".....giờ.....phút",
                    timeissue: timeissue || ".....giờ.....phút",
                    wo_timeissue: wo_timeissue,
                    // tc_date_h: tc_date_h,
                    // tc_opinion_h: tc_opinion_h

                }
            });
        }

        function formatTimeToVietnamese(timeString) {
            if (!timeString) return '';
            const cleanedTimeString = timeString.replace(/:\d{2}$/, '').trim();
            const match = cleanedTimeString.match(/^(\d{1,2}):(\d{2})\s?(am|pm)$/i);
            if (!match) return '';
            let hour = parseInt(match[1], 10);
            const minute = match[2];
            const period = match[3].toLowerCase();
            if (period === 'pm' && hour !== 12) {
                hour += 12;
            } else if (period === 'am' && hour === 12) {
                hour = 0;
            }
            return `${hour} giờ ${minute} phút`;
        }

        const addDefaultRecordRender = (renderer, type, id) => {
            let rec = record.load({
                type: type,
                id: id,
                isDynamic: false
            });
            renderer.addRecord('record', rec);
            return rec;
        }


        function ngaygioin(trandate) {
            let timezoneOffset = trandate.getTimezoneOffset() / 60;
            trandate.setHours(trandate.getHours() + timezoneOffset + 7);
            let dd_now = String(trandate.getDate()).padStart(2, '0');
            let mm_now = String(trandate.getMonth() + 1).padStart(2, '0');
            let yyyy_now = trandate.getFullYear();
            // let hh_now = String(trandate.getHours()).padStart(2, '0');
            // let minutes_now = String(trandate.getMinutes()).padStart(2, '0');
            // let vietnamTime = dd_now + '/' + mm_now + '/' + yyyy_now + ' ' + hh_now + ':' + minutes_now;
            let ngaythangnam = 'Ngày ' + dd_now + ' tháng ' + mm_now + ' năm ' + yyyy_now;
            return ngaythangnam;
        }

        function escapeXML(value) {
            if (!value) return '';
            return value
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/'/g, '&apos;')
                .replace(/"/g, '&quot;');
        }

        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let response = scriptContext.response;
            let params = request.parameters;

            let pdfFile = renderRecordToPdfWithTemplate(params.id, params.type, params.printfile);
            response.writeFile(pdfFile, true);

        }

        return {
            onRequest,
            renderRecordToPdfWithTemplate
        }

    });