USE `rabbitpi`;

INSERT INTO `users` (`user_id`, `user_username`, `user_password`, `user_email`, `user_display_name`, `user_display_surname`) VALUES
(1, 'demo', '89e495e7941cf9e40e6980d14a16bf023ccd4c91', 'demo@example.com', 'John', 'Doe'),
(2, 'admin', '89e495e7941cf9e40e6980d14a16bf023ccd4c91', 'admin@example.com', 'Jane', 'Doe');

INSERT INTO `organizations` (`organization_id`, `organization_name`) VALUES
(1, 'demo');

INSERT INTO `organizations_users` (`ou_id`, `ou_organization_id`, `ou_user_id`) VALUES
(1, 1, 1),
(2, 1, 2);
