<script lang="ts">
    import type {PropertyButtonProps} from "$lib/types.js";
    import {BlocksInterface} from "$lib/common/BlocksInterface.js";

    let {
        propertyPath,
        value,
        label
    }: PropertyButtonProps = $props();

    const param =  BlocksInterface.getInstance()?.getParamStore(propertyPath);

    function onClick() {
        // console.log('clicked: set to ' + value);
        param?.set(value);
    }

    let isActive = $state(false);
    $effect(() => {
        isActive = $param == value;
    });

</script>

<div class="property-button {isActive ? 'active' : ''}" on:click={() => onClick()}>
    <div class="surface"></div>
    <div class="label">{label}</div>
</div>

<style lang="scss">
    .property-button {
        position: relative;
        cursor: pointer;
        .surface {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: white;
          border: black 1px solid;
          border-radius: 5px;
        }
        &.active .surface {
          background-color: lightblue;
        }
        .label {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
    }
</style>