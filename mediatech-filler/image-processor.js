const Jimp = require('jimp');
const { ExifImage } = require('exif');
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

  getExifImage(image) {
    return new Promise((resolve, reject) => {
      new ExifImage(image.filepath, (error, exifData) => {
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
      image,
      thumbnail,
      gps
    };
  }

  canProcess(file) {
    return IMG_EXT.includes(ext.toLowerCase());
  }

  async addData(image) {
    try {
      let jimpImage = await Jimp.read(image.filepath);
      await jimpImage.resize(this.imageResizer.width, this.imageResizer.height);
      await jimpImage.quality(this.imageResizer.quality);
      jimpImage = await jimpImage.getBase64Async(Jimp.AUTO);
      // set mini image
      image.icon = jimpImage;
    } catch (error) {
      console.log(error);
    }

    try {
      let exifImage = await this.getExifImage(image);
      // set more data
      image.more = exif;
    } catch (error) {
      console.log(error);
    }
    
  }

  async process(file) {
    if (IMG_EXT.includes(file.extension.toLowerCase())) {
      await this.addData(file);
    }
  }

}

module.exports = ImageProcessor;