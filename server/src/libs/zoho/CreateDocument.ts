const Margin =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/margin').Margin;
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

function createRandomUserName() {
  const tokens =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

  let userName = '';

  const randomLength = Math.floor(Math.random() * 15) + 6;
  for (let i = 0; i < randomLength; i++) {
    userName += tokens[Math.floor(Math.random() * tokens.length)];
  }

  return userName;
}

class CreateDocument {
  static async execute() {
    console.log('CREATE DOCUMENT: vvvvvvvvvvvv');

    try {
      const sdkOperations = new V1Operations();
      const createDocumentParameters = new CreateDocumentParameters();

      const documentInfo = new DocumentInfo();

      //Time value used to generate unique document everytime. You can replace based on your application.
      const documentId = '' + new Date().getTime();
      console.log({ documentId });

      documentInfo.setDocumentId(documentId);
      documentInfo.setDocumentName(`New Document: ${documentId}`);

      createDocumentParameters.setDocumentInfo(documentInfo);

      const userInfo = new UserInfo();

      const randomUserName = createRandomUserName();
      console.log({ randomUserName });

      userInfo.setUserId(randomUserName);
      userInfo.setDisplayName(randomUserName);

      createDocumentParameters.setUserInfo(userInfo);

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
      documentDefaults.setOrientation('landscape');

      documentDefaults.setMargin(margin);
      documentDefaults.setLanguage('ta');

      createDocumentParameters.setDocumentDefaults(documentDefaults);

      const editorSettings = new EditorSettings();

      editorSettings.setUnit('in');
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
      permissions.set('document.pausecollaboration', true);
      permissions.set('document.fill', true);

      createDocumentParameters.setPermissions(permissions);

      // TODO: learn what this callbackSettings for
      const callbackSettings = new CallbackSettings();
      const saveUrlParams = new Map();

      saveUrlParams.set('auth_token', '1234');
      saveUrlParams.set('id', '123131');

      const saveUrlHeaders = new Map();

      saveUrlHeaders.set('header1', 'value1');
      saveUrlHeaders.set('header2', 'value2');

      callbackSettings.setSaveUrlParams(saveUrlParams);
      callbackSettings.setSaveUrlHeaders(saveUrlHeaders);
      callbackSettings.setRetries(1);
      callbackSettings.setSaveFormat('zdoc');
      callbackSettings.setHttpMethodType('post');
      callbackSettings.setTimeout(100000);
      callbackSettings.setSaveUrl(
        'https://bc59556ab64f536be787aeca1dd36571.m.pipedream.net',
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
      console.log('CREATE DOCUMENT: ^^^^^^^^^^^^');
    }
  }
}

// CreateDocument.execute();
export default CreateDocument;
