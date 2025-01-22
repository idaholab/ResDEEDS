export class httpReponseContext {
    success: boolean = false;
    messageBody: any = null;
    errorMessage: string = "Error, please define error message if needed"
  
    constructor(success: boolean = false, messageBody: any = {}, errorMessage: any = "Error Not Defined"){
        this.success = success,
        this.messageBody = messageBody
        this.errorMessage = errorMessage        
    };
}