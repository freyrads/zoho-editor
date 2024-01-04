const fs = require('fs');
const StreamWrapper =
  require('zoi-nodejs-sdk/utils/util/stream_wrapper').StreamWrapper;
const UserInfo =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/user_info').UserInfo;
const UiOptions =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/ui_options').UiOptions;
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
const CreateDocumentParameters =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/create_document_parameters').CreateDocumentParameters;
const InvaildConfigurationException =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/invaild_configuration_exception').InvaildConfigurationException;
const V1Operations =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/v1_operations').V1Operations;

interface ICreateDocumentParams {
  userName: string;
  documentId: string;
  userId: string;
  filename: string;
}

class EditDocument {
  static async execute({
    userName,
    documentId,
    userId,
    filename,
  }: ICreateDocumentParams) {
    console.log('EDIT DOCUMENT: vvvvvvvvvvvv');

    console.log({
      userName,
      documentId,
      userId,
      filename,
    });

    try {
      const sdkOperations = new V1Operations();
      const createDocumentParameters = new CreateDocumentParameters();

      const filePath = process.env.DOCUMENT_FOLDER + filename;
      // TODO: handle error
      const fileStream = fs.readFileSync(filePath);
      const streamWrapper = new StreamWrapper(filename, fileStream, filePath);

      createDocumentParameters.setDocument(streamWrapper);

      const documentInfo = new DocumentInfo();

      documentInfo.setDocumentId(documentId);
      documentInfo.setDocumentName(filename);

      createDocumentParameters.setDocumentInfo(documentInfo);

      const userInfo = new UserInfo();

      userInfo.setUserId(userId);
      userInfo.setDisplayName(userName);

      createDocumentParameters.setUserInfo(userInfo);

      const documentDefaults = new DocumentDefaults();

      documentDefaults.setTrackChanges('enabled'); // default disabled
      documentDefaults.setLanguage('en');

      createDocumentParameters.setDocumentDefaults(documentDefaults);

      const editorSettings = new EditorSettings();

      editorSettings.setUnit('mm');
      editorSettings.setLanguage('en');
      editorSettings.setView('pageview');

      createDocumentParameters.setEditorSettings(editorSettings);

      const uiOptions = new UiOptions();

      uiOptions.setDarkMode('show');
      uiOptions.setFileMenu('show');
      uiOptions.setSaveButton('show');
      uiOptions.setChatPanel('show');

      createDocumentParameters.setUiOptions(uiOptions);

      const permissions = new Map();

      permissions.set('document.export', true);
      permissions.set('document.print', true);
      permissions.set('document.edit', true);
      permissions.set('review.comment', true);
      permissions.set('review.changes.resolve', true);
      permissions.set('collab.chat', true);
      permissions.set('document.pausecollaboration', false);
      permissions.set('document.fill', false);

      createDocumentParameters.setPermissions(permissions);

      const callbackSettings = new CallbackSettings();
      const saveUrlParams = new Map();

      // saveUrlParams.set('author_id', userId);

      // const saveUrlHeaders = new Map();

      // saveUrlHeaders.set('header1', 'value1');
      // saveUrlHeaders.set('header2', 'value2');

      callbackSettings.setSaveUrlParams(saveUrlParams);
      // callbackSettings.setSaveUrlHeaders(saveUrlHeaders);
      callbackSettings.setRetries(3);
      callbackSettings.setSaveFormat('docx');
      callbackSettings.setHttpMethodType('post');
      callbackSettings.setTimeout(100000);
      callbackSettings.setSaveUrl(
        `${process.env.SERVER_URL}/zoho/${documentId}/save`,
      );

      createDocumentParameters.setCallbackSettings(callbackSettings);

      const responseObject = await sdkOperations.createDocument(
        createDocumentParameters,
      );

      console.log({ responseObject });

      if (responseObject != null) {
        // Get the status code from response
        console.log('Status Code: ' + responseObject.statusCode);

        // Get the api response object from responseObject
        let writerResponseObject = responseObject.object;

        if (writerResponseObject != null) {
          // Check if expected CreateDocumentResponse instance is received
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
      console.log('EDIT DOCUMENT: ^^^^^^^^^^^^');
    }
  }
}

// EditDocument.execute();
export default EditDocument;
