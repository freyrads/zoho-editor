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

interface IMergeAndDownloadParams {
  filename: string;
  /**
   * Whether filename is url
   */
  isUrl?: boolean;
  /**
   * JSON string:
   * {"data":[{"name":"Amelia","email":"amelia@zylker.com"}]}
   *
   * {
   *   data: [
   *   {entry},
   *   {entry},
   *   {entry},
   *   ]
   * }
   */
  mergeContent: Map<string, string>;
}

class MergeAndDownload {
  static async execute({
    filename,
    isUrl,
    mergeContent,
  }: IMergeAndDownloadParams) {
    console.log('MERGE AND DOWNLOAD DOCUMENT: vvvvvvvvvvvv');

    console.log({
      filename,
      isUrl,
      mergeContent,
    });

    try {
      const sdkOperations = new OfficeIntegratorSDKOperations();
      const parameters = new MergeAndDownloadDocumentParameters();

      if (isUrl)
        parameters.setFileUrl(
          // filename is url
          filename,
        );
      // parameters.setFileUrl(
      //   'https://demo.office-integrator.com/zdocs/OfferLetter.zdoc',
      // );
      else {
        const filePath = process.env.DOCUMENT_FOLDER + filename;
        // TODO: handle error
        const fileStream = fs.readFileSync(filePath);
        const streamWrapper = new StreamWrapper(filename, fileStream, filePath);
        parameters.setFileContent(streamWrapper);
      }
      // parameters.setMergeDataJsonUrl(
      //   'https://demo.office-integrator.com/data/candidates.json',
      // );

      // parameters.setPassword('***');
      parameters.setOutputFormat('docx');

      parameters.setMergeData(mergeContent);

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

      console.log({ responseObject });

      if (responseObject != null) {
        console.log('\nStatus Code: ' + responseObject.statusCode);

        let writerResponseObject = responseObject.object;

        if (writerResponseObject != null) {
          if (writerResponseObject instanceof FileBodyWrapper) {
            const convertedDocument = writerResponseObject.getFile();

            // TODO: filename?
            if (convertedDocument instanceof StreamWrapper) {
              const outputFilePath =
                process.env.DOCUMENT_FOLDER + `merged-${filename}`;

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

        return writerResponseObject;
      }
    } catch (error) {
      console.log('\nException while running sample code', error);
    } finally {
      console.log('MERGE AND DOWNLOAD DOCUMENT: ^^^^^^^^^^^^');
    }
  }
}

// MergeAndDownload.execute();
export default MergeAndDownload;
