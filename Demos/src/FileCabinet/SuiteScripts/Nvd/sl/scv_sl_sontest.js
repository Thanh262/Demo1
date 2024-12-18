/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/redirect', 'N/ui/serverWidget'], (redirect, serverWidget) => {
    
    const onRequest = (context) => {
        if (context.request.method === 'GET') {
            let form = serverWidget.createForm({
                title: 'Form trong Popup'
            });
            addDummyField(form);
            
            form.addSubmitButton({
                label: 'Submit'
            });
            
            context.response.writePage(form);
        } else if (context.request.method === 'POST') {
            const redirectUrl = 'https://example.com';
            context.response.write(`
                <script>
                    window.opener.postMessage({ redirectUrl: "${redirectUrl}" }, "*");
                    window.close();
                </script>
            `);
            
        }
    };
    
    const addDummyField = (form) => {
        form.addField({
            id: 'custpage_dummy_field',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Dummy'
        }).defaultValue = css;
    }
    
    const css = `
            <style>
                #ns-header, #ns-footer, .ns-mainmenu, #ns-menu, #ns-console, .ns-uilayout {
                    display: none !important;
                }
                body { overflow: hidden; }
                .uir-outside-fields-table, .uir-inline-tag { max-width: 100% !important; }
            </style>
            <script>
                document.addEventListener('DOMContentLoaded', function() {
                    document.body.style.margin = '0';
                    document.body.style.padding = '0';
                });
                
                window.addEventListener('beforeunload', function() {
                    window.opener.postMessage({ action: 'closePopup' }, "*");
                });
            </script>
        `;
    
    return { onRequest };
});