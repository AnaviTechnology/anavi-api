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
-- Dumping data for table `organizations`
--

INSERT INTO `organizations` (`organization_id`, `organization_name`) VALUES
(1, 'demo');

--
-- Dumping data for table `organizations_users`
--

INSERT INTO `organizations_users` (`ou_id`, `ou_organization_id`, `ou_user_id`) VALUES
(1, 1, 1),
(2, 1, 2);

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`settings_id`, `settings_user_id`, `settings_type`, `settings_value`) VALUES
(11, 1, 'home', 'pageDevices');

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_username`, `user_password`, `user_email`, `user_display_name`, `user_display_surname`) VALUES
(1, 'demo', '89e495e7941cf9e40e6980d14a16bf023ccd4c91', 'demo@example.com', 'John', 'Doe'),
(2, 'admin', '89e495e7941cf9e40e6980d14a16bf023ccd4c91', 'admin@example.com', 'Jane', 'Doe');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
