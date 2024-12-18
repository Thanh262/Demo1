/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  19 Nov 2024         Huy Pham                Init & create file, Tính giá cơ sở của Item chuẩn và Item lệch chuẩn theo Conversion Rate, from ms.Ngọc(https://app.clickup.com/t/86cx3r94u)
 */
define(['N/search', 'N/record',
    '../lib/scv_lib_cs.js',
    '../cons/scv_cons_format.js',
    '../cons/scv_cons_search_bp_item_chuan.js',
    '../cons/scv_cons_search_bp_items.js',
    '../cons/scv_cons_search_bp_rate.js',
],
function(search, record,
    libCs,
    constFormat,
    constSearchBPItemChuan,
    constSearchBPItems,
    constSearchBPRate,
) {
    const addButtonCalcBasePrice = (form, curRec) => {
        let isShow = isShowBtnCalcBasePrice(curRec);
        if(!isShow) return;

        form.addButton({
            id: 'custpage_scv_btn_calc_base_price',
            label: 'Tính giá cơ sở'
        });
    }

    const isShowBtnCalcBasePrice = (curRec) => {
        if(!curRec.id) return false;

        let slItem = 'item';
        for(let i = 0; i < curRec.getLineCount(slItem); i++){
            let bp_rate = curRec.getSublistValue(slItem, 'custcol_scv_bp_rate', i);
            if(bp_rate || bp_rate === 0) return true;
        }
        
        return false;
    }

    const addEventClickBtnCalcBasePrice = (scriptContext) => {
        let btnLoad = document.getElementById('custpage_scv_btn_calc_base_price');
        if(btnLoad){
            btnLoad.onclick = async () => {
                libCs.showLoadingDialog(true);
                try {
                    await clickBtnCalcBasePrice(scriptContext);//1.3
                } catch (error) {
                    alert(error.toString())
                }
                
                libCs.showLoadingDialog(false);
            };
        }
    }

    const clickBtnCalcBasePrice = async (scriptContext) => {
        let curRec = scriptContext.currentRecord;
        let itemIds = [], arrSlItem = [];
        let slItem = 'item';
        for(let i = 0; i < curRec.getLineCount(slItem); i++){
            let bp_rate = curRec.getSublistValue(slItem, 'custcol_scv_bp_rate', i);
            if(bp_rate || bp_rate === 0){
                let item = curRec.getSublistValue(slItem, 'item', i);
                let bang_gia_dai_ly = curRec.getSublistValue(slItem, 'custcol_scv_bang_gia_dai_ly', i);
                let bp_vat = curRec.getSublistText(slItem, 'custcol_scv_bp_vat', i);
                let unit = curRec.getSublistValue(slItem, 'units_display', i);
                let unit_conversion_rate = curRec.getSublistValue(slItem, 'custcol_scv_unit_conversion_rate', i) || 1;
                let ori_lineid = curRec.getSublistValue(slItem, 'custcol_scv_ori_lineid', i);
                bp_vat = bp_vat ? 'T' : 'F';
                arrSlItem.push({
                    item, bang_gia_dai_ly, bp_vat, unit, unit_conversion_rate, ori_lineid
                })
                
                itemIds.push(item)
            }
        }

        if(arrSlItem.length == 0) return;

        let arrBasePrice = await getDataBasePrice(curRec, arrSlItem, itemIds); 
        updateBasePriceSlItem(curRec, arrBasePrice)
    }

    const updateBasePriceSlItem = (curRec, arrBasePrice) => {
        let slItem = 'item';
        for(let i = 0; i < curRec.getLineCount(slItem); i++){
            let item = curRec.getSublistValue(slItem, 'item', i);
            let ori_lineid = curRec.getSublistValue(slItem, 'custcol_scv_ori_lineid', i);
            let objUpd = arrBasePrice.find(e => e.item == item && e.ori_lineid == ori_lineid);
            if(!objUpd) continue;
            
            log.error('objUpd', objUpd)
            if(curRec.isDynamic){
                curRec.selectLine(slItem, i);
                curRec.setCurrentSublistValue({sublistId: slItem, fieldId: 'custcol_scv_bp_rate', value: objUpd.bp_rate * 1});
                curRec.commitLine(slItem);
            }else{
                curRec.setSublistValue({sublistId: slItem, fieldId: 'custcol_scv_bp_rate', line: i, value: objUpd.bp_rate * 1});
            }
        }
    }

    const getDataBasePrice = async (curRec, arrSlItem, itemIds) => {
        let entity = curRec.getValue('entity');
        let currency = curRec.getValue('currency');
        let [arrSS_bpItems, arrSS_bpRate, arrSS_bpItemChuan] = await fetchMultipleSavedSearches(curRec, itemIds);
        arrSlItem.forEach(obj => {
            obj.bp_rate = 0;
            let objSS_bpTrans = arrSS_bpItems.find(e => e.item == obj.item);
            if(!objSS_bpTrans) return;

            if(obj.bang_gia_dai_ly == true){//1.1
                let arrSS_bpRate_ft = arrSS_bpRate.filter(e => e.bp_vat == obj.bp_vat && e.unit == obj.unit && 
                    e.key_mapping == objSS_bpTrans.key_mapping && e.ma_mau.includes(objSS_bpTrans.ma_mau));
                if(arrSS_bpRate_ft.length == 0) return;
    
                let objSS_bpRate = arrSS_bpRate_ft.find(e => e.customer == entity);
                if(!objSS_bpRate) objSS_bpRate = arrSS_bpRate_ft[0];
    
                let bp_rate = obj.unit_conversion_rate * objSS_bpRate.base_price;
                obj.bp_rate = parseFloat(bp_rate.toFixed(8));
            }else{//1.4
                if(objSS_bpTrans.item_parent_id){
                    let objSS_bpItemChuan = arrSS_bpItemChuan.find(e => e.key_mapping == objSS_bpTrans.item_parent_id + currency);
                    if(!objSS_bpItemChuan) return;

                    obj.bp_rate = objSS_bpItemChuan.base_price * obj.conversion_rate;
                }else{
                    let objSS_bpItemChuan = arrSS_bpItemChuan.find(e => e.key_mapping == objSS_bpTrans.item + currency);
                    if(!objSS_bpItemChuan) return;

                    obj.bp_rate = objSS_bpItemChuan.base_price;
                }
            }
        })

        return arrSlItem;
    }

    const fetchMultipleSavedSearches = async (curRec, itemIds) => {
        let [arrSS_bpItems, arrSS_bpRate, arrSS_bpItemChuan] = await Promise.all([
            getDataSS_bpItems(itemIds),
            getDataSS_bpRate(curRec),
            getDataSS_bpItemChuan(itemIds)
        ]);
        return [arrSS_bpItems, arrSS_bpRate, arrSS_bpItemChuan];
    };

    const getDataSS_bpItemChuan = (itemIds) => { 
        let myFilters = [];
        myFilters.push(
            search.createFilter({name: 'internalid', operator: 'anyof', values: itemIds})
        );

        return constSearchBPItemChuan.getDataSource(myFilters);
    }

    const getDataSS_bpRate = (curRec) => {
        let myFilters = [];
        let trandate = curRec.getValue('trandate');
        let subsidiary = curRec.getValue('subsidiary');
        let currency = curRec.getValue('currency');
        if(trandate){
            trandate = constFormat.formatDate(trandate);
            myFilters.push(
                search.createFilter({name: 'custrecord_scv_sales_price_start_date', operator: 'onorbefore', values: trandate})
            );
            myFilters.push(
                search.createFilter({name: 'custrecord_scv_sales_price_end_date', operator: 'onorafter', values: trandate})
            )
        }

        if(subsidiary){
            myFilters.push(
                search.createFilter({name: 'custrecord_scv_sales_price_sub', operator: 'anyof', values: subsidiary})
            )
        } 
        
        if(currency){
            myFilters.push(
                search.createFilter({name: 'custrecord_scv_sales_price_currency', operator: 'anyof', values: currency})
            )
        } 
        
        return constSearchBPRate.getDataSource(myFilters);
    }

    const getDataSS_bpItems= (itemIds) => {
        let myFilters = [];
        myFilters.push(
            search.createFilter({name: 'internalid', operator: 'anyof', values: itemIds})
        );

        return constSearchBPItems.getDataSource(myFilters);
    }

    const updateOriginalRecord = async (scriptContext) => {
        let curRec = scriptContext.newRecord;
        let itemIds = [], arrSlItem = [];
        let slItem = 'item';log.error('slItem', slItem)
        for(let i = 0; i < curRec.getLineCount(slItem); i++){
            let bp_rate = curRec.getSublistValue(slItem, 'custcol_scv_bp_rate', i);
            if(!bp_rate && bp_rate !== 0){
                let item = curRec.getSublistValue(slItem, 'item', i);
                let bang_gia_dai_ly = curRec.getSublistValue(slItem, 'custcol_scv_bang_gia_dai_ly', i);
                let bp_vat = curRec.getSublistValue(slItem, 'custcol_scv_bp_vat', i);
                let unit = curRec.getSublistValue(slItem, 'units_display', i);
                let unit_conversion_rate = curRec.getSublistValue(slItem, 'custcol_scv_unit_conversion_rate', i) || 1;
                let ori_lineid = curRec.getSublistValue(slItem, 'custcol_scv_ori_lineid', i);
                bp_vat = bp_vat ? 'T' : 'F';
                arrSlItem.push({
                    item, bang_gia_dai_ly, bp_vat, unit, unit_conversion_rate, ori_lineid
                })
                
                itemIds.push(item)
            }
        };
        log.error('arrSlItem', arrSlItem)

        if(arrSlItem.length == 0) return;

        let arrBasePrice = await getDataBasePrice(curRec, arrSlItem, itemIds);log.error('arrBasePrice', arrBasePrice)
        updateBasePriceSlItem(curRec, arrBasePrice);
    }

    return {
        addButtonCalcBasePrice,
        addEventClickBtnCalcBasePrice,
        updateOriginalRecord,

    };
    
});
    