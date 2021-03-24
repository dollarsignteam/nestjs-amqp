# Contributing

1. [Fork it](https://help.github.com/articles/fork-a-repo/)
2. Install dependencies (`yarn install`)
3. Create your feature branch (`git checkout -b my-new-feature`)
4. Commit your changes (`git commit -am 'feat: added some feature'`)
5. Test your changes (`yarn test`)
6. Push to the branch (`git push origin my-new-feature`)
7. [Create new Pull Request](https://help.github.com/articles/creating-a-pull-request/)

## Testing

We use [Jest](https://github.com/facebook/jest) to write tests. Run our test suite with this command:

```bash
yarn test
```

## Code Style

We use [Prettier](https://prettier.io/) and tslint to maintain code style and best practices.
Please make sure your PR adheres to the guides by running:

```bash
yarn format
```

and

```bash
yarn lint
```

## Commitlint

commitlint checks if your commit messages meet the [conventional commit format](https://conventionalcommits.org).

In general the pattern mostly looks like this:

```sh
type(scope?): subject  #scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")
```

Real world examples can look like this:

```sh
chore: run tests on travis ci
```

```sh
fix(server): send cors headers
```

```sh
feat(blog): add comment section
```

Common types according to [commitlint-config-conventional (based on the Angular convention)](https://github.com/conventional-changelog/commitlint/tree/master/@commitlint/config-conventional#type-enum) can be:

- build
- ci
- chore
- docs
- feat
- fix
- perf
- refactor
- revert
- style
- test
