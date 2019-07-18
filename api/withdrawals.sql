CREATE TABLE `withdrawals` (
  `id` int(11) NOT NULL,
  `githubUser` varchar(50) NOT NULL,
  `amount` float NOT NULL,
  `currency` varchar(25) NOT NULL,
  `address` varchar(255) NOT NULL,
  `memo` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `withdrawals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
