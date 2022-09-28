# react-reservice

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A minimal react state management via proxy

## Install

```bash
npm install react-reservice
```

## Usage

```tsx
import React from 'react';
import Service, { useService, serviceSelector } from 'react-reservice';

// Create service class
class YourService extends Service {
  constructor() {
    super();
    this.context = {
      // Set default context value
      username: 'Mark',
      balance: 1000
    };
  }

  updateUsername = (username: string) => {
    // Update context value directly
    this.context.username = username;
  }
}

// Create service instance
const yourService = new YourService();

// Create custom hooks by passing service instance and value selector
const useYourService = (subscriptionKeys: string[]) => useService(yourService, serviceSelector(subscriptionKeys));

// Bind the hooks with your component
const Username: FC = () => {
  // The Component will render only when `username` changed
  const { username } = useYourService(['username']);

  return <div>{username}</div>;
}

// Call service function directly in anywhere!!
yourService.updateUsername('John')
```

[build-img]:https://github.com/pop0030/react-reservice/actions/workflows/release.yml/badge.svg
[build-url]:https://github.com/pop0030/react-reservice/actions/workflows/release.yml
[downloads-img]:https://img.shields.io/npm/dt/react-reservice
[downloads-url]:https://www.npmtrends.com/react-reservice
[npm-img]:https://img.shields.io/npm/v/react-reservice
[npm-url]:https://www.npmjs.com/package/react-reservice
[issues-img]:https://img.shields.io/github/issues/pop0030/react-reservice
[issues-url]:https://github.com/pop0030/react-reservice/issues
[codecov-img]:https://codecov.io/gh/pop0030/react-reservice/branch/main/graph/badge.svg
[codecov-url]:https://codecov.io/gh/pop0030/react-reservice
[semantic-release-img]:https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]:https://github.com/semantic-release/semantic-release
[commitizen-img]:https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]:http://commitizen.github.io/cz-cli/