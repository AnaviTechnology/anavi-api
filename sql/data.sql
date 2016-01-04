USE `rabbitpi`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `rabbitpi`
--

--
-- Dumping data for table `devices`
--

INSERT INTO `devices` (`device_id`, `device_name`, `device_type_id`) VALUES
(1, 'Power switch A', 1, ''),
(2, 'Power switch B', 1, ''),
(3, 'Weather Station', 2, '724cb57fb81b463980ac71543012d9cd');

--
-- Dumping data for table `device_properties`
--

INSERT INTO `device_properties` (`dp_id`, `dp_device_id`, `dp_feature_id`, `dp_property`) VALUES
(1, 1, 1, '20'),
(2, 1, 2, '40'),
(3, 1, 3, 'true'),
(4, 2, 1, '25'),
(5, 2, 2, '15'),
(6, 2, 3, 'false');

--
-- Dumping data for table `device_types`
--

INSERT INTO `device_types` (`device_type_id`, `device_type`, `device_icon`) VALUES
(1, 'raspberrypi-power-switch', 'plug'),
(2, 'raspberry-pi-weather-station', 'cloud');

--
-- Dumping data for table `device_type_features`
--

INSERT INTO `device_type_features` (`dtf_id`, `dtf_type_id`, `dtf_feature_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 1),
(5, 2, 2),
(6, 2, 4),
(7, 2, 5);

--
-- Dumping data for table `features`
--

INSERT INTO `features` (`feature_id`, `feature_name`, `feature_topic`, `feature_unit`) VALUES
(1, 'temperature', 'temperature', '°C'),
(2, 'humidity', 'humidity', '%'),
(3, 'power', 'power', ''),
(4, 'barometric pressure', 'pressure', 'mb'),
(5, 'display', 'display', '');

--
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`organization_id`, `organization_name`) VALUES
(1, 'demo'),
(2, 'work');

--
-- Dumping data for table `organizations_devices`
--

INSERT INTO `organizations_devices` (`od_id`, `od_organization_id`, `od_device_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3);

--
-- Dumping data for table `organizations_users`
--

INSERT INTO `organizations_users` (`ou_id`, `ou_organization_id`, `ou_user_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1);

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`settings_id`, `settings_user_id`, `settings_type`, `settings_value`) VALUES
(14, 1, 'home', 'pageDevices');

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_username`, `user_password`, `user_email`, `user_display_name`, `user_display_surname`) VALUES
(1, 'demo', '89e495e7941cf9e40e6980d14a16bf023ccd4c91', 'demo@example.com', 'John', 'Doe'),
(2, 'admin', '89e495e7941cf9e40e6980d14a16bf023ccd4c91', 'admin@example.com', 'Jane', 'Doe');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
