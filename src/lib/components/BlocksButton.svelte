<script lang="ts">
    import type { ButtonProps} from "$lib/types.js";

    const {
        label,
        primaryAction,
        secondaryActions = []
    }: ButtonProps = $props();

    let isActive = $derived(primaryAction.active);

    function onPointerDown() {
        primaryAction.onDown();
        secondaryActions.forEach((action)=>action.onDown());
    }
    function onPointerUp() {
        primaryAction.onUp();
        secondaryActions.forEach((action)=>action.onUp());
    }
</script>

<div class="property-button { $isActive ? 'active' : ''}"
     onpointerdown={() => onPointerDown()}
     onpointerup={() => onPointerUp()}
     role="button"
     tabindex="0"
>
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

