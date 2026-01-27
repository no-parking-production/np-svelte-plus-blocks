# @nopa/svelte-plus-blocks

Experimental interface between Svelte and Blocks, providing seamless integration for property management and button interactions.

## Installation

```sh
npm install @nopa/svelte-plus-blocks
```

## Requirements

- Svelte 5.0.0 or higher

## Usage

```svelte
<script>
  import { BlocksButton } from '@nopa/svelte-plus-blocks';
  import { BAction } from '@nopa/svelte-plus-blocks';
</script>

<BlocksButton label="Click me!" primaryAction={BAction.SetProperty('test', true)} />
```

## Components

### BlocksButton
A Svelte component for manipulating Blocks properties, etc. via a button click.


## License

MIT
