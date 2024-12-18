/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/record', 'N/runtime'], function (search, record, runtime) {
    const objScriptId = {
        DEPLOY: 'customdeploy_scv_sl_calldata',
        SCRIPT: 'customscript_scv_sl_calldata',
    };

    const objAction = {
        GET_DATA_ITEM_IA : 'getDataItemIA',
    };

    function onRequest(context) {
        if (context.request.method === 'POST' && runtime.getCurrentScript().deploymentId === objScriptId.DEPLOY) {
            postServer(context);
            return;
        } else if (context.request.method === 'GET') {
            getServer(context);
            return;
        }
    }

    function getServer(context) {
        const request = context.request;
        const response = context.response;
        let objResponse = {isSuccess: true};
        let params = request.parameters;
        try {
            log.debug('params', params);
            switch (params.action) {
                case objAction.GET_DATA_ITEM_IA:
                default:
                    break;
            }
        } catch (e) {
            objResponse.isSuccess = false;
            objResponse.msg = e.message;
            log.debug("Error getServer", e);
        }
        response.write(JSON.stringify(objResponse));
    }


    function postServer(context) {
        const request = context.request;
        const response = context.response;
        try {
            let objBody = JSON.parse(request.body);
            let jsonData = {isSuccess: true};
            log.debug('Post Server__action_'.concat(objBody.action), objBody);
            switch (objBody.action) {
                default:
                    break;
            }
            log.audit({title: 'Response', details: JSON.stringify(jsonData)});
            response.setHeader({name: 'Content-Type', value: 'application/json'});
            response.write(JSON.stringify(jsonData));
        } catch (e) {
            log.error("Error postServer", e);
            response.setHeader({name: 'Content-Type', value: 'application/json'});
            response.write(JSON.stringify({
                isSuccess: false,
                msg: e.message,
            }));
        }
    }

    return {
        onRequest: onRequest
    }
})