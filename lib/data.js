//dependencies
const fs = require("fs");
const path = require("path");

//module scafolding
const lib = {};

//base directory
lib.basedir = path.join(__dirname, "../.data/");

//creating new file
lib.create = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, "wx", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      fs.write(fileDescriptor, stringData, (err2) => {
        if (!err2) {
          fs.close(fileDescriptor, (err3) => {
            if (!err3) {
              callback(false);
            } else {
              callback("Error closing the new file");
            }
          });
        } else {
          callback("Error writing the new file");
        }
      });
    } else {
      callback("There was an error! file already may exist");
    }
  });
};

//write file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, "utf8", (err, data) => {
    callback(err, data);
  });
};

//update existing file
lib.update = (dir, file, data, callback) => {
  fs.open(`${lib.basedir + dir}/${file}.json`, "r+", (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stringData = JSON.stringify(data);
      fs.ftruncate(fileDescriptor, (err2) => {
        if (!err2) {
          fs.write(fileDescriptor, stringData, (err3) => {
            if (!err3) {
              fs.close(fileDescriptor, (err4) => {
                if (!err4) {
                  callback(false);
                } else {
                  callback("Error closing file");
                }
              });
            } else {
              callback("Error updating file");
            }
          });
        } else {
          callback("Error truncating file");
        }
      });
    } else {
      callback("Error in opening file");
    }
  });
};

lib.delete = (dir, file, callback) => {
  fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

lib.list = (dir, callback) => {
  fs.readdir(`${lib.basedir + dir}/`, (err, fileNames) => {
    if (!err && fileNames.length > 0) {
      let trimedFilenames = [];
      fileNames.forEach((fileName) => {
        trimedFilenames.push(fileName.replace(".json", ""));
      });
      callback(false, trimedFilenames);
    } else {
      callback("Error reading directory");
    }
  });
};

module.exports = lib;
