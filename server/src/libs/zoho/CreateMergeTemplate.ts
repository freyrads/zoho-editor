const fs = require('fs');
const StreamWrapper =
  require('zoi-nodejs-sdk/utils/util/stream_wrapper').StreamWrapper;
const Margin =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/margin').Margin;
const UserInfo =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/user_info').UserInfo;
const DocumentInfo =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/document_info').DocumentInfo;
const EditorSettings =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/editor_settings').EditorSettings;
const DocumentDefaults =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/document_defaults').DocumentDefaults;
const CallbackSettings =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/callback_settings').CallbackSettings;
const CreateDocumentResponse =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/create_document_response').CreateDocumentResponse;
const MailMergeTemplateParameters =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/mail_merge_template_parameters').MailMergeTemplateParameters;
const InvaildConfigurationException =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/invaild_configuration_exception').InvaildConfigurationException;
const OfficeIntegratorSDKOperations =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/v1_operations').V1Operations;
import { Readable } from 'stream';

interface ICreateMergeTemplateDocumentParams {
  userName: string;
  documentId: string;
  userId: string;
  filename: string;
  /*
   * JSON string
   */
  mergeContent: string;
  mergeContentName: string;
  newFilename: string;
  // mergeFilename: string;
}

class CreateMergeTemplate {
  static async execute({
    userName,
    documentId,
    userId,
    filename,
    mergeContent, // mergeFilename,
    mergeContentName,
    newFilename,
  }: ICreateMergeTemplateDocumentParams) {
    console.log('CREATE MERGE TEMPLATE DOCUMENT: vvvvvvvvvvvv');

    console.log({
      userName,
      documentId,
      userId,
      filename,
      mergeContent,
      mergeContentName,
      newFilename,
    });

    try {
      const sdkOperations = new OfficeIntegratorSDKOperations();
      const templateParameters = new MailMergeTemplateParameters();

      //Either use url as document source or attach the document in request body and use below methods
      // templateParameters.setUrl(
      //   'https://demo.office-integrator.com/zdocs/Graphic-Design-Proposal.docx',
      // );
      // templateParameters.setMergeDataJsonUrl(
      //   'https://demo.office-integrator.com/data/candidates.json',
      // );

      // const fileName = "OfferLetter.zdoc";
      // const filePath = "./sample_documents/OfferLetter.zdoc";
      // const fileStream = fs.readFileSync(filePath);
      // const streamWrapper = new StreamWrapper(fileName, fileStream, filePath);

      const filePath = `${process.env.TEMPLATE_DOCUMENT_FOLDER}/${filename}`;
      const streamWrapper = new StreamWrapper(null, null, filePath);

      templateParameters.setDocument(streamWrapper);

      // const jsonFileName = 'candidates.json';
      // const jsonFilePath = './sample_documents/candidates.json';
      // const jsonFileStream = fs.readFileSync(jsonFilePath);

      const jsonFileStream = new Readable();
      jsonFileStream.push(mergeContent);
      jsonFileStream.push(null);

      const jsonStreamWrapper = new StreamWrapper(
        mergeContentName,
        jsonFileStream,
        // jsonFilePath,
      );

      templateParameters.setMergeDataJsonContent(jsonStreamWrapper);

      const documentInfo = new DocumentInfo();

      //Time value used to generate unique document every time. You can replace based on your application.
      documentInfo.setDocumentId(documentId);
      documentInfo.setDocumentName(newFilename);

      templateParameters.setDocumentInfo(documentInfo);

      const userInfo = new UserInfo();

      userInfo.setUserId(userId);
      userInfo.setDisplayName(userName);

      templateParameters.setUserInfo(userInfo);

      const margin = new Margin();

      margin.setTop('2in');
      margin.setBottom('2in');
      margin.setLeft('2in');
      margin.setRight('2in');

      const documentDefaults = new DocumentDefaults();

      documentDefaults.setFontSize(12);
      documentDefaults.setPaperSize('A4');
      documentDefaults.setFontName('Arial');
      documentDefaults.setTrackChanges('enabled');
      // documentDefaults.setOrientation('landscape');

      documentDefaults.setMargin(margin);

      templateParameters.setDocumentDefaults(documentDefaults);

      const editorSettings = new EditorSettings();

      editorSettings.setUnit('mm');
      editorSettings.setLanguage('en');
      editorSettings.setView('pageview');

      templateParameters.setEditorSettings(editorSettings);

      const permissions = new Map();

      permissions.set('document.export', true);
      permissions.set('document.print', true);
      permissions.set('document.edit', true);
      permissions.set('review.comment', true);
      permissions.set('review.changes.resolve', true);
      permissions.set('collab.chat', true);
      permissions.set('document.pausecollaboration', false);
      permissions.set('document.fill', true);

      templateParameters.setPermissions(permissions);

      const callbackSettings = new CallbackSettings();
      const saveUrlParams = new Map();

      saveUrlParams.set('author_id', userId);
      saveUrlParams.set('is_merge_template', '1');

      callbackSettings.setSaveUrlParams(saveUrlParams);

      callbackSettings.setRetries(3);
      callbackSettings.setSaveFormat('docx');
      callbackSettings.setHttpMethodType('post');
      callbackSettings.setTimeout(100000);
      callbackSettings.setSaveUrl(
        // 'https://officeintegrator.zoho.com/v1/api/webhook/savecallback/601e12157a25e63fc4dfd4e6e00cc3da2406df2b9a1d84a903c6cfccf92c8286',
        `${process.env.SERVER_URL}/zoho/${documentId}/save-merge-template`,
      );

      templateParameters.setCallbackSettings(callbackSettings);

      const responseObject =
        await sdkOperations.createMailMergeTemplate(templateParameters);

      console.log({ responseObject });

      if (responseObject != null) {
        //Get the status code from response
        console.log('\nStatus Code: ' + responseObject.statusCode);

        //Get the api response object from responseObject
        let writerResponseObject = responseObject.object;

        if (writerResponseObject != null) {
          //Check if expected CreateDocumentResponse instance is received
          if (writerResponseObject instanceof CreateDocumentResponse) {
            console.log(
              '\nDocument ID - ' + writerResponseObject.getDocumentId(),
            );
            console.log(
              '\nDocument session ID - ' + writerResponseObject.getSessionId(),
            );
            console.log(
              '\nDocument session URL - ' +
                writerResponseObject.getDocumentUrl(),
            );
            console.log(
              '\nDocument save URL - ' + writerResponseObject.getSaveUrl(),
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
        }

        return writerResponseObject;
      }
    } catch (error) {
      console.log('\nException while running sample code', error);
    } finally {
      console.log('CREATE MERGE TEMPLATE DOCUMENT: ^^^^^^^^^^^^');
    }
  }
}

// CreateMergeTemplate.execute();
export default CreateMergeTemplate;
