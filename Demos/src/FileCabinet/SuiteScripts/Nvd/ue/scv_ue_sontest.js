/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/url'],
    
    (url) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                const suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_scv_sl_sontest',
                    deploymentId: 'customdeploy_scv_sl_sontest'
                });
                
                const labelPopup = 'Open Suitelet Popup';
                scriptContext.form.addButton({
                    id: 'custpage_open_popup',
                    label: labelPopup,
                    functionName: `(function() {
                        const overlay = document.createElement('div');
                        overlay.id = 'popup-overlay';
                        overlay.style.position = 'fixed';
                        overlay.style.top = '0';
                        overlay.style.left = '0';
                        overlay.style.width = '100%';
                        overlay.style.height = '100%';
                        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                        overlay.style.zIndex = '9998';
                        overlay.style.display = 'flex';
                        overlay.style.alignItems = 'center';
                        overlay.style.justifyContent = 'center';
                        document.body.appendChild(overlay);

                        const width = 600;
                        const height = 400;
                        const left = (screen.width / 2) - (width / 2);
                        const top = (screen.height / 2) - (height / 2);

                        let strWidthHeight = 'width=' + width + ',height='+ height + ',left=' + left + ',top=' + top + ',resizable=yes,scrollbars=yes';

                        const popup = window.open('${suiteletUrl}', '${labelPopup}', strWidthHeight);

                        overlay.addEventListener('click', () => {
                            if (popup && !popup.closed) {
                                popup.focus();
                            }
                        });

                        popup.addEventListener('blur', () => {
                            if (!popup.closed) {
                                setTimeout(() => {
                                    popup.focus();
                                }, 0);
                            }
                        });

                        window.addEventListener('message', (event) => {
                            if (event.data && event.data.redirectUrl) {
                                window.location.href = event.data.redirectUrl;
                            } else if (event.data && event.data.action === 'closePopup') {
                                document.body.removeChild(overlay);
                            }
                        });

                        setInterval(() => {
                            if (popup.closed) {
                                clearInterval(interval);
                                document.body.removeChild(overlay);
                            }
                        }, 100);
                    })()`
                });
            }
        };
        
        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
        
        }
        
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
        
        }
        
        return {beforeLoad, beforeSubmit, afterSubmit}
        
    });
