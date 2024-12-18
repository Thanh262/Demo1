/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  22 Nov 2024         Huy Pham			    Init, create file, Tính toán phân bổ trọng lượng nâng hạ trong sản xuất, from mr.Bính(https://app.clickup.com/t/86cx40ye7)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/runtime', 
    
    '../cons/scv_cons_queue_job.js',
    '../cons/scv_cons_assemblybuild',
],
    
    (runtime,

        constQueueJob,
        constAssemblyBuild
        ) => {

        const getInputData = (inputContext) => {
            let curScript = runtime.getCurrentScript();

            let paramsInput = curScript.getParameter({name : "custscript_scv_mr_liftmat_allocate_param"});
                
            paramsInput = !!paramsInput ? JSON.parse(paramsInput) : {};
            
            let arrResult = paramsInput.arrAsb;

            let msg = "Start Date: " + (new Date()).toISOString();
            msg += "\nUpdate: " + arrResult.length + " (records)";

            if(arrResult.length == 0){
                msg = (!!msg ? "\n" : "") +  "Result: 0 (records)";
                msg += "\nEnd Date: " + (new Date()).toISOString();
            }

            constQueueJob.updateNoteQueueJob(curScript.id, curScript.deploymentId, msg);

            return arrResult;
        }

        const map = (mapContext) => {
            let objValueInput = JSON.parse(mapContext.value);

            let curScript = runtime.getCurrentScript();
            let objResReduce = {
                key: curScript.id,
                value: "T"
            };

            try{
                constAssemblyBuild.allocateComponent(objValueInput.internalid, objValueInput.components);
                objResReduce.value = "T";
            }
            catch(err){
                log.error("ERROR: Try-Catch-map", {objValueInput: objValueInput, err: err});

                objResReduce.value = "F";
                constQueueJob.updateNoteQueueJob(curScript.id, curScript.deploymentId, "Error: " + err.message);
            }

            mapContext.write(objResReduce);
        }

        const reduce = (context) => {
            let strKey = context.key;
            var arrValue = context.values;
            let curScript = runtime.getCurrentScript();

            try{
                if(strKey == curScript.id){
                    let arrUpdate = arrValue.filter(e => e == "T");
                    let arrError = arrValue.filter(e => e == "F");
                    let msg = "Response: Update " + arrUpdate.length + " (records); Error " + arrError.length + " (records)";
                    
                    constQueueJob.updateNoteQueueJob(curScript.id, curScript.deploymentId, msg);
                }
            }catch(err){
                log.error("ERROR: Try-Catch-reduce", err);
            }
        }

        const summarize = (summary) => {
            try{
                let curScript = runtime.getCurrentScript();
                let msg = "End Date: " + (new Date()).toISOString();

                constQueueJob.completeQueueJob(curScript.id, curScript.deploymentId, msg);
            }catch(err){
                log.error("ERROR: Try-Catch-summarize", err);
            }
        }

        return {getInputData, map, reduce, summarize}

    });
