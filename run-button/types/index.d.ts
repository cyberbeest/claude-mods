export type Outcome = { command: string; exitCode: number; output: string }

declare module 'claude-code' {
  interface PluginState {
    'run-button': { pending: string[]; outcome: Outcome | null }
  }
}
