/**
 * Nội dung: 
 * Key word:
 * =======================================================================================
 *  Date                Author                  Description
 * 28 Nov 2024		    Huy Pham                Init, create file
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/runtime', 
    '../lib/scv_lib_function.js', '../lib/scv_lib_common_html.js',

    '../cons/scv_cons_queue_job.js',
    '../cons/scv_cons_queue_job_status.js'
],
    
    (serverWidget, runtime, 
        lbf, libHtml,

        constQueueJob,
        constQueueJobStatus
    ) => {

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let response = scriptContext.response;
            let params = request.parameters;

            if(request.method === "GET") {
                if(params.actionType == "cancel"){
                    constQueueJob.cancelQueueJob(params.queueId);
                }

                let mainForm = onCreateFormUI(params);

                let arrResult = getDataSource(params);

                onRenderDataSublist(mainForm.custpage_sl_queue, arrResult);

                response.writePage(mainForm.form);
            }
        }

        const onCreateFormUI = (_params) => {
            let mainForm = serverWidget.createForm({title: "Status Queue Job", hideNavBar: true});

            let objPopupQueue = constQueueJob.getPopupQueueJobStatus(_params.custrecord_scv_queue_job_scriptid, _params.custrecord_scv_queue_job_deployid);

            mainForm.addButton({id: "custpage_btn_cancel", label: "Cancel", functionName: "setTimeout(function(){window.onbeforeunload = null; closePopup(true); })"});
            mainForm.addButton({id: "custpage_btn_refresh", label: "Refresh", functionName: "setTimeout(function(){window.onbeforeunload = null; window.location.replace('" + objPopupQueue.url + "'); })"});

            libHtml.addClassBtnSubmit(mainForm, "custpage_btn_refresh");

            let queueSublist = mainForm.addSublist({
                id : "custpage_sl_queue",
                type : "LIST",
                label : 'Queue Job List'
            });
            onCreateSublistColumn(queueSublist, _params);

            return {form: mainForm, custpage_sl_queue: queueSublist};
        }

        const onCreateSublistColumn = (_sublist, _params) => {
            let arrColumn = getColumnOfSublist();

            for(let i = 0; i< arrColumn.length; i++){
                let objCol = arrColumn[i];
                let field = _sublist.addField({
                    id : objCol.id,
                    type : objCol.type,
                    source: objCol.source||null,
                    label : objCol.label
                }).updateDisplayType({displayType: objCol.displayType||"inline"});

                field.isMandatory = objCol.isMandatory ?? false;

                if(!!objCol.defaultValue){
                    field.defaultValue = objCol.defaultValue;
                }
            }
        }

        const getColumnOfSublist = () =>{
            return [
                {id: "custpage_col_stt", label: "Stt", type: "float"},
                {id: "custpage_col_status", label: "Status", type: "text"},
                {id: "custpage_col_owner", label: "Owner", type: "text"},
                {id: "custpage_col_note", label: "Note", type: "textarea"},
                {id: "custpage_col_crtdt", label: "Created Date", type: "text"},
                {id: "custpage_col_manual", label: "Manual job", type: "textarea"}
            ];
        }

        const getDataSource = (_params) =>{
            let arrResult = [];

            let curScript = runtime.getCurrentScript();

            let arrQueue = constQueueJob.getDataQueueJob({
                custrecord_scv_queue_job_scriptid: _params.custrecord_scv_queue_job_scriptid,
                custrecord_scv_queue_job_deployid: _params.custrecord_scv_queue_job_deployid,
            });

            for(let i = 0; i < arrQueue.length; i++){
                let objQueue = arrQueue[i];

                let objRes = {
                    custpage_col_stt: i + 1,
                    custpage_col_status: objQueue.custrecord_scv_queue_job_status_display,
                    custpage_col_owner: objQueue.owner_display,
                    custpage_col_note: objQueue.custrecord_scv_queue_job_note||"",
                    custpage_col_crtdt: objQueue.created_date
                };

                if(objRes.custpage_col_note.length > 3000){
                    objRes.custpage_col_note = objQueue.custrecord_scv_queue_job_note.substring(0, 3000) + "(more...)";
                }

                objRes.custpage_col_manual = "";
                
                if(objQueue.custrecord_scv_queue_job_status == constQueueJobStatus.RECORDS.PENDING.ID){
                    objRes.custpage_col_manual += `<a href="/app/site/hosting/scriptlet.nl?script=${curScript.id}&deploy=${curScript.deploymentId}&actionType=cancel&queueId=${objQueue.id}" target="_self" class="dottedlink">Cancel Queue</a>`;
                }

                arrResult.push(objRes);
            }

            return arrResult;
        }

        const onRenderDataSublist = (_sublist, _arrResult) =>{
            let arrColumns = getColumnOfSublist();

            for(let i = 0; i < _arrResult.length; i++){
                let objRes = _arrResult[i];

                for(let j = 0; j < arrColumns.length; j++){
                    let colId = arrColumns[j].id;

                    let val_col = objRes[colId];

                    if(lbf.isContainValue(val_col)){
                        _sublist.setSublistValue({id: colId, line: i, value: val_col});
                    }
                }
            }
        }

        return {onRequest}

    });
