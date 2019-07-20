export default `
This file is a backup of your steem account password and keys.
Please store this in a secure place!

Steem Account Name: {{accountName}}
Password: {{password}}

The following four private keys are derived from your password.

Owner Key: {{owner}}
Active Key: {{active}}
Posting Key: {{posting}}
Memo Key: {{memo}}

These keys can optionally be used as a replacement for your password when
logging in to Steem wallets such as steemit.com as an additional security
measure. For example, if you log in with your Posting Key, you can create
posts and vote, but you cannot transfer funds. This might be useful, for
example, if you are logging in from a public computer.`;
