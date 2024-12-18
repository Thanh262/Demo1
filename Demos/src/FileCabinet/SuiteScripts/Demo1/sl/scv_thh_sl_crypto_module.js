/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/runtime', 'N/crypto', 'N/encode'], (serverWidget, runtime, crypto, encode) => {
    function onRequest(scriptContext) {
        if (scriptContext.request.method === 'GET') {
            let form = serverWidget.createForm({
                title: 'My Credential Form'
            });
            let skField = form.addSecretKeyField({
                id: 'mycredential',
                label: 'Credential',
                restrictToScriptIds: [runtime.getCurrentScript().id],
                restrictToCurrentUser: false
            })
            skField.maxLength = 5;

            form.addSubmitButton();

            scriptContext.response.writePage(form);
        } else {
            let form = serverWidget.createForm({
                title: 'My Credential Form'
            });

            const inputString = "YWJjZGVmZwo=";
            let myGuid = scriptContext.request.parameters.mycredential;

            // Create the key
            let sKey = crypto.createSecretKey({
                guid: myGuid,
                encoding: encode.Encoding.UTF_8
            });

            let digestSha512;

            try {
                let hmacSha512 = crypto.createHmac({
                    algorithm: 'SHA512',
                    key: sKey
                });
                hmacSha512.update({
                    input: inputString,
                    inputEncoding: encode.Encoding.BASE_64
                });
                digestSha512 = hmacSha512.digest({
                    outputEncoding: encode.Encoding.HEX
                });
            } catch (e) {
                log.error({
                    title: 'Failed to hash input',
                    details: e
                });
            }

            form.addField({
                id: 'result',
                label: 'Your digested hash value',
                type: 'textarea'
            }).defaultValue = digestSha512;

            scriptContext.response.writePage(form);
        }
    }
    return {
        onRequest: onRequest
    };
});