# Commit Tokens

Rewards for open source collaboration

## Score Criteria (Draft)

### Repository

- Number of stars
- Number of projects using it (and their "score")
- Number of collaborators
- Age

### Account

- Age
- Activity (in foreign repositories)

### Pull Request

- Not more than 14 days since merge
- Not for owned/administrated repositories
- Number of comments
- Reactions of project owners
- Closing an issue
- Number of commits
- Avg. length of commit messages
- Comments in code

### Example

#### Low Score

Repo:

- < 1 Month old
- < 10 Contributors
- < 50 Stars

Account:

- < 1 Year old
- < 2 merged PRs last Month

**Score: 0 - 25 %**

#### Medium Score

Repo:

- > 1 Month, < 1 Year old
- > 10, < 50 Contributors
- > 50, < 1000 Stars

Account:

- > 1, < 5 Years old
- > 2, < 10 merged PRs last Month

**Score: 25 - 75 %**

#### High Score

Repo:

- > 1 Year old
- > 50 Contributors
- > 1000 Stars

Account:

- > 5 Years old
- > 10 merged PRs last Month

**Score: 75 - 100 %**

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

[Nuxt.js docs](https://nuxtjs.org)
