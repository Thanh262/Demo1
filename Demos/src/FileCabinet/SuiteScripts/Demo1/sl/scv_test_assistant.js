/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'], (serverWidget) => {
    const onRequest = (context) => {
        const assistant = serverWidget.createAssistant({
            title: 'New Supervisor',
            hideNavBar: true
        });
        
        const assignment = assistant.addStep({
            id: 'assignment',
            label: 'Select New Supervisor'
        });
        
        const review = assistant.addStep({
            id: 'review',
            label: 'Review and Submit'
        });
        
        const writeAssignment = () => {
            assistant.addField({
                id: 'newsupervisor',
                type: serverWidget.FieldType.SELECT,
                label: 'Name',
                source: 'employee'
            });
            assistant.addField({
                id: 'assignedemployee',
                type: serverWidget.FieldType.SELECT,
                label: 'Employee',
                source: 'employee'
            });
        };
        
        const writeReview = () => {
            const supervisor = assistant.addField({
                id: 'newsupervisor',
                type: serverWidget.FieldType.TEXT,
                label: 'Name'
            });
            supervisor.defaultValue = context.request.parameters.inpt_newsupervisor;
            supervisor.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
            
            const employee = assistant.addField({
                id: 'assignedemployee',
                type: serverWidget.FieldType.TEXT,
                label: 'Employee'
            });
            employee.defaultValue = context.request.parameters.inpt_assignedemployee;
            employee.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.INLINE
            });
        };
        
        const writeResult = () => {
            const supervisor = context.request.parameters.newsupervisor;
            const employee = context.request.parameters.assignedemployee;
            context.response.write(`Supervisor: ${supervisor}\nEmployee: ${employee}`);
        };
        
        const writeCancel = () => {
            context.response.write('Assistant was cancelled');
        };
        
        if (context.request.method === 'GET') { // GET method means starting the assistant
            writeAssignment();
            assistant.currentStep = assignment;
            context.response.writePage(assistant);
        } else { // POST method - process step of the assistant
            if (context.request.parameters.next === 'Finish') { // Finish was clicked
                writeResult();
            } else if (context.request.parameters.cancel) { // Cancel was clicked
                writeCancel();
            } else if (assistant.currentStep.stepNumber === 1) { // transition from step 1 to step 2
                writeReview();
                assistant.currentStep = assistant.getNextStep();
                context.response.writePage(assistant);
            } else { // transition from step 2 back to step 1
                writeAssignment();
                assistant.currentStep = assistant.getNextStep();
                context.response.writePage(assistant);
            }
        }
    };
    
    return { onRequest };
});