--
-- Database: `rabbitmax`
--
CREATE DATABASE IF NOT EXISTS `rabbitmax` DEFAULT CHARACTER SET utf8 COLLATE utf8_unicode_ci;
USE `rabbitmax`;

-- --------------------------------------------------------

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rabbitmax`
--

-- --------------------------------------------------------

--
-- Table structure for table `devices`
--

CREATE TABLE IF NOT EXISTS `devices` (
  `device_id` int(20) NOT NULL,
  `device_name` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `device_type_id` int(5) NOT NULL
  `device_uid` varchar(32) COLLATE utf8_unicode_ci NOT NULL COMMENT 'unique machine ID'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `device_properties`
--

CREATE TABLE IF NOT EXISTS `device_properties` (
  `dp_id` int(20) NOT NULL,
  `dp_device_id` int(11) NOT NULL,
  `dp_feature_id` int(11) NOT NULL,
  `dp_property` varchar(255) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `device_types`
--

CREATE TABLE IF NOT EXISTS `device_types` (
  `device_type_id` int(5) NOT NULL,
  `device_type` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `device_icon` varchar(20) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `device_type_features`
--

CREATE TABLE IF NOT EXISTS `device_type_features` (
  `dtf_id` int(12) NOT NULL,
  `dtf_type_id` int(5) NOT NULL,
  `dtf_feature_id` int(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `features`
--

CREATE TABLE IF NOT EXISTS `features` (
  `feature_id` int(6) NOT NULL,
  `feature_name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `feature_topic` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `feature_unit` varchar(20) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizations`
--

CREATE TABLE IF NOT EXISTS `organizations` (
  `organization_id` int(6) NOT NULL,
  `organization_name` varchar(40) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizations_devices`
--

CREATE TABLE IF NOT EXISTS `organizations_devices` (
  `od_id` int(20) NOT NULL,
  `od_organization_id` int(6) NOT NULL,
  `od_device_id` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `organizations_users`
--

CREATE TABLE IF NOT EXISTS `organizations_users` (
  `ou_id` int(12) NOT NULL,
  `ou_organization_id` int(6) NOT NULL,
  `ou_user_id` int(12) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE IF NOT EXISTS `settings` (
  `settings_id` int(20) NOT NULL,
  `settings_user_id` int(12) NOT NULL,
  `settings_type` enum('home') COLLATE utf8_unicode_ci NOT NULL,
  `settings_value` varchar(255) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int(12) NOT NULL,
  `user_username` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `user_password` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `user_email` varchar(254) COLLATE utf8_unicode_ci NOT NULL,
  `user_display_name` varchar(40) COLLATE utf8_unicode_ci NOT NULL,
  `user_display_surname` varchar(40) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `devices`
--
ALTER TABLE `devices`
  ADD PRIMARY KEY (`device_id`),
  ADD UNIQUE KEY `device_name` (`device_name`);

--
-- Indexes for table `device_properties`
--
ALTER TABLE `device_properties`
  ADD PRIMARY KEY (`dp_id`),
  ADD UNIQUE KEY `dp_device_id` (`dp_device_id`,`dp_feature_id`);

--
-- Indexes for table `device_types`
--
ALTER TABLE `device_types`
  ADD PRIMARY KEY (`device_type_id`),
  ADD UNIQUE KEY `device_type` (`device_type`);

--
-- Indexes for table `device_type_features`
--
ALTER TABLE `device_type_features`
  ADD PRIMARY KEY (`dtf_id`),
  ADD UNIQUE KEY `dtf_type_id` (`dtf_type_id`,`dtf_feature_id`);

--
-- Indexes for table `features`
--
ALTER TABLE `features`
  ADD PRIMARY KEY (`feature_id`),
  ADD UNIQUE KEY `feature_name` (`feature_name`),
  ADD UNIQUE KEY `feature_topic` (`feature_topic`);

--
-- Indexes for table `organizations`
--
ALTER TABLE `organizations`
  ADD PRIMARY KEY (`organization_id`),
  ADD UNIQUE KEY `organization_name` (`organization_name`);

--
-- Indexes for table `organizations_devices`
--
ALTER TABLE `organizations_devices`
  ADD PRIMARY KEY (`od_id`),
  ADD UNIQUE KEY `od_organization_id` (`od_organization_id`,`od_device_id`);

--
-- Indexes for table `organizations_users`
--
ALTER TABLE `organizations_users`
  ADD PRIMARY KEY (`ou_id`),
  ADD UNIQUE KEY `ou_organization_id` (`ou_organization_id`,`ou_user_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`settings_id`),
  ADD UNIQUE KEY `settings_user_id` (`settings_user_id`,`settings_type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_username` (`user_username`),
  ADD UNIQUE KEY `user_email` (`user_email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `devices`
--
ALTER TABLE `devices`
  MODIFY `device_id` int(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `device_properties`
--
ALTER TABLE `device_properties`
  MODIFY `dp_id` int(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `device_types`
--
ALTER TABLE `device_types`
  MODIFY `device_type_id` int(5) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `device_type_features`
--
ALTER TABLE `device_type_features`
  MODIFY `dtf_id` int(12) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `features`
--
ALTER TABLE `features`
  MODIFY `feature_id` int(6) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `organizations`
--
ALTER TABLE `organizations`
  MODIFY `organization_id` int(6) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `organizations_devices`
--
ALTER TABLE `organizations_devices`
  MODIFY `od_id` int(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `organizations_users`
--
ALTER TABLE `organizations_users`
  MODIFY `ou_id` int(12) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `settings_id` int(20) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(12) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
