<script lang="ts">
  import {
    DataFieldType,
    type DataField,
    type DataValue,
    type Optional,
  } from "src/lib/data";
  import { TagList } from "../TagList";

  export let value: Optional<DataValue>;
  export let field: DataField;
</script>

{#if field.type === DataFieldType.String && field.repeated && Array.isArray(value)}
  <TagList values={value || []} />
{/if}
