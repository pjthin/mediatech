const Jimp = require('jimp');
const exifr = require('exifr');
const { error, log, debug } = require('./util');
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
const EXIFR_OPTS = {
  idf0: false,
  idf1: false,
  exif: true,
  gps: true,
  pick: ['Make','Model','ModifyDate','GPSLatitude','GPSLatitudeRef','GPSLongitude','GPSLongitudeRef','GPSAltitude','GPSAltitudeRef']
};

const convertExifToDb = (exifData) => {
  debug('extractOnly exifData', exifData);
  return {
    picture_make: exifData["Make"] || thumbnail["Make"],
    picture_model: exifData["Model"] || thumbnail["Model"],
    picture_date: exifData["ModifyDate"] || thumbnail["ModifyDate"],
    gps_latitude: exifToCoordonate(exifData["GPSLatitude"], exifData["GPSLatitudeRef"]),
    gps_longitude: exifToCoordonate(exifData["GPSLongitude"], exifData["GPSLongitudeRef"]),
    gps_altitude: exifData["GPSAltitude"],
    gps_altitude_ref: exifData["GPSAltitudeRef"]
  };
};

const exifToCoordonate = (gpsData, direction) => {
  if (gpsData && direction) {
    return convertDMSToDD(gpsData[0], gpsData[1], gpsData[2], direction);
  }
  return;
};

const convertDMSToDD = (degrees, minutes, seconds, direction) => {
  let dd = degrees + minutes/60 + seconds/(60*60);
  if (direction == "S" || direction == "W") {
    dd = dd * -1;
  } // Don't do anything for N or E
  return dd;
};

const makeIconAsync = async function(file) {
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
      error(error.stack || error);
    }
  }
}

const extractExifAsync = async (file) => {
  if (IMG_EXT_EXIF.includes(file.extension.toLowerCase())) {
    try {
      let exifImage = convertExifToDb(await exifr.parse(file.path, EXIFR_OPTS));
      // set more data
      Object.assign(file.image, exifImage);
    } catch (error) {
      error(error.stack || error);
    }  
  }
}


class ImageProcessor {
  constructor(configuration = {imageResizer: {width:400, height: Jimp.AUTO, quality: 90}}) {
    this.imageResizer = configuration.imageResizer;
  }

  processAsync(file) {
    debug('start image-processor', file);
    let exifData = extractExifAsync(file);
    let iconData = makeIconAsync.bind(this)(file);
    return Promise.all([exifData, iconData]);
  }

}

module.exports = ImageProcessor;