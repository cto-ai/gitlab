import { sdk, ux } from '@cto.ai/sdk'
import { deleteProjectLabel, deleteGroupLabel } from './apiCalls'
import { Inputs } from '../types/Success'

const SUCCESS_TAGS = ['gitlab', 'success']

const {
  actionBlue,
  callOutCyan,
  italic: { dim },
  green,
  white,
} = ux.colors

export const handleSuccess = async (
  commandName: string,
  inputs: Inputs,
  currentRepo?: boolean,
) => {
  const {
    id,
    iid,
    name,
    number,
    title,
    web_url,
    is_project_label,
    namespace,
    repo,
    cloned,
    path,
  } = inputs
  await sdk.track(SUCCESS_TAGS, {
    event: `GitLab Op completing ${commandName}`,
    command: commandName,
    inputs,
    user: await sdk.user(),
  })
  if (commandName === 'project:clone') {
    sdk.log(
      `\n 🎉 ${callOutCyan(
        `Successfully cloned project! ${white(`'cd ${name}'`)} to get started!`,
      )}\n`,
    )
    process.exit(0)
  }
  if (commandName === 'project:create') {
    ux.spinner.stop(`${green('done!')}`)
    sdk.log(
      `\n🎉 ${callOutCyan(
        `Successfully created project ${white(name)}. ${dim(
          white(`'cd ${name}'`),
        )} to get started.`,
      )} \n`,
    )
    process.exit(0)
  }
  if (commandName === 'issue:start') {
    sdk.log(
      `\n🙌 Issue ${callOutCyan(
        `# ${iid} - ${title}`,
      )} has been checked out and read to be worked on.\nUse ${callOutCyan(
        'ops run gitlab issue:save',
      )} to commit & push.\n`,
    )
    process.exit(0)
  }
  if (commandName === 'issue:create') {
    sdk.log(
      `\n🎉 Successfully created issue ${callOutCyan(
        `${title}`,
      )} for the ${callOutCyan(`${name}`)} project: \n${callOutCyan(
        `${web_url}\n`,
      )}\n👉 Use ${callOutCyan(
        'ops run gitlab issue:start',
      )} to get started with the issue.\n`,
    )
    process.exit(0)
  }
  if (commandName === 'issue:done') {
    sdk.log(
      `\n🎉 Successfully created your merge-request! \n➡️  You can find it here: ${callOutCyan(
        web_url,
      )}\n`,
    )
    process.exit(0)
  }
  if (commandName === 'issue:save') {
    sdk.log('\n🎉 Successfully committed and pushed your code!\n')
    process.exit(0)
  }
  if (commandName === 'issue:search') {
    sdk.log(
      `\n🙌 Issue ${callOutCyan(
        `${title}-${iid}`,
      )} has been checked out and ready to be worked on.\nUse ${callOutCyan(
        'ops run github issue:save',
      )} to commit & push.\n`,
    )
    process.exit(0)
  }
  if (commandName === 'label:add') {
    sdk.log(`🎉 ${green(`Label ${name} has been added.`)}`)
    process.exit(0)
  }
  if (commandName === 'label:edit') {
    sdk.log(
      `🎉 ${green(`Label ${name} has been updated in the current project.`)}`,
    )
    process.exit(0)
  }
  if (commandName === 'label:remove') {
    if (is_project_label) {
      await deleteProjectLabel(`${namespace}/${repo}`, id)
      sdk.log(
        `🎉 ${green(
          `Label ${name} has been removed from the current project!`,
        )}`,
      )
      process.exit(0)
    } else {
      await deleteGroupLabel(namespace, id)
      sdk.log(
        `🎉 ${green(`Label ${name} has been removed from the current group!`)}`,
      )
      process.exit(0)
    }
  }
  if (commandName === 'label:sync') {
    sdk.log('✅ Labels across the chosen projects has been synced up!')
    process.exit(0)
  }
  if (commandName === 'merges:list') {
    sdk.log(`\nView the merge request here: 🔗 ${actionBlue(`${web_url}`)}\n`)
    process.exit(0)
  }
  if (commandName === 'issue:list' && currentRepo) {
    sdk.log(
      `\n✅ Run '$ ops run gitlab issue:start' to get started with the issue '# ${number} - ${title}'.\n`,
    )
    process.exit(0)
  }
  if (commandName === 'issue:list' && !currentRepo) {
    if (cloned) {
      sdk.log(
        `\n✅ cd ${path} and use command 'ops run gitlab issue:start' to get started with the issue.\n`,
      )
      process.exit(0)
    }
    sdk.log(
      `\n🤖 Project ${path} is not yet cloned. Clone the project using command project:clone and then use issue:start to get started on the issue.\n`,
    )
    process.exit(0)
  }
}
