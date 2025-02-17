<script lang="ts">
  import { Button, Icon, Popover } from "obsidian-svelte";

  import ViewToolbar from "src/components/Layout/ViewToolbar.svelte";
  import FilterSettings from "src/components/FilterSettings/FilterSettings.svelte";
  import ColorFilterSettings from "src/components/FilterSettings/ColorFilterSettings.svelte";
  import { createProject } from "src/lib/data-api";
  import { i18n } from "src/lib/stores/i18n";
  import { app } from "src/lib/stores/obsidian";
  import { dataFrame } from "src/lib/stores/dataframe";
  import { settings } from "src/lib/stores/settings";
  import { AddViewModal } from "src/modals/add-view-modal";
  import { ConfirmDialogModal } from "src/modals/confirm-dialog";
  import { CreateProjectModal } from "src/modals/create-project-modal";
  import Flair from "./Flair.svelte";

  import ProjectSelect from "./ProjectSelect.svelte";
  import ViewSelect from "./ViewSelect.svelte";
  import { InspectorModal } from "src/modals/inspector";
  import produce from "immer";
  import type {
    ProjectDefinition,
    ProjectId,
    ViewId,
  } from "src/settings/settings";

  export let projects: ProjectDefinition[];

  export let projectId: ProjectId | undefined;
  export let onProjectChange: (projectId: ProjectId) => void;

  export let viewId: ViewId | undefined;
  export let onViewChange: (viewId: ViewId) => void;

  $: project = projects.find((project) => project.id === projectId);
  $: views = project?.views ?? [];

  $: errors = $dataFrame.errors ?? [];

  let filterRef: HTMLButtonElement;
  let filterOpen: boolean = false;

  let colorRef: HTMLButtonElement;
  let colorOpen: boolean = false;
</script>

<!--
	@component

	Toolbar lets the user manage projects and views.
-->
<ViewToolbar variant="primary">
  <svelte:fragment slot="info">
    {#if errors.length}
      <Flair
        variant="error"
        on:click={() => {
          new InspectorModal($app, "Project inspector", errors).open();
        }}
        >{`${errors.length} ${errors.length === 1 ? "error" : "errors"}`}</Flair
      >
    {/if}
  </svelte:fragment>

  <ProjectSelect
    slot="left"
    {projectId}
    {projects}
    {onProjectChange}
    onProjectAdd={() =>
      new CreateProjectModal(
        $app,
        $i18n.t("modals.project.create.title"),
        $i18n.t("modals.project.create.cta"),
        (project) => {
          settings.addProject(project);
          projectId = project.id;
          onProjectChange(project.id);
        },
        createProject()
      ).open()}
  />

  <div slot="middle">
    {#if project}
      <ViewSelect
        {viewId}
        {views}
        viewExists={(name) =>
          !!project?.views.find((view) => view.name === name)}
        onViewSort={(viewIds) => {
          if (projectId) {
            settings.sortViews(projectId, viewIds);
          }
        }}
        onViewAdd={() => {
          if (project) {
            new AddViewModal($app, project, (projectId, view) => {
              settings.addView(projectId, view);
              onViewChange(view.id);
            }).open();
          }
        }}
        onViewRename={(viewId, name) => {
          if (projectId) {
            settings.renameView(projectId, viewId, name);
          }
        }}
        {onViewChange}
        onViewDuplicate={(viewId) => {
          if (projectId) {
            const id = settings.duplicateView(projectId, viewId);
            onViewChange(id);
          }
        }}
        onViewDelete={(viewId) => {
          new ConfirmDialogModal(
            $app,
            $i18n.t("modals.view.delete.title"),
            $i18n.t("modals.view.delete.message"),
            $i18n.t("modals.view.delete.cta"),
            () => {
              if (projectId) {
                settings.deleteView(projectId, viewId);
              }
            }
          ).open();
        }}
      />
    {/if}
  </div>
  <svelte:fragment slot="right">
    {@const view = projects
      .find((project) => project.id === projectId)
      ?.views?.find((view) => view.id === viewId)}

    <Button
      bind:ref={colorRef}
      on:click={() => {
        colorOpen = !colorOpen;
      }}
      disabled={!view}
    >
      <Icon name="palette" />
      Color
      {#if view?.colors.conditions.length}
        <Flair variant="primary">{view?.colors.conditions.length}</Flair>
      {/if}
    </Button>
    <Popover
      anchorEl={colorRef}
      open={colorOpen}
      onClose={() => {
        colorOpen = false;
      }}
      placement="auto"
    >
      <ColorFilterSettings
        filter={view?.colors ?? {
          conditions: [],
        }}
        onFilterChange={(filter) => {
          const view = projects
            .find((project) => project.id === projectId)
            ?.views?.find((view) => view.id === viewId);

          if (projectId && view) {
            settings.updateView(
              projectId,
              produce(view, (draft) => {
                draft.colors = filter;
              })
            );
          }
        }}
        fields={$dataFrame.fields}
      />
    </Popover>
    <Button
      bind:ref={filterRef}
      on:click={() => {
        filterOpen = !filterOpen;
      }}
      disabled={!view}
    >
      <Icon name="filter" />
      Filter
      {#if view?.filter.conditions.length}
        <Flair variant="primary">{view?.filter.conditions.length}</Flair>
      {/if}
    </Button>
    <Popover
      anchorEl={filterRef}
      open={filterOpen}
      onClose={() => {
        filterOpen = false;
      }}
      placement="auto"
    >
      <FilterSettings
        filter={view?.filter ?? {
          conditions: [],
        }}
        onFilterChange={(filter) => {
          const view = projects
            .find((project) => project.id === projectId)
            ?.views?.find((view) => view.id === viewId);

          if (projectId && view) {
            settings.updateView(
              projectId,
              produce(view, (draft) => {
                draft.filter = filter;
              })
            );
          }
        }}
        fields={$dataFrame.fields}
      />
    </Popover>
  </svelte:fragment>
</ViewToolbar>
