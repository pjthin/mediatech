CREATE TABLE `mediadb`.`myfile` (
  `id_file` INT NOT NULL AUTO_INCREMENT,
  `path` VARCHAR(400) NOT NULL,
  `insert_date` TIMESTAMP NOT NULL,
  `type` VARCHAR(1) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_file`),
  UNIQUE INDEX `path_UNIQUE` (`path` ASC),
  UNIQUE INDEX `id_file_UNIQUE` (`id_file` ASC),
  INDEX `index_insert_date` (`insert_date` ASC));

CREATE TABLE `mediadb`.`mypicture` (
  `fk_id_file` INT NOT NULL,
  `picture_date` DATETIME NOT NULL,
  `picture_make` VARCHAR(150) NULL,
  `picture_model` VARCHAR(150) NULL,
  `icon` MEDIUMTEXT NOT NULL,
  `gps_latitude` DECIMAL NULL,
  `gps_longitude` DECIMAL NULL,
  `gps_altitude` DECIMAL NULL,
  `gps_altitude_ref` DECIMAL NULL,
  `gps_speed_ref` VARCHAR(1) NULL,
  `gps_speed` DECIMAL NULL,
  UNIQUE INDEX `fk_id_file_UNIQUE` (`fk_id_file` ASC),
  INDEX `index_picture_date` (`picture_date` ASC),
  CONSTRAINT `fk_mypicture_1`
    FOREIGN KEY (`fk_id_file`)
    REFERENCES `mediadb`.`myfile` (`id_file`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
