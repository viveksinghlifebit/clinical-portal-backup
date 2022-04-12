export class S3Utils {
  /**
   * Returns the http url from s3
   * @param url
   */
  public static getHttpURLFromS3(url: string): string {
    if (url.startsWith('s3://')) {
      const index = url.lastIndexOf('/');
      return `http://${url.substring('s3://'.length, index)}.s3-eu-west-1.amazonaws.com${url.substring(index)}`;
    }
    return url;
  }
}
