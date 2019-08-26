SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE TABLE `boosters` (
  `githubUser` varchar(50) NOT NULL,
  `strikes` int(11) NOT NULL DEFAULT '0',
  `spares` int(11) NOT NULL DEFAULT '0',
  `doubles` int(11) NOT NULL DEFAULT '0',
  `dices` int(11) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `bounties` (
  `id` int(11) NOT NULL,
  `steemTxId` varchar(64) NOT NULL,
  `githubUser` varchar(50) NOT NULL,
  `btcAddress` varchar(50) NOT NULL,
  `ltcAddress` varchar(50) NOT NULL,
  `ethAddress` varchar(50) NOT NULL,
  `xmrAddress` varchar(255) NOT NULL,
  `steemAddress` varchar(50) NOT NULL,
  `sbdAddress` varchar(50) NOT NULL,
  `issueId` varchar(64) NOT NULL,
  `issueTitle` varchar(255) NOT NULL,
  `issueOwner` varchar(50) NOT NULL,
  `issueRepo` varchar(100) NOT NULL,
  `issueNum` int(11) NOT NULL,
  `claimId` int(11) DEFAULT NULL,
  `autoRelease` tinyint(1) NOT NULL DEFAULT '0',
  `releasedAt` datetime DEFAULT NULL,
  `releasedTo` varchar(50) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `bountyDeposits` (
  `id` int(11) NOT NULL,
  `receivingAddress` varchar(255) NOT NULL,
  `sbdAmount` decimal(10,3) NOT NULL DEFAULT '0.000',
  `usdAmount` decimal(10,3) NOT NULL DEFAULT '0.000',
  `currency` varchar(50) NOT NULL,
  `bountyId` int(11) NOT NULL,
  `txId` varchar(255) NOT NULL,
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
  `booster` varchar(10) DEFAULT NULL,
  `vote` float DEFAULT NULL,
  `votedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `withdrawals` (
  `id` int(11) NOT NULL,
  `githubUser` varchar(50) NOT NULL,
  `sbdAmount` decimal(10,3) NOT NULL DEFAULT '0.000',
  `usdAmount` decimal(10,3) NOT NULL DEFAULT '0.000',
  `currency` varchar(25) NOT NULL,
  `address` varchar(255) NOT NULL,
  `memo` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `boosters`
  ADD PRIMARY KEY (`githubUser`);

ALTER TABLE `bounties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `steemTxId` (`steemTxId`);

ALTER TABLE `bountyDeposits`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `txId` (`txId`);

ALTER TABLE `claims`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pullrequestID` (`pullRequestId`);

ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `bounties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `bountyDeposits`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `claims`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `withdrawals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
