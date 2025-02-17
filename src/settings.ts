import produce from "immer";
import { App, PluginSettingTab, Setting } from "obsidian";
import { settings } from "src/lib/stores/settings";
import { get } from "svelte/store";
import type ProjectsPlugin from "./main";
import type { ProjectsPluginPreferences } from "./settings/settings";

export class ProjectsSettingTab extends PluginSettingTab {
  constructor(app: App, readonly plugin: ProjectsPlugin) {
    super(app, plugin);
  }

  display(): void {
    const { projects } = get(settings);
    let { preferences } = get(settings);

    const save = (prefs: ProjectsPluginPreferences) => {
      preferences = prefs;
      settings.updatePreferences(prefs);
    };

    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Project view limit")
      .setName('Project view limit')
      .setDesc('Clip the notes to this many')
      .addText((text) => {
        text
          .setValue(preferences.projectViewLimit.toString())
          .setPlaceholder('300')
          .onChange((value) => {
            save({
              ...preferences,
              projectViewLimit: parseInt(value) || 300,
            });
          })
      });
    
    new Setting(containerEl)
      .setName("Project size limit")
      .setDesc("Avoid accidentally loading too many notes. Increasing ")
      .addText((text) =>
        text
          .setValue(preferences.projectSizeLimit.toString())
          .setPlaceholder("1000")
          .onChange((value) => {
            save({
              ...preferences,
              projectSizeLimit: parseInt(value) || 1000,
            });
          })
    );

    new Setting(containerEl).setName("Front matter").setHeading();

    new Setting(containerEl).setName("Quote strings").addDropdown((dropdown) =>
      dropdown
        .addOption("PLAIN", "If needed")
        .addOption("QUOTE_DOUBLE", "Always")
        .setValue(preferences.frontmatter.quoteStrings)
        .onChange((value) => {
          if (value === "PLAIN" || value === "QUOTE_DOUBLE") {
            save({
              ...preferences,
              frontmatter: {
                quoteStrings: value,
              },
            });
          }
        })
    );

    new Setting(containerEl)
      .setName("Commands")
      .setDesc("Add commands for your favorite projects and views.")
      .setHeading();

    projects.forEach((project) => {
      new Setting(containerEl)
        .setName(project.name)
        .setDesc("Project")
        .addToggle((toggle) =>
          toggle
            .setValue(
              !!preferences.commands.find(
                (command) => command.project == project.id && !command.view
              )
            )
            .onChange((value) => {
              save(
                produce(preferences, (draft) => {
                  if (value) {
                    draft.commands.push({
                      project: project.id,
                    });
                  } else {
                    draft.commands = draft.commands.filter(
                      (command) =>
                        !(command.project === project.id && !command.view)
                    );
                  }
                })
              );
            })
        );

      project.views.forEach((view) => {
        new Setting(containerEl)
          .setName(`${project.name}: ${view.name}`)
          .setDesc("View")
          .addToggle((toggle) =>
            toggle
              .setValue(
                !!preferences.commands.find(
                  (command) =>
                    command.project == project.id && command.view === view.id
                )
              )
              .onChange((value) => {
                save(
                  produce(preferences, (draft) => {
                    if (value) {
                      draft.commands.push({
                        project: project.id,
                        view: view.id,
                      });
                    } else {
                      draft.commands = draft.commands.filter(
                        (command) =>
                          !(
                            command.project === project.id &&
                            command.view === view.id
                          )
                      );
                    }
                  })
                );
              })
          );
      });
    });
  }
}
