# @jacraig/request

[![NPM Publish](https://github.com/JaCraig/request/actions/workflows/node-publish.yml/badge.svg)](https://github.com/JaCraig/request/actions/workflows/node-publish.yml)

`@jacraig/request` is a powerful yet lightweight library designed to simplify HTTP requests using the native `fetch` API while adding functionality such as caching, retry logic, and timeouts. It aims to provide developers with a convenient and flexible solution for handling HTTP requests in JavaScript and TypeScript applications.

## Features

- **Caching**: Cache responses to improve performance and reduce network requests.
- **Retry logic**: Automatically retry failed requests with customizable retry options.
- **Timeouts**: Set timeouts for requests to prevent hanging and improve overall application responsiveness.

## Installation

You can install `@jacraig/request` via npm:

```bash
npm install @jacraig/request
```

## Usage

Here's a basic example of how you can use `@jacraig/request` to make a fetch request:

```typescript

import { Request } from '@jacraig/request';

let returnValue = await Request.get('https://jsonplaceholder.somewhere.com/post.json').send();

```

In order to use caching, retry logic, or timeouts, you can use the extra methods on the returned Request object to set options:

```typescript

import { Request, StorageMode } from '@jacraig/request';

let returnValue = await Request.get('https://jsonplaceholder.somewhere.com/post.json')
    .withStorageMode(StorageMode.StorageAndUpdate)
    .withTimeout(5000)
    .withRetryAttempts(3)
    .send();

```

If you prefer to use callbacks instead of promises, you can do so by passing a callback function to the `onSuccess` method:

```typescript

import { Request } from '@jacraig/request';

Request.get('https://jsonplaceholder.somewhere.com/post.json')
    .onSuccess((response) => {
        console.log(response);
    })
    .send();

```

## Documentation
For more detailed information on how to use `@jacraig/request`, please refer to the [documentation](https://jacraig.github.io/request/) on GitHub Pages.

## License
@jacraig/request is licensed under the [Apache 2.0 License](https://github.com/JaCraig/request/blob/main/LICENSE)
