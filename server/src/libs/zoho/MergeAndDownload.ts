const fs = require('fs');
const StreamWrapper =
  require('zoi-nodejs-sdk/utils/util/stream_wrapper').StreamWrapper;
const FileBodyWrapper =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/file_body_wrapper').FileBodyWrapper;
const InvaildConfigurationException =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/invaild_configuration_exception').InvaildConfigurationException;
const OfficeIntegratorSDKOperations =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/v1_operations').V1Operations;
const MergeAndDownloadDocumentParameters =
  require('zoi-nodejs-sdk/core/com/zoho/officeintegrator/v1/merge_and_download_document_parameters').MergeAndDownloadDocumentParameters;

class MergeAndDownload {
  static async execute() {
    try {
      const sdkOperations = new OfficeIntegratorSDKOperations();
      const parameters = new MergeAndDownloadDocumentParameters();

      // parameters.setFileUrl(
      //   'https://demo.office-integrator.com/zdocs/OfferLetter.zdoc',
      // );
      // parameters.setMergeDataJsonUrl(
      //   'https://demo.office-integrator.com/data/candidates.json',
      // );

      // var fileName = "OfferLetter.zdoc";
      // var filePath = __dirname + "/sample_documents/OfferLetter.zdoc";
      // TODO: handle error
      // var fileStream = fs.readFileSync(filePath);
      // var streamWrapper = new StreamWrapper(fileName, fileStream, filePath);

      // parameters.setPassword('***');
      parameters.setOutputFormat('docx');
      // parameters.setFileContent(streamWrapper);

      // var jsonFileName = "candidates.json";
      // var jsonFilePath = __dirname + "/sample_documents/candidates.json";
      // var jsonFileStream = fs.readFileSync(jsonFilePath);
      // var jsonStreamWrapper = new StreamWrapper(jsonFileName, jsonFileStream, jsonFilePath);

      // parameters.setMergeDataJsonContent(jsonStreamWrapper);

      /*
            var mergeData = new Map();

            parameters.setMergeData(mergeData);

            var csvFileName = "csv_data_source.csv";
            var csvFilePath = __dirname + "/sample_documents/csv_data_source.csv";
            var csvFileStream = fs.readFileSync(csvFilePath);
            var csvStreamWrapper = new StreamWrapper(csvFileName, csvFileStream, csvFilePath);

            parameters.setMergeDataCsvContent(csvStreamWrapper);

            parameters.setMergeDataCsvUrl("https://demo.office-integrator.com/data/csv_data_source.csv");
            parameters.setMergeDataJsonUrl("https://demo.office-integrator.com/zdocs/json_data_source.json");
            */

      const responseObject =
        await sdkOperations.mergeAndDownloadDocument(parameters);

      if (responseObject != null) {
        console.log('\nStatus Code: ' + responseObject.statusCode);

        let writerResponseObject = responseObject.object;

        if (writerResponseObject != null) {
          if (writerResponseObject instanceof FileBodyWrapper) {
            const convertedDocument = writerResponseObject.getFile();

            if (convertedDocument instanceof StreamWrapper) {
              const outputFilePath =
                __dirname + '/sample_documents/merge_and_download.pdf';

              fs.writeFileSync(outputFilePath, convertedDocument.getStream());
              console.log(
                '\nCheck merged output file in file path - ',
                outputFilePath,
              );
            }
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
      }
    } catch (error) {
      console.log('\nException while running sample code', error);
    }
  }
}

// MergeAndDownload.execute();
export default MergeAndDownload;
