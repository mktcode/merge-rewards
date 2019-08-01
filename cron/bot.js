const helper = require("./helper");
require("dotenv").config({ path: __dirname + "/../.env" });

const DEBUG = !(process.env.BOT_DEBUG && process.env.BOT_DEBUG === "no");

console.log("");
console.log(new Date());

if (DEBUG) {
  console.log("############################################");
  console.log("### DEBUG Mode: No votes will be casted. ###");
  console.log("############################################");
}

const botKey = process.env.BOT_KEY; // TODO: use SteemConnect instead of SteemJS
const botAccountName = process.env.BOT_ACCOUNT_NAME || "mkt";

// minimum number of posts waiting for a vote - don't vote if we are below
const waitListSize = parseInt(process.env.BOT_WAIT_LIST_SIZE) || 100;

// also don't vote if we are below
const minimumVotingPower = parseFloat(process.env.BOT_MIN_VOTING_POWER) || 99;

// force vote if we go above - the smaller the bot interval, the closer this can be set to 100%
// 99.93 = bot needs to run every 5 minutes, to make sure we don't reach 100%
const maximumVotingPower =
  parseFloat(process.env.BOT_MAX_VOTING_POWER) || 99.93;

// force vote if next post gets older than that
// should never really happen, but could also be set to a much lower value if possible
const maxPostAgeForVotes = parseInt(process.env.BOT_MAX_POST_AGE) || 6 * 24; // hours

// the adjustment amplifier can adjust how "strong" voting weights will be adjusted automatically,
// in relation to the deviation between the desired and the actual wait list.
const adjustmentAmplifier =
  parseFloat(process.env.BOT_ADJUSTMENT_AMPLIFIER) || 1;

// if the deviation is above >= 100 %, the voting weight will be the global min or max.
// here you can limit the maximum adjustment, to deal with large deviations. (only a value < 1 makes sense)
const maximumAdjustment = parseFloat(process.env.BOT_MAX_ADJUSTMENT) || 0.5; // adjust weights by a maximum af 50 %

// global weight boundaries, applied after all adjustments
const globalMinimumVoteWeight =
  parseFloat(process.env.BOT_GLOBAL_MIN_VOTE_WEIGHT) || 1;
const globalMaximumVoteWeight =
  parseFloat(process.env.BOT_GLOBAL_MAX_VOTE_WEIGHT) || 100;

// TODO: add more verbose logs

// pull some data
console.log("Fetching data...");
Promise.all([
  helper.getCurrentVotingPower(botAccountName, true),
  helper.getPostsWaitingForUpvote()
])
  .then(values => {
    const currentVotingPower = values[0];
    const postsWaitingForUpvote = values[1];
    if (postsWaitingForUpvote.length) {
      const nextPostToUpvote = postsWaitingForUpvote[0];

      let castVote = false;

      console.log("Checking voting conditions...");
      console.log(
        "Posts waiting for an upvote: " +
          postsWaitingForUpvote.length +
          " (desired value: " +
          waitListSize +
          ")"
      );
      // check voting power first
      if (currentVotingPower >= minimumVotingPower) {
        // then check if there are enough posts waiting, to make some calculations based on them
        if (postsWaitingForUpvote.length >= waitListSize) {
          castVote = true;
        } else {
          console.log("Not enough posts waiting for an upvote.");

          // force vote if next post gets too old
          // TODO: maybe this should even overrule minimum voting power... ?
          if (
            nextPostToUpvote.createdAt.getTime() <
            new Date().getTime() - maxPostAgeForVotes * 60 * 60 * 1000
          ) {
            console.log(
              "Force vote because post gets to old. (" +
                nextPostToUpvote.createdAt +
                ")"
            );
            castVote = true;
          } else {
            // force vote if voting power gets to high
            if (currentVotingPower >= maximumVotingPower) {
              console.log(
                "Force vote because Voting Power gets to high. (" +
                  currentVotingPower.toFixed(2) +
                  "/" +
                  maximumVotingPower +
                  ")"
              );
              castVote = true;
            } else {
              console.log("No reason to force.");
            }
          }
        }
      } else {
        console.log(
          "Voting Power to low: " +
            currentVotingPower.toFixed(2) +
            "%, Waiting to reach " +
            minimumVotingPower +
            "% (" +
            helper
              .calcRecoveryTime(minimumVotingPower - currentVotingPower)
              .toFixed(2) +
            " minutes)"
        );
      }

      if (castVote) {
        // adjust votes based on the deviation of desired and actual wait list size:
        // 1. calculate deviation
        // 2. apply amplifier
        // 3. apply adjustment cap
        // 4. get score based weight
        // 5. apply final adjustment
        // 6. apply global min/max values

        // calculate deviation percentage (e.g. 0.3 => 30 % deviation)
        let waitListSizeDeviation =
          Math.abs(waitListSize - postsWaitingForUpvote.length) / waitListSize;
        console.log("Waitlist Deviation: " + waitListSizeDeviation);

        // amplify adjustment
        let amplifiedAdjustment = waitListSizeDeviation * adjustmentAmplifier;
        console.log("Amplified Adjustment: " + amplifiedAdjustment);

        // apply adjustment cap too avoid too drastic adjustments
        amplifiedAdjustment =
          amplifiedAdjustment > maximumAdjustment
            ? maximumAdjustment
            : amplifiedAdjustment;
        console.log("Capped Adjustment: " + amplifiedAdjustment);

        // apply adjustment to weight multiplier
        // if actual and desired wait list are the same, nothing will happen here
        let votingWeightMultiplier = 1; // default: * 1 (no change)
        if (postsWaitingForUpvote.length > waitListSize) {
          // decrease voting power to vote faster if posts pile up
          votingWeightMultiplier -= amplifiedAdjustment;
        } else {
          // increase voting power to vote slower if posts become less
          votingWeightMultiplier += amplifiedAdjustment;
        }
        console.log("Final Multiplier: " + votingWeightMultiplier.toFixed(2));

        // get vote weight based on score
        let voteWeight = helper.getVoteWeightForScore(
          nextPostToUpvote.score,
          globalMaximumVoteWeight
        );
        // adjust it with the calculated multiplier
        let adjustedVoteWeight = voteWeight * votingWeightMultiplier;
        // apply global min/max weight values
        if (adjustedVoteWeight < globalMinimumVoteWeight)
          adjustedVoteWeight = globalMinimumVoteWeight;
        if (adjustedVoteWeight > globalMaximumVoteWeight)
          adjustedVoteWeight = globalMaximumVoteWeight;

        console.log(
          "Post: @" +
            nextPostToUpvote.steemUser +
            "/" +
            nextPostToUpvote.permlink
        );
        console.log("Created: " + nextPostToUpvote.createdAt);
        console.log("Score: " + nextPostToUpvote.score + " %");
        console.log(
          "Score-based Voting Weight: " + voteWeight.toFixed(2) + " %"
        );
        console.log(
          "Adjusted Voting Weight: " + adjustedVoteWeight.toFixed(2) + " %"
        );
        console.log(
          "Voting at " + currentVotingPower.toFixed(2) + " % Voting Power"
        );

        helper
          .upvotePost(
            botAccountName,
            botKey,
            nextPostToUpvote.steemUser,
            nextPostToUpvote.permlink,
            parseInt(adjustedVoteWeight * 100)
          )
          .then(() => {
            helper
              .updateClaimVote(nextPostToUpvote.id, adjustedVoteWeight)
              .then(() => {
                console.log("Updated claim vote in database.");
              });
            helper
              .getCurrentVotingPower(botAccountName, true)
              .then(newVotingPower => {
                console.log(
                  "Done! New Voting Power: " + newVotingPower.toFixed(2) + " %"
                );
                if (newVotingPower < minimumVotingPower) {
                  console.log(
                    helper
                      .calcRecoveryTime(minimumVotingPower - newVotingPower)
                      .toFixed(2) +
                      " minutes to get back to " +
                      minimumVotingPower +
                      " %"
                  );
                }
                if (!DEBUG) {
                  // TODO: post comment, for now let's better save on RC
                }
                process.exit();
              });
          })
          .catch(err => console.log(err));
      } else {
        process.exit();
      }
    } else {
      console.log("No posts available.");
      process.exit();
    }
  })
  .catch(err => console.log(err));
