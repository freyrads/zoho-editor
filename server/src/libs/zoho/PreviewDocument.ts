// import * as fs from 'fs';
// import { StreamWrapper } from 'zoi-nodejs-sdk/utils/util/stream_wrapper';
const PreviewResponse =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/preview_response').PreviewResponse;
const PreviewParameters =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/preview_parameters').PreviewParameters;
const PreviewDocumentInfo =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/preview_document_info').PreviewDocumentInfo;
const InvaildConfigurationException =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/invaild_configuration_exception').InvaildConfigurationException;
const V1Operations =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/v1_operations').V1Operations;

class PreviewDocument {
  static async execute() {
    console.log('PREVIEW DOCUMENT: vvvvvvvvvvvv');

    try {
      const sdkOperations = new V1Operations();
      const previewParameters = new PreviewParameters();

      previewParameters.setUrl(
        'https://demo.office-integrator.com/zdocs/Graphic-Design-Proposal.docx',
      );

      // var fileName = "Graphic-Design-Proposal.docx";
      // var filePath = __dirname + "/sample_documents/Graphic-Design-Proposal.docx";
      // var fileStream = fs.readFileSync(filePath);
      // var streamWrapper = new StreamWrapper(fileName, fileStream, filePath)
      // var streamWrapper = new StreamWrapper(null, null, filePath)

      // previewParameters.setDocument(streamWrapper);

      const previewDocumentInfo = new PreviewDocumentInfo();

      //Time value used to generate unique document everytime. You can replace based on your application.
      previewDocumentInfo.setDocumentName('Graphic-Design-Proposal.docx');

      previewParameters.setDocumentInfo(previewDocumentInfo);

      const permissions = new Map();

      permissions.set('document.print', true);

      previewParameters.setPermissions(permissions);

      const responseObject =
        await sdkOperations.createDocumentPreview(previewParameters);

      if (responseObject != null) {
        //Get the status code from response
        console.log('\nStatus Code: ' + responseObject.statusCode);

        //Get the api response object from responseObject
        let writerResponseObject = responseObject.object;

        if (writerResponseObject != null) {
          console.log(
            '\nPreview URL : ' + writerResponseObject.getPreviewUrl(),
          );

          //Check if expected PreviewResponse instance is received
          if (writerResponseObject instanceof PreviewResponse) {
            console.log(
              '\nDocument ID - ' + writerResponseObject.getDocumentId(),
            );
            console.log(
              '\nDocument session ID - ' + writerResponseObject.getSessionId(),
            );
            console.log(
              '\nDocument preview URL - ' +
                writerResponseObject.getPreviewUrl(),
            );
            console.log(
              '\nDocument delete URL - ' +
                writerResponseObject.getDocumentDeleteUrl(),
            );
            console.log(
              '\nDocument session delete URL - ' +
                writerResponseObject.getSessionDeleteUrl(),
            );
          } else if (
            writerResponseObject instanceof InvaildConfigurationException
          ) {
            console.log(
              '\nInvalid configuration exception. Exception json - ',
              writerResponseObject,
            );
          } else {
            console.log('\nRequest not completed successfullly');
          }

          return writerResponseObject;
        }
      }
    } catch (error) {
      console.log('\nException while running sample code', error);
    } finally {
      console.log('PREVIEW DOCUMENT: ^^^^^^^^^^^^');
    }
  }
}

// PreviewDocument.execute();
export default PreviewDocument;
