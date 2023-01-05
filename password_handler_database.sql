-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1
-- Tid vid skapande: 30 dec 2022 kl 10:21
-- Serverversion: 10.4.21-MariaDB
-- PHP-version: 8.0.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `password_handler`
--

-- --------------------------------------------------------

--
-- Tabellstruktur `admins`
--

CREATE TABLE `admins` (
  `uname` varchar(128) NOT NULL,
  `email` varchar(128) NOT NULL,
  `hashed_pwd` varchar(128) DEFAULT NULL,
  `salt` varchar(128) DEFAULT NULL,
  `token` varchar(256) DEFAULT NULL,
  `token_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `email_token` varchar(256) DEFAULT NULL,
  `email_token_timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=COMPACT;

--
-- Dumpning av Data i tabell `admins`
--

INSERT INTO `admins` (`uname`, `email`, `hashed_pwd`, `salt`, `token`, `token_timestamp`, `email_token`, `email_token_timestamp`) VALUES
('admin1', 'test@gmail.com', '7958807b06d8e4d6941c558943872492', '6d99d0f66e584f4cb55c8163f6abab87', 'WSCFO5B8Z0F82p2pGQ6bEQxDtRqsrgT0', '2022-12-29 13:30:06', NULL, '2022-12-29 10:50:21');

-- --------------------------------------------------------

--
-- Tabellstruktur `admin_ips`
--

CREATE TABLE `admin_ips` (
  `uname` varchar(128) NOT NULL,
  `ip` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;



-- --------------------------------------------------------

--
-- Tabellstruktur `feedback`
--

CREATE TABLE `feedback` (
  `id` bigint(20) NOT NULL,
  `feedback` varchar(512) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Tabellstruktur `ips`
--

CREATE TABLE `ips` (
  `uname` varchar(128) NOT NULL,
  `ip` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=COMPACT;



-- --------------------------------------------------------

--
-- Tabellstruktur `passwords`
--

CREATE TABLE `passwords` (
  `uname` varchar(128) NOT NULL,
  `website_url` varchar(128) NOT NULL,
  `website_uname` varchar(128) NOT NULL,
  `encrypted_pwd` varchar(256) NOT NULL,
  `iv` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=COMPACT;

-- --------------------------------------------------------

--
-- Tabellstruktur `super_admins`
--

CREATE TABLE `super_admins` (
  `uname` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=COMPACT;

--
-- Dumpning av Data i tabell `super_admins`
--

INSERT INTO `super_admins` (`uname`) VALUES
('admin1');

-- --------------------------------------------------------

--
-- Tabellstruktur `users`
--

CREATE TABLE `users` (
  `uname` varchar(128) NOT NULL,
  `email` varchar(128) NOT NULL,
  `hashedhashed_masterpwd` varchar(128) NOT NULL,
  `salt_1` varchar(128) NOT NULL,
  `salt_2` varchar(128) NOT NULL,
  `encrypted_key` varchar(128) NOT NULL,
  `iv` varchar(128) NOT NULL,
  `token` varchar(256) DEFAULT NULL,
  `token_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `email_token` varchar(256) DEFAULT NULL,
  `email_token_timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `pfpid` varchar(128) NOT NULL,
  `pfpURL` varchar(128) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=COMPACT;



--
-- Index för dumpade tabeller
--

--
-- Index för tabell `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`uname`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index för tabell `admin_ips`
--
ALTER TABLE `admin_ips`
  ADD PRIMARY KEY (`uname`,`ip`);

--
-- Index för tabell `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`);

--
-- Index för tabell `ips`
--
ALTER TABLE `ips`
  ADD PRIMARY KEY (`uname`,`ip`);

--
-- Index för tabell `passwords`
--
ALTER TABLE `passwords`
  ADD PRIMARY KEY (`uname`,`website_url`,`website_uname`);

--
-- Index för tabell `super_admins`
--
ALTER TABLE `super_admins`
  ADD PRIMARY KEY (`uname`);

--
-- Index för tabell `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`uname`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT för dumpade tabeller
--

--
-- AUTO_INCREMENT för tabell `feedback`
--
ALTER TABLE `feedback`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Restriktioner för dumpade tabeller
--

--
-- Restriktioner för tabell `admin_ips`
--
ALTER TABLE `admin_ips`
  ADD CONSTRAINT `admin_uname` FOREIGN KEY (`uname`) REFERENCES `admins` (`uname`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restriktioner för tabell `ips`
--
ALTER TABLE `ips`
  ADD CONSTRAINT `uname_ips_constraint` FOREIGN KEY (`uname`) REFERENCES `users` (`uname`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restriktioner för tabell `passwords`
--
ALTER TABLE `passwords`
  ADD CONSTRAINT `uname_passwords_constraints` FOREIGN KEY (`uname`) REFERENCES `users` (`uname`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restriktioner för tabell `super_admins`
--
ALTER TABLE `super_admins`
  ADD CONSTRAINT `uname_admin_fk` FOREIGN KEY (`uname`) REFERENCES `admins` (`uname`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
