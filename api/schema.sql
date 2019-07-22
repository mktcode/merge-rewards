CREATE TABLE `bounties` (
  `id` int(11) NOT NULL,
  `issue` varchar(255) NOT NULL,
  `amount` float NOT NULL,
  `pullRequestId` varchar(64) DEFAULT NULL,
  `claimedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `claims` (
  `id` int(11) NOT NULL,
  `pullRequestId` varchar(64) NOT NULL,
  `score` float NOT NULL,
  `permlink` varchar(255) NOT NULL,
  `githubUser` varchar(50) NOT NULL,
  `steemUser` varchar(50) NOT NULL,
  `pendingRewards` float DEFAULT NULL,
  `rewards` float DEFAULT NULL,
  `vote` float DEFAULT NULL,
  `votedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `withdrawals` (
  `id` int(11) NOT NULL,
  `githubUser` varchar(50) NOT NULL,
  `amount` float NOT NULL,
  `currency` varchar(25) NOT NULL,
  `address` varchar(255) NOT NULL,
  `memo` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `boosters` (
  `githubUser` varchar(50) NOT NULL,
  `strikes` int(11) NOT NULL DEFAULT '0',
  `spares` int(11) NOT NULL DEFAULT '0',
  `doubles` int(11) NOT NULL DEFAULT '0',
  `dices` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `bounties`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `claims`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pullRequestId` (`pullRequestId`);
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`);
ALTER TABLE `boosters`
  ADD PRIMARY KEY (`githubUser`);


ALTER TABLE `bounties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `claims`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `withdrawals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
