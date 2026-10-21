import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Outcome } from '../types'

const pending = atom({ plugin: 'run-button', key: 'pending' } as const, [])
const outcome = atom({ plugin: 'run-button', key: 'outcome' } as const, null)

const BANG_LINE = /^[ \t]*!\s+(\S.*)$/gm
const MAX_OUTPUT = 1500

export const register: Register = on => {
  on('session.append', { door: 'response' }, async ($, e, next) => {
    const found: string[] = []

    for (const block of e.message.content) {
      if (block.type !== 'text') continue

      for (const match of block.text.matchAll(BANG_LINE)) {
        found.push(match[1].trim())
      }
    }

    if (found.length > 0) {
      await update($, pending, list => [...list, ...found].slice(-5))
    }

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    await update($, outcome, () => null)

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const list = await read($, pending)
    const done = await read($, outcome)

    if (e.props.hasSurvey || (list.length === 0 && done === null)) {
      return next(e)
    }

    const { Box, Button, Text } = $.ui.resolve(e)

    const run = async (command: string) => {
      await update($, pending, all => all.filter(one => one !== command))
      // setsid drops the controlling terminal, so a command like sudo cannot prompt on /dev/tty and draw over the session
      const ran = await $.process.run(['setsid', '-w', 'bash', '-c', command], {
        stdin: '',
        timeoutMs: 120_000,
      })
      const output = (ran.stdout + ran.stderr).trim().slice(-MAX_OUTPUT)
      const result: Outcome = { command, exitCode: ran.exitCode, output }
      await update($, outcome, () => result)
      $.ui.toast(`Exit ${ran.exitCode}: ${command.slice(0, 60)}`)
    }

    return (
      <Box flexDirection="column" borderStyle="round" paddingX={1}>
        <Text> </Text>
        {list.map(command => (
          <Box key={`row-${command}`}>
            <Button key={`run-${command}`} label="Run" onPress={() => run(command)} />
            <Text> ! {command} </Text>
            <Button
              key={`skip-${command}`}
              label="Skip"
              onPress={() => update($, pending, all => all.filter(one => one !== command))}
            />
          </Box>
        ))}
        <Text> </Text>
        {done === null ? null : (
          <Box flexDirection="column">
            <Text dimColor>
              Exit {done.exitCode} from: {done.command}
            </Text>
            <Text>{done.output === '' ? '(no output)' : done.output}</Text>
          </Box>
        )}
      </Box>
    )
  })
}
