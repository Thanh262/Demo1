/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(
    ['N/file', 'N/encode', 'N/record', 'N/search', '../lib/scv_lib_function.js',
        '../olib/lodash.min', 'N/render'
    ],
    function (file, encode, record, search, lfunc, _, render
    ) {

        function onRequest(context) {
            let request = context.request;
            let parameters = request.parameters;
            if (request.method === 'GET') {
                let dataHeader = getDataHeader(parameters);
                let dataDetail = getDataDetail(parameters);

                if (parameters.hasOwnProperty("isPrint") && parameters.isPrint === "T") {
                    let fileObj = onRenderPdf(parameters, dataHeader, dataDetail);
                    fileObj.name = "BS report.pdf";
                    context.response.writeFile(fileObj, true);
                    return;
                }
                let templatePath = '../xml/fs_report/scv_fs_bs.xml';
                let namefile = 'BS Report.xls';
                let fileObject = file.load({id: templatePath});
                let content = fileObject.getContents();
                content = content.replace(/{pSubsidiary}/gi, dataHeader.SubName);
                content = content.replace(/{pAddress}/gi, dataHeader.SubAddress);
                content = content.replace(/{pCurTodate}/gi, dataHeader.CurrentDate);

                content = content.replace(/{socuoinam}/gi, parameters.custpage_curtodt);
                content = content.replace(/{sodaunam}/gi, parameters.custpage_beftodt);
                for (let idx_maso = 0; idx_maso < dataDetail.length; idx_maso++) {
                    content = content.replace("{pCur_" + dataDetail[idx_maso].maso + "}", Number(dataDetail[idx_maso].amtCur));
                    content = content.replace("{pBef_" + dataDetail[idx_maso].maso + "}", Number(dataDetail[idx_maso].amtBef));
                }
                let f = file.create({
                    name: namefile,
                    fileType: file.Type.XMLDOC,
                    contents: content,
                    encoding: file.Encoding.UTF8,
                });
                context.response.writeFile(f, false);
            }
        }

        function onRenderPdf(parameters, dataHeader, dataDetail) {
            let content = file.load("../xml/pdf/scv_render_rp_bcdkt_pdf.xml").getContents();
            content = content
                .replace(/{pSubsidiary}/gi, dataHeader.SubName)
                .replace(/{pAddress}/gi, dataHeader.SubAddress)
                .replace(/{pCurTodate}/gi, dataHeader.CurrentDate)
                .replace(/{socuoinam}/gi, parameters.custpage_curtodt)
                .replace(/{sodaunam}/gi, parameters.custpage_beftodt);
            let listSumCalc = {
                "0": {
                    '411': ['411a', '411b'],
                    '421': ['421a', '421b'],
                },
                "1": {
                    '110': ['111', '112'],
                    '120': ['121', '122', '123'],
                    '130': ['131', '132', '133', '134', '135', '136', '137', '139'],
                    '140': ['141', '149'],
                    '150': ['151', '152', '153', '154', '155'],

                    '210': ['211', '212', '213', '214', '215', '216', '219'],
                    '220': ['221', '222', '223', '224', '225', '226', '227', '228', '229'],
                    '230': ['231', '232'],
                    '240': ['241', '242'],
                    '250': ['251', '252', '253', '254', '255'],
                    '260': ['261', '262', '263', '268'],

                    '310': ['311', '312', '313', '314', '315', '316', '317', '318', '319', '320', '321', '322', '323', '324'],
                    '330': ['331', '332', '333', '334', '335', '336', '337', '338', '339', '340', '341', '342', '343'],

                    '410': ['411', '412', '413', '414', '415', '416', '417', '418', '419', '420', '421', '422'],
                    '430': ['431', '432'],
                },
                "2": {
                    '100': ['110', '120', '130', '140', '150'],
                    '200': ['210', '220', '230', '240', '250', '260'],
                    '300': ['310', '330'],
                    '400': ['410', '430'],
                },
                "3": {
                    '440': ['300', '400'],
                    '270': ['100', '200']
                }
            }
            let listMaSoVal = dataDetail.reduce((pre, curr) => ({
                ...pre,
                [curr.maso]: {amtCur: curr.amtCur, amtBef: curr.amtBef}
            }), {})
            for (let iLv = 0; iLv < 4; iLv++) {
                const level = iLv.toString();
                Object
                    .entries(listSumCalc[level])
                    .forEach(([root, listChild]) =>
                        listMaSoVal[root] = listChild.reduce((sum, maso) => {
                            sum.amtCur += listMaSoVal[maso].amtCur;
                            sum.amtBef += listMaSoVal[maso].amtBef;
                            return sum;
                        }, {amtCur: 0, amtBef: 0}))
            }
            Object.entries(listMaSoVal).forEach(([maso, obj]) => content = content.replace(`{pCur_${maso}}`, changeCurrency(obj.amtCur)).replace(`{pBef_${maso}}`, changeCurrency(obj.amtBef)));
            return render.xmlToPdf({xmlString: content});
        }

        function getDataHeader(_params) {
            let subsidiary = _params.custpage_subsidiary;
            let infoSub = getInfoSub(subsidiary.split(",")[0]);
            return {
                SubName: infoSub.SubName,
                SubAddress: infoSub.SubAddress,
                CurrentDate: _params.curtodt_header
            };
        }

        function getInfoSub(subId) {
            let lkSub = search.lookupFields({
                type: search.Type.SUBSIDIARY,
                id: subId,
                columns: ["legalname", "address.address"]
            });
            return {SubName: lkSub.legalname || '', SubAddress: lkSub['address.address'] || ''};
        }

        function getDataDetail(_params) {
            let myData = [];
            let myDataCur = getDataDetailCur(_params);
            let myDataBef = getDataDetailBef(_params);
            let arrMaSo = getListMaSo();
            for (let i = 0; i < arrMaSo.length; i++) {
                let objData = {
                    maso: arrMaSo[i].maso,
                    amtCur: 0,
                    amtBef: 0
                };
                let objCur = findByMaSo(myDataCur, objData.maso);// myDataCur.find(e => e.maso == objData.maso);
                let objBef = findByMaSo(myDataBef, objData.maso);//myDataBef.find(e => e.maso == objData.maso);
                if (lfunc.isContainValue(objCur)) objData.amtCur = Number(objCur.amt) * arrMaSo[i].factor;
                if (lfunc.isContainValue(objBef)) objData.amtBef = Number(objBef.amt) * arrMaSo[i].factor;
                myData.push(objData);
            }
            return myData;
        }

        function getDataDetailCur(_params) {
            let resultSearch = search.load("customsearch_scv_report_bs");
            let myFilter = resultSearch.filters;
            if (lfunc.isContainValue(_params.custpage_subsidiary)) {
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: _params.custpage_subsidiary.split(","),
                }));
            }

            if (lfunc.isContainValue(_params.custpage_curtodt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_curtodt
                }));
            }
            return getEleDataResultSavedSearch(resultSearch);
        }

        function getEleDataResultSavedSearch(searchObj) {
            let myColumns = searchObj.columns;
            let resultSearch = searchObj.runPaged({pageSize: 1000});
            let myData = [];
            const lRP = resultSearch.pageRanges.length;
            for (let i = 0; i < lRP; i++) {
                let dataPage = resultSearch.fetch(i).data;
                for (let idx in dataPage) {
                    let obj = {};
                    const chitieu = dataPage[idx].getValue(myColumns[0]);
                    obj.maso = chitieu.substr(0, chitieu.indexOf("-")).trim();
                    obj.amt = Number(dataPage[idx].getValue(myColumns[1]));
                    myData.push(obj);
                }
            }
            return myData;
        }

        function getDataDetailBef(_params) {
            let resultSearch = search.load("customsearch_scv_report_bs");
            let myFilter = resultSearch.filters;
            if (lfunc.isContainValue(_params.custpage_subsidiary)) {
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: _params.custpage_subsidiary.split(","),
                }));
            }
            if (lfunc.isContainValue(_params.custpage_beftodt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.BEFORE,
                    values: _params.custpage_beftodt
                }));
            }
            return getEleDataResultSavedSearch(resultSearch);
        }

        function getListMaSo() {
            return [
                {maso: "100", factor: 1, chitieu: "A - TÀI SẢN NGẮN HẠN"},
                {maso: "110", factor: 1, chitieu: "I. Tiền và các khoản tương đương tiền"},
                {maso: "111", factor: -1, chitieu: "1. Tiền "},
                {maso: "112", factor: -1, chitieu: "2. Các khoản tương đương tiền"},
                {maso: "120", factor: 1, chitieu: "II. Đầu tư tài chính ngắn hạn"},
                {maso: "121", factor: -1, chitieu: "1. Chứng khoán kinh doanh"},
                {maso: "122", factor: -1, chitieu: "2. Dự phòng giảm giá chứng khoán kinh doanh (*)"},
                {maso: "123", factor: -1, chitieu: "3. Đầu tư nắm giữ đến ngày đáo hạn"},
                {maso: "130", factor: 1, chitieu: "III. Các khoản phải thu ngắn hạn"},
                {maso: "131", factor: -1, chitieu: "1. Phải thu ngắn hạn của khách hàng "},
                {maso: "132", factor: -1, chitieu: "2. Trả trước cho người bán ngắn hạn"},
                {maso: "133", factor: -1, chitieu: "3. Phải thu nội bộ ngắn hạn"},
                {maso: "134", factor: -1, chitieu: "4. Phải thu theo tiến độ kế hoạch hợp đồng xây dựng"},
                {maso: "135", factor: -1, chitieu: "5. Phải thu về cho vay ngắn hạn"},
                {maso: "136", factor: -1, chitieu: "6. Phải thu ngắn hạn khác"},
                {maso: "137", factor: -1, chitieu: "7. Dự phòng phải thu ngắn hạn khó đòi (*)"},
                {maso: "139", factor: -1, chitieu: "8. Tài sản thiếu chờ xử lý"},
                {maso: "140", factor: 1, chitieu: "IV. Hàng tồn kho"},
                {maso: "141", factor: -1, chitieu: "1. Hàng tồn kho"},
                {maso: "149", factor: -1, chitieu: "2. Dự phòng giảm giá hàng tồn kho (*)"},
                {maso: "150", factor: 1, chitieu: "V. Tài sản ngắn hạn khác"},
                {maso: "151", factor: -1, chitieu: "1. Chi phí trả trước ngắn hạn "},
                {maso: "152", factor: -1, chitieu: "2. Thuế GTGT được khấu trừ"},
                {maso: "153", factor: -1, chitieu: "3. Thuế và các khoản khác phải thu Nhà nước"},
                {maso: "154", factor: -1, chitieu: "4. Giao dịch mua bán lại trái phiếu Chính phủ"},
                {maso: "155", factor: -1, chitieu: "5. Tài sản ngắn hạn khác"},
                {maso: "200", factor: 1, chitieu: "B - TÀI SẢN DÀI HẠN"},
                {maso: "210", factor: 1, chitieu: "I. Các khoản phải thu dài hạn "},
                {maso: "211", factor: -1, chitieu: "1. Phải thu dài hạn của khách hàng"},
                {maso: "212", factor: -1, chitieu: "2. Trả trước cho người bán dài hạn"},
                {maso: "213", factor: -1, chitieu: "3. Vốn kinh doanh ở đơn vị trực thuộc"},
                {maso: "214", factor: -1, chitieu: "4. Phải thu nội bộ dài hạn"},
                {maso: "215", factor: -1, chitieu: "5. Phải thu về cho vay dài hạn"},
                {maso: "216", factor: -1, chitieu: "6. Phải thu dài hạn khác"},
                {maso: "219", factor: -1, chitieu: "7. Dự phòng phải thu dài hạn khó đòi (*)"},
                {maso: "220", factor: 1, chitieu: "II. Tài sản cố định"},
                {maso: "221", factor: 1, chitieu: "1. Tài sản cố định hữu hình"},
                {maso: "222", factor: -1, chitieu: "      - Nguyên giá"},
                {maso: "223", factor: -1, chitieu: "      - Giá trị hao mòn luỹ kế (*)"},
                {maso: "224", factor: 1, chitieu: "2. Tài sản cố định thuê tài chính"},
                {maso: "225", factor: -1, chitieu: "      - Nguyên giá"},
                {maso: "226", factor: -1, chitieu: "      - Giá trị hao mòn luỹ kế (*)"},
                {maso: "227", factor: 1, chitieu: "3. Tài sản cố định vô hình"},
                {maso: "228", factor: -1, chitieu: "      - Nguyên giá"},
                {maso: "229", factor: -1, chitieu: "      - Giá trị hao mòn luỹ kế (*)"},
                {maso: "230", factor: 1, chitieu: "III. Bất động sản đầu tư"},
                {maso: "231", factor: -1, chitieu: "      - Nguyên giá"},
                {maso: "232", factor: -1, chitieu: "      - Giá trị hao mòn luỹ kế (*)"},
                {maso: "240", factor: 1, chitieu: "IV. Tài sản dở dang dài hạn "},
                {maso: "241", factor: -1, chitieu: "1. Chi phí sản xuất, kinh doanh dở dang dài hạn "},
                {maso: "242", factor: -1, chitieu: "2. Chi phí xây dựng cơ bản dở dang"},
                {maso: "250", factor: 1, chitieu: "V. Đầu tư tài chính dài hạn"},
                {maso: "251", factor: -1, chitieu: "1. Đầu tư vào công ty con "},
                {maso: "252", factor: -1, chitieu: "2. Đầu tư vào công ty liên doanh, liên kết"},
                {maso: "253", factor: -1, chitieu: "3. Đầu tư góp vốn vào đơn vị khác"},
                {maso: "254", factor: -1, chitieu: "4. Dự phòng đầu tư tài chính dài hạn (*)"},
                {maso: "255", factor: -1, chitieu: "5. Đầu tư nắm giữ đến ngày đáo hạn"},
                {maso: "260", factor: 1, chitieu: "VI. Tài sản dài hạn khác"},
                {maso: "261", factor: -1, chitieu: "1. Chi phí trả trước dài hạn"},
                {maso: "262", factor: -1, chitieu: "2. Tài sản thuế thu nhập hoãn lại"},
                {maso: "263", factor: -1, chitieu: "3. Thiết bị, vật tư, phụ tùng thay thế dài hạn"},
                {maso: "268", factor: -1, chitieu: "4. Tài sản dài hạn khác"},
                {maso: "270", factor: 1, chitieu: "TỔNG CỘNG TÀI SẢN (270 = 100 + 200)"},
                {maso: "300", factor: 1, chitieu: "C - NỢ PHẢI TRẢ"},
                {maso: "310", factor: 1, chitieu: "I. Nợ ngắn hạn"},
                {maso: "311", factor: 1, chitieu: "1. Phải trả người bán ngắn hạn"},
                {maso: "312", factor: 1, chitieu: "2. Người mua trả tiền trước ngắn hạn"},
                {maso: "313", factor: 1, chitieu: "3. Thuế và các khoản phải nộp Nhà nước"},
                {maso: "314", factor: 1, chitieu: "4. Phải trả người lao động"},
                {maso: "315", factor: 1, chitieu: "5. Chi phí phải trả ngắn hạn"},
                {maso: "316", factor: 1, chitieu: "6. Phải trả nội bộ ngắn hạn"},
                {maso: "317", factor: 1, chitieu: "7. Phải trả theo tiến độ kế hoạch hợp đồng xây dựng"},
                {maso: "318", factor: 1, chitieu: "8. Doanh thu chưa thực hiện ngắn hạn "},
                {maso: "319", factor: 1, chitieu: "9. Phải trả ngắn hạn khác"},
                {maso: "320", factor: 1, chitieu: "10. Vay và nợ thuê tài chính ngắn hạn"},
                {maso: "321", factor: 1, chitieu: "11. Dự phòng phải trả ngắn hạn "},
                {maso: "322", factor: 1, chitieu: "12. Quỹ khen thưởng, phúc lợi "},
                {maso: "323", factor: 1, chitieu: "13. Quỹ bình ổn giá"},
                {maso: "324", factor: 1, chitieu: "14. Giao dịch mua bán lại trái phiếu Chính phủ"},
                {maso: "330", factor: 1, chitieu: "II. Nợ dài hạn"},
                {maso: "331", factor: 1, chitieu: "1. Phải trả người bán dài hạn"},
                {maso: "332", factor: 1, chitieu: "2. Người mua trả tiền trước dài hạn"},
                {maso: "333", factor: 1, chitieu: "3. Chi phí phải trả dài hạn"},
                {maso: "334", factor: 1, chitieu: "4. Phải trả nội bộ về vốn kinh doanh"},
                {maso: "335", factor: 1, chitieu: "5. Phải trả nội bộ dài hạn"},
                {maso: "336", factor: 1, chitieu: "6. Doanh thu chưa thực hiện dài hạn "},
                {maso: "337", factor: 1, chitieu: "7. Phải trả dài hạn khác"},
                {maso: "338", factor: 1, chitieu: "8. Vay và nợ thuê tài chính dài hạn "},
                {maso: "339", factor: 1, chitieu: "9. Trái phiếu chuyển đổi"},
                {maso: "340", factor: 1, chitieu: "10. Cổ phiếu ưu đãi"},
                {maso: "341", factor: 1, chitieu: "11. Thuế thu nhập hoãn lại phải trả "},
                {maso: "342", factor: 1, chitieu: "12. Dự phòng phải trả dài hạn "},
                {maso: "343", factor: 1, chitieu: "13. Quỹ phát triển khoa học và công nghệ"},
                {maso: "400", factor: 1, chitieu: "D - VỐN CHỦ SỞ HỮU"},
                {maso: "410", factor: 1, chitieu: "I. Vốn chủ sở hữu"},
                {maso: "411", factor: 1, chitieu: "1. Vốn góp của chủ sở hữu"},
                {maso: "411a", factor: 1, chitieu: "    - Cổ phiếu phổ thông có quyền biểu quyết"},
                {maso: "411b", factor: 1, chitieu: "    - Cổ phiếu ưu đãi"},
                {maso: "412", factor: 1, chitieu: "2. Thặng dư vốn cổ phần"},
                {maso: "413", factor: 1, chitieu: "3. Quyền chọn chuyển đổi trái phiếu"},
                {maso: "414", factor: 1, chitieu: "4. Vốn khác của chủ sở hữu "},
                {maso: "415", factor: 1, chitieu: "5. Cổ phiếu quỹ (*)"},
                {maso: "416", factor: 1, chitieu: "6. Chênh lệch đánh giá lại tài sản"},
                {maso: "417", factor: 1, chitieu: "7. Chênh lệch tỷ giá hối đoái"},
                {maso: "418", factor: 1, chitieu: "8. Quỹ đầu tư phát triển"},
                {maso: "419", factor: 1, chitieu: "9. Quỹ hỗ trợ sắp xếp doanh nghiệp"},
                {maso: "420", factor: 1, chitieu: "10. Quỹ khác thuộc vốn chủ sở hữu"},
                {maso: "421", factor: 1, chitieu: "11. Lợi nhuận sau thuế chưa phân phối"},
                {maso: "421a", factor: 1, chitieu: "     - LNST chưa phân phối lũy kế đến cuối kỳ trước"},
                {maso: "421b", factor: 1, chitieu: "     - LNST chưa phân phối kỳ này"},
                {maso: "422", factor: 1, chitieu: "12. Nguồn vốn đầu tư XDCB"},
                {maso: "430", factor: 1, chitieu: "II. Nguồn kinh phí và quỹ khác"},
                {maso: "431", factor: 1, chitieu: "  1. Nguồn kinh phí "},
                {maso: "432", factor: 1, chitieu: "  2. Nguồn kinh phí đã hình thành TSCĐ"},
                {maso: "440", factor: 1, chitieu: "TỔNG CỘNG NGUỒN VỐN (440 = 300 + 400)"}
            ];
        }

        function findByMaSo(_arrFind, _maso) {
            return _arrFind.find(function (item) {
                return item.maso === _maso;
            });
        }

        function changeCurrency(number) {
            if (!!number && number !== 0) {
                let parts = number.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                if (parts[1] !== '00') {
                    return parts.join(".");
                } else {
                    return parts[0];
                }
            }
            return number;
        }


        return {
            onRequest: onRequest
        };

    });
