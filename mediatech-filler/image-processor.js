const Jimp = require('jimp');
const { ExifImage } = require('exif');
const { log, debug } = require('./util');
const IMG_EXT_JIMP = [
    '.bmp',
    '.gif',
    '.jpeg',
    '.jpg',
    '.png',
    '.tiff'
];
const IMG_EXT_EXIF = [
    '.jpeg',
    '.jpg'
];

class ImageProcessor {
  constructor(configuration = {imageResizer: {width:400, height: Jimp.AUTO, quality: 90}}) {
    this.imageResizer = configuration.imageResizer;
  }

  getExifImage(file) {
    return new Promise((resolve, reject) => {
      new ExifImage(file.path, (error, exifData) => {
        if (error) {
          reject(error);
        } else {
          resolve(this.extractOnly(exifData));
        }
      });
    });
  }

  extractOnly(exifData) {
    debug('extractOnly exifData', exifData);
    let { image, thumbnail, gps } = exifData;
    return {
      picture_make: image["Make"] || thumbnail["Make"],
      picture_model: image["Model"] || thumbnail["Model"],
      picture_date: image["ModifyDate"] || thumbnail["ModifyDate"],
      gps_latitude: this.exifToCoordonate(gps["GPSLatitude"], gps["GPSLatitudeRef"]),
      gps_longitude: this.exifToCoordonate(gps["GPSLongitude"], gps["GPSLongitudeRef"]),
      gps_altitude: gps["GPSAltitude"],
      gps_altitude_ref: gps["GPSAltitudeRef"],
      gps_speed: gps["GPSSpeed"],
      gps_speed_ref:gps["GPSSpeedRef"] 
    };
  }

  exifToCoordonate(gpsData, direction) {
    if (gpsData && direction) {
      return this.convertDMSToDD(gpsData[0], gpsData[1], gpsData[2], direction);
    }
    return;
  }

  convertDMSToDD(degrees, minutes, seconds, direction) {
    let dd = degrees + minutes/60 + seconds/(60*60);
    if (direction == "S" || direction == "W") {
      dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
  }

  async process(file) {
    debug('start image-processor', file);
    if (IMG_EXT_JIMP.includes(file.extension.toLowerCase())) {
      try {
        file.image = {};
        let jimpImage = await Jimp.read(file.path);
        await jimpImage.resize(this.imageResizer.width, this.imageResizer.height);
        await jimpImage.quality(this.imageResizer.quality);
        jimpImage = await jimpImage.getBase64Async(Jimp.AUTO);
        // set mini image
        file.image.icon = jimpImage;
      } catch (error) {
        log(error.stack || error);
      }
    }
    // exif only for jpeg image
    if (IMG_EXT_EXIF.includes(file.extension.toLowerCase())) {
      try {
        let exifImage = await this.getExifImage(file);
        // set more data
        Object.assign(file.image, exifImage);
      } catch (error) {
        log(error.stack || error);
      }  
    }
    debug('end image-processor');
  }

}

module.exports = ImageProcessor;