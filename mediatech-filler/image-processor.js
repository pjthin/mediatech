const Jimp = require('jimp');
const { ExifImage } = require('exif');
const { log } = require('./util');
const IMG_EXT = [
    '.bmp',
    '.gif',
    '.jpeg',
    '.jpg',
    '.png',
    '.tiff'
];

class ImageProcessor {
  constructor(configuration = {imageResizer: {width:400, height: Jimp.AUTO, quality: 90}}) {
    this.imageResizer = configuration.imageResizer;
  }

  getExifImage(file) {
    return new Promise((resolve, reject) => {
      new ExifImage(file.filepath, (error, exifData) => {
        if (error) {
          reject(error);
        } else {
          resolve(this.extractOnly(exifData));
        }
      });
    });
  }

  extractOnly(exifData) {
    let { image, thumbnail, gps } = exifData;
    return {
      pictureMake: image["Make"] || thumbnail["Make"],
      pictureModele: image["Model"] || thumbnail["Model"],
      pictureDate: image["ModifyDate"] || thumbnail["ModifyDate"],
      gpsLatitude: this.convertDMSToDD(gps["GPSLatitude"][0],gps["GPSLatitude"][1],gps["GPSLatitude"][2],gps["GPSLatitudeRef"]),
      gpsLongitude: this.convertDMSToDD(gps["GPSLongitude"][0],gps["GPSLongitude"][1],gps["GPSLongitude"][2],gps["GPSLongitudeRef"]),
      gpsAltitude: gps["GPSAltitude"],
      gpsAltitudeRef: gps["GPSAltitudeRef"],
      gpsSpeed: gps["GPSSpeed"],
      gpsSpeedRef:gps["GPSSpeedRef"] 
    };
  }

  convertDMSToDD(degrees, minutes, seconds, direction) {
    let dd = degrees + minutes/60 + seconds/(60*60);
    if (direction == "S" || direction == "W") {
      dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
  }

  async addData(file) {
    try {
      file.image = {};
      let jimpImage = await Jimp.read(file.filepath);
      await jimpImage.resize(this.imageResizer.width, this.imageResizer.height);
      await jimpImage.quality(this.imageResizer.quality);
      jimpImage = await jimpImage.getBase64Async(Jimp.AUTO);
      // set mini image
      file.image.icon = jimpImage;
    } catch (error) {
      log(error);
    }

    try {
      let exifImage = await this.getExifImage(file);
      // set more data
      Object.assign(file.image, exifImage);
    } catch (error) {
      log(error);
    }
    
  }

  async process(file) {
    if (IMG_EXT.includes(file.extension.toLowerCase())) {
      await this.addData(file);
    }
  }

}

module.exports = ImageProcessor;