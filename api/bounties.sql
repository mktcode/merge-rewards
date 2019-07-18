CREATE TABLE `bounties` (
  `id` int(11) NOT NULL,
  `issue` varchar(255) NOT NULL,
  `amount` float NOT NULL,
  `pullrequestId` varchar(64) DEFAULT NULL,
  `claimedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `bounties`
  ADD PRIMARY KEY (`id`);
