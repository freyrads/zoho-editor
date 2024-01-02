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
  /**
   * Dummy prop, unused for CoEdit
   */
  filename?: string;
}

class CoEditDocument {
  // TODO: adjustment required
  static async execute({
    userName,
    documentId,
    userId,
  }: ICreateDocumentParams) {
    try {
      const sdkOperations = new V1Operations();
      const createDocumentParameters = new CreateDocumentParameters();

      const documentInfo = new DocumentInfo();

      //To collaborate in existing document, providing the document id (e.g: 1000) alone is enough.
      //Note: Make sure the document already exist in Zoho server (for below given document id).
      //Even if the document is added to this request, if document exist in Zoho server for given document id, then session will be create for the document which already exist in Zoho.
      documentInfo.setDocumentId(documentId);

      createDocumentParameters.setDocumentInfo(documentInfo);

      const userInfo = new UserInfo();

      userInfo.setUserId(userId);
      userInfo.setDisplayName(userName);

      createDocumentParameters.setUserInfo(userInfo);

      const documentDefaults = new DocumentDefaults();

      documentDefaults.setTrackChanges('enabled');

      createDocumentParameters.setDocumentDefaults(documentDefaults);

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
      permissions.set('review.comment', false);
      permissions.set('review.changes.resolve', false);
      permissions.set('collab.chat', false);
      permissions.set('document.pausecollaboration', false);
      permissions.set('document.fill', false);

      createDocumentParameters.setPermissions(permissions);

      const callbackSettings = new CallbackSettings();
      const saveUrlParams = new Map();

      callbackSettings.setSaveUrlParams(saveUrlParams);
      callbackSettings.setRetries(3);
      callbackSettings.setSaveFormat('docx');
      callbackSettings.setHttpMethodType('post');
      callbackSettings.setTimeout(100000);
      // callbackSettings.setSaveUrl(
      //   'https://officeintegrator.zoho.com/v1/api/webhook/savecallback/601e12157123434d4e6e00cc3da2406df2b9a1d84a903c6cfccf92c8286',
      // );
      callbackSettings.setSaveUrl(
        `${process.env.SERVER_URL}/zoho/${documentId}/save`,
      );

      createDocumentParameters.setCallbackSettings(callbackSettings);

      const responseObject = await sdkOperations.createDocument(
        createDocumentParameters,
      );

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
      console.log('EDIT DOCUMENT: ^^^^^^^^^^^^');
    }
  }
}

// CoEditDocument.execute();
export default CoEditDocument;
